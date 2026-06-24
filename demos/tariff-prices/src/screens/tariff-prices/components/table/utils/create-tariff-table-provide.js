import { getHorizontalDisplayCalendarFromCache } from "../lib/scroll/tariff-horizontal-display-calendar-cache.js";

/**
 * Границы доменов таблицы тарифов (для навигации по рефакторингу):
 * - `mixins/tariff-table-horizontal-scroll.js` — horizontalDayWindow, resize, подавление ghost-click по категориям
 * - `mixins/tariff-table-mobile-edit.js` — VisualViewport (dismiss клавиатуры), sticky overlap, подскролл ячейки (`lib/scroll/mobile-edit-scroll-into-view.js`) при фокусе в ячейке
 * - `mixins/tariff-table-cell-events.js` — click/input/focus/blur, синк черновиков, boolean sheets, tooltip anchor
 * - `mixins/tariff-table-restriction-selection.js` — drag-выделение диапазона в строке ограничений
 * - `index.vue` — Vuex, виртуальные строки, cell VM, координатор `handleScroll`, provide через эту фабрику
 *
 * Единая фабрика `provide`, чтобы список инжектируемых ключей жил в одном месте без раздувания SFC.
 *
 * @param {object} outer — экземпляр компонента `BnovoTariffPricesAndRestrictionsTable`
 */
export default function createTariffTableProvide(outer) {
  return {
    tariffPriceCellTooltipController: outer.priceCellTooltipController,
    tariffTableHorizontalDayWindow: outer.horizontalDayWindow,
    get tariffTableHorizontalDisplayCalendar() {
      return getHorizontalDisplayCalendarFromCache(outer.horizontalDisplayCalendarCache);
    },
    getPriceCellVm: (args) => outer.getPriceCellVm(args),
    getPriceRowVmEpoch: (args) => outer.getPriceRowVmEpoch(args),
    getRestrictionCellVm: (args) => outer.getRestrictionCellVm(args),
    getRestrictionRowVmEpoch: (args) => outer.getRestrictionRowVmEpoch(args),
    findTariffTableCellRootByKey: (key) => outer.findCellRootByKey(key),
    tariffTableCellShared: {
      get pricesCalendarModel() {
        return outer.pricesCalendarModel;
      },
      get pricesCalendarModelUpdatedAt() {
        return outer.pricesCalendarModelUpdatedAt;
      },
      get currentTariff() {
        return outer.currentTariff;
      },
      get isDynamicPricesModeEnabled() {
        return outer.isDynamicPricesModeEnabled;
      },
      get isRmsPricingEnabled() {
        return outer.isRmsPricingEnabled;
      },
      get parentPriceModification() {
        return outer.parentPriceModification;
      },
      get isOneOfPricesModesEnabled() {
        return outer.isOneOfPricesModesEnabled;
      },
      get isMobileDevice() {
        return outer.isMobileDevice;
      },
      get isCurrentTariffDepend() {
        return outer.isCurrentTariffDepend;
      },
      get currencySign() {
        return outer.$store.state.hotel?.currency_sign;
      },
      get isRestrictionModeEnabled() {
        return outer.isRestrictionModeEnabled;
      },
      get compactRestrictions() {
        return outer.compactRestrictions;
      },
      get closedRestrictionName() {
        return outer.$options.closedRestrictionName;
      },
      get cellVmCachePrice() {
        return outer.cellVmCachePrice;
      },
      get cellVmCacheRestriction() {
        return outer.cellVmCacheRestriction;
      },
      getRoomtypeClosedState(rid, d) {
        return outer.getRoomtypeClosedState(rid, d);
      },
      get isTableInteractionDisabled() {
        return outer.tableInteractionDisabled;
      },
      get isChmOnly() {
        return Boolean(outer.$store.state.hotel?.isChmOnly);
      },
    },
  };
}
