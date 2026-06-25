import OSF from "@/utils/object-structure-formatter.js";

export default class DemoHotelModel {
  constructor(data = {}) {
    this.id = OSF.formatField("", data.id);
    this.name = OSF.formatField("", data.name);
    this.city = OSF.formatField("", data.city);
    this.currency = OSF.formatField("RUB", data.currency);
    this.currency_sign = OSF.formatField("₽", data.currency_sign);
    this.extra = OSF.formatField({}, data.extra || {});
  }
}
