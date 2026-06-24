import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { isEmptyObject } from "@/utils/object";
import { mergeSavedAvailabilityIntoMetaResponse } from "./merge-saved-availability-into-meta-response.js";

const STORE_NS = "tariffPricesAndRestrictions";

/**
 * Загрузка модели календаря цен (foreground shell или фон после сохранения).
 *
 * @param {import("vue").default} vm — экземпляр корневого SFC экрана (`setIsLoading`, mapState)
 * @param {{ background?: boolean, parts?: string[], releaseLoading?: boolean, savedAvailability?: object|null }} options
 */
// eslint-disable-next-line import/prefer-default-export
export async function fetchTariffPricesCalendarData(vm, {
  background = false,
  parts = null,
  releaseLoading = true,
  savedAvailability = null,
} = {}) {
  if (!vm.currentTariff?.id) {
    return;
  }

  const normalizedParts = Array.isArray(parts)
    ? parts.filter(Boolean)
    : [];

  if (background && !normalizedParts.length) {
    throw new Error("fetchTariffPricesCalendarData: background refetch requires explicit parts");
  }

  // eslint-disable-next-line no-nested-ternary
  const requestParts = background
    ? normalizedParts
    : (normalizedParts.length ? normalizedParts : ["base"]);

  if (!background) {
    vm.setIsLoading(true);
  } else {
    await vm.$store.dispatch(`${STORE_NS}/beginBackgroundPartsRefetch`, { parts: requestParts });
  }

  try {
    const requestKey = [
      vm.currentTariff.id,
      vm.dateFrom,
      vm.mode,
    ].join("|");

    let response = await PriceAndRestrictionsService.getPricesAndRestrictionsDataRaw({
      planId: vm.currentTariff.id,
      dateFrom: vm.dateFrom,
      withDynamicPrices: vm.isDynamicPricesModeEnabled,
      parts: requestParts,
    }) || {};

    if (
      savedAvailability
      && !isEmptyObject(savedAvailability)
      && requestParts.includes("meta")
    ) {
      response = mergeSavedAvailabilityIntoMetaResponse(response, savedAvailability);
    }

    if (background) {
      await vm.$store.dispatch(`${STORE_NS}/finishBackgroundPartsRefetch`, {
        parts: requestParts,
        requestKey,
        response,
      });
    } else {
      await vm.$store.dispatch(`${STORE_NS}/updatePricesCalendarModelFromResponse`, {
        response,
        refetchParts: requestParts,
      });
      await vm.$store.dispatch(`${STORE_NS}/applyInitialPricesPayloadParts`, { fetchedParts: requestParts });
    }
  } finally {
    if (!background && releaseLoading) {
      vm.setIsLoading(false);
    }
  }
}
