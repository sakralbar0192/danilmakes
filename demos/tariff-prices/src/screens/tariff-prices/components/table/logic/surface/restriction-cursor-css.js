/**
 * @param {object} params
 * @param {string} params.restrictionType
 * @param {string} params.closedArrivalName
 * @param {string} params.closedDepartureName
 * @param {string} params.pointerCssUrl — уже с url(...)
 * @param {string} params.customCursorCssUrl
 */
// eslint-disable-next-line import/prefer-default-export
export function buildRestrictionCellCursorStyle({
  restrictionType,
  closedArrivalName,
  closedDepartureName,
  pointerCssUrl,
  customCursorCssUrl,
}) {
  const isClosedArrivalOrDeparture = restrictionType === closedArrivalName
    || restrictionType === closedDepartureName;
  return {
    cursor: isClosedArrivalOrDeparture
      ? pointerCssUrl
      : customCursorCssUrl,
  };
}
