import { cellWidth } from "../config/table-grid-metrics.js";

/**
 * Срез календаря по горизонтальному окну из таблицы (provide tariffTableHorizontalDayWindow).
 * Общий slice — через provide tariffTableHorizontalDisplayCalendar (один slice на все строки).
 * Fallback: cal.slice(...) для компонентов вне provide или тестов.
 */
export default {
  inject: {
    tariffTableHorizontalDayWindow: { default: null },
    tariffTableHorizontalDisplayCalendar: { default: null },
    tariffTableCellShared: { default: null },
  },
  computed: {
    hcalWindow() {
      return this.tariffTableHorizontalDayWindow;
    },
    hcalFullCalendar() {
      if (Array.isArray(this.calendar) && this.calendar.length) {
        return this.calendar;
      }
      return this.tariffTableCellShared?.pricesCalendarModel?.calendar ?? [];
    },
    hcalCalendarLength() {
      return this.hcalFullCalendar?.length ?? 0;
    },
    hcalStartIndex() {
      const w = this.hcalWindow;
      if (!w || w.endIndex <= w.startIndex) {
        return 0;
      }
      return w.startIndex;
    },
    hcalDisplayCalendar() {
      const shared = this.tariffTableHorizontalDisplayCalendar;
      if (Array.isArray(shared) && shared.length) {
        return shared;
      }
      const cal = this.hcalFullCalendar;
      const w = this.hcalWindow;
      if (!cal?.length) {
        return cal;
      }
      if (!w || w.endIndex <= w.startIndex) {
        return cal;
      }
      return cal.slice(w.startIndex, Math.min(cal.length, w.endIndex));
    },
    hcalWindowKey() {
      const cal = this.hcalFullCalendar || [];
      const display = this.hcalDisplayCalendar || [];
      const start = this.hcalStartIndex;
      const end = start + display.length;
      const firstDate = display[0]?.date || "";
      const lastDate = display[display.length - 1]?.date || "";
      return `${start}:${end}:${firstDate}:${lastDate}:${cal.length}`;
    },
    hcalLeadingSpacerPx() {
      return this.hcalStartIndex * this.hcalCellWidth;
    },
    hcalTrailingSpacerPx() {
      const cal = this.hcalFullCalendar;
      const w = this.hcalWindow;
      if (!cal?.length || !w || w.endIndex <= w.startIndex) {
        return 0;
      }
      return Math.max(0, cal.length - w.endIndex) * this.hcalCellWidth;
    },
    hcalCellWidth() {
      return this.$options.cellWidth ?? cellWidth;
    },
    hcalDaysRowFlexStyle() {
      return {
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
      };
    },
    hcalLeadingSpacerStyle() {
      const w = this.hcalLeadingSpacerPx;
      return {
        flex: "0 0 auto",
        width: `${w}px`,
        minWidth: `${w}px`,
      };
    },
    hcalTrailingSpacerStyle() {
      const w = this.hcalTrailingSpacerPx;
      return {
        flex: "0 0 auto",
        width: `${w}px`,
        minWidth: `${w}px`,
      };
    },
  },
};

/**
 * @param {object} ctx — контекст с полями mixin computed
 * @returns {Array}
 */
export function resolveHcalDisplayCalendar(ctx) {
  const shared = ctx.tariffTableHorizontalDisplayCalendar;
  if (Array.isArray(shared) && shared.length) {
    return shared;
  }
  const cal = ctx.hcalFullCalendar ?? ctx.calendar ?? [];
  const w = ctx.hcalWindow ?? ctx.tariffTableHorizontalDayWindow;
  if (!cal?.length) {
    return cal;
  }
  if (!w || w.endIndex <= w.startIndex) {
    return cal;
  }
  return cal.slice(w.startIndex, Math.min(cal.length, w.endIndex));
}
