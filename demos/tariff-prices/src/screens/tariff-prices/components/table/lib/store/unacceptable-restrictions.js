import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";

export function getCurrentMinMaxRestrictions(pricesCalendarModel, roomtypeId, date) {
  return {
    minstay: pricesCalendarModel?.getRestriction({
      id: roomtypeId,
      date,
      name: PriceAndRestrictionsService.restrictionTypeEnum.minstay,
    })?.value ?? 0,
    maxstay: pricesCalendarModel?.getRestriction({
      id: roomtypeId,
      date,
      name: PriceAndRestrictionsService.restrictionTypeEnum.maxstay,
    })?.value ?? 0,
  };
}

function planDisplayName(plan) {
  const name = plan?.name;
  if (name != null && String(name).trim() !== "") {
    return String(name).trim();
  }
  const id = plan?.id;
  return id != null ? `#${id}` : "";
}

/** Значение stay-ограничения для проверки «ячейка не пустая»: черновик или модель. */
function getStayValueForConflict(restrictionType, updatedRestrictionValues, roomtypeId, date, pricesCalendarModel) {
  if (Object.prototype.hasOwnProperty.call(updatedRestrictionValues, restrictionType)) {
    return updatedRestrictionValues[restrictionType];
  }
  return pricesCalendarModel?.getRestriction?.({
    id: roomtypeId,
    date,
    name: restrictionType,
  })?.value ?? 0;
}

/** Как в отображении ячейки: 0 / пусто не подсвечиваем. */
function isNonEmptyStayConflictValue(raw) {
  const n = Number(raw ?? 0);
  return Number.isFinite(n) && n > 0;
}

/**
 * Типы stay-ячеек с локальным конфликтом min/max (та же геометрия, что getRestrictionStayCellUnacceptable), только с ненулевым значением.
 */
function collectLocalConflictStayTypesNonEmpty({
  effMin,
  effMax,
  updatedRestrictionValues,
  roomtypeId,
  date,
  pricesCalendarModel,
}) {
  const t = PriceAndRestrictionsService.restrictionTypeEnum;
  const maxPositive = effMax > 0;
  const invalidMin = maxPositive && effMin > effMax;
  const candidates = [];
  if (invalidMin) {
    candidates.push(t.minstay);
    candidates.push(t.maxstay);
  }
  return candidates.filter((restrictionType) => {
    const raw = getStayValueForConflict(
      restrictionType,
      updatedRestrictionValues,
      roomtypeId,
      date,
      pricesCalendarModel,
    );
    return isNonEmptyStayConflictValue(raw);
  });
}

/**
 * Поля min/max stay у **редактируемого** тарифа, которые он берёт из родителя (dependencySettings) и где значение ненулевое.
 * — при конфликте с дочерним: подсветка на стороне родителя;
 * — при конфликте с родительским: подсветка на стороне дочернего (текущего) тарифа.
 */
function collectDependentPlanInheritedStayTypesNonEmpty({
  dependentPlan,
  updatedRestrictionValues,
  roomtypeId,
  date,
  pricesCalendarModel,
}) {
  const dep = dependentPlan?.dependent_restrictions || {};
  const t = PriceAndRestrictionsService.restrictionTypeEnum;
  const out = [];
  for (const restrictionType of [t.minstay, t.maxstay]) {
    if (!Number(dep[restrictionType])) {
      continue;
    }
    const raw = getStayValueForConflict(
      restrictionType,
      updatedRestrictionValues,
      roomtypeId,
      date,
      pricesCalendarModel,
    );
    if (!isNonEmptyStayConflictValue(raw)) {
      continue;
    }
    out.push(restrictionType);
  }
  return out;
}

export function defineUnacceptableRestrictions({
  updatedRestrictions = {},
  pricesCalendarModel,
  currentTariff,
  allPlans = [],
}) {
  /** @type {Record<string, Record<string, string[]>>} roomtypeId -> date -> restriction types */
  const unacceptableRestrictions = {};
  const dependentConflictPlanNames = new Set();
  /** Даты (timestamp), на которых конфликт min/max из‑за сопоставления с дочерним тарифом. */
  const childStayConflictTimestamps = new Set();
  /** Даты (timestamp), на которых конфликт min/max из‑за сопоставления с родительским тарифом. */
  const parentStayConflictTimestamps = new Set();
  const directDependentPlans = PriceAndRestrictionsService.getDirectDependentPlans(currentTariff, allPlans);
  const parentPlanId = Number(currentTariff?.dependent_restrictions?.parent_plan_id || 0);
  const parentPlan = parentPlanId
    ? (allPlans || []).find((p) => Number(p?.id) === parentPlanId)
    : null;
  const stayKeys = PriceAndRestrictionsService.restrictionTypeEnum;

  Object.entries(updatedRestrictions || {}).forEach(([roomtypeId, restrictionByDate]) => {
    Object.entries(restrictionByDate || {}).forEach(([date, updatedRestrictionValues]) => {
      if (
        !Object.prototype.hasOwnProperty.call(updatedRestrictionValues, stayKeys.minstay)
        && !Object.prototype.hasOwnProperty.call(updatedRestrictionValues, stayKeys.maxstay)
      ) {
        return;
      }

      const currentRestrictions = PriceAndRestrictionsService.resolveMinMaxRestrictions({
        baseRestrictions: getCurrentMinMaxRestrictions(pricesCalendarModel, roomtypeId, date),
        updatedRestrictions: updatedRestrictionValues,
      });

      const hasLocalConflict = PriceAndRestrictionsService.isMinstayGreaterThanMaxstay(currentRestrictions);

      let hasChildConflict = false;
      const typesChildAccum = [];
      if (!hasLocalConflict && directDependentPlans.length) {
        directDependentPlans.forEach((childPlan) => {
          const childRestrictions = pricesCalendarModel?.getDependentChildMinmaxRestrictions?.({
            planId: childPlan.id,
            id: roomtypeId,
            date,
          }) || {};

          const childConflict = PriceAndRestrictionsService.isMinstayGreaterThanMaxstay(
            PriceAndRestrictionsService.resolveMinMaxRestrictions({
              baseRestrictions: childRestrictions,
              parentRestrictions: currentRestrictions,
              dependencySettings: childPlan?.dependent_restrictions || {},
            }),
          );
          if (!childConflict) {
            return;
          }
          hasChildConflict = true;
          const label = planDisplayName(childPlan);
          if (label) {
            dependentConflictPlanNames.add(label);
          }
          collectDependentPlanInheritedStayTypesNonEmpty({
            dependentPlan: childPlan,
            updatedRestrictionValues,
            roomtypeId,
            date,
            pricesCalendarModel,
          }).forEach((rt) => typesChildAccum.push(rt));
        });
      }

      const typesChild = [...new Set(typesChildAccum)];

      let hasParentConflict = false;
      const typesParentAccum = [];
      if (
        !hasLocalConflict
        && parentPlanId
        && typeof pricesCalendarModel?.getDependentParentMinmaxRestrictions === "function"
      ) {
        const parentRestrictions = pricesCalendarModel.getDependentParentMinmaxRestrictions({
          id: roomtypeId,
          date,
        });
        const effectiveWithParent = PriceAndRestrictionsService.resolveMinMaxRestrictions({
          baseRestrictions: getCurrentMinMaxRestrictions(pricesCalendarModel, roomtypeId, date),
          updatedRestrictions: updatedRestrictionValues,
          parentRestrictions,
          dependencySettings: currentTariff?.dependent_restrictions || {},
        });
        if (PriceAndRestrictionsService.isMinstayGreaterThanMaxstay(effectiveWithParent)) {
          hasParentConflict = true;
          const label = planDisplayName(parentPlan);
          if (label) {
            dependentConflictPlanNames.add(label);
          }
          collectDependentPlanInheritedStayTypesNonEmpty({
            dependentPlan: currentTariff,
            updatedRestrictionValues,
            roomtypeId,
            date,
            pricesCalendarModel,
          }).forEach((rt) => typesParentAccum.push(rt));
        }
      }
      const typesParent = [...new Set(typesParentAccum)];

      if (hasChildConflict) {
        childStayConflictTimestamps.add(new Date(date).getTime());
      }
      if (hasParentConflict) {
        parentStayConflictTimestamps.add(new Date(date).getTime());
      }

      const hasConflict = hasLocalConflict || hasChildConflict || hasParentConflict;
      if (!hasConflict) {
        return;
      }

      const effMin = PriceAndRestrictionsService.effectiveStayRestrictionValue(
        updatedRestrictionValues,
        pricesCalendarModel,
        roomtypeId,
        date,
        stayKeys.minstay,
      );
      const effMax = PriceAndRestrictionsService.effectiveStayRestrictionValue(
        updatedRestrictionValues,
        pricesCalendarModel,
        roomtypeId,
        date,
        stayKeys.maxstay,
      );

      const typesLocal = hasLocalConflict
        ? collectLocalConflictStayTypesNonEmpty({
          effMin,
          effMax,
          updatedRestrictionValues,
          roomtypeId,
          date,
          pricesCalendarModel,
        })
        : [];

      const typesParentForMerge = hasParentConflict ? typesParent : [];

      const merged = [...new Set([...typesLocal, ...typesChild, ...typesParentForMerge])];
      if (!merged.length) {
        return;
      }

      if (!unacceptableRestrictions[roomtypeId]) {
        unacceptableRestrictions[roomtypeId] = {};
      }
      unacceptableRestrictions[roomtypeId][date] = merged;
    });
  });

  return {
    unacceptableRestrictions,
    dependentRestrictionConflictPlanNames: [...dependentConflictPlanNames].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
    childStayConflictTimestamps,
    parentStayConflictTimestamps,
  };
}
