import i18n from "@/plugins/i18n";

export const PERIOD_PRE_FILTERS_HINT_MAP = Object.freeze({
  week: i18n.t("Текущая неделя"),
  month: i18n.t("Текущий месяц"),
  year: i18n.t("Текущий год"),
  sixMonths: i18n.t("Последние 6 месяцев"),
});

export const PERIOD_PRE_FILTERS = Object.freeze(["yesterday", "week", "month", "sixMonths", "year"]);
