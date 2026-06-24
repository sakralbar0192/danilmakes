import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { cellTypes } from "../config/cell-types.js";
import { restrictionCellResetDataAttrName } from "../config/table-grid-metrics.js";
import { buildCellKey } from "../lib/cell-identity.js";
import { getClosedSaleRestrictionRoomtypeId } from "../lib/closed-sale-roomtype-id.js";
import { resolveRestrictionCellRequiredParts } from "../../../lib/screen/resolve-table-required-parts.js";
import { buildPartsReadinessToken, isPartsPending } from "../../../lib/screen/table-parts-readiness.js";

/**
 * @param {{
 *   roomtype: object,
 *   day: object,
 *   restrictionType: string,
 *   pricesCalendarModel: object,
 *   updatedRestrictions: object,
 *   updatedRestrictionsOverride?: object,
 *   currentTariff: object|null,
 *   isRestrictionModeEnabled: boolean,
 *   closedRestrictionName: string,
 *   cellVmCacheRestriction: Map,
 *   cellHeight: number,
 *   unacceptableRestrictions?: Record<string, string[]> — карта date → типы конфликта для текущего roomtype (срез одной комнаты)
 *   partsLoadState?: object,
 * }} input
 */
// eslint-disable-next-line import/prefer-default-export
export function computeRestrictionCellVm(input) {
  const {
    roomtype,
    day,
    restrictionType,
    pricesCalendarModel,
    updatedRestrictions,
    updatedRestrictionsOverride,
    currentTariff,
    isRestrictionModeEnabled,
    closedRestrictionName,
    cellVmCacheRestriction,
    cellHeight,
    unacceptableRestrictions = {},
    pricesCalendarModelUpdatedAt,
    partsLoadState = {},
  } = input;

  const dayDate = day?.date;
  const roomId = roomtype.id;
  const closedRestrictionOwnerId = getClosedSaleRestrictionRoomtypeId(roomtype);
  const dataId = `${roomtype.id}_${restrictionType}`;
  const cellKey = buildCellKey({
    cellType: cellTypes.restriction,
    id: dataId,
    date: dayDate,
  });

  const restrictionsRoot = updatedRestrictionsOverride != null
    ? updatedRestrictionsOverride
    : updatedRestrictions;
  const dayRestrictions = restrictionsRoot?.[roomtype?.id]?.[dayDate] ?? {};
  const ownerDayRestrictions = restrictionsRoot?.[closedRestrictionOwnerId]?.[dayDate] ?? {};

  let isUpdating;
  let draftValue;
  if (restrictionType === closedRestrictionName) {
    const hasClosedDraftOnOwner = Object.prototype.hasOwnProperty.call(ownerDayRestrictions, closedRestrictionName);
    const hasClosedDraftOnSelf = Object.prototype.hasOwnProperty.call(dayRestrictions, restrictionType);
    isUpdating = hasClosedDraftOnOwner || hasClosedDraftOnSelf;
    draftValue = ownerDayRestrictions?.[restrictionType] ?? dayRestrictions[restrictionType];
  } else {
    isUpdating = restrictionType in dayRestrictions;
    draftValue = dayRestrictions[restrictionType];
  }

  const byDate = unacceptableRestrictions || {};
  const conflictTypesForDate = byDate?.[dayDate];
  /** Подсветка только по списку типов из defineUnacceptableRestrictions (участвуют в конфликте и непустые). */
  const isUnacceptable = Array.isArray(conflictTypesForDate)
    && conflictTypesForDate.includes(restrictionType);
  const isBooleanStateRestriction = restrictionType === PriceAndRestrictionsService.closedArrivalRestrictionName
    || restrictionType === PriceAndRestrictionsService.closedDepartureRestrictionName;
  const copiedRestrictionServerType = PriceAndRestrictionsService.getServerRestrictionTypeName(restrictionType);
  const isRestrictionCopied = !!Number(
    currentTariff?.dependent_restrictions?.[copiedRestrictionServerType],
  );
  const requiredParts = resolveRestrictionCellRequiredParts({ needsMetaForAvailability: false });
  const partsPending = isPartsPending(requiredParts, partsLoadState);
  const partsReadinessToken = buildPartsReadinessToken(requiredParts, partsLoadState);

  if (partsPending) {
    const pendingSignature = [
      "pending",
      partsReadinessToken,
      cellKey,
      restrictionType,
      cellHeight,
    ].join("|");
    const cachedPending = cellVmCacheRestriction.get(cellKey);
    if (cachedPending && cachedPending.fastSignature === pendingSignature) {
      return cachedPending.cellVm;
    }
    const skeletonVm = {
      isDataPending: true,
      cellKey,
      dataId,
      day,
      restrictionType,
      internalRestriction: { value: 0 },
      displayedRestrictionValue: "",
      isSaleClosed: false,
      isUpdating: false,
      isUnacceptable: false,
      isRestrictionCopied: false,
      isBooleanStateRestriction,
      needShowResetButton: false,
      buttonAction: "",
      cellHeight,
    };
    if (cellVmCacheRestriction.size > 500) cellVmCacheRestriction.clear();
    cellVmCacheRestriction.set(cellKey, {
      fastSignature: pendingSignature,
      signature: pendingSignature,
      cellVm: skeletonVm,
    });
    return skeletonVm;
  }

  const cached = cellVmCacheRestriction.get(cellKey);
  const closedDraftForSig = ownerDayRestrictions?.[closedRestrictionName] ?? dayRestrictions?.[closedRestrictionName];
  const fastSignature = [
    pricesCalendarModelUpdatedAt ?? "",
    currentTariff?.id ?? "",
    currentTariff?.parent_id ?? "",
    isRestrictionModeEnabled ? 1 : 0,
    isUpdating ? 1 : 0,
    String(draftValue ?? ""),
    isRestrictionCopied ? 1 : 0,
    isBooleanStateRestriction ? 1 : 0,
    isUnacceptable ? 1 : 0,
    String(closedDraftForSig ?? ""),
    cellHeight,
  ].join("|");

  if (cached && cached.fastSignature === fastSignature) {
    return cached.cellVm;
  }

  const fetchedRestriction = pricesCalendarModel?.getRestriction?.({
    id: roomId,
    date: dayDate,
    name: restrictionType,
  }) ?? { value: 0 };
  const internalRestrictionValue = isUpdating
    ? draftValue
    : fetchedRestriction?.value;
  const stayKeys = PriceAndRestrictionsService.restrictionTypeEnum;
  const effMin = PriceAndRestrictionsService.effectiveStayRestrictionValue(
    dayRestrictions,
    pricesCalendarModel,
    roomId,
    dayDate,
    stayKeys.minstay,
  );
  const effMinA = PriceAndRestrictionsService.effectiveStayRestrictionValue(
    dayRestrictions,
    pricesCalendarModel,
    roomId,
    dayDate,
    stayKeys.minstayA,
  );
  const effMax = PriceAndRestrictionsService.effectiveStayRestrictionValue(
    dayRestrictions,
    pricesCalendarModel,
    roomId,
    dayDate,
    stayKeys.maxstay,
  );
  let isSaleClosed;
  if (Object.prototype.hasOwnProperty.call(ownerDayRestrictions, closedRestrictionName)) {
    isSaleClosed = !!Number(ownerDayRestrictions[closedRestrictionName]);
  } else if (closedRestrictionName in dayRestrictions) {
    isSaleClosed = !!Number(dayRestrictions[closedRestrictionName]);
  } else {
    isSaleClosed = !!Number(pricesCalendarModel?.getRestriction?.({
      id: closedRestrictionOwnerId,
      date: dayDate,
      name: closedRestrictionName,
    })?.value);
  }
  const restrictionSignature = [
    fastSignature,
    isUpdating,
    String(draftValue ?? ""),
    internalRestrictionValue,
    isSaleClosed,
    effMin,
    effMinA,
    effMax,
    isUnacceptable,
    cellHeight,
  ].join("|");

  if (cached && cached.signature === restrictionSignature) {
    return cached.cellVm;
  }

  const internalRestriction = isUpdating
    ? {
      value: restrictionType === closedRestrictionName
        ? draftValue
        : dayRestrictions[restrictionType],
    }
    : fetchedRestriction;

  const rawRestr = internalRestriction.value;
  const rawRestrAsNum = rawRestr === null || rawRestr === undefined || rawRestr === ""
    ? NaN
    : Number(rawRestr);
  const displayedRestrictionValue = rawRestr === null || rawRestr === undefined || rawRestr === ""
    || rawRestrAsNum === 0
    ? ""
    : String(rawRestr);
  const needShowResetButton = isRestrictionModeEnabled
    && !isBooleanStateRestriction
    && !isRestrictionCopied
    && isUpdating;

  const cellVm = {
    isDataPending: false,
    cellKey,
    dataId,
    day,
    restrictionType,
    internalRestriction,
    displayedRestrictionValue,
    isSaleClosed,
    isUpdating,
    isUnacceptable,
    isRestrictionCopied,
    isBooleanStateRestriction,
    needShowResetButton,
    buttonAction: needShowResetButton ? restrictionCellResetDataAttrName : "",
    cellHeight,
  };
  if (cellVmCacheRestriction.size > 500) cellVmCacheRestriction.clear();
  cellVmCacheRestriction.set(cellKey, {
    fastSignature,
    signature: restrictionSignature,
    cellVm,
  });
  return cellVm;
}
