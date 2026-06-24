import CoreModel from "@/models/core";

export default class RevenueReportModel extends CoreModel {
  static NUMBER_SEPARATOR = ",";

  constructor(data) {
    super();
    this.data = data;
  }

  static formattedValue(value, config) {
    let formatter = new Intl.NumberFormat("ru-ru");
    if (config) {
      formatter = new Intl.NumberFormat("ru-ru", {
        minimumFractionDigits: config?.minimumFractionDigits || 1,
        maximumFractionDigits: config?.maximumFractionDigits || 1,
      });
    }
    return formatter.format(value).replace(".", this.NUMBER_SEPARATOR);
  }

  static formattedPercent(value, minFractionDigits = 1, maxFractionDigits = 1) {
    return this.formattedValue(value, {
      minFractionDigits,
      maxFractionDigits,
    });
  }

  static calculateFactPlanDiff(plan, fact) {
    let diff = 0;
    let percentage = 0;

    if (!plan) {
      return { diff, percentage };
    }

    diff = fact - plan;
    percentage = Math.abs(diff / plan) * 100;

    return { diff, percentage };
  }
}
