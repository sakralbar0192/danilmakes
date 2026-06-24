/**
 * @param {boolean} isBooleanStateRestriction
 * @param {boolean} isRestrictionCopied — зависимое/скопированное ограничение
 * @returns {number|undefined}
 */
// eslint-disable-next-line import/prefer-default-export
export function computeBooleanRestrictionRootTabindex(isBooleanStateRestriction, isRestrictionCopied) {
  if (!isBooleanStateRestriction) {
    return undefined;
  }
  return isRestrictionCopied ? -1 : 0;
}
