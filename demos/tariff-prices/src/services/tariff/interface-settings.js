import CoreStatic from "@/services/core";

export default class TariffInterfaceSettingsService extends CoreStatic {
  static async saveSettings(settings) {
    const response = await this.http.post("/tariff/save_interface_settings", { settings });
    return response?.result === "success";
  }

  /**
   * Определяет, можно ли показывать кнопку сброса цены.
   * Для зависимого тарифа кнопка всегда доступна; для остальных — по `showResetPriceToDefault` (по умолчанию показываем).
   *
   * @param {Object} params - Параметры проверки.
   * @param {TariffInterfaceSettingsModel} params.interfaceSettingsModel - Настройки интерфейса тарифа.
   * @param {boolean} params.isCurrentTariffDepend - Признак зависимого тарифа.
   * @returns {boolean} `true`, если кнопку можно показать.
   */
  static canResetPriceToDefault({
    interfaceSettingsModel,
    isCurrentTariffDepend,
  }) {
    if (isCurrentTariffDepend) {
      return true;
    }

    return interfaceSettingsModel?.showResetPriceToDefault !== false;
  }
}
