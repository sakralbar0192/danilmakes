/** Имена счётчикей statist при открытии массового обновления ограничений */
export const STATIST_RESTRICTIONS_DRAWER_COUNTERS = [
  "tariffsFromUpdatingConstraintsStartToFinish",
  "newtariffsFromUpdatingConstraintsStartToFinish",
];

/** Имена счётчикей statist при открытии массового обновления цен */
export const STATIST_PRICES_DRAWER_COUNTERS = [
  "tariffsFromMassPricesUpdateStartToFinish",
  "newtariffsFromMassPricesUpdateStartToFinish",
];

/**
 * @param {{ startCounter: (name: string) => void }|undefined|null} statist
 * @param {readonly string[]} counterNames
 */
export function startStatistCounters(statist, counterNames) {
  if (!statist) {
    return;
  }
  counterNames.forEach((name) => {
    statist.startCounter(name);
  });
}

/**
 * Цель Я.Метрики для попапа массовых ограничений.
 * @param {string} pathname — обычно window.location.pathname
 */
export function ymGoalRestrictionsMassPopup(pathname) {
  return pathname === "/tariff/restrictions_overview"
    ? "massRestrictionsOverviewPopup"
    : "massRestrictionsPopup";
}

/** Цель Я.Метрики для попапа массовых цен */
export const YM_GOAL_MASS_PRICES_POPUP = "massPricesUpdatePopup";
