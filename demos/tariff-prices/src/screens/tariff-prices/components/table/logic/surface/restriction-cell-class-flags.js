/**
 * Флаги для классов restriction-cell и связанных состояний.
 */
// eslint-disable-next-line import/prefer-default-export
export function getRestrictionCellModifierFlags(cellVm, {
  booleanSheetCellKey,
  needShowBooleanActiveState = false,
}) {
  const isBooleanSheetHighlight = Boolean(
    needShowBooleanActiveState
    && booleanSheetCellKey
    && cellVm.isBooleanStateRestriction
    && cellVm.cellKey === booleanSheetCellKey,
  );
  return {
    isBooleanSheetHighlight,
    cellModifiers: {
      isClosed: cellVm.isSaleClosed,
      isCopied: cellVm.isRestrictionCopied,
      isBoolean: cellVm.isBooleanStateRestriction,
      isError: cellVm.isUnacceptable,
    },
  };
}
