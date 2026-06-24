import OSF from "@/utils/object-structure-formatter.js";
import { hasOwn } from "@/utils/object";
import { buildRmsSalesLayerCellContext } from "@/models/tariff/rms-cell-context";
import { isDynamicLayerRmsManualCell,
  resolveBaseLayerPriceFallback,
  resolveDynamicLayerResetBaseline,
  resolveDynamicParentActualForDependent,
  resolveRegularPriceIsManualFromPricesAll } from "@/models/tariff/rms-manual-override";
import { normalizeRmsPricesRuleSource } from "@/models/tariff/rms-rule-source";
import { mergePlanKeyedSnapshot, normalizeRecordPayload } from "@/models/tariff/merge-plan-keyed-snapshot";

const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 7];

// Модель для календаря цен тарифа
export default class TariffPricesCalendarModel {
  static formatRmsPricesRuleSource(source) {
    return normalizeRmsPricesRuleSource(source);
  }

  static buildRmsRuleRoomtypeSet(roomtypeIds = []) {
    return new Set((roomtypeIds || []).map((id) => String(id)));
  }

  static buildRmsRuleRoomtypeIdsByPlan(byPlan = {}) {
    const map = new Map();
    Object.entries(byPlan || {}).forEach(([planId, roomtypeIds]) => {
      map.set(String(planId), TariffPricesCalendarModel.buildRmsRuleRoomtypeSet(roomtypeIds));
    });
    return map;
  }

  static mergeRmsRuleRoomtypeIdsByPlan(existing, incoming = {}) {
    const base = existing instanceof Map ? existing : new Map();
    const map = new Map(base);
    Object.entries(incoming || {}).forEach(([planId, roomtypeIds]) => {
      map.set(String(planId), TariffPricesCalendarModel.buildRmsRuleRoomtypeSet(roomtypeIds));
    });
    return map;
  }

  /** @param {object|null|undefined} tariff */
  static isMeaningfulMaxDiscountChild(tariff) {
    if (!tariff || typeof tariff !== "object") {
      return false;
    }
    if (tariff.id != null && String(tariff.id) !== "") {
      return true;
    }
    if (tariff.discount_amount != null && tariff.discount_amount !== "") {
      return true;
    }
    return false;
  }

  /** @param {object|null|undefined} tree */
  static hasRestrictionTreeData(tree) {
    return Boolean(tree && typeof tree === "object" && Object.keys(tree).length > 0);
  }

  static formatCalendar(calendar = []) {
    return (calendar || []).map(day => ({
      date: OSF.formatField("", day.date),
      weekday: OSF.formatField("", day.weekday),
      weekdayName: OSF.formatField("", day.weekday_name),
      day: OSF.formatField("", day.day),
      monthName: OSF.formatField("", day.month_name),
      monthNameGenitive: OSF.formatField("", day.month_name_genitive),
      isWeekend: OSF.formatField(false, day.is_weekend),
      shortMonthName: OSF.formatField("", day.short_month_name),
      isLastDayInMonth: OSF.formatField(false, day.is_last_day_in_month),
    }));
  }

  static formatDefaultPrices(defaultPrices = {}) {
    return Object.freeze(Object.entries((defaultPrices || {})).reduce((tariffObj, [tariffId, categoryInfoObj]) => {
      tariffObj[tariffId] = Object.entries((categoryInfoObj || {})).reduce((categoryObj, [categoryId, weekDaysPricesObject]) => {
        categoryObj[categoryId] = {};
        WEEK_DAYS.forEach(weekDay => {
          categoryObj[categoryId][weekDay] = OSF.formatField(0, weekDaysPricesObject[weekDay]);
        });
        return categoryObj;
      }, {});
      return tariffObj;
    }, {}));
  }

  static formatPlanPrices(planPrices = {}) {
    return Object.freeze(Object.entries((planPrices || {})).reduce((categoryObj, [categoryId, datePricesObject]) => {
      categoryObj[categoryId] = Object.entries((datePricesObject || {})).reduce((pricesObj, [date, price]) => {
        pricesObj[date] = OSF.formatField(0, price);
        return pricesObj;
      }, {});
      return categoryObj;
    }, {}));
  }

  static formatPricesAll(pricesAll = {}) {
    return Object.freeze(Object.entries((pricesAll || {})).reduce((tariffObj, [tariffId, categoryInfoObj]) => {
      tariffObj[tariffId] = Object.entries((categoryInfoObj || {})).reduce((categoryObj, [categoryId, datePricesObject]) => {
        categoryObj[categoryId] = Object.entries((datePricesObject || {})).reduce((pricesObj, [date, price]) => {
          pricesObj[date] = OSF.formatField(0, price);
          return pricesObj;
        }, {});
        return categoryObj;
      }, {});
      return tariffObj;
    }, {}));
  }

  static formatRmsPricesAll(rmsPricesAll = {}) {
    return Object.freeze(Object.entries((rmsPricesAll || {})).reduce((tariffObj, [tariffId, categoryInfoObj]) => {
      tariffObj[tariffId] = Object.entries((categoryInfoObj || {})).reduce((categoryObj, [categoryId, datePricesObject]) => {
        categoryObj[categoryId] = Object.entries((datePricesObject || {})).reduce((pricesObj, [date, priceInfoObj]) => {
          pricesObj[date] = {
            manual: OSF.formatField(0, priceInfoObj.manual),
            value: OSF.formatField(0, priceInfoObj.value),
            originalValue: priceInfoObj.original_value ?? null,
          };
          return pricesObj;
        }, {});
        return categoryObj;
      }, {});
      return tariffObj;
    }, {}));
  }

  static formatExtraChargesPrices(extraChargesPrices = {}) {
    return Object.freeze(Object.entries((extraChargesPrices || {})).reduce((tariffObj, [tariffId, categoryInfoObj]) => {
      tariffObj[tariffId] = Object.entries((categoryInfoObj || {})).reduce((categoryObj, [categoryId, childrenAgeInfoObj]) => {
        categoryObj[categoryId] = Object.entries((childrenAgeInfoObj || {})).reduce((childrenAgeObj, [childrenAgeId, bedTypesInfoObj]) => {
          childrenAgeObj[childrenAgeId] = Object.entries((bedTypesInfoObj || {})).reduce((bedTypesObj, [bedTypeId, datePricesObject]) => {
            bedTypesObj[bedTypeId] = Object.entries((datePricesObject || {})).reduce((pricesObj, [date, priceInfoObj]) => {
              pricesObj[date] = {
                manual: priceInfoObj.origin === "plan",
                value: OSF.formatField(0, priceInfoObj.value),
                originalValue: priceInfoObj.origin_value ?? null,
              };
              return pricesObj;
            }, {});
            return bedTypesObj;
          }, {});
          return childrenAgeObj;
        }, {});
        return categoryObj;
      }, {});
      return tariffObj;
    }, {}));
  }

  static formatAvailability(availability = {}) {
    return Object.freeze(Object.entries((availability || {})).reduce((availabilityObj, [categoryId, availabilityInfoObj]) => {
      availabilityObj[categoryId] = Object.entries((availabilityInfoObj || {})).reduce((dateObj, [date, dateAvailability]) => {
        dateObj[date] = OSF.formatField(0, dateAvailability);
        return dateObj;
      }, {});
      return availabilityObj;
    }, {}));
  }

  static formatHotelChildrenAges(hotelChildrenAges = {}) {
    return Object.freeze(Object.entries((hotelChildrenAges || {})).reduce((hotelChildrenAgeObj, [childrenAgeId, childrenAgeObj]) => {
      hotelChildrenAgeObj[childrenAgeId] = {
        bedsTypes: OSF.formatField("000", childrenAgeObj?.beds_types),
        minAge: OSF.formatField("0", childrenAgeObj?.min_age),
        maxAge: OSF.formatField("17", childrenAgeObj?.max_age),
      };
      return hotelChildrenAgeObj;
    }, {}));
  }

  static formatDependentParentMinmaxRestrictions(dependentParentMinmaxRestrictions = {}) {
    return Object.freeze(
      Object.entries((dependentParentMinmaxRestrictions || {})).reduce((categoriesObj, [categoryId, dateInfoObj]) => {
        categoriesObj[categoryId] = Object.entries((dateInfoObj || {})).reduce((datesObj, [date, restrictionObjInfo]) => {
          datesObj[date] = {
            minstay: OSF.formatField(0, restrictionObjInfo.minstay),
            maxstay: OSF.formatField(0, restrictionObjInfo.maxstay),
          };
          return datesObj;
        }, {});
        return categoriesObj;
      }, {}),
    );
  }

  static formatDependentChildMinmaxRestrictions(dependentChildMinmaxRestrictions = {}) {
    return Object.freeze(
      Object.entries((dependentChildMinmaxRestrictions || {})).reduce((plansObj, [planId, roomtypesObj]) => {
        plansObj[planId] = Object.entries((roomtypesObj || {})).reduce((categoriesObj, [categoryId, dateInfoObj]) => {
          categoriesObj[categoryId] = Object.entries((dateInfoObj || {})).reduce((datesObj, [date, restrictionObjInfo]) => {
            datesObj[date] = {
              minstay: OSF.formatField(0, restrictionObjInfo.minstay),
              maxstay: OSF.formatField(0, restrictionObjInfo.maxstay),
            };
            return datesObj;
          }, {});
          return categoriesObj;
        }, {});
        return plansObj;
      }, {}),
    );
  }

  static formatRestrictions(restrictions = {}) {
    return Object.freeze(Object.entries((restrictions || {})).reduce((categoryObj, [categoryId, dateInfoObj]) => {
      categoryObj[categoryId] = Object.entries((dateInfoObj || {})).reduce((dateObj, [date, restrictionObjInfo]) => {
        dateObj[date] = {
          minstay: OSF.formatField(0, restrictionObjInfo.minstay),
          minstayA: OSF.formatField(0, restrictionObjInfo.minstay_a),
          maxstay: OSF.formatField(0, restrictionObjInfo.maxstay),
          closed: OSF.formatField(0, restrictionObjInfo.closed),
          closedArrival: OSF.formatField(0, restrictionObjInfo.closed_arrival),
          closedDeparture: OSF.formatField(0, restrictionObjInfo.closed_departure),
        };
        return dateObj;
      }, {});
      return categoryObj;
    }, {}));
  }

  constructor(
    calendar = [],
    defaultPrices = {},
    planPrices = {},
    pricesAll = {},
    rmsPricesAll = {},
    extraChargesPrices = {},
    availability = {},
    hotelChildrenAges = {},
    restrictions = {},
    maxDiscountChildTariff = {},
    dependentChildMinmaxRestrictions = {},
    dependentParentMinmaxRestrictions = {},
    rmsPricesRuleSource = null,
    rmsRuleRoomtypeIdsByPlan = {},
  ) {
    this._parsedIdCache = new Map();
    this._priceCache = new Map();
    this._regularPriceCache = new Map();
    this._dynamicPriceCache = new Map();
    this._extraChargePriceCache = new Map();
    this._restrictionCache = new Map();
    this._closedCache = new Map();
    this._availabilityCache = new Map();
    this._rmsRuleRoomtypeIdsByPlan = TariffPricesCalendarModel.buildRmsRuleRoomtypeIdsByPlan(rmsRuleRoomtypeIdsByPlan);

    this.calendar = TariffPricesCalendarModel.formatCalendar(calendar);
    this.defaultPrices = TariffPricesCalendarModel.formatDefaultPrices(defaultPrices);
    this.planPrices = TariffPricesCalendarModel.formatPlanPrices(planPrices);
    this.pricesAll = TariffPricesCalendarModel.formatPricesAll(pricesAll);
    this.rmsPricesAll = TariffPricesCalendarModel.formatRmsPricesAll(rmsPricesAll);
    this.extraChargesPrices = TariffPricesCalendarModel.formatExtraChargesPrices(extraChargesPrices);
    this.availability = TariffPricesCalendarModel.formatAvailability(availability);
    this.hotelChildrenAges = TariffPricesCalendarModel.formatHotelChildrenAges(hotelChildrenAges);
    this.restrictions = TariffPricesCalendarModel.formatRestrictions(restrictions);
    this.maxDiscountChildTariff = maxDiscountChildTariff;
    this.dependentChildMinmaxRestrictions = TariffPricesCalendarModel.formatDependentChildMinmaxRestrictions(
      dependentChildMinmaxRestrictions,
    );
    this.dependentParentMinmaxRestrictions = TariffPricesCalendarModel.formatDependentParentMinmaxRestrictions(
      dependentParentMinmaxRestrictions,
    );
    this.rmsPricesRuleSource = TariffPricesCalendarModel.formatRmsPricesRuleSource(rmsPricesRuleSource);
  }

  /** Очистка derived-кэшей цен без сброса payload (смена mode отображения). */
  clearDerivedPriceCaches() {
    this._priceCache.clear();
    this._regularPriceCache.clear();
    this._dynamicPriceCache.clear();
    this._extraChargePriceCache.clear();
  }

  /** Сброс данных и кэшей контекста (planId + dateFrom) при смене тарифа или периода в store. */
  resetPlanScopedFields() {
    this._parsedIdCache.clear();
    this.clearDerivedPriceCaches();
    this._restrictionCache.clear();
    this._closedCache.clear();
    this._availabilityCache.clear();
    this._rmsRuleRoomtypeIdsByPlan = new Map();

    this.calendar = [];
    this.defaultPrices = {};
    this.planPrices = {};
    this.pricesAll = Object.freeze({});
    this.rmsPricesAll = Object.freeze({});
    this.extraChargesPrices = Object.freeze({});
    this.availability = {};
    this.hotelChildrenAges = {};
    this.restrictions = {};
    this.maxDiscountChildTariff = {};
    this.dependentChildMinmaxRestrictions = {};
    this.dependentParentMinmaxRestrictions = {};
    this.rmsPricesRuleSource = null;
  }

  /**
   * Обновляет данные модели из сырого ответа API (in-place, без смены ссылки на экземпляр).
   * @param {Object} response — объект с ключами API: calendar, default_prices, plan_prices, prices_all, rms_prices_all, extra_charges, availability, hotel_children_ages, restrictions, max_discount_child, dependent_child_minmax_restrictions, dependent_parent_minmax_restrictions
   * @param {{
   *   replacePricesAllPlanIds?: string[],
   *   replaceRmsPricesAllPlanIds?: string[],
   * }} [options] — при refetch planPrices/dynamic: заменить снимок по planId ветки (пустой ответ очищает ручные цены)
   */
  updateFrom(response = {}, options = {}) {
    this._parsedIdCache.clear();
    this._priceCache.clear();
    this._regularPriceCache.clear();
    this._dynamicPriceCache.clear();
    this._extraChargePriceCache.clear();
    this._restrictionCache.clear();
    this._closedCache.clear();
    this._availabilityCache.clear();

    if (hasOwn(response, "calendar")) {
      this.calendar = TariffPricesCalendarModel.formatCalendar(response.calendar);
    }
    if (hasOwn(response, "default_prices")) {
      this.defaultPrices = TariffPricesCalendarModel.formatDefaultPrices(response.default_prices);
    }
    if (hasOwn(response, "plan_prices")) {
      this.planPrices = TariffPricesCalendarModel.formatPlanPrices(
        normalizeRecordPayload(response.plan_prices),
      );
    }
    if (hasOwn(response, "prices_all")) {
      const incomingPricesAll = TariffPricesCalendarModel.formatPricesAll(
        normalizeRecordPayload(response.prices_all),
      );
      const replacePricesAllPlanIds = options.replacePricesAllPlanIds;
      this.pricesAll = Object.freeze(
        Array.isArray(replacePricesAllPlanIds) && replacePricesAllPlanIds.length
          ? mergePlanKeyedSnapshot(this.pricesAll || {}, incomingPricesAll, replacePricesAllPlanIds)
          : { ...this.pricesAll || {}, ...incomingPricesAll },
      );
    }
    if (hasOwn(response, "rms_prices_all")) {
      const incomingRmsPricesAll = TariffPricesCalendarModel.formatRmsPricesAll(
        normalizeRecordPayload(response.rms_prices_all),
      );
      const replaceRmsPricesAllPlanIds = options.replaceRmsPricesAllPlanIds;
      this.rmsPricesAll = Object.freeze(
        Array.isArray(replaceRmsPricesAllPlanIds) && replaceRmsPricesAllPlanIds.length
          ? mergePlanKeyedSnapshot(this.rmsPricesAll || {}, incomingRmsPricesAll, replaceRmsPricesAllPlanIds)
          : { ...this.rmsPricesAll || {}, ...incomingRmsPricesAll },
      );
    }
    if (hasOwn(response, "rms_prices_rule_source")) {
      this.rmsPricesRuleSource = TariffPricesCalendarModel.formatRmsPricesRuleSource(response.rms_prices_rule_source);
    }
    if (hasOwn(response, "rms_rule_roomtype_ids_by_plan")) {
      this._rmsRuleRoomtypeIdsByPlan = TariffPricesCalendarModel.mergeRmsRuleRoomtypeIdsByPlan(
        this._rmsRuleRoomtypeIdsByPlan,
        response.rms_rule_roomtype_ids_by_plan,
      );
    }
    if (hasOwn(response, "extra_charges")) {
      this.extraChargesPrices = Object.freeze(
        { ...this.extraChargesPrices || {}, ...TariffPricesCalendarModel.formatExtraChargesPrices(response.extra_charges) },
      );
    }
    if (hasOwn(response, "availability")) {
      this.availability = TariffPricesCalendarModel.formatAvailability(response.availability);
    }
    if (hasOwn(response, "hotel_children_ages")) {
      this.hotelChildrenAges = TariffPricesCalendarModel.formatHotelChildrenAges(response.hotel_children_ages);
    }
    if (hasOwn(response, "restrictions")) {
      this.restrictions = TariffPricesCalendarModel.formatRestrictions(response.restrictions);
    }
    if (hasOwn(response, "max_discount_child")) {
      const nextMaxDiscountChild = response.max_discount_child ?? {};
      if (TariffPricesCalendarModel.isMeaningfulMaxDiscountChild(nextMaxDiscountChild)) {
        this.maxDiscountChildTariff = nextMaxDiscountChild;
      }
    }
    if (hasOwn(response, "dependent_child_minmax_restrictions")) {
      const nextChildRestrictions = TariffPricesCalendarModel.formatDependentChildMinmaxRestrictions(
        response.dependent_child_minmax_restrictions,
      );
      if (
        TariffPricesCalendarModel.hasRestrictionTreeData(nextChildRestrictions)
        || !TariffPricesCalendarModel.hasRestrictionTreeData(this.dependentChildMinmaxRestrictions)
      ) {
        this.dependentChildMinmaxRestrictions = nextChildRestrictions;
      }
    }
    if (hasOwn(response, "dependent_parent_minmax_restrictions")) {
      const nextParentRestrictions = TariffPricesCalendarModel.formatDependentParentMinmaxRestrictions(
        response.dependent_parent_minmax_restrictions,
      );
      if (
        TariffPricesCalendarModel.hasRestrictionTreeData(nextParentRestrictions)
        || !TariffPricesCalendarModel.hasRestrictionTreeData(this.dependentParentMinmaxRestrictions)
      ) {
        this.dependentParentMinmaxRestrictions = nextParentRestrictions;
      }
    }
  }

  buildCacheKey(parts = []) {
    return parts.map(part => (part == null ? "" : String(part))).join("|");
  }

  parsePriceId(id = "") {
    if (this._parsedIdCache.has(id)) {
      return this._parsedIdCache.get(id);
    }

    const [roomtypeId = "", childrenAgeId = "", bedTypeId = ""] = `${id}`.split("_");
    const parsed = {
      roomtypeId,
      childrenAgeId,
      bedTypeId,
    };
    this._parsedIdCache.set(id, parsed);
    return parsed;
  }

  /**
   * Применяет строку модификатора зависимого тарифа к базовой сумме (`*` — множитель, иначе прибавление).
   * @param {number|string} base
   * @param {string} [modification]
   * @returns {number}
   */
  static applyParentModification(base, modification) {
    const b = Number(base) || 0;
    if (modification == null || modification === "") {
      return b;
    }
    const mod = String(modification);
    const rest = mod.slice(1);
    if (mod[0] === "*") {
      return b * Number(rest);
    }
    return b + Number(rest);
  }

  /**
   * Создает базовый шаблон объекта цены
   *
   * @returns {Object} Объект с базовыми свойствами цены
   * @property {boolean} unlocked - Флаг ручной установки рассчитываемой цены
   * @property {boolean} manual - Флаг ручной установки динамической цены цены
   * @property {number} originalValue - Исходное значение цены
   * @property {number} value - Текущее значение цены
 */
  getPricePattern() {
    return {
      unlocked: false,
      manual: false,
      dynamic: false,
      originalValue: null,
      value: 0,
      closed: false,
      basePrice: 0,
    };
  }

  checkClosedRestriction(roomtypeId, date) {
    const cacheKey = this.buildCacheKey([roomtypeId, date]);
    if (this._closedCache.has(cacheKey)) {
      return this._closedCache.get(cacheKey);
    }

    const value = Boolean(this.getRestriction({
      id: roomtypeId, date, name: "closed",
    }).value);

    this._closedCache.set(cacheKey, value);
    return value;
  }

  getRestriction({
    id, date, name = "",
  }) {
    const cacheKey = this.buildCacheKey([id, date, name]);
    if (this._restrictionCache.has(cacheKey)) {
      return this._restrictionCache.get(cacheKey);
    }

    const value = Object.freeze({ value: Number(this.restrictions?.[id]?.[date]?.[name] || 0) });
    this._restrictionCache.set(cacheKey, value);
    return value;
  }

  getDependentChildMinmaxRestrictions({
    planId,
    id,
    date,
  }) {
    return {
      minstay: Number(this.dependentChildMinmaxRestrictions?.[planId]?.[id]?.[date]?.minstay || 0),
      maxstay: Number(this.dependentChildMinmaxRestrictions?.[planId]?.[id]?.[date]?.maxstay || 0),
    };
  }

  getDependentParentMinmaxRestrictions({
    id,
    date,
  }) {
    return {
      minstay: Number(this.dependentParentMinmaxRestrictions?.[id]?.[date]?.minstay || 0),
      maxstay: Number(this.dependentParentMinmaxRestrictions?.[id]?.[date]?.maxstay || 0),
    };
  }

  /**
   * «Фактическое» число цены родителя для расчёта зависимого тарифа.
   * При parentUsesRmsPricing: RMS → prices_all → default (как при сбросе базового слоя).
   * Иначе: prices_all → default через getRegularPrice (без RMS).
   * @param {string|number} parentPlanId
   * @param {string} roomtypeId
   * @param {{ date?: string, weekday?: string|number }} day
   * @param {{ getOtherTariffPrice?: boolean, parentUsesRmsPricing?: boolean }} [options]
   * @returns {number}
   */
  getDependentParentActualValue(parentPlanId, roomtypeId, day, options = {}) {
    const getOtherTariffPrice = options.getOtherTariffPrice ?? false;
    const parentUsesRmsPricing = !!options.parentUsesRmsPricing;
    const pid = parentPlanId == null ? "" : parentPlanId;

    if (parentUsesRmsPricing) {
      const {
        defaultPriceForWeekday,
        hasPricesAllForDate,
        pricesAllValueForDate,
        hasPlanPriceForDate,
        planPriceForDate,
        rmsCurrentValue,
        rmsOriginalValue,
      } = buildRmsSalesLayerCellContext(this, {
        planId: pid,
        roomtypeId,
        date: day?.date,
        weekday: day?.weekday,
        getOtherTariffPrice: true,
      });
      return resolveDynamicParentActualForDependent({
        rmsCurrentValue,
        rmsOriginalValue,
        hasPlanPriceForDate,
        planPriceForDate,
        hasPricesAllForDate,
        pricesAllValueForDate,
        defaultPriceForWeekday,
      });
    }

    return Number(this.getRegularPrice(pid, roomtypeId, day, null, getOtherTariffPrice)?.value ?? 0);
  }

  /**
   * originalValue для зависимого тарифа: модифицированный факт родителя (RMS при наличии) + встроенные доп. услуги по дефолтам.
   * @param {object} params
   * @param {string|number} params.planId — дочерний план
   * @param {string} params.roomtypeId
   * @param {{ weekday?: string|number }} params.day
   * @param {{ id?: string, modification?: string }} params.parentInfo
   * @param {boolean} [params.getOtherTariffPrice=true] — как при снятии фактической цены родителя (other tariff)
   */
  computeDependentChildOriginalValue({
    planId,
    roomtypeId,
    day,
    parentInfo,
    getOtherTariffPrice = true,
  }) {
    const weekdayKey = day.weekday;
    const pid = parentInfo.id;
    const defaultParent = Number(this.defaultPrices?.[pid]?.[roomtypeId]?.[weekdayKey] ?? 0);
    const defaultChild = Number(this.defaultPrices?.[planId]?.[roomtypeId]?.[weekdayKey] ?? 0);
    const mod = parentInfo?.modification;
    const modifiedParentDefault = mod
      ? TariffPricesCalendarModel.applyParentModification(defaultParent, mod)
      : defaultParent;
    /** На дефолтных ценах: разница дочерней и модифицированной родительской — сумма включённых в цену доп. услуг (может быть < 0 при аномальных данных). */
    const embeddedExtras = defaultChild - modifiedParentDefault;
    const parentActual = this.getDependentParentActualValue(pid, roomtypeId, day, {
      getOtherTariffPrice,
      parentUsesRmsPricing: !!parentInfo?.parentUsesRmsPricing,
    });
    const modifiedParentActual = mod
      ? TariffPricesCalendarModel.applyParentModification(parentActual, mod)
      : parentActual;
    return modifiedParentActual + embeddedExtras;
  }

  getPrice({
    id,
    tariffId,
    day,
    isDynamicPricesModeEnabled,
    parentInfo = { id: "", modification: "" },
    getOtherTariffPrice = false,
    extraChargeCategoryDefault = null,
  }) {
    const isDependentTariff = Boolean(parentInfo?.id);
    const cacheKey = this.buildCacheKey([
      tariffId,
      id,
      day?.date,
      day?.weekday,
      isDynamicPricesModeEnabled ? 1 : 0,
      parentInfo?.id,
      parentInfo?.modification,
      parentInfo?.parentUsesRmsPricing ? 1 : 0,
      getOtherTariffPrice ? 1 : 0,
      isDependentTariff ? extraChargeCategoryDefault ?? "" : "",
    ]);
    if (this._priceCache.has(cacheKey)) {
      return this._priceCache.get(cacheKey);
    }

    const {
      roomtypeId, childrenAgeId, bedTypeId,
    } = this.parsePriceId(id);
    let price;
    if (childrenAgeId && bedTypeId) {
      price = this.getExtraChargePrice(
        tariffId,
        roomtypeId,
        childrenAgeId,
        bedTypeId,
        day,
        {
          isDependentTariff,
          categoryDefault: extraChargeCategoryDefault,
        },
      ) ?? "";
    } else {
      price = !isDependentTariff && isDynamicPricesModeEnabled
        ? this.getDynamicPrice({
          planId: tariffId,
          roomtypeId,
          day,
          getOtherTariffPrice,
        }) ?? ""
        : this.getRegularPrice(
          tariffId,
          roomtypeId,
          day,
          parentInfo,
          getOtherTariffPrice,
        ) ?? "";
    }

    this._priceCache.set(cacheKey, price);
    return price;
  }

  /**
   * Получает базовую цену для указанного плана и типа номера на определенную дату
   * @param {string} planId - Идентификатор тарифного плана
   * @param {string} roomtypeId - Идентификатор типа номера
   * @param {Object} [day = { date: "", weekday: "" }] - Объект с информацией о дате
   * @param {string} day.date - Дата в формате YYYY-MM-DD
   * @param {string} day.weekday - День недели (например, 1)
   *
   * @returns {Object} Объект с информацией о цене
 */
  getRegularPrice(planId, roomtypeId, day, parentInfo, getOtherTariffPrice = false) {
    const hasOwnDatePrice = day.date in (this.pricesAll?.[planId]?.[roomtypeId] || {});
    const cacheKey = this.buildCacheKey([
      planId,
      roomtypeId,
      day?.date,
      day?.weekday,
      parentInfo?.id,
      parentInfo?.modification,
      parentInfo?.parentUsesRmsPricing ? 1 : 0,
      getOtherTariffPrice ? 1 : 0,
    ]);
    if (this._regularPriceCache.has(cacheKey)) {
      return this._regularPriceCache.get(cacheKey);
    }

    const price = this.getPricePattern();
    if (!getOtherTariffPrice && day.date in (this.planPrices?.[roomtypeId] || {})) {
      price.value = this.planPrices?.[roomtypeId]?.[day.date];
      price.unlocked = true;
    } else if (hasOwnDatePrice) {
      const pricesAllValueForDate = this.pricesAll?.[planId]?.[roomtypeId]?.[day.date];
      const rmsCtx = buildRmsSalesLayerCellContext(this, {
        planId,
        roomtypeId,
        date: day.date,
        weekday: day.weekday,
        getOtherTariffPrice,
      });
      if (rmsCtx.rmsPriceInfo && !rmsCtx.rmsPriceInfo.manual) {
        price.value = resolveDynamicLayerResetBaseline({
          rmsOriginalValue: rmsCtx.rmsOriginalValue,
          rmsCurrentValue: rmsCtx.rmsCurrentValue,
          hasPlanPriceForDate: rmsCtx.hasPlanPriceForDate,
          planPriceForDate: rmsCtx.planPriceForDate,
          defaultPriceForWeekday: rmsCtx.defaultPriceForWeekday,
          hasPricesAllForDate: rmsCtx.hasPricesAllForDate,
          pricesAllValueForDate: rmsCtx.pricesAllValueForDate,
        }) ?? 0;
      } else {
        price.value = resolveBaseLayerPriceFallback({
          hasPlanPriceForDate: false,
          hasPricesAllForDate: true,
          pricesAllValueForDate,
          defaultPriceForWeekday: this.defaultPrices?.[planId]?.[roomtypeId]?.[day.weekday] || 0,
          rmsCurrentValue: rmsCtx.rmsCurrentValue,
          rmsOriginalValue: rmsCtx.rmsOriginalValue,
        }) ?? 0;
      }
      if (!parentInfo?.id) {
        price.manual = resolveRegularPriceIsManualFromPricesAll({
          pricesAllValueForDate,
          rmsCurrentValue: rmsCtx.rmsCurrentValue,
          rmsOriginalValue: rmsCtx.rmsOriginalValue,
        });
      }
    } else {
      price.value = this.defaultPrices?.[planId]?.[roomtypeId]?.[day.weekday] || 0;
    }


    if (parentInfo?.id) {
      const dependentValue = this.computeDependentChildOriginalValue({
        planId,
        roomtypeId,
        day,
        parentInfo,
        getOtherTariffPrice: true,
      });
      // Для зависимого тарифа без ручной цены в день берём вычисленную цену от родителя.
      if (!price.unlocked && !hasOwnDatePrice) {
        price.value = dependentValue;
      }
      price.originalValue = dependentValue;
    } else {
      price.originalValue = price.unlocked
        ? this.defaultPrices?.[planId]?.[roomtypeId]?.[day.weekday] ?? null
        : price.value;
    }
    price.closed = this.checkClosedRestriction(roomtypeId, day.date);

    const frozenPrice = Object.freeze(price);
    this._regularPriceCache.set(cacheKey, frozenPrice);
    return frozenPrice;
  }

  /**
 * Динамическая (RMS) цена на слое продаж. Зависимые тарифы не используют этот метод —
 * для них расчёт от родителя в {@link getRegularPrice} / {@link computeDependentChildOriginalValue}.
 *
 * @param {object} params
 * @param {string} params.planId - Идентификатор тарифного плана
 * @param {string} params.roomtypeId - Идентификатор типа номера
 * @param {Object} [params.day={ date: '', weekday: '' }] - Объект с информацией о дате
 * @param {string} params.day.date - Дата в формате YYYY-MM-DD
 * @param {string} params.day.weekday - День недели (например, '1')
 * @param {boolean} [params.getOtherTariffPrice=false]
 * @returns {Object} Объект с информацией о цене
 */
  getDynamicPrice({
    planId,
    roomtypeId,
    day = { date: "", weekday: "" },
    getOtherTariffPrice = false,
  }) {
    const cacheKey = this.buildCacheKey([
      planId,
      roomtypeId,
      day?.date,
      day?.weekday,
      getOtherTariffPrice ? 1 : 0,
    ]);
    if (this._dynamicPriceCache.has(cacheKey)) {
      return this._dynamicPriceCache.get(cacheKey);
    }

    let price = this.getPricePattern();
    const {
      rmsPriceInfo,
      defaultPriceForWeekday: defaultForWeekday,
      hasPricesAllForDate,
      pricesAllValueForDate,
      hasPlanPriceForDate,
      planPriceForDate,
      rmsCurrentValue,
      rmsOriginalValue,
    } = buildRmsSalesLayerCellContext(this, {
      planId,
      roomtypeId,
      date: day.date,
      weekday: day.weekday,
      getOtherTariffPrice,
    });
    const resetBaselineInput = {
      defaultPriceForWeekday: defaultForWeekday,
      hasPlanPriceForDate,
      planPriceForDate,
      hasPricesAllForDate,
      pricesAllValueForDate,
      rmsCurrentValue,
      rmsOriginalValue,
    };
    if (rmsPriceInfo) {
      price = {
        ...price,
        value: rmsPriceInfo?.value || 0,
        manual: isDynamicLayerRmsManualCell({
          rmsPriceInfo,
          defaultPriceForWeekday: defaultForWeekday,
          hasPricesAllForDate,
          pricesAllValueForDate,
        }),
        dynamic: !rmsPriceInfo.manual,
        originalValue: resolveDynamicLayerResetBaseline(resetBaselineInput),
      };
    } else if (!getOtherTariffPrice && day.date in (this.planPrices?.[roomtypeId] || {})) {
      price.value = this.planPrices?.[roomtypeId]?.[day.date];
      price.unlocked = true;
    } else if (hasPricesAllForDate) {
      price.value = pricesAllValueForDate;
      price.originalValue = resolveDynamicLayerResetBaseline(resetBaselineInput);
    } else {
      price.value = this.defaultPrices?.[planId]?.[roomtypeId]?.[day.weekday] || 0;
    }

    if (price.unlocked) {
      price.originalValue = this.defaultPrices?.[planId]?.[roomtypeId]?.[day.weekday] ?? null;
    }
    price.closed = this.checkClosedRestriction(roomtypeId, day.date);

    const frozenPrice = Object.freeze(price);
    this._dynamicPriceCache.set(cacheKey, frozenPrice);
    return frozenPrice;
  }

  /**
   * Получает дефолтную цену для указанного плана и типа номера на определенный день недели
   * @param {string} planId - Идентификатор тарифного плана
   * @param {string} roomtypeId - Идентификатор типа номера
   * @param {Object} weekday - Номер дня недели начиная с понедельника (1)
   *
   * @returns {number} Значение цены
 */
  getDefaultPrice(planId, roomtypeId, weekday) {
    return this.defaultPrices?.[planId]?.[roomtypeId]?.[weekday] || 0;
  }

  /**
 * Получает дополнительную плату за размещение детей с учетом типа кровати, номера и даты
 *
 * @param {string} childrenAgeId - Идентификатор возрастной группы ребенка
 * @param {string} bedTypeId - Идентификатор типа кровати
 * @param {string} roomtypeId - Идентификатор типа номера
 * @param {Object} day = { date: '', weekday: '' } - Объект с информацией о дате
 * @param {string} day.date - Дата в формате YYYY-MM-DD
 * @param {string} day.weekday - День недели (например, '1')
 *
 * @returns {Object} Объект с информацией о цене дополнительной платы
 */
  getExtraChargePrice(
    tariffId,
    roomtypeId,
    childrenAgeId,
    bedTypeId,
    day = { date: "", weekday: "" },
    { isDependentTariff = false, categoryDefault = null } = {},
  ) {
    const cacheKey = this.buildCacheKey([
      tariffId,
      roomtypeId,
      childrenAgeId,
      bedTypeId,
      day?.date,
      day?.weekday,
      isDependentTariff ? 1 : 0,
      isDependentTariff ? categoryDefault ?? "" : "",
    ]);
    if (this._extraChargePriceCache.has(cacheKey)) {
      return this._extraChargePriceCache.get(cacheKey);
    }

    const price = this.getPricePattern();
    const priceInfo = this.extraChargesPrices?.[tariffId]?.[roomtypeId]?.[childrenAgeId]?.[bedTypeId]?.[day.date];

    price.value = priceInfo?.value ?? "";
    price.manual = !!priceInfo?.manual;
    price.unlocked = !!priceInfo?.manual;
    if (isDependentTariff && categoryDefault != null) {
      price.originalValue = categoryDefault;
    } else if (price.manual) {
      price.originalValue = priceInfo.originalValue ?? null;
    } else {
      price.originalValue = price.value;
    }
    price.closed = this.checkClosedRestriction(roomtypeId, day.date);

    const frozenPrice = Object.freeze(price);
    this._extraChargePriceCache.set(cacheKey, frozenPrice);
    return frozenPrice;
  }

  getAvailability(roomtypeId, date = "") {
    const cacheKey = this.buildCacheKey([roomtypeId, date]);
    if (this._availabilityCache.has(cacheKey)) {
      return this._availabilityCache.get(cacheKey);
    }

    const availability = date in (this.availability?.[roomtypeId] || {})
      ? this.availability?.[roomtypeId]?.[date]
      : this.availability?.[roomtypeId]?.full_quantity || 0;

    this._availabilityCache.set(cacheKey, availability);
    return availability;
  }

  /**
   * Загружена ли конфигурация категорий БП для плана (есть ключ в rms_rule_roomtype_ids_by_plan).
   * @param {string|number} planId
   */
  isRmsRuleRoomtypeConfigLoadedForPlan(planId) {
    return this._rmsRuleRoomtypeIdsByPlan?.has(String(planId)) ?? false;
  }

  /**
   * Id категорий с правилами БП для плана (sorted).
   * @param {string|number} planId
   * @returns {string[]}
   */
  getRmsRuleRoomtypeIdsForPlan(planId) {
    const roomtypeSet = this._rmsRuleRoomtypeIdsByPlan?.get(String(planId));
    if (!roomtypeSet?.size) {
      return [];
    }
    return [...roomtypeSet].sort((a, b) => String(a).localeCompare(String(b)));
  }

  /**
   * Токен конфигурации категорий БП для мемоизации строк таблицы.
   * @param {string|number} planId
   */
  getRmsRuleRoomtypeIdsToken(planId) {
    return this.getRmsRuleRoomtypeIdsForPlan(planId).join(",");
  }

  /**
   * Категория указана в конфигурации БП по ценам (rms_rule_roomtype_ids_by_plan).
   * @param {string|number} planId
   * @param {string|number} roomtypeId
   */
  isCategoryHasDynamicRule(planId, roomtypeId) {
    const roomtypeSet = this._rmsRuleRoomtypeIdsByPlan?.get(String(planId));
    return roomtypeSet?.has(String(roomtypeId)) ?? false;
  }
}
