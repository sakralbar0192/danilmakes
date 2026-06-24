/**
 * Есть ли несохранённые правки на экране (цены / удаления / ограничения).
 */
export function hasPendingTariffChanges({
  updatingPrices,
  pricesToDelete,
  updatedRestrictions,
  updatingAvailability = {},
}) {
  return Boolean(
    Object.keys(updatingPrices || {}).length
      || Object.keys(pricesToDelete || {}).length
      || Object.keys(updatedRestrictions || {}).length
      || Object.keys(updatingAvailability || {}).length,
  );
}

/**
 * Скрывать ли нижнюю панель приложения (вне экрана).
 * На мобилке экрана ЦиО панель скрыта всегда (DEV-20991).
 * Иначе — при несохранённых правках, при скрытом футере страницы (редактирование ячейки, sheet’ы, диалоги)
 * и при явном сигнале таблицы (`tableHideMobileAppFooter`).
 * Без учёта клавиатуры в формуле — см. комментарий в index.vue.
 */
export function shouldHideMobileAppFooterBar({
  needHideFooter,
  hasPendingTariffChanges: pending,
  tableHideMobileAppFooter,
  isMobileDevice = false,
}) {
  if (isMobileDevice) {
    return true;
  }
  return Boolean(needHideFooter || pending || tableHideMobileAppFooter);
}

/**
 * Показывать ли футер сохранения страницы.
 * `isMobileFooterHiddenByKeyboard` учитывается только на мобилке: трекинг resize после клавиатуры
 * не должен скрывать панель сохранения на десктопе при вводе в ячейку.
 */
export function shouldShowPageFooter({
  needHideFooter,
  isMobileFooterHiddenByKeyboard,
  hasPendingTariffChanges: pending,
  isMobileDevice = true,
}) {
  const keyboardSuppressesPageFooter = isMobileDevice && isMobileFooterHiddenByKeyboard;
  return !needHideFooter && !keyboardSuppressesPageFooter && pending;
}
