import moment from "moment";
import TariffPricesCalendarModel from "@/models/tariff/prices-calendar-model";
import CoreService from "@/services/core";
import { isExtraChargePriceId } from "@/screens/tariff-prices/components/table/lib/cell-identity";
import { isEmptyObject } from "@/utils/object";
import { buildMassiveAvailabilitySendingData as buildMassiveAvailabilitySendingDataFn } from "@/screens/tariff-prices/lib/screen/build-massive-availability-sending-data";

export default class PriceAndRestrictionsService extends CoreService {
  static sendingDateFormat = "DD-M-YYYY";

  static massiveUpdatingPricesDatesFormats = {
    value: "YYYY-MM-DD",
    display: "DD.MM.YYYY",
    sending: "DD-MM-YYYY",
  };

  static modeDefaultPrice = "prices";

  static modeDynamicPrice = "rms_prices";

  static modeRestrictions = "restrictions";

  static modeRestrictionsWithPrices = "combined";

  static modeRestrictionsWithDynamicPrices = "combined_rms_prices";

  static manualUpdatingPricesMode = "from_table";

  static discountUpdatingPricesMode = "discount";

  static markupUpdatingPricesMode = "markup";

  static resetDependentPricesMode = "reset_dependent_prices";

  static resetDefaultPricesMode = "reset_default_prices";

  static updatingExtraChargesPricesFieldName = "extraCharge";

  static closedRestrictionName = "closed";

  /** RMS-правила на тарифе-родителе по данным каталога планов (индекс `rplansByIds`). */
  static parentPlanUsesRmsPricing(rplansByIds, parentPlanId) {
    if (parentPlanId == null || parentPlanId === "" || Number(parentPlanId) === 0) {
      return false;
    }
    return !!Number(rplansByIds?.[parentPlanId]?.extra?.rms_pricing_rules_enabled);
  }

  /** RMS включён у тарифного плана по каталогу `rplansByIds`. */
  static planUsesRmsPricing(rplansByIds, planId) {
    return PriceAndRestrictionsService.parentPlanUsesRmsPricing(rplansByIds, planId);
  }

  static closedArrivalRestrictionName = "closedArrival";

  static closedDepartureRestrictionName = "closedDeparture";

  static tariffDiscountTypePercent = 1;

  static tariffDiscountTypeCurrency = 2;

  static maxUpdatingPricesDatesPeriods = 30;

  /** Значение дня недели «все» для сравнения и API (объект с title для UI — в screen-config). */
  static allWeekdayValue = "all";

  /** Id валюты «процент» для validateDiscountChange. */
  static currencyIdPercent = "percent";

  /** Id валюты «сумма» для validateDiscountChange. */
  static currencyIdAmount = "amount";

  static roundingModes = {
    toInteger: 1,
    toTenths: 2,
    toHundredths: 3,
  };

  static roundingMap = {
    [PriceAndRestrictionsService.roundingModes.toInteger]: 1,
    [PriceAndRestrictionsService.roundingModes.toTenths]: 10,
    [PriceAndRestrictionsService.roundingModes.toHundredths]: 100,
  };

  static restrictionTypeEnum = {
    minstay: "minstay",
    minstayA: "minstayA",
    maxstay: "maxstay",
    closed: "closed",
    closedDeparture: "closedDeparture",
    closedArrival: "closedArrival",
  };

  static parseAmount(formattedValue, allowEmpty = false) {
    if (formattedValue == null) return allowEmpty ? "" : null;
    let str = String(formattedValue).trim();
    if (str === "" || str === "-" || str === ".") return allowEmpty ? "" : null;
    str = str.replace(/\s+/g, "").replace(/-/g, "").replace(/,/g, ".").replace(/[^\d.]/g, "");
    const num = Math.abs(parseFloat(str));
    if (isNaN(num)) return allowEmpty ? "" : null;
    return Math.round(num * 100) / 100;
  }

  static normalizeRestrictionNumber(value) {
    const normalizedValue = Number(value ?? 0);
    return Number.isFinite(normalizedValue) && normalizedValue > 0
      ? normalizedValue
      : 0;
  }

  static isMinstayGreaterThanMaxstay(restrictions = {}) {
    const minstay = PriceAndRestrictionsService.normalizeRestrictionNumber(restrictions?.minstay);
    const maxstay = PriceAndRestrictionsService.normalizeRestrictionNumber(restrictions?.maxstay);

    return Boolean(minstay && maxstay && minstay > maxstay);
  }

  static resolveMinMaxRestrictions({
    baseRestrictions = {},
    updatedRestrictions = {},
    parentRestrictions = {},
    dependencySettings = {},
  } = {}) {
    const resolved = {};

    ["minstay", "maxstay"].forEach((restrictionType) => {
      const hasUpdatedValue = Object.prototype.hasOwnProperty.call(updatedRestrictions, restrictionType);

      if (hasUpdatedValue) {
        resolved[restrictionType] = PriceAndRestrictionsService.normalizeRestrictionNumber(updatedRestrictions[restrictionType]);
        return;
      }

      if (Number(dependencySettings?.[restrictionType])) {
        resolved[restrictionType] = PriceAndRestrictionsService.normalizeRestrictionNumber(parentRestrictions?.[restrictionType]);
        return;
      }

      resolved[restrictionType] = PriceAndRestrictionsService.normalizeRestrictionNumber(baseRestrictions?.[restrictionType]);
    });

    return resolved;
  }

  static getDirectDependentPlans(currentTariff, allPlans = []) {
    const currentTariffId = Number(currentTariff?.id || 0);
    return (allPlans || []).filter((plan) => Number(plan?.dependent_restrictions?.parent_plan_id || 0) === currentTariffId);
  }

  /**
 * Валидирует процентное значение (скидку или наценку)
 * @param {*} value - входное значение (строка или число)
 * @param {number} min - минимальное допустимое значение (включительно)
 * @param {number} max - максимальное допустимое значение (включительно)
 * @returns {number} - валидное целое число или NaN
 */
  static validatePercent(value, min, max) {
    let num = parseFloat(String(value).replace(/,/g, "."));
    if (isNaN(num)) return "";
    if (num < min) num = min;
    if (num > max) num = max;
    return Math.round(num);
  }

  static validateDiscountAmount(value) {
    value = `${(value ?? "")}`.replace(/[^\d]/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    if (value === "") return "";
    return (parseInt(value, 10) || 1).toString();
  }

  static validateDiscountChange(value, changeType, currencyType) {
    const {
      discountUpdatingPricesMode, markupUpdatingPricesMode, currencyIdPercent,
    } = PriceAndRestrictionsService;
    switch (`${changeType}_${currencyType}`) {
      case `${discountUpdatingPricesMode}_${currencyIdPercent}`:
        return PriceAndRestrictionsService.validatePercent(value, 1, 99);
      case `${markupUpdatingPricesMode}_${currencyIdPercent}`:
        return PriceAndRestrictionsService.validatePercent(value, 1, 100);
      default:
        return PriceAndRestrictionsService.validateDiscountAmount(value);
    }
  }

  static checkNullishPrice(updatingPrices) {
    return Object.values(updatingPrices).some(prices => {
      return Object.values(prices).some(price => {
        return (typeof price !== "object" && price && !Number(price))
          || (typeof price === "object" && Object.values(price).some(extraPrices => {
            return Object.values(extraPrices).some(childrenAgePries => {
              return Object.values(childrenAgePries).some(bedTypePrice => bedTypePrice && !Number(bedTypePrice));
            });
          }));
      });
    });
  }

  static checkMode(mode, isRmsPricingEnabled, defaultPlanMode = PriceAndRestrictionsService.modeDefaultPrice, enabledCombinedMode = true) {
    const MODE_DEFAULT = PriceAndRestrictionsService.modeDefaultPrice;
    const MODE_DYNAMIC = PriceAndRestrictionsService.modeDynamicPrice;
    const MODE_RESTRICTIONS = PriceAndRestrictionsService.modeRestrictions;
    const MODE_COMBINED = PriceAndRestrictionsService.modeRestrictionsWithPrices;
    const MODE_DYNAMIC_COMBINED = PriceAndRestrictionsService.modeRestrictionsWithDynamicPrices;
    const VALID_MODES = [MODE_DEFAULT, MODE_DYNAMIC, MODE_RESTRICTIONS, MODE_COMBINED, MODE_DYNAMIC_COMBINED];
    const safeDefaultMode = VALID_MODES.includes(defaultPlanMode) ? defaultPlanMode : MODE_DEFAULT;
    let effectiveMode = VALID_MODES.includes(mode) ? mode : safeDefaultMode;
    if (isRmsPricingEnabled) {
      if (!VALID_MODES.includes(mode)) {
        effectiveMode = enabledCombinedMode ? MODE_DYNAMIC_COMBINED : MODE_DYNAMIC;
      } else if (effectiveMode === MODE_DEFAULT) {
        effectiveMode = enabledCombinedMode ? MODE_DYNAMIC_COMBINED : MODE_DYNAMIC;
      } else if (effectiveMode === MODE_DYNAMIC && enabledCombinedMode) {
        effectiveMode = MODE_DYNAMIC_COMBINED;
      }
    } else if (effectiveMode === MODE_DYNAMIC || effectiveMode === MODE_DYNAMIC_COMBINED) {
      effectiveMode = enabledCombinedMode ? MODE_COMBINED : MODE_DEFAULT;
    } else if (effectiveMode === MODE_DEFAULT || effectiveMode === MODE_RESTRICTIONS) {
      effectiveMode = enabledCombinedMode ? MODE_COMBINED : effectiveMode;
    }
    return effectiveMode;
  }

  static getServerRestrictionTypeName(type) {
    switch (type) {
      case "minstayA": return "minstay_a";
      case "closedArrival": return "closed_arrival";
      case "closedDeparture": return "closed_departure";
      default: return type;
    }
  }

  /** Пусто или явный ноль в черновике min stay (сброс дефолтного ограничения). */
  static isMinstayResetRawValue(raw) {
    return raw === "" || raw === 0 || raw === "0";
  }

  /**
   * Сериализация одного ограничения для API сохранения.
   * Для minstay при дефолтном ограничении тарифа сброс (0 / пусто) → "0", иначе как раньше `|| -1`.
   */
  static serializeRestrictionValueForSaving(raw, clientRestrictionType, hasDefaultMinstayRestriction) {
    const t = PriceAndRestrictionsService.restrictionTypeEnum;
    if (
      clientRestrictionType === t.minstay
      && hasDefaultMinstayRestriction
      && PriceAndRestrictionsService.isMinstayResetRawValue(raw)
    ) {
      return "0";
    }
    return `${raw || -1}`;
  }

  /**
   * Эффективное значение stay-ограничения для даты: черновик из updatedRestrictions или модель календаря.
   * @param {Record<string, *>} dayDraft — updatedRestrictions[roomtypeId][date]
   * @param {{ getRestriction?: (args: { id: string, date: string, name: string }) => { value?: number } }} model
   */
  static effectiveStayRestrictionValue(dayDraft, model, roomtypeId, date, key) {
    if (dayDraft && Object.prototype.hasOwnProperty.call(dayDraft, key)) {
      return Number(dayDraft[key]) || 0;
    }
    return model?.getRestriction?.({
      id: roomtypeId,
      date,
      name: key,
    })?.value ?? 0;
  }

  /**
   * Недопустимая комбинация min/max stay для подсветки ячейки таблицы ЦиО.
   * Сравниваются только minstay и maxstay; minstayA не участвует.
   */
  static getRestrictionStayCellUnacceptable(restrictionType, effMin, effMax) {
    const maxPositive = effMax > 0;
    const invalidMin = maxPositive && effMin > effMax;
    const t = PriceAndRestrictionsService.restrictionTypeEnum;
    if (restrictionType === t.minstay) return invalidMin;
    if (restrictionType === t.minstayA) return false;
    if (restrictionType === t.maxstay) return invalidMin;
    return false;
  }

  /**
   * Даты (timestamps), на которых в черновике `updatedRestrictions` недопустимая комбинация min/max stay
   * (только minstay и maxstay; minstayA не учитывается).
   * @returns {Set<number>}
   */
  static getInvalidStayCombinationTimestampsInUpdatedRestrictions(model, updatedRestrictions = {}) {
    const timestamps = new Set();
    if (!model || !updatedRestrictions || typeof updatedRestrictions !== "object") {
      return timestamps;
    }
    const t = PriceAndRestrictionsService.restrictionTypeEnum;
    for (const [roomtypeId, roomtypeData] of Object.entries(updatedRestrictions)) {
      if (!roomtypeData || typeof roomtypeData !== "object") {
        continue;
      }
      for (const date of Object.keys(roomtypeData)) {
        const dayDraft = roomtypeData[date] || {};
        const effMin = PriceAndRestrictionsService.effectiveStayRestrictionValue(dayDraft, model, roomtypeId, date, t.minstay);
        const effMax = PriceAndRestrictionsService.effectiveStayRestrictionValue(dayDraft, model, roomtypeId, date, t.maxstay);
        if (PriceAndRestrictionsService.isMinstayGreaterThanMaxstay({ minstay: effMin, maxstay: effMax })) {
          timestamps.add(new Date(date).getTime());
        }
      }
    }
    return timestamps;
  }

  /**
   * Проверка черновиков `updatedRestrictions` на недопустимую комбинацию min/max stay
   * (только minstay и maxstay).
   */
  static hasInvalidStayCombinationInUpdatedRestrictions(model, updatedRestrictions = {}) {
    return PriceAndRestrictionsService.getInvalidStayCombinationTimestampsInUpdatedRestrictions(model, updatedRestrictions).size > 0;
  }

  static async saveChoosenCategoriesFilter(choosenCategories) {
    const response = await this.http.post("/tariff/save_price_and_restrictions_choosen_categories_filter", { choosenCategories });
    return response?.result === "success";
  }

  static async saveChoosenRestrictionsFilter(choosenRestrictions) {
    const response = await this.http.post("/tariff/save_price_and_restrictions_choosen_restrictions_filter", { choosenRestrictions });
    return response?.result === "success";
  }

  static async saveChoosenCompactRestrictionsFilter(choosenRestrictionViewMode) {
    const response = await this.http.post("/tariff/save_price_and_restrictions_choosen_restriction_view_mode", { choosenRestrictionViewMode });
    return response?.result === "success";
  }

  /**
   * @param {object} data
   * @param {{
   *   routePriceSaveLayer?: ((tariffId: string|number, roomtypeId: string|number) => boolean)|null,
   *   routePriceDeleteLayer?: ((tariffId: string|number, roomtypeId: string|number, date: string) => boolean)|null,
   *   subrooms?: Map,
   * }} [options]
   */
  static buildUpdatePricesSendingData(
    data = {},
    {
      routePriceSaveLayer = null,
      routePriceDeleteLayer = null,
      subrooms = new Map(),
    } = {},
  ) {
    const sendingData = { plan_id: data.tariffId };
    const deleteCallback = routePriceDeleteLayer ?? routePriceSaveLayer;
    this.preparePricesForSaving(data, routePriceSaveLayer, sendingData);
    this.preparePricesToDeleteForSaving(data, sendingData, deleteCallback);
    this.prepareRestrictionsForSaving(data, subrooms, sendingData);
    this.prepareAvailabilityForSaving(data, sendingData);
    return sendingData;
  }

  static async postUpdatePricesSendingData(sendingData = {}) {
    const sendingKeys = ["prices", "dynamic_prices", "extra_charges", "delete_prices", "delete_dynamic_prices", "restrictions", "availability"];
    if (sendingKeys.some((key) => !isEmptyObject(sendingData[key]))) {
      return await this.http.post("/tariff/updatePrices", sendingData);
    }
    return { result: "success" };
  }

  static async updatePrices(
    data = {},
    {
      routePriceSaveLayer = null,
      routePriceDeleteLayer = null,
      subrooms = new Map(),
    } = {},
  ) {
    const sendingData = PriceAndRestrictionsService.buildUpdatePricesSendingData(data, {
      routePriceSaveLayer,
      routePriceDeleteLayer,
      subrooms,
    });
    return PriceAndRestrictionsService.postUpdatePricesSendingData(sendingData);
  }

  static prepareRestrictionsForSaving(data, subrooms, sendingData) {
    if (!Object.keys(data.updatedRestrictions || {}).length) return;
    const hasDefaultMinstayRestriction = Boolean(data.hasDefaultMinstayRestriction);
    const updated = {};
    for (const [roomtypeId, roomtypeData] of Object.entries(data.updatedRestrictions)) {
      updated[roomtypeId] = {};
      for (const [date, restrictions] of Object.entries(roomtypeData)) {
        updated[roomtypeId][date] = {};
        for (const type of Object.keys(restrictions)) {
          const key = PriceAndRestrictionsService.getServerRestrictionTypeName(type);
          const raw = data.updatedRestrictions[roomtypeId][date][type];
          updated[roomtypeId][date][key] = PriceAndRestrictionsService.serializeRestrictionValueForSaving(
            raw,
            type,
            hasDefaultMinstayRestriction,
          );
        }
      }
      for (const subroomId of subrooms.get(roomtypeId) || []) {
        updated[subroomId] = updated[roomtypeId];
      }
    }
    sendingData.restrictions = updated;
  }

  static availabilityReadModelMetaKey = "full_quantity";

  static isAvailabilityDraftValueEmpty(raw) {
    return raw === "" || raw === null || raw === undefined;
  }

  /**
   * Значение availability в теле POST: ноль — строкой, чтобы не терялся как falsy на BE.
   *
   * @param {number} num
   * @returns {number|string}
   */
  static formatAvailabilityValueForServer(num) {
    return num === 0 ? "0" : num;
  }

  /**
   * @param {*} raw
   * @returns {number|string}
   */
  static serializeAvailabilityValueForSaving(raw) {
    if (PriceAndRestrictionsService.isAvailabilityDraftValueEmpty(raw)) {
      throw new Error("availability.empty");
    }
    const num = Number(raw);
    if (!Number.isInteger(num) || num < 0) {
      throw new Error("availability.invalid");
    }
    return PriceAndRestrictionsService.formatAvailabilityValueForServer(num);
  }

  static prepareAvailabilityForSaving(data, sendingData) {
    const drafts = data.updatingAvailability || {};
    if (isEmptyObject(drafts)) {
      return;
    }

    const availability = {};
    for (const [roomtypeId, byDate] of Object.entries(drafts)) {
      for (const [date, raw] of Object.entries(byDate || {})) {
        if (date === PriceAndRestrictionsService.availabilityReadModelMetaKey) {
          continue;
        }
        if (!availability[roomtypeId]) {
          availability[roomtypeId] = {};
        }
        availability[roomtypeId][date] = PriceAndRestrictionsService.serializeAvailabilityValueForSaving(raw);
      }
    }
    if (!isEmptyObject(availability)) {
      sendingData.availability = availability;
    }
  }

  static preparePricesToDeleteForSaving(data, sendingData, checkIsCategoryHasDynamicRuleCallback) {
    if (!Object.keys(data.pricesToDelete || {}).length) return;
    const regularDeletedPrices = {};
    const dynamicDeletedPrices = {};
    Object.entries(data.pricesToDelete).forEach(([entityId, dates]) => {
      (dates || []).forEach((date) => {
        if (isExtraChargePriceId(String(entityId))) {
          if (!regularDeletedPrices[entityId]) {
            regularDeletedPrices[entityId] = {};
          }
          regularDeletedPrices[entityId][date] = "";
          return;
        }
        const useDynamicLayer = checkIsCategoryHasDynamicRuleCallback?.(
          data.tariffId,
          entityId,
          date,
        );
        if (useDynamicLayer) {
          if (!dynamicDeletedPrices[entityId]) {
            dynamicDeletedPrices[entityId] = {};
          }
          dynamicDeletedPrices[entityId][date] = "";
        } else {
          if (!regularDeletedPrices[entityId]) {
            regularDeletedPrices[entityId] = {};
          }
          regularDeletedPrices[entityId][date] = "";
        }
      });
    });
    if (Object.keys(regularDeletedPrices).length) sendingData.delete_prices = regularDeletedPrices;
    if (Object.keys(dynamicDeletedPrices).length) sendingData.delete_dynamic_prices = dynamicDeletedPrices;
  }

  static preparePricesForSaving(data, checkIsCategoryHasDynamicRuleCallback, sendingData) {
    const extraChargesPrices = {};
    const regularPrices = {};
    const dynamicPrices = {};
    Object.entries(data.prices || {}).forEach(([roomtypeId, daysInfo]) => {
      Object.entries(daysInfo || {}).forEach(([day, priceInfo]) => {
        if (day === PriceAndRestrictionsService.updatingExtraChargesPricesFieldName) {
          extraChargesPrices[roomtypeId] = priceInfo;
        } else if (checkIsCategoryHasDynamicRuleCallback?.(data.tariffId, roomtypeId)) {
          dynamicPrices[roomtypeId] = { ...(dynamicPrices[roomtypeId] || {}), [day]: priceInfo };
        } else {
          regularPrices[roomtypeId] = { ...(regularPrices[roomtypeId] || {}), [day]: priceInfo };
        }
      });
    });
    if (Object.keys(extraChargesPrices).length) sendingData.extra_charges = extraChargesPrices;
    if (Object.keys(regularPrices).length) sendingData.prices = regularPrices;
    if (Object.keys(dynamicPrices).length) sendingData.dynamic_prices = dynamicPrices;
  }

  /**
   * Тело POST /tariff/updateMassivePrices (для отправки и для выбора parts refetch).
   *
   * @param {object} data — payload дровера (`tariffId`, `updatingMode`, `periods`, `prices`, `roomtypes`, …)
   * @param {((tariffId: string|number, roomtypeId: string|number) => boolean)|null} routePriceSaveLayer
   * @returns {object}
   */
  static buildMassivePricesSendingData(data = {}, routePriceSaveLayer = null) {
    const fmt = PriceAndRestrictionsService.massiveUpdatingPricesDatesFormats;
    const sendingData = {
      plan_id: data.tariffId,
      update_mode: data.updatingMode || PriceAndRestrictionsService.manualUpdatingPricesMode,
      date_periods: (data.periods || []).map(item => ({
        date_from: moment(item.period[0], fmt.value).format(fmt.sending),
        date_to: moment(item.period[1], fmt.value).format(fmt.sending),
      })),
    };
    if (sendingData.update_mode === PriceAndRestrictionsService.manualUpdatingPricesMode) {
      const extraChargesPrices = {};
      const regularPrices = {};
      const dynamicPrices = {};
      Object.entries(data.prices || {}).forEach(([roomtypeId, weekdaysInfo]) => {
        Object.entries(weekdaysInfo || {}).forEach(([weekday, priceInfo]) => {
          if (weekday === PriceAndRestrictionsService.allWeekdayValue) return;
          if (weekday === PriceAndRestrictionsService.updatingExtraChargesPricesFieldName) {
            extraChargesPrices[roomtypeId] = priceInfo;
          } else if (routePriceSaveLayer?.(data.tariffId, roomtypeId)) {
            dynamicPrices[roomtypeId] = { ...(dynamicPrices[roomtypeId] || {}), [weekday]: priceInfo };
          } else {
            regularPrices[roomtypeId] = { ...(regularPrices[roomtypeId] || {}), [weekday]: priceInfo };
          }
        });
      });
      if (Object.keys(extraChargesPrices).length) sendingData.extra_charges = extraChargesPrices;
      if (Object.keys(regularPrices).length) sendingData.price_massive = regularPrices;
      if (Object.keys(dynamicPrices).length) sendingData.dynamic_price_massive = dynamicPrices;
    } else {
      const extraChargesIds = [];
      const regularIds = [];
      const dynamicIds = [];
      (data.roomtypes || []).forEach(roomtype => {
        const [roomtypeId, childrenAgeId] = roomtype.split("_");
        if (childrenAgeId) extraChargesIds.push(roomtype);
        else if (routePriceSaveLayer?.(data.tariffId, roomtypeId)) dynamicIds.push(roomtype);
        else regularIds.push(roomtype);
      });
      if (extraChargesIds.length) sendingData.extra_charges_ids = extraChargesIds;
      if (regularIds.length) sendingData.roomtype_ids = regularIds;
      if (dynamicIds.length) sendingData.dynamic_roomtype_ids = dynamicIds;
      sendingData.week_days = data.weekdays;
      sendingData.price_diff = data.priceDiff;
      sendingData.currency = data.currency;
    }
    return sendingData;
  }

  static async updateMassivePrices(data = {}, routePriceSaveLayer = null) {
    const sendingData = PriceAndRestrictionsService.buildMassivePricesSendingData(
      data,
      routePriceSaveLayer,
    );
    return await this.http.post("/tariff/updateMassivePrices", sendingData);
  }

  /**
   * Тело POST /tariff/updateMassiveAvailability (+ availability tree для ADR-005 merge).
   *
   * @param {object} data — payload дровера (`periods`, `roomtypes`, `weekdays`, `grid`)
   * @returns {object}
   */
  static buildMassiveAvailabilitySendingData(data = {}) {
    return buildMassiveAvailabilitySendingDataFn(data);
  }

  static async updateMassiveAvailability(data = {}) {
    const sendingData = PriceAndRestrictionsService.buildMassiveAvailabilitySendingData(data);
    const { datePeriods, availabilityMassive } = sendingData;
    const response = await this.http.post("/tariff/updateMassiveAvailability", {
      date_periods: datePeriods,
      availability_massive: availabilityMassive,
    });
    return { response, sendingData };
  }

  static async getPricesAndRestrictionsDataRaw({
    planId, dateFrom, withDynamicPrices, parts,
  }) {
    // eslint-disable-next-line no-nested-ternary
    const normalizedParts = Array.isArray(parts)
      ? parts.filter(Boolean).join(",")
      : (typeof parts === "string" ? parts : "");
    return await this.http.get("/tariff/getPricesAndRestrictionsData", {
      params: {
        planId,
        dateFrom,
        withDynamicPrices: withDynamicPrices ? 1 : 0,
        ...(normalizedParts ? { parts: normalizedParts } : {}),
      },
    }) || {};
  }

  /**
   * Собирает read-model из ответа API одним снимком.
   * @deprecated Используйте getPricesAndRestrictionsDataRaw + TariffPricesCalendarModel#updateFrom.
   */
  static async getPricesAndRestrictionsData({
    planId, dateFrom, withDynamicPrices, parts,
  }) {
    const response = await this.getPricesAndRestrictionsDataRaw({
      planId, dateFrom, withDynamicPrices, parts,
    });

    return new TariffPricesCalendarModel(
      response.calendar,
      response.default_prices,
      response.plan_prices,
      response.prices_all,
      response.rms_prices_all,
      response.extra_charges,
      response.availability,
      response.hotel_children_ages,
      response.restrictions,
      response.max_discount_child,
      response.dependent_child_minmax_restrictions,
      response.dependent_parent_minmax_restrictions,
      response.rms_prices_rule_source,
      response.rms_rule_roomtype_ids_by_plan,
    );
  }

  static async setTariffMain(id) {
    const response = await this.http.post("/tariff/setMain", { id });
    return response.result === "success";
  }

  static hasAllDependentRestrictionsFor(tariff) {
    const dependentRestrictions = tariff?.dependent_restrictions;
    if (!dependentRestrictions) return false;
    return Object.keys(this.restrictionTypeEnum).every((restrictionType) => {
      const serverName = this.getServerRestrictionTypeName(restrictionType);
      return Number(dependentRestrictions[serverName]);
    });
  }
}
