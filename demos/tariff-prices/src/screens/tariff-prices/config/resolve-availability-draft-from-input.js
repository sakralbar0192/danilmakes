/**
 * @param {string} raw
 * @returns {string}
 */
export function resolveAvailabilityDraftFromInput(raw = "") {
  const digits = `${raw ?? ""}`.replace(/\D/g, "");
  return digits;
}

/**
 * @param {string} raw
 * @returns {string}
 */
export function finalizeAvailabilityDraftFromInput(raw = "") {
  const digits = resolveAvailabilityDraftFromInput(raw);
  return digits === "" ? "0" : digits;
}

/**
 * @param {string|number} draftValue
 * @param {number|string} savedAvailability
 * @returns {boolean}
 */
export function isAvailabilityDraftEqualToSaved(draftValue, savedAvailability) {
  return Number(draftValue) === Number(savedAvailability);
}

/**
 * @param {string|number} value
 * @returns {boolean}
 */
export function isInvalidAvailabilityDraftValue(value) {
  if (value === "" || value === null || value === undefined) {
    return false;
  }
  const num = Number(value);
  return !Number.isInteger(num) || num < 0;
}

/**
 * @param {object} updatingAvailability
 * @returns {boolean}
 */
export function hasInvalidAvailabilityDraftInTree(updatingAvailability = {}) {
  for (const byDate of Object.values(updatingAvailability || {})) {
    for (const raw of Object.values(byDate || {})) {
      if (isInvalidAvailabilityDraftValue(raw)) {
        return true;
      }
    }
  }
  return false;
}
