<template>
  <b-teleport-wrapper selector="#bnovo-spa">
    <b-drawer
      ref="massPricesDrawer"
      v-model="internalValue"
      lock-overflow
      width="1100"
      stateless
      data-test="tariff-mass-prices-drawer"
    >
      <div class="v-dialog--scrollable height-100">
        <v-card class="d-flex flex-column height-100">
          <v-card-title
            ref="title"
            :class="['pb-outer px-outer d-flex flex-nowrap', $style.header]"
          >
            <h3 class="text-h3 mb-0 font-weight-bold">
              {{ $t("Редактирование цен на период") }}
            </h3>
            <v-spacer/>
            <b-btn
              icon
              color="tertiary"
              text
              large
              @click="internalValue = false"
            >
              <v-icon class="icon-cross"/>
            </b-btn>
          </v-card-title>
          <v-card-text
            ref="content"
            data-test="tariff-mass-prices-drawer-scroll"
            :class="['flex-grow-1 px-outer', $style.content]"
          >
            <div ref="filters" class="set mb-groups" :class="$style['sticky-filters']">
              <tariff-info ref="info" :reset-dependent-prices-active="resetDependentPricesModeChosen"/>
              <div data-test="tariff-mass-prices-dates">
                <dates-periods
                  :ref="$options.innerBlocks.dates"
                  v-model="massiveUpdatingPricesData.datesPeriods"
                  @update:error="$set(validationsStatuses, $options.innerBlocks.dates, $event)"
                  @need-scroll-to-alerts="scrollToAlerts"
                />
              </div>
              <v-row ref="selects" no-gutters :class="{'align-start': isMobileDevice}">
                <b-col cols="auto" class="mr-groups" data-test="tariff-mass-prices-categories">
                  <categories-select
                    :ref="$options.innerBlocks.categories"
                    v-model="massiveUpdatingPricesData.localSelectedRoomtypes"
                    :categories="categoriesForSelect"
                    :search-string="categoriesSearchString"
                    @close="onCategoriesSelectClose"
                    @update:error="$set(validationsStatuses, $options.innerBlocks.categories, $event)"
                  />
                </b-col>
                <b-col cols="auto" data-test="tariff-mass-prices-weekdays">
                  <week-days
                    :ref="$options.innerBlocks.days"
                    v-model="massiveUpdatingPricesData.selectedWeekdays"
                    @update:error="$set(validationsStatuses, $options.innerBlocks.days, $event)"
                  />
                </b-col>
              </v-row>
              <div ref="action" data-test="tariff-mass-prices-mode">
                <b-input-label label="Действие"/>
                <v-row no-gutters :class="['gap-groups', {'align-start': isMobileDevice}]">
                  <b-col cols="auto">
                    <updating-modes v-model="massiveUpdatingPricesData.updatingMode"/>
                  </b-col>
                  <b-col v-if="!manualUpdatingModeChosen && !resetDeletePricesModeChosen" cols="auto" class="flex-grow-1 d-flex">
                    <price-condition
                      :ref="$options.innerBlocks.price"
                      v-model="massiveUpdatingPricesData.priceDiff"
                      :updating-mode="massiveUpdatingPricesData.updatingMode"
                      @update:error="$set(validationsStatuses, $options.innerBlocks.price, $event)"
                    />
                  </b-col>
                </v-row>
              </div>
              <div
                v-if="manualUpdatingModeChosen && !isCurrentTariffDepend"
                class="d-flex align-center justify-start gap-ingroup"
              >
                <b-switch
                  :value="massiveUpdatingPricesDrawerShowDefaultPrices"
                  :label="$t('Показать цены по умолчанию')"
                  medium
                  hide-details
                  @change="$store.dispatch('tariffPricesAndRestrictions/setShowDefaultPrices', $event)"
                />
                <b-tooltip-arrowed bottom max-width="280">
                  <template #activator="{ on, attrs }">
                    <v-icon
                      class="icon-help-circle"
                      size="medium"
                      :color="$vuetify.theme.current.colors.secondary"
                      data-test="tariff-mass-prices-default-prices-hint"
                      v-bind="attrs"
                      v-on="on"
                    />
                  </template>
                  <span v-if="isRmsBasePriceModeActive">
                    <span class="d-block font-weight-bold">{{ $t('Цены по умолчанию') }}</span>
                    <br>
                    <span class="d-block">{{ $t('Цены за взрослых на основных местах, указанные в настройках тарифа') }}</span>
                  </span>
                  <span v-else>
                    <span class="d-block font-weight-bold">{{ $t('Цены по умолчанию') }}</span>
                    <br>
                    <span v-if="hasExtraChargesCategories" class="d-block">
                      — {{ $t('Цены за доп. места и детей на основном месте, настроенные в категориях.') }}
                    </span>
                    <span class="d-block">— {{ $t('Цены за взрослых на основных местах, указанные в настройках тарифа') }}</span>
                  </span>
                </b-tooltip-arrowed>
              </div>
            </div>
            <div v-if="canMountPricesTable" data-test="tariff-mass-prices-values">
              <prices-table
                :roomtypes-ids="massiveUpdatingPricesData.selectedRoomtypes"
                :weekdays="massiveUpdatingPricesData.selectedWeekdays"
                :reference-day="massPricesReferenceDay"
                :get-scroll-container="getContentContainer"
                :class="$style.table"
                @input="handleInput"
                @change="changePrice"
                @focusin="handleFocus"
                @focusout="handleBlur"
              />
            </div>
          </v-card-text>
          <prices-alerts
            ref="pricesAlerts"
            :dates-periods="massiveUpdatingPricesData.datesPeriods"
            :class="['px-outer', $style.alerts]"
            :style="{ bottom: `${alertsBottomOffset}px` }"
            :validations-statuses="validationsStatuses"
            :was-attempt-to-save="wasAttemptToSave"
            :has-no-updating-prices="hasNoUpdatingPrices"
            :updating-mode="massiveUpdatingPricesData.updatingMode"
            @need-scroll-to-alerts="scrollToAlerts"
          />
          <v-card-actions
            v-show="isDesktopDevice || !needHideFooter"
            ref="footer"
            :class="['bordered-t px-outer py-groups gap-inner', $style.footer, {
              'justify-space-between': !isMobileDevice,
              'flex-column-reverse align-stretch': isMobileDevice,
            }]"
          >
            <b-btn
              :disabled="isSavingMassPrices"
              outlined
              color="tertiary"
              data-test="tariff-mass-prices-cancel-button"
              @click="internalValue = false"
            >
              {{ $t('Отменить') }}
            </b-btn>

            <b-btn
              :loading="isSavingMassPrices"
              class="mx-0"
              data-test="tariff-mass-prices-save-button"
              @click="updatePrices"
            >
              {{ $t('Сохранить цены') }}
            </b-btn>
          </v-card-actions>
        </v-card>
      </div>
    </b-drawer>
  </b-teleport-wrapper>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import moment from "moment";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import scrollToElementMixin from "@/mixins/scroll-into-view";
import ymHelpers from "@/utils/ym-helpers";
import rusWordCaserMixin from "@/mixins/rus-word-caser-mixin";
import BTeleportWrapper from "@/uikit/b-teleport-wrapper";
import { haveDifferentContent, getRightOrderArray } from "@/utils/array-set-content";
import resolveElement from "@/utils/resolve-element.js";
import { formatAmount } from "../../config/format-amount.js";
import { currencyList as screenCurrencyList,
  updatingPricesInnerBlocks,
  allWeekdayItem,
  getExtraChargeName,
  bedTypes } from "../../config/screen-config.js";
import TariffInfo from "../chrome/tariff-info.vue";
import DatesPeriods from "./dates-periods.vue";
import CategoriesSelect from "./categories-select.vue";
import WeekDays from "./week-days.vue";
import UpdatingModes from "./updating-modes.vue";
import PricesTable from "./prices-table.vue";
import PriceCondition from "./price-condition.vue";
import PricesAlerts from "./alerts.vue";
import { createMassiveUpdatingPricesFormData,
  createMassiveUpdatingPricesValidationStatuses } from "./logic/massive-prices-initial-state.js";
import createPromiseProxy from "../../lib/promise-proxy.js";
import { getSavePricesStrategy } from "./logic/reset-dependent-prices.js";
import { buildPriceSaveRoutingContext } from "../../lib/tariff/price-save-layer.js";
import { ensureDynamicPartBeforePriceSave } from "../../lib/screen/price-save-preflight.js";
import { filterCategoriesForResetDependent,
  pruneExtraChargeIdsFromSelection } from "../../lib/tariff/filter-categories-for-reset-dependent.js";
import { resolveMassPriceChangeDispatch } from "./logic/resolve-mass-price-change-dispatch.js";
import { createMassPricesDrawerKeyboardSession,
  isInsideMassPricesTable,
  resolveMassPricesDrawerBlurAction } from "./logic/mass-prices-drawer-mobile-footer.js";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingPrices",
  components: {
    TariffInfo,
    DatesPeriods,
    CategoriesSelect,
    WeekDays,
    UpdatingModes,
    PricesTable,
    PriceCondition,
    PricesAlerts,
    BTeleportWrapper,
  },
  mixins: [scrollToElementMixin, rusWordCaserMixin],
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      massiveUpdatingPricesData: createMassiveUpdatingPricesFormData(),
      validationsStatuses: createMassiveUpdatingPricesValidationStatuses(),
      wasAttemptToSave: false,
      isSavingMassPrices: false,
      needHideFooter: false,
      alertsBottomOffset: 0,
      layoutObserver: null,
      layoutRafId: null,
      /** Мобилка: фокус в инпуте таблицы цен — не скрывать футер и не дергать высоту content (сохранение фокуса). */
      massPricesTableInputFocused: false,
      /** Таблица цен монтируется после анимации открытия дровера, чтобы не было рассинхрона лейаута. */
      pricesTableMountReady: false,
      pricesTableMountFallbackTimer: null,
      pricesTableMountOnTransitionEnd: null,
      categoriesSearchString: "",
    };
  },
  manualUpdatingPricesMode: PriceAndRestrictionsService.manualUpdatingPricesMode,
  discountUpdatingPricesMode: PriceAndRestrictionsService.discountUpdatingPricesMode,
  resetDependentPricesMode: PriceAndRestrictionsService.resetDependentPricesMode,
  resetDefaultPricesMode: PriceAndRestrictionsService.resetDefaultPricesMode,
  amountCurrency: screenCurrencyList[1]?.id,
  innerBlocks: updatingPricesInnerBlocks,
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["massiveUpdatingPrices", "currentTariff", "massiveUpdatingPricesDrawerShowDefaultPrices", "pricesCalendarModel", "unacceptableMassivePricesRestricted", "unacceptableMassivePricesSelf"]),
    ...mapState("hotel", ["rplansByIds"]),
    ...mapState("hotelRoom", ["roomtypes"]),
    ...mapGetters("tariffPricesAndRestrictions", [
      "isDynamicPricesModeEnabled",
      "isCurrentTariffDepend",
      "parentPriceModification",
      "parentUsesRmsPricing",
      "isRmsPricingEnabled",
      "hasExtraChargesCategories",
    ]),
    internalValue: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit("input", v);
      },
    },
    manualUpdatingModeChosen() {
      return this.massiveUpdatingPricesData.updatingMode === this.$options.manualUpdatingPricesMode;
    },
    resetDependentPricesModeChosen() {
      return this.massiveUpdatingPricesData.updatingMode === this.$options.resetDependentPricesMode;
    },
    resetDefaultPricesModeChosen() {
      return this.massiveUpdatingPricesData.updatingMode === this.$options.resetDefaultPricesMode;
    },
    resetDeletePricesModeChosen() {
      return this.resetDependentPricesModeChosen || this.resetDefaultPricesModeChosen;
    },
    /** RMS-тариф в режиме «Базовые цены для БП» — в таблице скрыты строки наценок. */
    isRmsBasePriceModeActive() {
      return this.isRmsPricingEnabled && !this.isDynamicPricesModeEnabled;
    },
    canShowTable() {
      return this.internalValue
      && this.manualUpdatingModeChosen
      && this.massiveUpdatingPricesData.selectedRoomtypes.length
      && this.massiveUpdatingPricesData.selectedWeekdays.length;
    },
    canMountPricesTable() {
      return this.canShowTable && this.pricesTableMountReady;
    },
    /** Первая дата периода дровера — для placeholder цен слоя продаж по дню недели. */
    massPricesReferenceDay() {
      const period = this.massiveUpdatingPricesData?.datesPeriods?.[0]?.period;
      if (!period?.[0]) {
        return null;
      }
      const fmt = PriceAndRestrictionsService.massiveUpdatingPricesDatesFormats.value;
      const date = moment(period[0], fmt).format(fmt);
      return date ? { date } : null;
    },
    hasNoUpdatingPrices() {
      return this.manualUpdatingModeChosen
      && !Object.values(this.massiveUpdatingPrices).some(innerObj => Object.values(innerObj).some(value => value));
    },
    /**
     * @returns {Array} Массив всех категорий
     */
    allCategories() {
      return this.roomtypes.reduce((arr, roomtype) => {
        const group = {
          id: roomtype.id,
          name: roomtype.name,
          metricaKey: "parentCategory",
        };
        const isExtraCharge = Object.keys(roomtype?.extra?.children_ages || {})?.length;
        if (roomtype?.subrooms?.length || isExtraCharge) {
          group.elements = [];
          (roomtype.subrooms || []).forEach(subroom => {
            group.elements.push({
              adults: subroom.adults,
              id: subroom.id,
              name: `${subroom.adults} ${this.rusWordCaser(
                subroom.adults,
                this.$t("взрослый"),
                this.$t("взрослых"),
                this.$t("взрослых"),
              )}`,
              metricaKey: "childCategory",
            });
          });
        }

        if (isExtraCharge) {
          Object.entries(roomtype?.extra?.children_ages || {}).forEach(([childrenAgeId, bedTypeObj]) => {
            Object.keys(bedTypeObj || {}).forEach(bedTypeId => {
              const ageId = parseInt(childrenAgeId, 10);
              const bedType = parseInt(bedTypeId, 10);

              let metricaKey;
              if (ageId === 0 || bedType === 1) {
                metricaKey = "adultExtraPlace";
              } else if (ageId !== 0 && bedType === 0) {
                metricaKey = "childMainPlace";
              } else if (ageId !== 0 && bedType !== 0) {
                metricaKey = "childExtraPlace";
              }

              group.elements.push({
                metricaKey,
                adults: Infinity,
                id: `${roomtype.id}_${childrenAgeId}_${bedTypeId}`,
                name: `${
                  getExtraChargeName(
                    childrenAgeId,
                    this.pricesCalendarModel?.hotelChildrenAges?.[childrenAgeId]?.minAge,
                    this.pricesCalendarModel?.hotelChildrenAges?.[childrenAgeId]?.maxAge,
                  )
                }, ${
                  bedTypes[bedTypeId] || ""
                }`,
              });
            });
          });
        }

        if (group.elements?.length) {
          group.elements.push({
            adults: roomtype.adults,
            id: roomtype.id,
            metricaKey: "parentCategory",
            name: `${roomtype.adults} ${this.rusWordCaser(
              roomtype.adults,
              this.$t("взрослый"),
              this.$t("взрослых"),
              this.$t("взрослых"),
            )}`,
          });

          group.elements.sort((a, b) => a.adults - b.adults);
        }

        arr.push(group);
        return arr;
      }, []);
    },
    categoriesForSelect() {
      if (this.resetDependentPricesModeChosen) {
        return filterCategoriesForResetDependent(this.allCategories);
      }
      return this.allCategories;
    },
    categorySelectOrderTemplate() {
      return this.categoriesForSelect.flatMap((category) => {
        if (category.elements?.length) {
          return category.elements.map((element) => element.id);
        }
        return [category.id];
      });
    },
    roomtypeMetricaKeyMap() {
      const result = new Map();

      for (const category of this.allCategories) {
        result.set(category.id, category.metricaKey);

        if (category.elements && category.elements.length > 0) {
          for (const child of category.elements) {
            if (!result.has(child.id)) {
              result.set(child.id, child.metricaKey);
            }
          }
        }
      }

      return result;
    },
    allCategoriesSelected() {
      let total = 0;

      for (const category of this.categoriesForSelect) {
        const children = category.elements ?? [];
        total += Math.max(1, children.length);
      }

      return total === this.massiveUpdatingPricesData.selectedRoomtypes.length;
    },
    allWeekDaysSelected() {
      return this.massiveUpdatingPricesData.selectedWeekdays.length === 7;
    },
    isMassiveDiscountReductionCheckActive() {
      const { updatingMode, priceDiff } = this.massiveUpdatingPricesData;
      const currency = priceDiff.currency;
      return updatingMode === this.$options.discountUpdatingPricesMode
        && Boolean(priceDiff.price)
        && (
          currency === this.$options.amountCurrency
          || currency === PriceAndRestrictionsService.currencyIdPercent
        );
    },
    priceReductionWatchKey() {
      const periodsKey = this.massiveUpdatingPricesData.datesPeriods.map(({ period = [] }) => period.join(":")).join("|");
      const roomtypesKey = [...this.massiveUpdatingPricesData.selectedRoomtypes].sort().join("|");
      const weekdaysKey = [...this.massiveUpdatingPricesData.selectedWeekdays].sort().join("|");

      return [
        this.massiveUpdatingPricesData.updatingMode,
        this.massiveUpdatingPricesData.priceDiff.currency,
        this.massiveUpdatingPricesData.priceDiff.price,
        periodsKey,
        roomtypesKey,
        weekdaysKey,
        this.currentTariff?.id || "",
        this.isDynamicPricesModeEnabled ? 1 : 0,
        this.pricesCalendarModel?.calendar?.length || 0,
      ].join("::");
    },
  },
  watch: {
    internalValue(opened) {
      if (!opened) {
        this.resetCategoriesSearchString();
        this.clearPricesTableMountSchedule();
        this.pricesTableMountReady = false;
        this.massPricesTableInputFocused = false;
        this.isSavingMassPrices = false;
        this.needHideFooter = false;
        this.keyboardSession?.destroy();
        return;
      }

      this.massiveUpdatingPricesData.localSelectedRoomtypes = [
        ...this.massiveUpdatingPricesData.selectedRoomtypes,
      ];
      this.schedulePricesTableMountAfterDrawerOpen();
      this.$nextTick(() => {
        this.refreshLayoutObservation();
        this.updateLayoutMeasurements();
      });
    },
    manualUpdatingModeChosen() {
      this.$store.dispatch("tariffPricesAndRestrictions/resetMassiveChanges");
      this.$store.dispatch("tariffPricesAndRestrictions/setMassiveUpdatingPricesWeekday", { weekday: allWeekdayItem.value });
    },
    resetDependentPricesModeChosen(isReset) {
      if (!isReset) {
        return;
      }
      const prunedSelected = pruneExtraChargeIdsFromSelection(
        this.massiveUpdatingPricesData.selectedRoomtypes,
      );
      const prunedLocal = pruneExtraChargeIdsFromSelection(
        this.massiveUpdatingPricesData.localSelectedRoomtypes,
      );
      if (prunedSelected.length !== this.massiveUpdatingPricesData.selectedRoomtypes.length) {
        this.massiveUpdatingPricesData.selectedRoomtypes = prunedSelected;
      }
      if (prunedLocal.length !== this.massiveUpdatingPricesData.localSelectedRoomtypes.length) {
        this.massiveUpdatingPricesData.localSelectedRoomtypes = prunedLocal;
      }
      this.$store.dispatch("tariffPricesAndRestrictions/resetMassiveChanges");
    },
    resetDefaultPricesModeChosen(isReset) {
      if (!isReset) {
        return;
      }
      this.$store.dispatch("tariffPricesAndRestrictions/resetMassiveChanges");
    },
    "massiveUpdatingPricesData.selectedWeekdays": {
      handler(newWeekDays, oldWeekDays) {
        const missing = oldWeekDays.filter(item => !newWeekDays.includes(item));
        missing.forEach(missingWeekday => {
          const virtualEvent = { target: { dataset: { weekday: missingWeekday }, value: "" } };
          this.changePrice(virtualEvent);
        });
      },
    },
    needHideFooter() {
      if (this.massPricesTableInputFocused) {
        return;
      }
      this.$nextTick(() => {
        this.refreshLayoutObservation();
        this.updateLayoutMeasurements();
      });
    },
    priceReductionWatchKey: {
      handler: "checkPriceReduction",
      immediate: true,
    },
    canShowTable() {
      this.$nextTick(() => this.updateLayoutMeasurements());
    },
    canMountPricesTable() {
      this.$nextTick(() => this.updateLayoutMeasurements());
    },
  },
  async mounted() {
    this.keyboardSession = createMassPricesDrawerKeyboardSession({
      window: typeof window !== "undefined" ? window : null,
      document: typeof document !== "undefined" ? document : null,
    });
    if (!this.roomtypes.length) {
      await this.$store.dispatch("hotelRoom/getRoomTypes");
    }
    this.initLayoutObserver();
    this.$nextTick(() => {
      this.refreshLayoutObservation();
      this.updateLayoutMeasurements();
      if (this.internalValue) {
        this.schedulePricesTableMountAfterDrawerOpen();
      }
    });
  },
  beforeUnmount() {
    this.clearPricesTableMountSchedule();
    this.keyboardSession?.destroy();
    this.keyboardSession = null;
    if (this.layoutObserver) {
      this.layoutObserver.disconnect();
      this.layoutObserver = null;
    }
    if (this.layoutRafId) {
      cancelAnimationFrame(this.layoutRafId);
      this.layoutRafId = null;
    }
  },
  methods: {
    ...mapActions("tariffPricesAndRestrictions", ["setUnacceptableMassivePricesRestricted", "setUnacceptableMassivePricesSelf"]),
    scrollToAlerts() {
      this.$nextTick(() => { if (this.$refs.pricesAlerts?.$el) this.$scrollToElement(this.$refs.pricesAlerts); });
    },
    onCategoriesSelectClose() {
      const { localSelectedRoomtypes, selectedRoomtypes } = this.massiveUpdatingPricesData;
      if (!haveDifferentContent(localSelectedRoomtypes, selectedRoomtypes)) {
        return;
      }
      this.massiveUpdatingPricesData.selectedRoomtypes = getRightOrderArray(
        localSelectedRoomtypes,
        this.categorySelectOrderTemplate,
      );
    },
    clearPricesTableMountSchedule() {
      if (this.pricesTableMountFallbackTimer != null) {
        clearTimeout(this.pricesTableMountFallbackTimer);
        this.pricesTableMountFallbackTimer = null;
      }
      if (this.pricesTableMountOnTransitionEnd) {
        const root = this.$refs.massPricesDrawer?.getPanelEl?.()
          ?? this.$refs.massPricesDrawer?.$refs?.panel
          ?? this.$refs.massPricesDrawer?.$el;
        if (root) {
          root.removeEventListener("transitionend", this.pricesTableMountOnTransitionEnd);
        }
        this.pricesTableMountOnTransitionEnd = null;
      }
    },
    schedulePricesTableMountAfterDrawerOpen() {
      this.clearPricesTableMountSchedule();
      this.pricesTableMountReady = false;

      const finishMount = () => {
        if (!this.internalValue) {
          return;
        }
        this.pricesTableMountReady = true;
      };

      this.$nextTick(() => {
        const root = this.$refs.massPricesDrawer?.getPanelEl?.()
          ?? this.$refs.massPricesDrawer?.$refs?.panel
          ?? this.$refs.massPricesDrawer?.$el;
        if (!root || typeof root.addEventListener !== "function") {
          finishMount();
          return;
        }

        const onTransitionEnd = (ev) => {
          if (!this.internalValue) {
            return;
          }
          const name = ev.propertyName || "";
          if (name !== "transform" && name !== "-webkit-transform") {
            return;
          }
          this.clearPricesTableMountSchedule();
          finishMount();
        };

        this.pricesTableMountOnTransitionEnd = onTransitionEnd;
        root.addEventListener("transitionend", onTransitionEnd);

        this.pricesTableMountFallbackTimer = setTimeout(() => {
          this.clearPricesTableMountSchedule();
          finishMount();
        }, 100);
      });
    },
    resetFormToDefaults() {
      Object.values(this.$options.innerBlocks).forEach((block) => {
        if (this.$refs?.[block]?.$v) {
          this.$refs[block].$v.$reset();
        }
      });
      this.massiveUpdatingPricesData = createMassiveUpdatingPricesFormData();
      this.validationsStatuses = createMassiveUpdatingPricesValidationStatuses();
      this.wasAttemptToSave = false;
    },
    resetCategoriesSearchString() {
      this.categoriesSearchString = `\u200b${Date.now()}`;
      this.$nextTick(() => {
        this.categoriesSearchString = "";
      });
    },
    initLayoutObserver() {
      if (this.layoutObserver || typeof ResizeObserver === "undefined") {
        return;
      }

      this.layoutObserver = new ResizeObserver(() => {
        if (this.massPricesTableInputFocused) {
          return;
        }
        this.updateLayoutMeasurements();
      });
    },
    refreshLayoutObservation() {
      if (!this.layoutObserver) {
        return;
      }

      this.layoutObserver.disconnect();

      [
        resolveElement(this.$refs.title),
        resolveElement(this.$refs.pricesAlerts),
        resolveElement(this.$refs.footer),
      ].filter(Boolean).forEach((element) => {
        this.layoutObserver.observe(element);
      });
    },
    updateLayoutMeasurements() {
      if (this.layoutRafId) {
        cancelAnimationFrame(this.layoutRafId);
      }

      this.layoutRafId = requestAnimationFrame(() => {
        this.layoutRafId = null;
        this.calculateContentHeight();
        this.updateAlertsBottomOffset();
      });
    },
    updateAlertsBottomOffset() {
      this.alertsBottomOffset = resolveElement(this.$refs.footer)?.offsetHeight ?? 0;
    },
    handleInput(e) {
      const t = e?.target;
      if (!t || t.nodeName !== "INPUT" || !t.dataset?.weekday) {
        return;
      }
      // Передаём сам input, чтобы внутри форматтера сохранить позицию курсора
      formatAmount(t);
      this.changePrice(e);
    },
    changePrice(e) {
      const { selectedRoomtypes, selectedWeekdays } = this.massiveUpdatingPricesData;
      const { priceEntries, weekdaySync } = resolveMassPriceChangeDispatch({
        id: e.target.dataset.id,
        weekday: e.target.dataset.weekday,
        rawValue: e.target.value,
        selectedRoomtypes,
        selectedWeekdays,
      });

      if (priceEntries.length) {
        this.$store.dispatch("tariffPricesAndRestrictions/setMassiveUpdatingPrices", priceEntries);
      }
      if (weekdaySync) {
        this.$store.dispatch("tariffPricesAndRestrictions/setMassiveUpdatingPricesWeekday", weekdaySync);
      }
    },
    checkPriceReduction() {
      if (this.isMassiveDiscountReductionCheckActive) {
        const {
          datesPeriods, selectedRoomtypes, selectedWeekdays, priceDiff,
        } = this.massiveUpdatingPricesData;
        const isPercent = priceDiff.currency === PriceAndRestrictionsService.currencyIdPercent;
        const fixedDiscountOrPercent = Number(priceDiff.price || 0);
        const maxChildTariffDiscountAmount = Math.abs(Number(this.pricesCalendarModel?.maxDiscountChildTariff?.discount_amount || 0));
        /** Как в `AutomationService.daysOfWeekList`: 1 = пн … 7 = вс (ISO). Нельзя использовать `day()` (0–6, вс = 0). */
        const selectedDaysSet = new Set(selectedWeekdays.map(day => parseInt(day, 10)));
        const unacceptablePricesRestricted = {};
        const unacceptablePricesSelf = {};

        datesPeriods.forEach(({ period }) => {
          const [start, end] = period.map(d => moment(d));
          if (start && end) {
            const current = start.clone();

            while (current.isSameOrBefore(end, "day")) {
              const isoWeekday = current.isoWeekday();
              if (selectedDaysSet.has(isoWeekday)) {
                const dateStr = current.format("YYYY-MM-DD");
                selectedRoomtypes.forEach(roomtypeId => {
                  const price = this.pricesCalendarModel.getPrice({
                    id: roomtypeId,
                    tariffId: this.currentTariff.id,
                    day: { date: dateStr, weekday: isoWeekday },
                    isDynamicPricesModeEnabled: this.isDynamicPricesModeEnabled,
                    parentInfo: {
                      id: Number(this.currentTariff?.parent_id),
                      modification: this.parentPriceModification,
                      parentUsesRmsPricing: this.parentUsesRmsPricing,
                    },
                  })?.value ?? 0;
                  const priceNum = Number(price || 0);
                  const discountAmount = isPercent
                    ? (priceNum * fixedDiscountOrPercent) / 100
                    : fixedDiscountOrPercent;
                  // Сравниваем с ценой категории в том же тарифе
                  if (priceNum < discountAmount) {
                    if (!unacceptablePricesSelf[roomtypeId]) {
                      unacceptablePricesSelf[roomtypeId] = [];
                    }
                    if (!unacceptablePricesSelf[roomtypeId].includes(dateStr)) {
                      unacceptablePricesSelf[roomtypeId].push(dateStr);
                    }
                  }

                  // После массового уменьшения цена в родителе должна оставаться не ниже скидки зависимого тарифа
                  // (аналог unacceptable-price-index: новая цена < скидка дочернего → конфликт).
                  const priceAfterReduction = priceNum - discountAmount;
                  if (
                    maxChildTariffDiscountAmount > 0
                    && priceAfterReduction < maxChildTariffDiscountAmount
                  ) {
                    if (!unacceptablePricesRestricted[roomtypeId]) {
                      unacceptablePricesRestricted[roomtypeId] = [];
                    }
                    if (!unacceptablePricesRestricted[roomtypeId].includes(dateStr)) {
                      unacceptablePricesRestricted[roomtypeId].push(dateStr);
                    }
                  }
                });
              }
              current.add(1, "day");
            }
          }
        });

        this.setUnacceptableMassivePricesRestricted(unacceptablePricesRestricted);
        this.setUnacceptableMassivePricesSelf(unacceptablePricesSelf);
      } else {
        this.setUnacceptableMassivePricesRestricted({});
        this.setUnacceptableMassivePricesSelf({});
      }
    },
    async updatePrices() {
      this.wasAttemptToSave = true;
      Object.values(this.$options.innerBlocks).forEach(block => { if (this.$refs?.[block]?.$v) this.$refs[block].$v.$touch(); });
      if (
        Object.values(this.$options.innerBlocks).some(block => this.$refs?.[block]?.$v?.$invalid)
        || this.hasNoUpdatingPrices
        || Object.keys(this.unacceptableMassivePricesRestricted).length
        || Object.keys(this.unacceptableMassivePricesSelf).length
      ) {
        this.scrollToAlerts();
        return;
      }

      this.isSavingMassPrices = true;
      this.sendYaMetrics();

      const saveStrategy = getSavePricesStrategy(this.massiveUpdatingPricesData.updatingMode);

      const sendingData = saveStrategy.buildRequestData({
        updatingMode: this.massiveUpdatingPricesData.updatingMode,
        periods: this.massiveUpdatingPricesData.datesPeriods,
        roomtypes: this.massiveUpdatingPricesData.selectedRoomtypes,
        weekdays: this.massiveUpdatingPricesData.selectedWeekdays,
        currency: this.massiveUpdatingPricesData.priceDiff.currency,
        priceDiff: this.massiveUpdatingPricesData.priceDiff.price,
        prices: this.massiveUpdatingPrices,
        tariffId: this.currentTariff.id,
        selectedRoomtypes: this.massiveUpdatingPricesData.selectedRoomtypes,
        datesPeriods: this.massiveUpdatingPricesData.datesPeriods,
      });

      // Та же маршрутизация plan_prices vs dynamic_prices, что при inline-save таблицы (save-flow.js).
      const { saveLayerCb, deleteLayerCb } = buildPriceSaveRoutingContext({
        planId: this.currentTariff.id,
        roomtypes: this.roomtypes,
        model: this.pricesCalendarModel,
        isRmsPricingEnabled: this.isRmsPricingEnabled,
        isDynamicPricesModeEnabled: this.isDynamicPricesModeEnabled,
      });
      const roomtypeIdsForLayerCheck = this.resetDeletePricesModeChosen
        ? Object.keys(sendingData.pricesToDelete || {})
        : this.massiveUpdatingPricesData.selectedRoomtypes;
      await ensureDynamicPartBeforePriceSave({
        ensureDynamicLoaded: () => this.$store.dispatch("tariffPricesAndRestrictions/ensureDynamicLoaded"),
        entityIds: roomtypeIdsForLayerCheck,
        updatingPrices: this.massiveUpdatingPrices,
        pricesToDelete: sendingData.pricesToDelete,
        currentTariff: this.currentTariff,
        roomtypes: this.roomtypes,
        pricesCalendarModel: this.pricesCalendarModel,
        isRmsPricingEnabled: this.isRmsPricingEnabled,
        isDynamicPricesModeEnabled: this.isDynamicPricesModeEnabled,
      });
      const response = await saveStrategy.sendRequest({
        payload: sendingData,
        saveLayerCb,
        deleteLayerCb,
      });
      ymHelpers.reachGoal("main", "massRestrictionsSavePrices");
      // Костыль для того чтобы дождаться завершения обновления цен в таблице!
      const compeleteLoadSignal = createPromiseProxy();
      this.$emit("updated", {
        response, compeleteLoadSignal, sendingData,
      });
      this.wasAttemptToSave = response.result !== "success";

      compeleteLoadSignal.promise
        .then(() => {
          this.resetFormToDefaults();
        }).finally(() => {
          this.isSavingMassPrices = false;
        });
    },
    sendYaMetrics() {
      if (this.isCurrentTariffDepend) {
        ymHelpers.sendHit("main", "updatePriceInDependentPlan", "Сохранили в зависимом тарифе", {}, "pricesAndRestrictions");
      }

      if (this.allCategoriesSelected) {
        ymHelpers.sendHit("main", "massive_prices_update_all_category_selected", "Выбраны все категории в окне массового изменения цен", {}, "massive_prices_update");
      } else {
        const attributeCount = this.calculateSelectedCategoriesAttributes();
        ymHelpers.sendHit("main", "massive_prices_update_category_selected", "Выбранные категории в окне массового изменения цен", attributeCount, "massive_prices_update");
      }

      if (this.allWeekDaysSelected) {
        ymHelpers.sendHit("main", "massive_prices_update_all_weekdays_selected", "Выбраны все дни недели в окне массового изменения цен", {}, "massive_prices_update");
      } else {
        const selectedWeekDays = this.getSelectedWeekDayNames();
        ymHelpers.sendHit("main", "massive_prices_update_weekdays_selected", "Выбранные дни недели в окне массового изменения цен", { selectedWeekDays }, "massive_prices_update");
      }

      const sendPriceModeMetric = this.getPriceModeMetric();
      if (sendPriceModeMetric) {
        sendPriceModeMetric();
      }

      if (window.statist) {
        window.statist.stopAndSendCounter("tariffsFromMassPricesUpdateStartToFinish");
        window.statist.stopAndSendCounter("newtariffsFromMassPricesUpdateStartToFinish");
      }
    },
    calculateSelectedCategoriesAttributes() {
      return this.massiveUpdatingPricesData.selectedRoomtypes.reduce(
        (metricaCounter, roomtypeId) => {
          const metricaKey = this.roomtypeMetricaKeyMap.get(roomtypeId);
          if (!metricaKey) {
            return metricaCounter;
          }

          metricaCounter[metricaKey]++;
          return metricaCounter;
        },
        {
          parentCategory: 0,
          childCategory: 0,
          childExtraPlace: 0,
          childMainPlace: 0,
          adultExtraPlace: 0,
        },
      );
    },
    getSelectedWeekDayNames() {
      const weekDaysMapping = {
        1: "Понедельник",
        2: "Вторник",
        3: "Среда",
        4: "Четверг",
        5: "Пятница",
        6: "Суббота",
        7: "Воскресенье",
      };

      return this.massiveUpdatingPricesData.selectedWeekdays.map((it) => weekDaysMapping[it]);
    },
    getPriceModeMetric() {
      const priceModeMetric = {
        [PriceAndRestrictionsService.manualUpdatingPricesMode]: () => {
          return ymHelpers.sendHit("main", "massive_prices_update_mode_from_table", "При сохранении в поле Изменение цены выбрано 'Указать цены вручную'", {}, "massive_prices_update");
        },
        [PriceAndRestrictionsService.discountUpdatingPricesMode]: () => {
          return ymHelpers.sendHit("main", "massive_prices_update_mode_discount", "При сохранении в поле Изменение цены выбрано 'Уменьшить цену на'", {}, "massive_prices_update");
        },
        [PriceAndRestrictionsService.markupUpdatingPricesMode]: () => {
          return ymHelpers.sendHit("main", "massive_prices_update_mode_markup", "При сохранении в поле Изменение цены выбрано 'Увеличить цену на'", {}, "massive_prices_update");
        },
      };

      return priceModeMetric[this.massiveUpdatingPricesData.updatingMode];
    },
    isInputTarget(target) {
      return target?.nodeName === "INPUT";
    },
    handleFocus(e) {
      if (!this.isDesktopDevice && this.isInputTarget(e?.target)) {
        if (isInsideMassPricesTable(e?.target)) {
          this.massPricesTableInputFocused = true;
          this.needHideFooter = false;
          this.keyboardSession?.onTableInputFocus();
          return;
        }
        this.needHideFooter = true;
        this.keyboardSession?.ensureMobileEditingBodyClass();
      }
    },
    handleBlur(e) {
      if (this.isDesktopDevice) return;

      const blurAction = resolveMassPricesDrawerBlurAction({
        wasInMassPricesTable: isInsideMassPricesTable(e?.target),
        stillInMassPricesTable: isInsideMassPricesTable(e?.relatedTarget),
        relatedTargetInsideContent: this.$refs.content?.contains?.(e?.relatedTarget),
      });

      if (blurAction === "stayInTable" || blurAction === "noop") {
        return;
      }

      if (blurAction === "leaveTable") {
        this.massPricesTableInputFocused = false;
        this.needHideFooter = false;
        this.keyboardSession?.finishKeyboardHideTracking();
        this.$nextTick(() => {
          this.refreshLayoutObservation();
          this.updateLayoutMeasurements();
        });
        return;
      }

      this.needHideFooter = false;
      this.keyboardSession?.startKeyboardHideTracking();
    },
    calculateContentHeight() {
      const content = resolveElement(this.$refs.content);
      if (!content) {
        return;
      }
      if (this.massPricesTableInputFocused) {
        return;
      }

      const headerHeight = resolveElement(this.$refs.title)?.offsetHeight ?? 0;
      const footerHeight = resolveElement(this.$refs.footer)?.offsetHeight ?? 0;

      content.style.height = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`;
    },
    getContentContainer() {
      return resolveElement(this.$refs.content);
    },
  },
};
</script>

<style lang="scss" module>
.wrapper {
  display: grid;
  grid-template-rows: auto 1fr auto;
  max-height: 100vh;
}

.content {
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: manipulation;
}

.header {
  position: sticky;
  top: -1px;
  z-index: 1;
  background: #fff;
}

.table {
  @include scrollbar();
  min-height: 110px;
  align-content: start;
}

.footer {
  position: sticky;
  bottom: 0;
  z-index: 1;
  background: #fff;
}

.alerts {
  position: sticky;
  z-index: 1;
  background: #fff;
  padding-bottom: map-get($gaps, typo);
}

.sticky-filters {
  position: sticky;
  left: 0;
}
</style>
