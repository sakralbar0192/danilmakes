import OSF from "@/utils/object-structure-formatter";
import CoreModel from "@/models/core";

export class TariffInterfaceSettingsModel extends CoreModel {
  constructor(data) {
    super();

    this.showResetPriceToDefault = OSF.formatBoolean(data.showResetPriceToDefault ?? true);
    this.showOtherPricesHint = OSF.formatBoolean(data.showOtherPricesHint ?? true);
  }

  /**
   * Возвращает новый инстанс класса со значениями по умолчанию.
   * @returns {TariffInterfaceSettingsModel}
   */
  static defaults() {
    return new TariffInterfaceSettingsModel({});
  }
}

/**
 * @param {TariffInterfaceSettingsModel} model - TariffInterfaceSettingsModel instance
 * @returns {Object} - Request format
 */
export function mapTariffInterfaceSettingsModelToRequest(model) {
  return {
    showResetPriceToDefault: model.showResetPriceToDefault ?? false,
    showOtherPricesHint: model.showOtherPricesHint ?? false,
  };
}
