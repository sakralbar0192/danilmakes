/**
 * Курсор ячейки статуса закрытия в roomtype-row (как inline :style).
 * @param {unknown} dependentRestrictionRaw — значение currentTariff?.dependent_restrictions?.[closedName]
 * @param {string} pointerCssUrl
 * @param {string} notAllowedCssUrl
 */
// eslint-disable-next-line import/prefer-default-export
export function buildRoomtypeClosedStatusCursorStyle(
  dependentRestrictionRaw,
  pointerCssUrl,
  notAllowedCssUrl,
) {
  const useNotAllowed = Boolean(Number(dependentRestrictionRaw));
  return { cursor: useNotAllowed ? notAllowedCssUrl : pointerCssUrl };
}
