import CoreModel from "@/models/core";
import { dateToMoment } from "@/utils/date";
import OSF from "@/utils/object-structure-formatter.js";
import uid from "@/utils/uid";
import moment from "moment";
import i18n from "@/plugins/i18n";
import capitalizeFirstLetter from "@/utils/string";
import strategiesDatasetDictionary from "@/screens/report-revenue/components/living/components/graphs/dictionaries/strategiesDatasetDictionary";
import tooltipStrategies from "@/screens/report-revenue/components/living/components/graphs/strategies/tooltipStrategies";

export default class RevenueReportPrimaryModel extends CoreModel {
  static sendingDataFormat = "YYYY-MM-DD";

  static tooltipDataMapping = tooltipStrategies;

  static monthsGroupFormat = "YYYY-MM";

  static groupByMethods = Object.freeze([
    {
      id: strategiesDatasetDictionary.months,
      name: i18n.t("По месяцам"),
      format: this.monthsGroupFormat,
      tableFormatter: item => `${this.formatDateWithDay(item)} ${moment(item, this.monthsGroupFormat).format("YYYY")}`,
      phaseDeterminant: (item) => {
        const inputMonth = moment(item, this.monthsGroupFormat);

        const currentMonth = moment().startOf("month");
        let result;

        if (inputMonth.isAfter(currentMonth, "month")) {
          result = "future";
        } else if (inputMonth.isBefore(currentMonth, "month")) {
          result = "past";
        } else {
          result = "today";
        }

        return result;
      },
    },
    {
      id: strategiesDatasetDictionary.dates,
      name: i18n.t("По датам"),
      format: this.sendingDataFormat,
      tableFormatter: item => this.formatDateWithDay(item),
      phaseDeterminant: (item) => {
        const itemDate = moment(item, this.sendingDataFormat).startOf("day");
        const today = moment().startOf("day");
        let phase = "past";
        if (itemDate.isSame(today)) {
          phase = "today";
        } else if (itemDate.isAfter(today)) {
          phase = "future";
        }
        return phase;
      },
    },
  ]);


  static groupBy = this.groupByMethods[0];

  constructor(reportData, plan, config) {
    const { groupType, canShowPlanData } = config;
    super();
    this.canShowPlanData = canShowPlanData;
    RevenueReportPrimaryModel.groupBy = RevenueReportPrimaryModel.groupByMethods[groupType];
    const groupId = RevenueReportPrimaryModel.groupBy.id;

    // Блок метрик
    this.metrics = {
      amount: OSF.formatField(0, reportData?.metrics?.selected?.income),
      adr: OSF.formatField(0, reportData?.metrics?.selected?.adr),
      revpar: OSF.formatField(0, reportData?.metrics?.selected?.revpar),
      load: OSF.formatField(0, reportData?.metrics?.selected?.load),
      past: {
        amount: OSF.formatField(0, reportData?.metrics?.past?.income),
        adr: OSF.formatField(0, reportData?.metrics?.past?.adr),
        revpar: OSF.formatField(0, reportData?.metrics?.past?.revpar),
        load: OSF.formatField(0, reportData?.metrics?.past?.load),
      },
      future: {
        amount: OSF.formatField(0, reportData?.metrics?.future?.income),
        adr: OSF.formatField(0, reportData?.metrics?.future?.adr),
        revpar: OSF.formatField(0, reportData?.metrics?.future?.revpar),
        load: OSF.formatField(0, reportData?.metrics?.future?.load),
      },
    };

    // Блок таблицы
    const tableData = OSF.format({}, reportData?.table?.[groupId]);
    const tableTotal = OSF.format({}, reportData?.table?.total);
    const tablePast = OSF.format({}, tableData?.past);
    const tableFuture = OSF.format({}, tableData?.future);

    if (Array.isArray(tableData) || Array.isArray(tableTotal)) {
      console.log("Получен неверный формат данных для таблицы");
      this.tableData = {
        total: {},
        data: {},
        past: {},
        future: {},
      };
    } else {
      const total = Object.keys(tableTotal).reduce((obj, item) => {
        obj[item] = {
          id: OSF.formatField(uid(), tableTotal[item].id),
          name: OSF.formatField("", tableTotal[item].name),
          amount: OSF.formatField(0, tableTotal[item].income),
          adr: OSF.formatField(0, tableTotal[item].adr),
          revpar: OSF.formatField(0, tableTotal[item].revpar),
          load: OSF.formatField(0, tableTotal[item].load),
          rooms: OSF.formatField(0, tableTotal[item].rooms),
        };
        return obj;
      }, {});

      const past = Object.keys(tablePast).reduce((obj, item) => {
        obj[item] = {
          amount: OSF.formatField(0, tablePast[item].income),
          adr: OSF.formatField(0, tablePast[item].adr),
          revpar: OSF.formatField(0, tablePast[item].revpar),
          load: OSF.formatField(0, tablePast[item].load),
          rooms: OSF.formatField(0, tablePast[item].rooms),
        };
        return obj;
      }, {});

      const future = Object.keys(tableFuture).reduce((obj, item) => {
        obj[item] = {
          amount: OSF.formatField(0, tableFuture[item].income),
          adr: OSF.formatField(0, tableFuture[item].adr),
          revpar: OSF.formatField(0, tableFuture[item].revpar),
          load: OSF.formatField(0, tableFuture[item].load),
          rooms: OSF.formatField(0, tableFuture[item].rooms),
        };
        return obj;
      }, {});

      const data = Object.keys(tableData).reduce((obj, dateKey) => {
        const tableDateData = OSF.format({}, tableData[dateKey]);
        if (Array.isArray(tableDateData)) {
          console.log("Получен неверный формат данных по датам для таблицы");
        } else if (dateKey !== "past" && dateKey !== "future" && moment(dateKey, RevenueReportPrimaryModel.groupBy.format).isValid()) {
          obj[dateKey] = Object.keys(tableDateData).reduce((dateObj, dateItem) => {
            dateObj[dateItem] = {
              id: OSF.formatField(uid(), tableDateData[dateItem].id),
              name: OSF.formatField("", tableDateData[dateItem].name),
              amount: OSF.formatField(0, tableDateData[dateItem].income),
              adr: OSF.formatField(0, tableDateData[dateItem].adr),
              revpar: OSF.formatField(0, tableDateData[dateItem].revpar),
              load: OSF.formatField(0, tableDateData[dateItem].load),
              rooms: OSF.formatField(0, tableDateData[dateItem].rooms),
            };
            return dateObj;
          }, {});
        }
        return obj;
      }, {});

      this.tableData = {
        total, past, future, data,
      };
    }

    this.plan = OSF.format({}, plan);

    // Блок графиков
    const revenueData = OSF.format({}, reportData?.revenue?.[groupId]);

    this.revenueData = this.formatGraphData(revenueData, "revenue");
    this.revenuePlan = this.formatPlanGraphData(revenueData, "revenue");

    const adrData = OSF.format({}, reportData?.adr?.[groupId]);

    this.adrData = this.formatGraphData(adrData, "adr");
    this.adrPlan = this.formatPlanGraphData(adrData, "adr");

    const revparData = OSF.format({}, reportData?.revpar?.[groupId]);

    this.revparData = this.formatGraphData(revparData, "revpar");
    this.revparPlan = this.formatPlanGraphData(revparData, "revpar");

    const loadData = OSF.format({}, reportData?.load?.[groupId]);

    this.loadData = this.formatGraphData(loadData, "load");
    this.loadPlan = this.formatPlanGraphData(loadData, "load", "loadPlan");
  }

  static formatDateWithDay(date) {
    const groupBy = RevenueReportPrimaryModel.groupBy;
    let result = "";
    if (groupBy.id === strategiesDatasetDictionary.months) {
      result = capitalizeFirstLetter(moment(date, groupBy.format).format("MMMM"));
    } else {
      const momentDate = dateToMoment(date, this.sendingDataFormat);

      if (!momentDate.moment.isValid()) return "Некорректная дата";

      result = `${momentDate.outputDate} (${capitalizeFirstLetter(momentDate.moment.format("dd"))})`;
    }

    return result;
  }

  /**
   * Формирует массив данных для отображения на графике на основе переданных метрических данных.
   * Каждая запись в результирующем массиве представляет собой объект с информацией о значении,
   * дате, цвете, типе и других атрибутах, необходимых для визуализации и подсказок.
   * @param {Object.<string, number>} data - Объект с данными метрики, где ключ — строка в формате 'YYYY-MM',
   *                                         а значение — числовая метрика за этот период.
   * @param {string} key - Уникальный идентификатор метрики (графика), используемый для определения
   *                      соответствующих настроек отображения.
   * @returns {Array<Object>} Массив объектов, каждый из которых содержит данные для одной точки графика.
   *                          Если входные данные имеют неверный формат (например, массив вместо объекта),
   *                          метод возвращает пустой объект {} и выводит предупреждение в консоль.
   */
  formatGraphData(data, key) {
    const graphData = OSF.format({}, data);
    if (Array.isArray(graphData)) {
      console.log("Получен неверный формат данных для графика ", key);
      return [];
    }

    return Object.keys(graphData).map(item => {
      const date = moment(item, RevenueReportPrimaryModel.monthsGroupFormat);
      const planValue = OSF.formatField(-1, this.plan.getMonthMetricValue(date.year(), date.month() + 1, key));
      return this.createGraphItem(key, graphData[item], item, { planValue, factValue: graphData[item] });
    });
  }

  /**
   * Формирует данные для графика плановых показателей, сопоставляя их с фактическими периодами.
   * Для каждого месяца из фактических данных извлекается соответствующее плановое значение из
   * внутреннего объекта `this.plan`. Месяцы без плановых данных пропускаются.
   *
   * @param {Object.<string, number>} fact - Объект с фактическими данными метрики в формате 'YYYY-MM' → число.
   * @param {string} dataKey - Ключ метрики, по которому извлекается значение из плана (например, 'revenue').
   * @param {string} [key="plan"] - Идентификатор графика для плановых данных.
   * @returns {Array<Object>} Массив объектов, каждый из которых содержит данные для одной точки графика плана с дополнительной информацией по разнице с факт. показателями.и
   */
  formatPlanGraphData(fact, dataKey, key = "plan") {
    if (!this.plan || RevenueReportPrimaryModel.groupBy.id !== strategiesDatasetDictionary.months) {
      return [];
    }

    const result = [];
    for (const yearMonthDate of Object.keys(fact)) {
      const date = moment(yearMonthDate, RevenueReportPrimaryModel.monthsGroupFormat);
      const planValue = OSF.formatField(-1, this.plan.getMonthMetricValue(date.year(), date.month() + 1, dataKey));
      const factValue = fact[yearMonthDate];
      const graphEntry = this.createGraphItem(key, planValue, yearMonthDate, { planValue, factValue });
      result.push(graphEntry);
    }

    return result.every((v) => v.value < 0) ? [] : result;
  }

  createGraphItem(key, value, date, externalData = {}) {
    const phase = RevenueReportPrimaryModel.groupBy.phaseDeterminant(date);

    const graphema = RevenueReportPrimaryModel.tooltipDataMapping[key].graphema;
    const title = RevenueReportPrimaryModel.tooltipDataMapping[key].phase[phase][RevenueReportPrimaryModel.groupBy.id].title;
    const color = RevenueReportPrimaryModel.tooltipDataMapping[key].phase[phase][RevenueReportPrimaryModel.groupBy.id].color;
    const type = RevenueReportPrimaryModel.tooltipDataMapping[key].phase[phase][RevenueReportPrimaryModel.groupBy.id].type;
    const hint = RevenueReportPrimaryModel.tooltipDataMapping[key].phase[phase][RevenueReportPrimaryModel.groupBy.id].hint;

    let combinedType = null;
    let combinedTitle = null;
    let combinedColor = null;
    if (Object.keys(RevenueReportPrimaryModel.tooltipDataMapping.combined).includes(key)) {
      combinedType = RevenueReportPrimaryModel.tooltipDataMapping.combined[key].phase[phase].type;
      combinedTitle = RevenueReportPrimaryModel.tooltipDataMapping.combined[key].phase[phase].title;
      combinedColor = RevenueReportPrimaryModel.tooltipDataMapping.combined[key].phase[phase].color;
    }

    const groupByMonth = RevenueReportPrimaryModel.groupBy.id === strategiesDatasetDictionary.months;
    const hasPlanValue = externalData.planValue && externalData.planValue > 0;
    const pastAndFutureMetricValuesExists = this.metrics.past[key === "revenue" ? "amount" : key] || this.metrics.future[key === "revenue" ? "amount" : key];

    const isCurrentMonthColTooltip = groupByMonth && moment(date, this.monthsGroupFormat).isSame(moment(), "month");

    let graphValue;
    if (
      (groupByMonth && hasPlanValue && this.canShowPlanData())
      || (pastAndFutureMetricValuesExists && isCurrentMonthColTooltip)
    ) {
      graphValue = OSF.formatNumber(value);
    } else {
      graphValue = Math.trunc(OSF.formatNumber(value));
    }

    return {
      phase,
      title,
      color,
      type,
      graphema,
      hint,
      combinedType,
      combinedTitle,
      combinedColor,
      externalData,
      value: graphValue,
      graphKey: key,
      day: RevenueReportPrimaryModel.formatDateWithDay(date),
      rawDay: OSF.formatString(date),
    };
  }
}
