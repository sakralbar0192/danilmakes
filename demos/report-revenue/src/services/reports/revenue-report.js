import CoreService from "@/services/core";
import moment from "moment";
import i18n from "@/plugins/i18n";
import { defineAsyncComponent } from "vue";
import baseUrl from "@/config/environment";
import ServiceModel from "@/models/service";
import { isStartAndEndOfSameMonth } from "@/utils/date";

const adr = defineAsyncComponent(() => import("@/screens/report-revenue/components/living/components/hints/adr-hint-body.vue"));
const living = defineAsyncComponent(() => import("@/screens/report-revenue/components/living/components/hints/living-hint-body.vue"));
const revpar = defineAsyncComponent(() => import("@/screens/report-revenue/components/living/components/hints/revpar-hint-body.vue"));
const loading = defineAsyncComponent(() => import("@/screens/report-revenue/components/living/components/hints/loading-hint-body.vue"));

export default class RevenueReportService extends CoreService {
  static isDev = false;

  static getLocalPostProd = this.isDev ? "get" : "post";

  static sendingDataFormat = "YYYY-MM-DD";

  static showDataFormat = "DD.MM.YYYY";

  static urlDatesFormat = "DD-MM-YYYY";

  static resortFeeId = "222222";

  static sendingFiltersFormat = {
    primary: {
      from: "",
      to: "",
      services_ids: [],
      roomtypes_ids: [],
    },
    comparable: {},
  };

  static typesExcelReports = {
    incomes: "incomes",
    services: "services",
  };

  static metricsBlockTypes = {
    amount: {
      key: "amount",
      alternativeKey: "revenue",
      name: i18n.t("Доход за проживание"),
      shortName: i18n.t("Доход"),
      hintComponent: living,
    },
    adr: {
      key: "adr",
      name: i18n.t("ADR"),
      hintComponent: adr,
    },
    revpar: {
      key: "revpar",
      name: i18n.t("RevPAR"),
      hintComponent: revpar,
    },
    load: {
      key: "load",
      name: i18n.t("Загрузка"),
      hintComponent: loading,
    },
    services: {
      key: "services",
      name: i18n.t("Доход от доп. услуг"),
      hintComponent: null,
    },
  };

  static get metricsSelectionOptions() {
    return Object.fromEntries(
      Object.entries(this.metricsBlockTypes)
        .filter(([key]) => key !== "services")
        .map(([key, metric]) => [
          key,
          {
            key: metric.key,
            name: metric.name,
            shortName: metric.shortName,
          },
        ]),
    );
  }

  // для 1 итерации сравниваемый период отключен
  static isComparedPeriodOn = false;

  static startDateInterval() {
    const firstDayOfMonth = moment().startOf("month").format(this.sendingDataFormat);
    const lastDayOfMonth = moment().endOf("month").format(this.sendingDataFormat);
    return [firstDayOfMonth, lastDayOfMonth];
  }

  static configuration(periodOfStay) {
    const localPeriodOfStay = periodOfStay || [];
    if (localPeriodOfStay.length !== 2) return "empty";
    const currentMoment = moment();
    const startCurrentMonthMoment = moment([currentMoment.year(), currentMoment.month(), 1]);
    const endCurrentMonthMoment = moment([currentMoment.year(), currentMoment.month(), currentMoment.daysInMonth()]);
    const startPeriodOfStayMoment = moment(localPeriodOfStay[0], this.sendingDataFormat);
    const endPeriodOfStayMoment = moment(localPeriodOfStay[1], this.sendingDataFormat);
    if (endPeriodOfStayMoment.isBefore(currentMoment, "days")) {
      return "past-month";
    }
    if (
      currentMoment.isBefore(startPeriodOfStayMoment, "days")
    ) {
      return "future";
    }
    if (endPeriodOfStayMoment.isSameOrBefore(endCurrentMonthMoment) && (startPeriodOfStayMoment.isSameOrAfter(startCurrentMonthMoment))) {
      return "curr-month";
    }
    if (isStartAndEndOfSameMonth(localPeriodOfStay)) {
      return "past-future-full";
    }
    return "curr-month";
  }

  /**
 * Формирует текстовую метку периода в контексте текущего месяца.
 *
 * Метод разделяет текущий месяц на два периода: "прошлый" (с начала месяца до вчерашнего дня)
 * и "будущий" (с сегодняшнего дня до конца месяца). Используется для отображения
 * прогресса или планирования в рамках текущего месяца.
 *
 * Для 1-го числа месяца прошлый период будет пустым, так как в текущем месяце еще не было дней.
 * Для последнего дня месяца будущий период будет содержать только этот день.
 *
 * @example
 * // Если сегодня 15 января 2024 года:
 * getContextualPeriodLabel('past');    // возвращает "1-14 Jan"
 * getContextualPeriodLabel('future');  // возвращает "15-31 Jan"
 *
 * @example
 * // Если сегодня 1 января 2024 года:
 * getContextualPeriodLabel('past');    // возвращает "" (пустую строку)
 * getContextualPeriodLabel('future');  // возвращает "1-31 Jan"
 *
 * @example
 * // Если сегодня 31 января 2024 года:
 * getContextualPeriodLabel('past');    // возвращает "1-30 Jan"
 * getContextualPeriodLabel('future');  // возвращает "31 Jan"
 *
 * @param {string} type - Тип периода для отображения. Допустимые значения:
 *                       "past" (прошлый), "future" (будущий).
 *
 * @returns {string} Текстовая метка периода в формате:
 *                   - "start-end MMM" для диапазона дней
 *                   - "day MMM" для одного дня
 *                   - "" (пустая строка) для некорректного типа или отсутствия периода
 *
 * @throws {Error} Не выбрасывает исключения, возвращает пустую строку при ошибках.
 */
  static getContextualPeriodLabel(type) {
    const today = moment().startOf("day");
    const startOfMonth = today.clone().startOf("month");
    const endOfMonth = today.clone().endOf("month");

    if (type === "past") {
      const yesterday = today.clone().subtract(1, "day");

      // Если сегодня 1-е число месяца
      if (yesterday.isBefore(startOfMonth, "day")) {
        return ""; // Нет прошедших дней в этом месяце
      }

      return RevenueReportService.formatPeriodWithinMonth(startOfMonth, yesterday);
    }

    if (type === "future") {
      return RevenueReportService.formatPeriodWithinMonth(today, endOfMonth);
    }

    return "";
  }

  /**
 * Форматирует диапазон дат в пределах одного месяца в текстовую метку.
 *
 * Форматирует период между двумя датами, которые должны находиться в одном месяце,
 * в строку вида:
 * - "1-15 Jan" для диапазона дней
 * - "15 Jan" для одной даты (когда начало и конец периода совпадают)
 *
 * @example
 * // Даты в одном месяце:
 * formatPeriodWithinMonth(moment('2024-01-01'), moment('2024-01-15')); // "1-15 Jan"
 * formatPeriodWithinMonth(moment('2024-01-15'), moment('2024-01-15')); // "15 Jan"
 *
 * @param {moment.Moment} startDate - Начальная дата периода.
 * @param {moment.Moment} endDate - Конечная дата периода.
 *
 * @returns {string} Отформатированная строка периода.
 *                   Возвращает пустую строку, если:
 *                   - переданные аргументы не являются объектами Moment.js
 *                   - даты находятся в разных месяцах
 *                   - endDate раньше startDate
 *
 * @throws {Error} Не выбрасывает исключения, возвращает пустую строку при ошибках.
 *
 * @see getContextualPeriodLabel Основной метод, который использует formatPeriodWithinMonth
 */
  static formatPeriodWithinMonth(startDate, endDate) {
  // Валидация входных параметров
    if (!moment.isMoment(startDate) || !moment.isMoment(endDate)) {
      return "";
    }

    // Проверка, что даты находятся в одном месяце
    if (!startDate.isSame(endDate, "month")) {
      console.warn(
        "formatPeriodWithinMonth: даты находятся в разных месяцах",
        startDate.format(),
        endDate.format(),
      );
      return "";
    }

    // Проверка, что endDate не раньше startDate
    if (endDate.isBefore(startDate, "day")) {
      console.warn(
        "formatPeriodWithinMonth: конечная дата раньше начальной",
        startDate.format(),
        endDate.format(),
      );
      return "";
    }

    const monthShort = startDate.format("MMM");

    // Проверка на совпадение дат (период из одного дня)
    if (startDate.isSame(endDate, "day")) {
      return `${startDate.date()} ${monthShort}`;
    }

    // Форматирование диапазона дней
    return `${startDate.date()}-${endDate.date()} ${monthShort}`;
  }

  // API - методы для взаимодействия с сервером

  /**
     * Метод получения всех доп услуг, учитывая удаленные
     * @param {string[]} periodOfStay - Текущий выбранный период для фильтрации услуги "Курортный сбор".
     * @see canUseService
     * @returns ServiceModel[]
     */
  static async getAllServicesWithDeleted(periodOfStay) {
    const response = await this.http.get("/reports/revenueGetServices");
    const services = response?.services || [];
    const servicesDeleted = response?.services_deleted || [];

    const result = [];

    for (const service of services) {
      service.active = this.canUseService(service.id, periodOfStay);
      result.push(new ServiceModel(service));
    }

    for (const service of servicesDeleted) {
      service.active = this.canUseService(service.id, periodOfStay);
      service.deleted = true;
      result.push(new ServiceModel(service));
    }

    return result;
  }

  /**
   * Метод получения данных для отчета
   */
  static async getReportResponse(data = {}) {
    const payload = {
      primary: {
        from: data.from,
        to: data.to,
        roomtypes_ids: data.roomtypesIds,
        services_ids: data.servicesIds,
      },
      comparable: {},
      groupBy: data.groupBy,
    };
    const url = this.getUrl("/reports/get_revenue");
    const response = await this.http[this.getLocalPostProd](url, payload, true);
    if (this.isDev) await this.delay();
    return response;
  }

  /**
   * Метод для сохранения пользовательского ввода в хранилище на сервере
   */
  static async saveReportFilters(reportData = {}) {
    const response = await this.http.post("/reports/save_revenue_report_data", { reportData, type: "filters" });
    return response?.result === "success";
  }

  /**
   * Метод для обновления состояния блоков с метриками на странице тарифов
   */
  static async saveBlockStatus(isHidden) {
    const response = await this.http.post("/reports/save_revenue_report_data", { isHidden, type: "block" });
    return response?.result === "success";
  }

  /**
   * Метод для получения отчета Excel
   */
  static async getExcel({
    type, to, from, roomtypeIds, servicesIds, metrics,
  }) {
    const typeValue = this.typesExcelReports?.[type] || this.typesExcelReports.incomes;
    const url = this.getUrl("/reports/get_revenue_xlsx");
    const query = {
      type: typeValue,
      primary: {
        ...this.sendingFiltersFormat.primary,
        to,
        from,
        metrics: metrics || [],
        roomtypes_ids: roomtypeIds || [],
        services_ids: servicesIds || [],
      },
      comparable: {},
    };
    if (this.isDev) await this.delay();
    const response = await this.http[this.getLocalPostProd](url, query, true);
    if (typeof response === "string"){
      window.open(baseUrl + response, "_blank");
    }
  }

  /**
   * Проверяет, нужно ли скрывать услугу "Курортный сбор".
   * Услуга скрывается, если выбранный период полностью находится после 31 декабря 2024 года.
   * @param {string[]} periodOfStay - Массив дат в формате строки
   * @returns {boolean} - true, если услуга должна быть скрыта, иначе false
   */
  static shouldHideResortFee(periodOfStay) {
    if (!Array.isArray(periodOfStay) || periodOfStay.length !== 2) {
      return false;
    }

    const start = periodOfStay[0];
    return moment(start, this.sendingDataFormat).isAfter("2024-12-31", "day");
  }

  /**
   * Проверяет, можно ли использовать услугу.
   * Все услуги доступны без ограничений, кроме "Курортный сбор", который доступен только для периодов до 31 декабря 2024 года.
   * @param {string} id
   * @param {string[]} periodOfStay
   * @returns {boolean}
   */
  static canUseService(id, periodOfStay = []) {
    // если услуга не является "Курортный сбор", используется без ограничений
    if (id !== this.resortFeeId) {
      return true;
    }

    // если услуга является "Курортный сбор", используется только для периодов до 31 декабря 2024 года
    return !this.shouldHideResortFee(periodOfStay);
  }

  static mapMetricKeyToServer(key) {
    return this.metricsBlockTypes.amount.key === key ? "income" : key;
  }
}
