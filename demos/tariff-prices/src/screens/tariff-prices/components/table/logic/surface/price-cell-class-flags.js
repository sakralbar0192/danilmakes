/**
 * Флаги модификаторов отображения цены (без привязки к CSS Modules).
 */
// eslint-disable-next-line import/prefer-default-export
export function getPriceCellModifierFlags(cellVm) {
  const isError = (cellVm.isUpdating && !parseInt(cellVm.displayedPriceValue, 10))
    || cellVm.isUnacceptable;
  return {
    isMain: cellVm.isMain,
    isSub: !cellVm.isMain,
    isSaleClosed: cellVm.isSaleClosed,
    isManual: cellVm.isManual,
    isDynamic: cellVm.isDynamic,
    isError,
  };
}
