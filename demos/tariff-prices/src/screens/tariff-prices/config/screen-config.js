import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import i18n from "@/plugins/i18n";

export const isDev = false;

export const viewDateFormat = "DD.MM.YYYY";

export const priceCellPresentationModes = {
  dynamic: "dynamic",
  default: "default",
  manual: "manual",
  closed: "closed",
};
export const restrictionCellPresentationModes = {
  none: "none",
  manual: "manual",
  manualToggled: "manual-toggled",
  manualEdited: "manual-edited",
  copied: "copied",
  closed: "closed",
};

const restrictionTypeEnum = PriceAndRestrictionsService.restrictionTypeEnum;
export const restrictionTypes = {
  [restrictionTypeEnum.minstay]: {
    table: i18n.t("Мин. кол-во ночей"),
    alert: i18n.t("Минимальное количество ночей"),
  },
  [restrictionTypeEnum.minstayA]: {
    table: i18n.t("Мин. кол-во ночей на заезд"),
    alert: i18n.t("Минимальное количество ночей на дату заезда"),
  },
  [restrictionTypeEnum.maxstay]: {
    table: i18n.t("Макс. кол-во ночей"),
    alert: i18n.t("Максимальное количество ночей"),
  },
  [restrictionTypeEnum.closed]: {
    table: i18n.t("Закрыт для продажи"),
    alert: i18n.t("Закрытие продажи"),
  },
  [restrictionTypeEnum.closedArrival]: {
    table: i18n.t("Закрыт на заезд"),
    alert: i18n.t("Закрытие на заезд"),
  },
  [restrictionTypeEnum.closedDeparture]: {
    table: i18n.t("Закрыт на выезд"),
    alert: i18n.t("Закрытие на выезд"),
  },
};

export const bedTypes = [
  i18n.t("основное"),
  i18n.t("доп"),
  i18n.t("без места"),
];

export const bedTypesShort = [
  i18n.t("осн"),
  i18n.t("доп"),
  i18n.t("б/м"),
];

export const currencyList = [
  { id: "percent", name: "%" },
  { id: "amount", name: "RUB" },
];

export const allWeekdayItem = {
  title: i18n.t("Все дни"),
  value: PriceAndRestrictionsService.allWeekdayValue,
};

export const restrictionSelectionGroups = Object.freeze([
  Object.freeze([
    PriceAndRestrictionsService.restrictionTypeEnum.minstay,
    PriceAndRestrictionsService.restrictionTypeEnum.minstayA,
    PriceAndRestrictionsService.restrictionTypeEnum.maxstay,
  ]),
  Object.freeze([
    PriceAndRestrictionsService.restrictionTypeEnum.closedArrival,
    PriceAndRestrictionsService.restrictionTypeEnum.closedDeparture,
  ]),
]);

export const compactRestrictionGroupItems = Object.freeze([
  Object.freeze({
    id: "stay-group",
    name: [
      restrictionTypes[PriceAndRestrictionsService.restrictionTypeEnum.minstay].table,
      restrictionTypes[PriceAndRestrictionsService.restrictionTypeEnum.minstayA].table,
      restrictionTypes[PriceAndRestrictionsService.restrictionTypeEnum.maxstay].table,
    ].join(", "),
    restrictionTypes: restrictionSelectionGroups[0],
  }),
  Object.freeze({
    id: "close-group",
    name: [
      restrictionTypes[PriceAndRestrictionsService.restrictionTypeEnum.closedArrival].table,
      restrictionTypes[PriceAndRestrictionsService.restrictionTypeEnum.closedDeparture].table,
    ].join(", "),
    restrictionTypes: restrictionSelectionGroups[1],
  }),
]);

export function getDefaultSelectedRestrictionKeys() {
  return Object.keys(restrictionTypeEnum).filter(
    (key) => key !== PriceAndRestrictionsService.closedRestrictionName,
  );
}

export function getExtraChargeName(childrenAgeId, minAge, maxAge, compactMode = false) {
  if (Number(childrenAgeId) === 0) {
    return compactMode ? i18n.t("взр") : i18n.t("взрослый");
  }
  return `${
    !compactMode ? `${i18n.t("дети")} ` : ""
  }${minAge || 0}${compactMode ? "-" : " - "}${maxAge || 0}`;
}

export function getPlanModification(currentTariff, parentTariff, currencySign, additionalServices, useSigns = true) {
  if (!currentTariff || !parentTariff) return "";
  let word = "";
  let serviceWord = "";
  if (useSigns) {
    word = Number(currentTariff.discount_amount) > 0 ? "+" : "-";
    serviceWord = "+";
  } else {
    word = Number(currentTariff.discount_amount) > 0 ? i18n.t("с наценкой") : i18n.t("со скидкой");
    serviceWord = `${i18n.t("и с наценкой в размере стоимости")} ${currentTariff.extra?.markup_services?.length > 1 ? i18n.t("услуг") : i18n.t("услуги")}`;
  }
  if (Number(currentTariff.discount_amount)) {
    return `${
      useSigns ? parentTariff.name : ""
    } ${word} ${Math.abs(Number(currentTariff.discount_amount))}${
      Number(currentTariff.discount_type) === PriceAndRestrictionsService.tariffDiscountTypePercent
        ? "%"
        : currencySign || "₽"
    } ${
      currentTariff?.extra?.markup_services?.length
        ? `${serviceWord} ${currentTariff.extra.markup_services.reduce((arr, service) => {
          const serviceName = additionalServices.find((s) => s.id === service)?.name;
          if (serviceName) arr.push(serviceName);
          return arr;
        }, []).join(", ")}`
        : ""
    }`;
  }
  return `${parentTariff.name} ${
    currentTariff?.extra?.markup_services?.length
      ? `${serviceWord} ${currentTariff.extra.markup_services.reduce((arr, service) => {
        const serviceName = additionalServices.find((s) => s.id === service)?.name;
        if (serviceName) arr.push(serviceName);
        return arr;
      }, []).join(", ")}`
      : ""
  }`;
}

export function getTariffDependentRestrictions(currentTariff) {
  const dependentRestrictionNames = Object.entries(restrictionTypes).reduce((arr, [restrictionKey, restrictionNames]) => {
    const key = PriceAndRestrictionsService.getServerRestrictionTypeName(restrictionKey);
    if (Number(currentTariff?.dependent_restrictions?.[key])) {
      arr.push(restrictionNames.alert);
    }
    return arr;
  }, []);
  return dependentRestrictionNames.length === Object.keys(restrictionTypes).length
    ? []
    : dependentRestrictionNames;
}
