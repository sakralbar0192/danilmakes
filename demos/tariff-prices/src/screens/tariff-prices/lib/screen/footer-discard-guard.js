/* eslint-disable import/prefer-default-export */
/**
 * Блокировка «Отменить изменения», пока фокус в мобильном инпуте ячейки таблицы (WebView / тап сквозь клавиатуру).
 * @param {boolean} isMobileDevice
 * @param {{ hasActiveMobileEditableCellFocus?: () => boolean } | null | undefined} pageTable
 */
export function shouldBlockTariffDiscardWhileMobileCellFocused(isMobileDevice, pageTable) {
  if (!isMobileDevice || !pageTable || typeof pageTable.hasActiveMobileEditableCellFocus !== "function") {
    return false;
  }
  return Boolean(pageTable.hasActiveMobileEditableCellFocus());
}
