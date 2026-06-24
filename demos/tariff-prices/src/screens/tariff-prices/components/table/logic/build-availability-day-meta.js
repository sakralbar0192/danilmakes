import { hasOwn } from "@/utils/object";
import { isInvalidAvailabilityDraftValue } from "../../../config/resolve-availability-draft-from-input.js";

/**
 * @param {object} params
 * @param {number|string} params.savedAvailability
 * @param {object} [params.updatingAvailability]
 * @param {string|number} params.roomtypeId
 * @param {string} params.dayDate
 * @param {boolean} params.isChmOnly
 * @param {boolean} params.isDataPending
 * @param {boolean} params.isSaleClosed
 * @param {object} params.day
 * @returns {object}
 */
// eslint-disable-next-line import/prefer-default-export
export function buildAvailabilityDayMeta({
  savedAvailability = 0,
  updatingAvailability = {},
  roomtypeId = "",
  dayDate = "",
  isChmOnly = false,
  isDataPending = false,
  isSaleClosed = false,
  day = {},
} = {}) {
  const roomDrafts = updatingAvailability?.[roomtypeId];
  const hasDraft = Boolean(roomDrafts) && hasOwn(roomDrafts, dayDate);
  const draftValue = hasDraft ? roomDrafts[dayDate] : undefined;
  const displayedAvailability = hasDraft ? draftValue : savedAvailability;
  const isInvalidAvailabilityDraft = hasDraft && isInvalidAvailabilityDraftValue(draftValue);

  return {
    day,
    isDataPending,
    availability: displayedAvailability,
    savedAvailability,
    isAvailabilityUpdating: hasDraft,
    isAvailabilityEditable: isChmOnly && !isDataPending,
    isInvalidAvailabilityDraft,
    isSaleClosed,
    roomtypeId,
    dayDate,
    cellKey: `availability|${roomtypeId}|${dayDate}`,
  };
}
