/**
 * Tab order for numeric restriction input (stay limits).
 * Copied restrictions must not receive focus on mobile tap.
 *
 * @param {boolean} isRestrictionCopied
 * @returns {number}
 */
export function computeRestrictionNumericInputTabindex(isRestrictionCopied) {
  return isRestrictionCopied ? -1 : 0;
}
