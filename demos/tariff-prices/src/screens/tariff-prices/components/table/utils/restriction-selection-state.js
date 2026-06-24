/** Начальное состояние выделения диапазона ограничений в строке (restriction selection). */
export default function restrictionSelectionStateFactory() {
  return {
    fromDate: null,
    toDate: null,
    roomTypeId: null,
    rowIndex: null,
    width: null,
    startCellIndex: 0,
    endCellIndex: 0,
    rowPositionTop: 0,
    restrictionType: null,
  };
}
