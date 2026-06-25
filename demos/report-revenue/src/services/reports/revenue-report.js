import CoreService from "@/services/core";
import moment from "moment";
import i18n from "@/plugins/i18n";
import { defineAsyncComponent } from "vue";
import { DemoApi } from "@/config/demo-api";
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

  static sendingFiltersFormat = {
    primary: {
      from: "",
      to: "",
      services_ids: [],
      roomtypes_ids: [],
    },
    comparable: {},
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
  };

  static get metricsSelectionOptions() {
    return Object.fromEntries(
      Object.entries(this.metricsBlockTypes).map(([key, metric]) => [
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
    const url = this.getUrl(DemoApi.revenueReport);
    const response = await this.http[this.getLocalPostProd](url, payload, true);
    if (this.isDev) await this.delay();
    return response;
  }

  static mapMetricKeyToServer(key) {
    return this.metricsBlockTypes.amount.key === key ? "income" : key;
  }
}
