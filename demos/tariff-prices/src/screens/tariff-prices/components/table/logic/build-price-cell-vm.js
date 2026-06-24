import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { buildRmsSalesLayerCellContext } from "@/models/tariff/rms-cell-context";
import { cellTypes } from "../config/cell-types.js";
import { formatAmount } from "../../../config/format-amount.js";
import { priceCellResetDataAttrName,
  priceCellRemoveDataAttrName } from "../config/table-grid-metrics.js";
import { buildCellKey, parsePriceId } from "../lib/cell-identity.js";
import { getClosedSaleRestrictionRoomtypeId } from "../lib/closed-sale-roomtype-id.js";
import { hasPriceDraftInTree,
  isZeroPriceValidationError } from "../../../config/resolve-price-draft-from-input.js";
import { resolveBpRuleRoomtypeId } from "../../../lib/flat-roomtypes.js";
import { resolveCategoryWritesToDynamicLayer } from "../../../lib/tariff/price-save-layer.js";
import { resolvePriceCellIsDynamic } from "./resolve-price-cell-is-dynamic.js";
import { canMarkPriceForDelete, resolvePriceCellIsManual } from "./resolve-price-cell-is-manual.js";
import { resolvePriceCellRequiredParts } from "../../../lib/screen/resolve-table-required-parts.js";
import { buildPartsReadinessToken, isPartsPending } from "../../../lib/screen/table-parts-readiness.js";
import { resolveExtraChargeCategoryDefault } from "../../../lib/tariff/resolve-extra-charge-category-default.js";

export function getPriceCellDataId(roomtype, childrenAgeId, bedTypeId) {
  return childrenAgeId && bedTypeId
    ? `${roomtype.id}_${childrenAgeId}_${bedTypeId}`
    : roomtype.id;
}

function readPriceCellDraftState({
  updatingPrices,
  dataId,
  dayDate,
  childrenAgeId,
  bedTypeId,
  roomtype,
}) {
  const hasDraft = hasPriceDraftInTree(updatingPrices, dataId, dayDate);
  const updatingValue = hasDraft
    ? (childrenAgeId && bedTypeId
      ? updatingPrices?.[roomtype?.id]?.[PriceAndRestrictionsService.updatingExtraChargesPricesFieldName]?.[childrenAgeId]?.[bedTypeId]?.[dayDate]
      : updatingPrices?.[roomtype?.id]?.[dayDate])
    : "";
  return {
    hasDraft, updatingValue, isUpdating: hasDraft,
  };
}

function buildPriceCellVmSignature(fields) {
  return fields.join("|");
}

/**
 * @param {{
 *   roomtype: object,
 *   day: object,
 *   isMain?: boolean,
 *   childrenAgeId?: string,
 *   bedTypeId?: string,
 *   pricesCalendarModel: object,
 *   currentTariff: object|null,
 *   updatingPrices: object,
 *   pricesToDelete: object,
 *   unacceptablePrices: object,
 *   getRoomtypeClosedState: (roomtypeId: string|number, date: string) => boolean,
 *   isDynamicPricesModeEnabled: boolean,
 *   parentPriceModification: unknown,
 *   isOneOfPricesModesEnabled: boolean,
 *   isMobileDevice: boolean,
 *   isCurrentTariffDepend: boolean,
 *   currencySign: string,
 *   cellHeight: number,
 *   cellVmCachePrice: Map,
 *   parentUsesRmsPricing?: boolean,
 *   canResetPriceToDefault?: boolean,
 *   isRmsPricingEnabled?: boolean,
 *   allRoomtypes?: object[],
 *   partsLoadState?: object,
 * }} input
 */
export function computePriceCellVm(input) {
  const {
    roomtype,
    day,
    isMain = false,
    childrenAgeId = "",
    bedTypeId = "",
    allRoomtypes = [],
    pricesCalendarModel,
    currentTariff,
    updatingPrices,
    pricesToDelete,
    unacceptablePrices,
    getRoomtypeClosedState,
    isDynamicPricesModeEnabled,
    parentPriceModification,
    isOneOfPricesModesEnabled,
    isMobileDevice,
    isCurrentTariffDepend,
    currencySign,
    cellHeight,
    cellVmCachePrice,
    pricesCalendarModelUpdatedAt,
    canResetPriceToDefault = true,
    parentUsesRmsPricing = false,
    isRmsPricingEnabled = false,
    partsLoadState = {},
  } = input;

  const dataId = getPriceCellDataId(roomtype, childrenAgeId, bedTypeId);
  const dayDate = day?.date;
  const cellKey = buildCellKey({
    cellType: cellTypes.price,
    id: dataId,
    date: dayDate,
  });
  const { updatingValue, isUpdating } = readPriceCellDraftState({
    updatingPrices,
    dataId,
    dayDate,
    childrenAgeId,
    bedTypeId,
    roomtype,
  });
  const priceToRemoved = (pricesToDelete?.[dataId] ?? []).includes(dayDate);
  const isUnacceptable = (unacceptablePrices?.[dataId] || []).includes(dayDate);

  const requiredParts = resolvePriceCellRequiredParts({
    childrenAgeId,
    bedTypeId,
    isDynamicPricesModeEnabled,
    isRmsPricingEnabled,
    isCurrentTariffDepend,
    parentUsesRmsPricing,
  });
  const partsPending = isPartsPending(requiredParts, partsLoadState);
  const partsReadinessToken = buildPartsReadinessToken(requiredParts, partsLoadState);

  if (partsPending) {
    const pendingSignature = buildPriceCellVmSignature([
      "pending",
      partsReadinessToken,
      cellKey,
      dataId,
      dayDate ?? "",
      cellHeight,
      updatingValue,
      isUpdating ? 1 : 0,
    ]);
    const cachedPending = cellVmCachePrice.get(cellKey);
    if (cachedPending && cachedPending.signature === pendingSignature) {
      return cachedPending.cellVm;
    }
    const skeletonVm = {
      isDataPending: true,
      cellKey,
      dataId,
      day,
      isMain,
      displayedPriceValue: "",
      needShowResetButton: false,
      isManual: false,
      isDynamic: false,
      isSaleClosed: false,
      isUpdating: false,
      isUnacceptable: false,
      isZeroPriceDraft: false,
      isTooltipDisabled: true,
      buttonAction: "",
      currentTariffIsDependent: isCurrentTariffDepend,
      currencySign: currencySign || "₽",
      cellHeight,
    };
    if (cellVmCachePrice.size > 500) cellVmCachePrice.clear();
    cellVmCachePrice.set(cellKey, {
      signature: pendingSignature,
      cellVm: skeletonVm,
    });
    return skeletonVm;
  }

  const parentInfo = {
    id: Number(currentTariff?.parent_id),
    modification: parentPriceModification,
    parentUsesRmsPricing,
  };
  const extraChargeCategoryDefault = childrenAgeId && bedTypeId
    ? resolveExtraChargeCategoryDefault(roomtype, childrenAgeId, bedTypeId)
    : null;
  const cached = cellVmCachePrice.get(cellKey);
  const fetchedPrice = pricesCalendarModel?.getPrice?.({
    id: dataId,
    tariffId: currentTariff?.id,
    day,
    isDynamicPricesModeEnabled,
    parentInfo,
    extraChargeCategoryDefault,
  }) ?? {
    value: 0, originalValue: null, manual: false, dynamic: false, closed: false, unlocked: false,
  };
  const closedOwnerId = getClosedSaleRestrictionRoomtypeId(roomtype);
  const isSaleClosed = getRoomtypeClosedState(closedOwnerId, dayDate);

  const { roomtypeId } = parsePriceId(dataId);
  const resolvedRoomtypeId = roomtypeId || roomtype?.id;
  const bpRuleRoomtypeId = childrenAgeId && bedTypeId
    ? resolvedRoomtypeId
    : resolveBpRuleRoomtypeId(allRoomtypes, resolvedRoomtypeId);
  const tariffId = currentTariff?.id;
  const rmsCtx = tariffId && resolvedRoomtypeId && dayDate
    ? buildRmsSalesLayerCellContext(pricesCalendarModel, {
      planId: tariffId,
      roomtypeId: resolvedRoomtypeId,
      date: dayDate,
      weekday: day?.weekday,
    })
    : {
      rmsPriceInfo: null,
      defaultPriceForWeekday: 0,
      hasPricesAllForDate: false,
      pricesAllValueForDate: null,
    };
  const {
    rmsPriceInfo,
    defaultPriceForWeekday,
    hasPricesAllForDate,
    pricesAllValueForDate,
  } = rmsCtx;
  const categoryWritesToDynamicLayer = childrenAgeId && bedTypeId
    ? false
    : resolveCategoryWritesToDynamicLayer({
      planId: tariffId,
      roomtypeId: resolvedRoomtypeId,
      roomtypes: allRoomtypes,
      model: pricesCalendarModel,
      rmsPricesRuleSource: pricesCalendarModel?.rmsPricesRuleSource ?? null,
      isRmsPricingEnabled,
      isDynamicPricesModeEnabled,
    });
  const categoryHasDynamicRule = tariffId && bpRuleRoomtypeId
    ? pricesCalendarModel?.isCategoryHasDynamicRule?.(tariffId, bpRuleRoomtypeId) === true
    : false;

  const signature = buildPriceCellVmSignature([
    pricesCalendarModelUpdatedAt ?? "",
    currentTariff?.id ?? "",
    currentTariff?.parent_id ?? "",
    canResetPriceToDefault ? 1 : 0,
    parentPriceModification ?? "",
    parentUsesRmsPricing ? 1 : 0,
    isDynamicPricesModeEnabled ? 1 : 0,
    isOneOfPricesModesEnabled ? 1 : 0,
    isMobileDevice ? 1 : 0,
    isCurrentTariffDepend ? 1 : 0,
    currencySign || "₽",
    cellHeight,
    updatingValue,
    isZeroPriceValidationError(updatingValue) ? 1 : 0,
    priceToRemoved,
    isUnacceptable,
    isSaleClosed,
    fetchedPrice?.value,
    fetchedPrice?.originalValue,
    fetchedPrice?.manual,
    fetchedPrice?.dynamic,
    fetchedPrice?.unlocked,
    fetchedPrice?.closed,
    rmsPriceInfo?.manual,
    rmsPriceInfo?.originalValue,
    defaultPriceForWeekday,
    hasPricesAllForDate ? 1 : 0,
    pricesAllValueForDate ?? "",
    categoryWritesToDynamicLayer ? 1 : 0,
    categoryHasDynamicRule ? 1 : 0,
    isUpdating ? 1 : 0,
  ]);

  if (cached && cached.signature === signature) {
    return cached.cellVm;
  }

  const internalPrice = isUpdating
    ? {
      ...pricesCalendarModel?.getPricePattern?.(),
      manual: true,
      value: updatingValue,
    }
    : fetchedPrice;
  const resetBaselineForDisplay = fetchedPrice?.originalValue ?? null;
  const manualDeleteInput = {
    isDynamicPricesModeEnabled,
    categoryWritesToDynamicLayer,
    categoryHasDynamicRule,
    childrenAgeId,
    rmsPriceInfo,
    defaultPriceForWeekday,
    hasPricesAllForDate,
    pricesAllValueForDate,
  };
  const isManual = resolvePriceCellIsManual({
    ...manualDeleteInput,
    priceToRemoved,
    isUpdating,
    categoryWritesToDynamicLayer,
    categoryHasDynamicRule,
    internalPrice,
  });
  const hasResetBaseline = resetBaselineForDisplay !== null && resetBaselineForDisplay !== "";
  let buttonAction = priceCellResetDataAttrName;
  if (!isUpdating && hasResetBaseline && canMarkPriceForDelete(manualDeleteInput)) {
    buttonAction = priceCellRemoveDataAttrName;
  }

  const isDynamic = resolvePriceCellIsDynamic({
    internalPrice,
    priceToRemoved,
    childrenAgeId,
    rmsPriceInfo,
    defaultPriceForWeekday,
  });

  const cellVm = {
    cellKey,
    dataId,
    day,
    isMain,
    fetchedPrice,
    internalPrice,
    displayedPriceValue: formatAmount(
      priceToRemoved ? resetBaselineForDisplay : internalPrice?.value,
    ),
    isSaleClosed,
    isUpdating,
    isZeroPriceDraft: isUpdating && isZeroPriceValidationError(updatingValue),
    isUnacceptable,
    isDynamic,
    isManual,
    needShowResetButton: canResetPriceToDefault && isOneOfPricesModesEnabled
      && !priceToRemoved
      && isManual,
    isTooltipDisabled: Boolean(!isDynamic || isMobileDevice),
    buttonAction,
    currentTariffIsDependent: isCurrentTariffDepend,
    categoryHasDynamicRule,
    categoryWritesToDynamicLayer,
    currencySign: currencySign || "₽",
    cellHeight,
  };
  if (cellVmCachePrice.size > 500) cellVmCachePrice.clear();
  cellVmCachePrice.set(cellKey, {
    signature,
    cellVm,
  });
  return cellVm;
}
