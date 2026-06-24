import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { cellTypes } from "../config/cell-types.js";
import { priceCellResetDataAttrName,
  priceCellRemoveDataAttrName,
  priceCellEditDataAttrName,
  restrictionCellResetDataAttrName } from "../config/table-grid-metrics.js";
import { buildCellKey, isPriceCellType } from "../lib/cell-identity.js";

/**
 * @param {{
 *   payload: { target?: *, cellRoot?: HTMLElement, data: object },
 *   dispatch: (type: string, payload?: object) => Promise<unknown>,
 *   nextTick: () => Promise<unknown>,
 *   pricesCalendarModel: { getRestriction: Function },
 *   isMobileDevice: boolean,
 *   runOrDeferMobileApproval: (opts: {
 *     callback: () => void,
 *     id: string,
 *     date: string,
 *     weekday: string,
 *     approvalKind: "price"|"restriction",
 *   }) => void|Promise<void>,
 *   openBooleanRestrictionSheet: (args: object) => void,
 *   toggleClosedArrivalDeparture: (roomtypeId: string, restrictionType: string, date: string, currentValue: string) => void|Promise<void>,
 * }} ctx
 */
// eslint-disable-next-line import/prefer-default-export
export async function runHandleTableCellAction(ctx) {
  const {
    payload,
    dispatch,
    nextTick,
    pricesCalendarModel,
    isMobileDevice,
    runOrDeferMobileApproval,
    openBooleanRestrictionSheet,
    toggleClosedArrivalDeparture,
  } = ctx;

  const {
    data: {
      id,
      date,
      action,
      cellType,
      weekday = "",
      restrictionValue,
    },
  } = payload;

  switch (action) {
    case priceCellResetDataAttrName:
      await runOrDeferMobileApproval({
        callback: () => {
          dispatch("tariffPricesAndRestrictions/unsetUpdatingPrice", { id, day: date });
        },
        id,
        date,
        weekday,
        approvalKind: "price",
      });
      return;
    case priceCellRemoveDataAttrName:
      await runOrDeferMobileApproval({
        callback: () => {
          dispatch("tariffPricesAndRestrictions/setPriceToDelete", { id, day: date });
        },
        id,
        date,
        weekday,
        approvalKind: "price",
      });
      return;
    case restrictionCellResetDataAttrName: {
      const [roomtypeId, restrictionType] = (id || "").split("_");
      if (!roomtypeId || !restrictionType) {
        return;
      }
      await runOrDeferMobileApproval({
        callback: () => {
          const saved = pricesCalendarModel.getRestriction({
            id: roomtypeId,
            date,
            name: restrictionType,
          })?.value;
          const normalized = saved === null || saved === undefined || saved === ""
            || Number(saved) === 0
            ? ""
            : String(saved);
          dispatch("tariffPricesAndRestrictions/setUpdatingRestrictions", {
            type: restrictionType,
            roomtypeId,
            day: date,
            value: normalized,
          });
        },
        id,
        date,
        weekday,
        approvalKind: "restriction",
      });
      return;
    }
    case priceCellEditDataAttrName: {
      const [roomtypeId, restrictionType] = (id || "").split("_");
      const isBooleanRestrictionEdit = cellType === cellTypes.restriction
        && (restrictionType === PriceAndRestrictionsService.closedArrivalRestrictionName
          || restrictionType === PriceAndRestrictionsService.closedDepartureRestrictionName);

      if (isBooleanRestrictionEdit) {
        if (isMobileDevice) {
          const cellKey = buildCellKey({
            cellType: cellTypes.restriction,
            id,
            date,
          });
          openBooleanRestrictionSheet({
            cellKey,
            roomtypeId,
            restrictionType,
            date,
            restrictionValue,
          });
        } else {
          await toggleClosedArrivalDeparture(roomtypeId, restrictionType, date, restrictionValue);
        }
        break;
      }
      if (
        !cellType
        || isPriceCellType(cellType)
        || cellType === cellTypes.restriction
      ) {
        const cellRoot = payload.cellRoot;
        if (cellRoot && id && date) {
          await nextTick();
          const input = cellRoot.querySelector?.("input[inputmode=\"decimal\"]")
            || cellRoot.querySelector?.("input[inputmode=\"numeric\"]")
            || cellRoot.querySelector?.("input");
          input?.focus?.();
        }
      }
      break;
    }
    default:
      break;
  }
}
