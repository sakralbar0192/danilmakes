import OSF from "@/utils/object-structure-formatter.js";
import uid from "@/utils/uid";

// Модель для сущности доп услуги
export default class ServiceModel {
  constructor(data) {
    this.id = OSF.formatField(uid(), data.id);
    this.name = OSF.formatField("", data.name);
    this.type = OSF.formatField("", data.type);
    this.isPackage = OSF.formatField(false, !!Number(data.is_package));
    this.isDaily = OSF.formatField(false, !!Number(data.daily));
    this.maxQuantity = OSF.formatField(0, data.max_quantity);
    this.maxQuantityEnabled = OSF.formatField(false, !!Number(data.max_quantity_enabled));
    this.package = OSF.formatField([], data.package);
    this.deleted = OSF.formatBoolean(data.deleted);
    this.active = OSF.formatBoolean(data.active);
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }
}
