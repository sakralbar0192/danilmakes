<template>
  <template>
    <tariff-prices-screen-layout
      ref="tariffPricesScreenLayout"
      :need-hide-footer="needHideFooter"
      :has-pending-tariff-changes="hasPendingTariffChanges"
      :is-mobile-footer-hidden-by-keyboard="isMobileFooterHiddenByKeyboard"
      :finish-mobile-edit-footer-session="finishMobileEditFooterSession"
      :keyboard-affects-scroll-layout-getter="resolveMobileKeyboardAffectsScrollLayout"
      @change-tariff="changeTariff"
      @change-mode="changeMode"
      @click-save="updatePrices"
      @click-discard="handleFooterDiscard"
    >
      <template #table>
        <page-table
          ref="pageTable"
          :calendar-loading="isLoading || isTableContentPending"
          :is-availability-editable="isAvailabilityEditable"
          @change-mode="changeMode"
          @change-date="changeDate"
          @show-categories-popup="categoriesPopupValue = true"
          @show-restrictions-popup="restrictionsPopupValue = true"
          @update-need-hide-footer="needHideFooter = $event"
          @update-need-hide-app-footer="onNeedHideAppMobileFooter"
        />
      </template>
    </tariff-prices-screen-layout>
    <tariff-prices-screen-modals
      v-model:categories-popup-value="categoriesPopupValue"
      v-model:restrictions-popup-value="restrictionsPopupValue"
    />
  </template>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import TariffInterfaceSettingsService from "@/services/tariff/interface-settings";
import { isEmptyObject } from "@/utils/object";
import { viewDateFormat } from "./config/screen-config.js";
import TariffPricesScreenLayout from "./components/layout/tariff-prices-screen-layout.vue";
import TariffPricesScreenModals from "./components/layout/tariff-prices-screen-modals.vue";
import PageTable from "./components/table/index.vue";
import { flatMapRoomtypesWithSubrooms } from "./lib/flat-roomtypes.js";
import { buildRouteDataKey } from "./lib/screen/route-key.js";
import { normalizeDateFrom } from "./lib/screen/normalize-date-from.js";
import { remapModeForCombinedMode } from "./lib/screen/combined-mode.js";
import { hasInvalidAvailabilityDraftInTree } from "./config/resolve-availability-draft-from-input.js";
import { hasPendingTariffChanges as computeHasPendingTariffChanges, shouldHideMobileAppFooterBar as computeShouldHideMobileAppFooterBar } from "./lib/screen/pending-and-footer.js";
import { createMobileAppFooterController } from "./lib/screen/mobile-app-footer-controller.js";
import { MOBILE_EDIT_POST_SAVE_SCROLL_FIT_DELAY_MS } from "./components/table/config/table-grid-metrics.js";
import resolveInitialSavedState from "./lib/screen/initialize-saved-state.js";
import { buildStayRestrictionDialogTranslationParams } from "./lib/screen/stay-restriction-dialog-content.js";
import { hasUnacceptablePrices,
  buildUnacceptablePriceCategoryTags,
  runSaveValidationSequence,
  requestUpdatePrices,
  isStayMinMaxApiError,
  mergeStayConflictTimestamps,
  STAY_MIN_MAX_API_ERROR_MESSAGE } from "./lib/screen/save-flow.js";
import { syncTariffPricesFromRoute } from "./lib/screen/sync-from-route.js";
import { applyAvailabilitySavedInPlace } from "./components/table/lib/store/apply-availability-saved-in-place.js";
import { fetchTariffPricesCalendarData } from "./lib/screen/fetch-tariff-calendar-data.js";
import { resolveRefetchPartsForSave } from "./lib/screen/resolve-refetch-parts-after-save.js";
import { ensureDynamicPartBeforePriceSave } from "./lib/screen/price-save-preflight.js";
import {   captureScrollContainerPosition,
  restoreScrollContainerPosition } from "./lib/screen/preserve-scroll-container-position.js";
import { shouldBlockTariffDiscardWhileMobileCellFocused } from "./lib/screen/footer-discard-guard.js";
import { applyVirtualKeyboardOverlaysContentOnce } from "./lib/screen/apply-virtual-keyboard-overlays-content.js";
import { applyRmsDefaultPlanModeMapping } from "./lib/screen/apply-rms-default-plan-mode-mapping.js";

export default {
  name: "TariffPricesScreen",
  components: {
    TariffPricesScreenLayout,
    TariffPricesScreenModals,
    PageTable,
  },
  data() {
    return {
      categoriesPopupValue: false,
      restrictionsPopupValue: false,
      needHideFooter: false,
      tableHideMobileAppFooter: false,
      isMobileFooterHiddenByKeyboard: false,
      mobileAppFooterController: null,
    };
  },
  computed: {
    ...mapState("hotelRoom", ["roomtypes"]),
    ...mapState("hotel", ["rplans", "rplansByIds"]),
    ...mapState("tariffPricesAndRestrictions", ["currentTariff", "dateFrom", "mode", "updatingPrices", "pricesToDelete", "unacceptableRestrictions", "unacceptableRestrictionsChildStayConflictTimestamps", "unacceptableRestrictionsParentStayConflictTimestamps", "pricesCalendarModel", "updatedRestrictions", "updatingAvailability", "enabledCombinedMode", "isLoading", "selectedCategories"]),
    ...mapGetters("tariffPricesAndRestrictions", ["unacceptablePrices", "isRmsPricingEnabled", "isDynamicPricesModeEnabled", "isCurrentTariffDepend", "isTableContentPending"]),
    ...mapGetters("user", ["getDefaultPlanMode"]),
    isSomeCategoriesHasExtraCharges() {
      return this.roomtypes
        .filter(roomtype => (!this.selectedCategories.length || this.selectedCategories.includes(roomtype.id)))
        .some(roomtype => !isEmptyObject(roomtype?.extra?.people ?? {}));
    },
    hasPendingTariffChanges() {
      return computeHasPendingTariffChanges({
        updatingPrices: this.updatingPrices,
        pricesToDelete: this.pricesToDelete,
        updatedRestrictions: this.updatedRestrictions,
        updatingAvailability: this.updatingAvailability,
      });
    },
    /** Нижняя панель приложения: на мобилке скрыта всегда; на десктопе — при правках, скрытом футере страницы и по сигналу таблицы. */
    shouldHideMobileAppFooterBar() {
      return computeShouldHideMobileAppFooterBar({
        needHideFooter: this.needHideFooter,
        hasPendingTariffChanges: this.hasPendingTariffChanges,
        tableHideMobileAppFooter: this.tableHideMobileAppFooter,
        isMobileDevice: this.isMobileDevice,
      });
    },
    flatRoomtypes() {
      return flatMapRoomtypesWithSubrooms(this.roomtypes);
    },
    routeDataKey() {
      return buildRouteDataKey({
        id: this.$route?.params?.id,
        dfrom: this.$route?.query?.dfrom,
        mode: this.$route?.query?.mode,
      });
    },
    isAvailabilityEditable() {
      return Boolean(this.hotel?.isChmOnly);
    },
  },
  watch: {
    routeDataKey: {
      async handler() {
        if (!this.rplans.length) {
          return;
        }
        await this.syncFromRoute();
      },
    },
    shouldHideMobileAppFooterBar() {
      this.mobileAppFooterController?.syncBodyClass();
    },
    needHideFooter(v) {
      if (!v && this.isMobileDevice) {
        this.$nextTick(() => this.finishMobileEditFooterSession());
      }
    },
  },
  created() {
    this.mobileAppFooterController = createMobileAppFooterController({
      window: typeof window !== "undefined" ? window : null,
      document: typeof document !== "undefined" ? document : null,
      isMobileDevice: () => this.isMobileDevice,
      getShouldHideMobileAppFooterBar: () => this.shouldHideMobileAppFooterBar,
      onKeyboardHiddenChange: (hidden) => {
        this.isMobileFooterHiddenByKeyboard = hidden;
      },
    });
  },
  async mounted() {
    await Promise.allSettled([
      this.$store.dispatch("hotelRoom/getRoomTypes"),
      this.$store.dispatch("hotel/getPlans"),
      this.$store.dispatch("additionalServices/getAdditionalServices"),
    ]);

    this.applyInitialSavedState();
    await this.syncFromRoute({ resetChanges: false });

    this.$nextTick(() => this.mobileAppFooterController?.syncBodyClass());
    if (typeof navigator !== "undefined") {
      applyVirtualKeyboardOverlaysContentOnce(navigator);
    }
    document.addEventListener("fullscreenchange", this.handleFullscreenChange);
    this.handleFullscreenChange();
  },
  beforeUnmount() {
    document.removeEventListener("fullscreenchange", this.handleFullscreenChange);
    document.body.classList.remove("tariff-demo-page-fullscreen");
    this.setFullscreenMode(false);
    if (this.mobileAppFooterController) {
      this.mobileAppFooterController.destroy();
      this.mobileAppFooterController = null;
    }
  },
  methods: {
    ...mapActions("tariffPricesAndRestrictions", ["setIsLoading", "setCompactRestrictions", "setInterfaceSettings"]),
    ...mapMutations("tariffPricesAndRestrictions", ["setFullscreenMode"]),
    applyInitialSavedState() {
      const savedState = resolveInitialSavedState({
        user: this.user,
        hotelId: this.hotel?.id,
        isMobileDevice: this.isMobileDevice,
        isApartment: this.hotel?.isApartment,
        hasTourKey: false,
      });

      this.setCompactRestrictions(savedState.compactRestrictions);
      this.setInterfaceSettings(savedState.interfaceSettings);

      if (savedState.categories.length) {
        this.$store.dispatch("tariffPricesAndRestrictions/setSelectedCategories", savedState.categories);
      }
      if (savedState.restrictions) {
        this.$store.dispatch("tariffPricesAndRestrictions/setSelectedRestrictions", savedState.restrictions);
      }
      if (savedState.shouldPersistCompactRestrictions) {
        PriceAndRestrictionsService.saveChoosenCompactRestrictionsFilter(savedState.compactRestrictions);
      }
      if (savedState.shouldPersistSettings) {
        TariffInterfaceSettingsService.saveSettings(savedState.interfaceSettings);
      }
    },
    // Дублирует часть needHideFooter намеренно: сигнал для mobile-app-footer-controller (клавиатура / body class), без reset approval.
    onNeedHideAppMobileFooter(value) {
      this.tableHideMobileAppFooter = value;
      this.mobileAppFooterController?.onTableAppFooterSignal(value);
      if (!value) {
        this.finishMobileEditFooterSession();
      }
    },
    finishMobileEditFooterSession() {
      this.mobileAppFooterController?.finishEditSession?.();
    },
    resolveMobileKeyboardAffectsScrollLayout() {
      const table = this.$refs.pageTable;
      if (table && typeof table.isMobileKeyboardAffectingScrollLayout === "function") {
        return table.isMobileKeyboardAffectingScrollLayout();
      }
      return false;
    },
    // --- Маршрут и данные ---
    normalizeQueryDateFrom(rawDateFrom = this.$route?.query?.dfrom) {
      return normalizeDateFrom(rawDateFrom, { sendingDateFormat: PriceAndRestrictionsService.sendingDateFormat });
    },
    getNormalizedMode(route = this.$route, tariff = this.currentTariff) {
      return PriceAndRestrictionsService.checkMode(
        route?.query?.mode || "",
        !!Number(tariff?.extra?.rms_pricing_rules_enabled),
        this.getDefaultPlanMode,
        this.enabledCombinedMode,
      );
    },
    async syncFromRoute(options) {
      return syncTariffPricesFromRoute(this, options);
    },
    handleFullscreenChange() {
      const isFullscreen = Boolean(document.fullscreenElement);
      document.body.classList.toggle("tariff-demo-page-fullscreen", isFullscreen);
      this.setFullscreenMode(isFullscreen);
      this.$nextTick(() => {
        const pageTable = this.$refs.pageTable;
        const virtualizer = pageTable?.$refs?.tariffTableVirtualizedGrid?.$refs?.tableVirtualizer;
        virtualizer?.removeListeners?.();
        virtualizer?.addListeners?.();
        virtualizer?.forceUpdateState?.();
        pageTable?.reattachHorizontalScrollListeners?.();
      });
    },
    // --- Данные календаря и смена даты/режима/тарифа в query ---
    async getData(options) {
      return fetchTariffPricesCalendarData(this, options);
    },
    buildRefetchPartsAfterSave(sendingData = null) {
      const hasStayConflictMeta = Boolean(
        this.unacceptableRestrictionsChildStayConflictTimestamps?.size
        || this.unacceptableRestrictionsParentStayConflictTimestamps?.size,
      );
      return resolveRefetchPartsForSave({
        sendingData,
        updatingPrices: this.updatingPrices,
        pricesToDelete: this.pricesToDelete,
        updatedRestrictions: this.updatedRestrictions,
        currentTariff: this.currentTariff,
        isDynamicPricesModeEnabled: this.isDynamicPricesModeEnabled,
        isRmsPricingEnabled: this.isRmsPricingEnabled,
        pricesCalendarModel: this.pricesCalendarModel,
        roomtypes: this.roomtypes,
        isDependentTariff: this.isCurrentTariffDepend,
        hasStayConflictMeta,
      });
    },
    async refetchCalendarPartsAfterSave(sendingData = null, { explicitParts = null } = {}) {
      const parts = Array.isArray(explicitParts) && explicitParts.length
        ? explicitParts
        : this.buildRefetchPartsAfterSave(sendingData);
      if (!parts.length) {
        return;
      }
      const savedAvailability = sendingData?.availability;
      const hasSavedAvailability = savedAvailability && !isEmptyObject(savedAvailability);
      if (hasSavedAvailability) {
        applyAvailabilitySavedInPlace(this.pricesCalendarModel, savedAvailability);
      }
      if (parts.includes("dynamic") && this.isRmsPricingEnabled) {
        await this.$store.dispatch("tariffPricesAndRestrictions/ensureDynamicLoaded");
      }
      await fetchTariffPricesCalendarData(this, {
        background: true,
        parts,
        savedAvailability: hasSavedAvailability ? savedAvailability : null,
      });
      this.pricesCalendarModel?.clearDerivedPriceCaches?.();
    },
    getPricesPageScrollContainerEl() {
      return this.$refs.tariffPricesScreenLayout?.$refs?.scrollContainerRef ?? null;
    },
    async refetchCalendarAfterSavePreservingScroll(sendingData = null, { explicitParts = null } = {}) {
      const scrollEl = this.getPricesPageScrollContainerEl();
      const scrollSnapshot = captureScrollContainerPosition(scrollEl);
      await this.refetchCalendarPartsAfterSave(sendingData, { explicitParts });
      await this.$nextTick();
      restoreScrollContainerPosition(scrollEl, scrollSnapshot);
      this.$refs.pageTable?.refreshVirtualizedTableLayout?.();
      this.schedulePostSaveScrollFitRecompute();
    },
    schedulePostSaveScrollFitRecompute() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.tariffPricesScreenLayout?.scrollFitController?.scheduleRecompute?.();
        }, MOBILE_EDIT_POST_SAVE_SCROLL_FIT_DELAY_MS);
      });
    },
    changeDate(dfrom) {
      dfrom = this.normalizeQueryDateFrom(dfrom);
      if (dfrom !== this.dateFrom) {
        this.$router.push({ query: { ...this.$route.query, dfrom } });
      }
    },
    async changeMode(e) {
      const nextMode = remapModeForCombinedMode(e, {
        enabledCombinedMode: this.enabledCombinedMode,
        isRmsPricingEnabled: this.isRmsPricingEnabled,
        modeDefaultPrice: PriceAndRestrictionsService.modeDefaultPrice,
        modeDynamicPrice: PriceAndRestrictionsService.modeDynamicPrice,
        modeRestrictions: PriceAndRestrictionsService.modeRestrictions,
        modeRestrictionsWithPrices: PriceAndRestrictionsService.modeRestrictionsWithPrices,
        modeRestrictionsWithDynamicPrices: PriceAndRestrictionsService.modeRestrictionsWithDynamicPrices,
      });

      if (this.mode && nextMode !== this.mode) {
        this.$router.push({ query: { ...this.$route.query, mode: nextMode } });
      }
    },
    async changeTariff(tariffId) {
      if (tariffId) {
        const nextTariff = this.rplansByIds[tariffId];
        const rawMode = this.$route.query?.mode || this.mode;
        const isNextRms = !!Number(nextTariff?.extra?.rms_pricing_rules_enabled);
        const modeCandidate = isNextRms
          ? applyRmsDefaultPlanModeMapping(rawMode, true, this.enabledCombinedMode)
          : rawMode;
        const mode = this.getNormalizedMode(
          { query: { ...this.$route.query, mode: modeCandidate } },
          nextTariff,
        );
        await this.$router.push({
          params: { ...this.$route.params, id: tariffId },
          query: {
            ...this.$route.query,
            mode,
          },
        });
        this.$refs.pageTable.clearMobileEdit();
      }
    },
    // --- Сохранение и диалоги ---
    checkNullishPrice() {
      return new Promise(res => {
        if (PriceAndRestrictionsService.checkNullishPrice(this.updatingPrices)) {
          this.$dialog.message({
            dataTest: "tariff-zero-price-warning-dialog",
            title: this.$t("Channel Manager не обновится"),
            content: this.$t("Вы указали цену '0'. Данные обновления не будут отправлены в Channel Manager, т.к. системы и модуль онлайн-бронирования не принимают указанную цену"),
            type: "warning",
            buttons: [
              {
                text: this.$t("Подтвердить сохранение"),
                color: "primary",
                dataTest: "tariff-zero-price-dialog-confirm",
                closeOnHandler: !Object.keys(this.unacceptablePrices).length,
                callback: () => { res(true); },
              },
              {
                text: this.$t("Отменить"),
                outlined: true,
                closeOnHandler: true,
                color: "secondary",
                dataTest: "tariff-zero-price-dialog-cancel",
                callback: () => { res(false); },
              },
            ],
          });
        } else res(true);
      });
    },
    checkUnacceptablePrices() {
      return new Promise(res => {
        if (hasUnacceptablePrices(this.unacceptablePrices)) {
          const roomtypeIds = Object.keys(this.unacceptablePrices);
          const categoryTags = buildUnacceptablePriceCategoryTags(
            roomtypeIds,
            (roomtypeId) => this.flatRoomtypes.find((roomtype) => roomtype.id === roomtypeId)?.name,
          );
          this.$dialog.message({
            title: this.$t("Невозможно изменить стоимость"),
            content: `${
              this.$t("Стоимость проживания в")
            } ${
              roomtypeIds.length > 1 ? this.$t("категориях") : this.$t("категории")
            } ${
              categoryTags
            } ${
              this.$t("не может быть изменена, так как по тарифу")
            } <${
              this.pricesCalendarModel?.maxDiscountChildTariff?.name || ""
            }> ${
              this.$t("сумма проживания станет отрицательной.")
            } <br /> <br /> ${
              this.$t("Пожалуйста")
            }, <b>${
              this.$t("измените стоимость для данной категории")
            }</b> ${
              this.$t("или")
            } <b>${
              this.$t("измените размер скидки")
            }</b> ${
              this.$t("в зависимом тарифе")
            }`,
            type: "error",
            buttons: [
              {
                text: this.$t("Понятно"),
                color: "primary",
                closeOnHandler: true,
                callback: () => { res(false); },
              },
            ],
          });
        } else res(true);
      });
    },
    checkInvalidRestrictionStays() {
      return new Promise((res) => {
        const timestamps = mergeStayConflictTimestamps({
          pricesCalendarModel: this.pricesCalendarModel,
          updatedRestrictions: this.updatedRestrictions,
          unacceptableRestrictions: this.unacceptableRestrictions,
        });
        if (!timestamps.size) {
          res(true);
          return;
        }
        this.showStayCombinationRestrictionError(timestamps, { onAcknowledge: () => { res(false); } });
      });
    },
    handleFooterDiscard() {
      if (shouldBlockTariffDiscardWhileMobileCellFocused(this.isMobileDevice, this.$refs.pageTable)) {
        this.$dialog.toast({
          content: this.$t("Закончите редактирование ячейки (закройте клавиатуру), затем отмените изменения."),
          type: "info",
        });
        return;
      }
      this.$store.dispatch("tariffPricesAndRestrictions/resetMainChanges");
    },
    async updatePrices() {
      if (this.isTableContentPending) {
        return;
      }
      await this.$refs.pageTable?.flushPendingMobileEditableInputs?.();
      await this.$nextTick();
      if (hasInvalidAvailabilityDraftInTree(this.updatingAvailability)) {
        this.$dialog.message({
          title: this.$t("Некорректное значение наличия"),
          content: this.$t("Укажите целое число больше или равное 0."),
          type: "warning",
        });
        return;
      }
      const maySave = await runSaveValidationSequence({
        checkNullishPrice: () => this.checkNullishPrice(),
        checkUnacceptablePrices: () => this.checkUnacceptablePrices(),
        checkInvalidRestrictionStays: () => this.checkInvalidRestrictionStays(),
      });

      if (!maySave) {
        return;
      }
      this.setIsLoading(true);
      await ensureDynamicPartBeforePriceSave({
        ensureDynamicLoaded: () => this.$store.dispatch("tariffPricesAndRestrictions/ensureDynamicLoaded"),
        updatingPrices: this.updatingPrices,
        pricesToDelete: this.pricesToDelete,
        currentTariff: this.currentTariff,
        roomtypes: this.roomtypes,
        pricesCalendarModel: this.pricesCalendarModel,
        isRmsPricingEnabled: this.isRmsPricingEnabled,
        isDynamicPricesModeEnabled: this.isDynamicPricesModeEnabled,
      });
      const { response: resp, sendingData } = await requestUpdatePrices({
        updatingPrices: this.updatingPrices,
        currentTariff: this.currentTariff,
        pricesToDelete: this.pricesToDelete,
        updatedRestrictions: this.updatedRestrictions,
        updatingAvailability: this.updatingAvailability,
        isDynamicPricesModeEnabled: this.isDynamicPricesModeEnabled,
        isRmsPricingEnabled: this.isRmsPricingEnabled,
        pricesCalendarModel: this.pricesCalendarModel,
        roomtypes: this.roomtypes,
      });
      if (isStayMinMaxApiError(resp)) {
        this.failureUpdatedRestrictions();
      } else {
        await this.successUpdatedPrices({ response: resp, sendingData });
      }
      this.setIsLoading(false);
    },
    async successUpdatedPrices({
      response, compeleteLoadSignal = null, sendingData = null,
    }) {
      if (response.result === "success") {
        await this.refetchCalendarAfterSavePreservingScroll(sendingData);
        this.$refs.pageTable?.clearCellVmCache?.();
        this.$refs.pageTable?.clearMobileEdit?.({ skipStoreFlush: true });
        this.$refs.pageTable?.scheduleMobileEditLayoutSettle?.();

        if (sendingData) {
          this.$store.dispatch("tariffPricesAndRestrictions/resetDraftsForSendingData", sendingData);
        } else {
          this.$store.dispatch("tariffPricesAndRestrictions/resetPriceDrafts");
        }
        this.$dialog.toast({
          content: this.$t("Данные успешно сохранены"),
          type: "success",
          timeout: 4000,
        });

        if (compeleteLoadSignal) {
          compeleteLoadSignal.resolve();
        }
      } else if (response.result === "error") {
        this.$dialog.toast({
          content: response?.error?.message || this.$t("Не удалось сохранить цены"),
          type: "error",
        });

        if (compeleteLoadSignal) {
          compeleteLoadSignal.reject();
        }
      }
    },
    /**
     * Единый диалог конфликта min/max stay: до сохранения и после ответа API.
     * @param {Set<number>} updateDateTimestamps — timestamps дат из `getInvalidStayCombinationTimestampsInUpdatedRestrictions` (пустой Set — общий текст без периода).
     */
    showStayCombinationRestrictionError(updateDateTimestamps, {
      clearEditedCellOnAcknowledge = false,
      onAcknowledge = null,
    } = {}) {
      const childTs = this.unacceptableRestrictionsChildStayConflictTimestamps;
      const parentTs = this.unacceptableRestrictionsParentStayConflictTimestamps;
      const hasPeriod = updateDateTimestamps instanceof Set && updateDateTimestamps.size > 0;
      const involvesDependentTariffs = hasPeriod
        ? [...updateDateTimestamps].some((ts) => childTs?.has?.(ts) || parentTs?.has?.(ts))
        : Boolean(childTs?.size || parentTs?.size);
      const spec = buildStayRestrictionDialogTranslationParams(
        updateDateTimestamps,
        viewDateFormat,
        { involvesDependentTariffs },
      );
      const content = spec.interpolation
        ? this.$t(spec.contentKey, spec.interpolation)
        : this.$t(spec.contentKey);

      this.$dialog.message({
        type: "error",
        title: this.$t("Невозможно изменить ограничение"),
        content,
        closable: true,
        buttons: [
          {
            text: this.$t("Понятно"),
            color: "primary",
            closeOnHandler: !clearEditedCellOnAcknowledge,
            callback: () => {
              if (clearEditedCellOnAcknowledge) {
                this.$dialog.hide();
              }
              if (onAcknowledge instanceof Function) {
                onAcknowledge();
              }
            },
          },
        ],
      });
    },
    failureUpdatedRestrictions() {
      this.showStayCombinationRestrictionError(mergeStayConflictTimestamps({
        pricesCalendarModel: this.pricesCalendarModel,
        updatedRestrictions: this.updatedRestrictions,
        unacceptableRestrictions: this.unacceptableRestrictions,
      }), { clearEditedCellOnAcknowledge: true });
    },
  },
};
</script>

<style lang="scss">
  @import "./styles/index.scss";
</style>
