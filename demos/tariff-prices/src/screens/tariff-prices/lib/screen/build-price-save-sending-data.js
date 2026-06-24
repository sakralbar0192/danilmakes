import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { buildPriceSaveRoutingContext } from "../tariff/price-save-layer.js";

/**
 * Тело POST /tariff/updatePrices из черновиков экрана (footer save preview и refetch).
 */
// eslint-disable-next-line import/prefer-default-export
export function buildSendingDataFromDraft({
  updatingPrices = {},
  pricesToDelete = {},
  updatedRestrictions = {},
  updatingAvailability = {},
  currentTariff,
  isDynamicPricesModeEnabled = false,
  isRmsPricingEnabled = false,
  pricesCalendarModel,
  roomtypes = [],
} = {}) {
  const { saveLayerCb, deleteLayerCb } = buildPriceSaveRoutingContext({
    planId: currentTariff?.id,
    roomtypes,
    model: pricesCalendarModel,
    isRmsPricingEnabled,
    isDynamicPricesModeEnabled,
  });

  return PriceAndRestrictionsService.buildUpdatePricesSendingData(
    {
      prices: updatingPrices,
      tariffId: currentTariff?.id,
      pricesToDelete,
      updatedRestrictions,
      updatingAvailability,
      hasDefaultMinstayRestriction: Boolean(currentTariff?.has_default_restriction),
    },
    {
      routePriceSaveLayer: saveLayerCb,
      routePriceDeleteLayer: deleteLayerCb,
      subrooms: new Map(),
    },
  );
}
