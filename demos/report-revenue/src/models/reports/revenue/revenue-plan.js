import OSF from "@/utils/object-structure-formatter";
import CoreModel from "@/models/core";

function generateMonth(data) {
  const revenue = OSF.formatField(0, data?.revenue, true);
  const adr = OSF.formatField(0, data?.adr, true);
  const load = OSF.formatField(0, data?.load, true);
  const revpar = OSF.formatField(0, data?.revpar, true);

  return {
    revenue,
    adr,
    load,
    revpar,
  };
}

export default class RevenuePlanModel extends CoreModel {
  constructor(opts = {}) {
    super();
    const { yearsData = {}, categories = [] } = opts;
    this.categories = OSF.format([], categories);
    this.yearsData = OSF.format({}, yearsData);

    Object.keys(yearsData)
      .forEach((year) => {
        const months = this.yearsData[year] ?? {};

        for (const month of Object.keys(months)) {
          const monthData = months[month] ?? {};
          this.yearsData[year][month] = generateMonth(monthData);
        }
      });
  }

  /**
   * Получить данные за месяц
   * @returns Данные за месяц или null если данных нет.
   */
  getMonthData(year, month) {
    return this.yearsData[year]?.[month] ?? null;
  }

  /**
   * Получить значение конкретной метрики.
   * @returns {number|null} Значение метрики или null если таковой нет
   */
  getMonthMetricValue(year, month, metric) {
    const monthData = this.getMonthData(year, month);
    return monthData?.[metric] ?? null;
  }
}
