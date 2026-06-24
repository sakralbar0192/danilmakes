import moment from "moment";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { isExtraChargePriceId } from "../../table/lib/cell-identity.js";

export const SavePricesStrategy = Object.freeze({
  massive: "massive",
  resetDependent: "resetDependent",
  resetDefault: "resetDefault",
});

/**
 * @param {{
 *   selectedRoomtypes?: string[],
 *   datesPeriods?: string[][],
 *   dateFormat?: string,
 *   skipExtraChargeIds?: boolean,
 * }} options
 */
export function buildPricesToDeleteByPeriods({
  selectedRoomtypes = [],
  datesPeriods = [],
  dateFormat = PriceAndRestrictionsService.massiveUpdatingPricesDatesFormats.value,
  skipExtraChargeIds = false,
}) {
  if (!Array.isArray(selectedRoomtypes)) {
    throw new Error("option selectedRoomtypes must be an array");
  }

  if (!Array.isArray(datesPeriods)) {
    throw new Error("option datesPeriods must be an array");
  }

  if (typeof dateFormat !== "string") {
    throw new Error("option dateFormat must be a string");
  }

  const result = Object.create(null);

  for (const roomtype of selectedRoomtypes) {
    if (skipExtraChargeIds && isExtraChargePriceId(roomtype)) {
      continue;
    }

    result[roomtype] = [];

    const approachPeriods = new Set();
    for (const period of datesPeriods) {
      const [startPeriod, endPeriod] = period ?? [];
      if (!startPeriod || !endPeriod) {
        continue;
      }

      const date = moment(startPeriod, dateFormat);
      const endDate = moment(endPeriod, dateFormat);

      while (date.isSameOrBefore(endDate)) {
        approachPeriods.add(date.format(dateFormat));
        date.add(1, "days");
      }
    }

    if (approachPeriods.size > 0) {
      result[roomtype] = Array.from(approachPeriods);
    }
  }

  return result;
}

export function buildResetDependentPricesToDelete(options = {}) {
  return buildPricesToDeleteByPeriods({
    ...options,
    skipExtraChargeIds: true,
  });
}

export function buildResetDefaultPricesToDelete(options = {}) {
  return buildPricesToDeleteByPeriods({
    ...options,
    skipExtraChargeIds: false,
  });
}

const massiveUpdatingStrategy = {
  buildRequestData({
    tariffId,
    updatingMode,
    periods,
    roomtypes,
    weekdays,
    currency,
    priceDiff,
    prices,
  }) {
    return {
      tariffId,
      updatingMode,
      periods,
      roomtypes,
      weekdays,
      currency,
      priceDiff,
      prices,
    };
  },
  sendRequest({ payload, saveLayerCb }) {
    return PriceAndRestrictionsService.updateMassivePrices(payload, saveLayerCb);
  },
};

const resetDependentPricesStrategy = {
  buildRequestData({
    tariffId,
    selectedRoomtypes,
    datesPeriods,
  }) {
    return {
      tariffId,
      pricesToDelete: buildResetDependentPricesToDelete({
        selectedRoomtypes,
        datesPeriods: datesPeriods.map((v) => v.period),
        dateFormat: PriceAndRestrictionsService.massiveUpdatingPricesDatesFormats.value,
      }),
    };
  },
  sendRequest({
    payload, saveLayerCb, deleteLayerCb,
  }) {
    return PriceAndRestrictionsService.updatePrices(payload, {
      routePriceSaveLayer: saveLayerCb,
      routePriceDeleteLayer: deleteLayerCb,
      subrooms: new Map(),
    });
  },
};

const resetDefaultPricesStrategy = {
  buildRequestData({
    tariffId,
    selectedRoomtypes,
    datesPeriods,
  }) {
    return {
      tariffId,
      pricesToDelete: buildResetDefaultPricesToDelete({
        selectedRoomtypes,
        datesPeriods: datesPeriods.map((v) => v.period),
        dateFormat: PriceAndRestrictionsService.massiveUpdatingPricesDatesFormats.value,
      }),
    };
  },
  sendRequest({
    payload, saveLayerCb, deleteLayerCb,
  }) {
    return PriceAndRestrictionsService.updatePrices(payload, {
      routePriceSaveLayer: saveLayerCb,
      routePriceDeleteLayer: deleteLayerCb,
      subrooms: new Map(),
    });
  },
};

export const savePriceStrategies = Object.freeze({
  [SavePricesStrategy.massive]: massiveUpdatingStrategy,
  [SavePricesStrategy.resetDependent]: resetDependentPricesStrategy,
  [SavePricesStrategy.resetDefault]: resetDefaultPricesStrategy,
});

export function getSavePricesStrategy(updatingMode) {
  let strategyKey = SavePricesStrategy.massive;
  if (updatingMode === PriceAndRestrictionsService.resetDependentPricesMode) {
    strategyKey = SavePricesStrategy.resetDependent;
  } else if (updatingMode === PriceAndRestrictionsService.resetDefaultPricesMode) {
    strategyKey = SavePricesStrategy.resetDefault;
  }

  const strategy = savePriceStrategies[strategyKey];
  if (!strategy) {
    throw new Error(`SavePricesStrategy ${strategyKey} not found`);
  }
  return strategy;
}
