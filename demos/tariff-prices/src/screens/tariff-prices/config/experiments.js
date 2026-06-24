/**
 * Коды экспериментов SPA «Цены и ограничения».
 * Legacy PHP использует те же строки напрямую — при смене кода обновить и PHP вручную.
 */
// eslint-disable-next-line import/prefer-default-export
export const TariffExperimentCode = Object.freeze({
  /** Новая SPA-страница ЦиО (DEV-6123) */
  NEW_PRICES_PAGE: "dev6123",
  /** Переключение SPA ↔ legacy в сезон (DEV-20567) */
  VERSION_SWITCH: "dev20567",
});
