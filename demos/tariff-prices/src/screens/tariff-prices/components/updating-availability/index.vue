<template>
  <b-teleport-wrapper selector="#bnovo-spa">
    <b-drawer
      ref="availabilityDrawer"
      v-model="internalValue"
      lock-overflow
      width="1100"
      stateless
      data-test="tariff-mass-availability-drawer"
    >
      <v-card class="d-flex flex-column height-100">
        <v-card-title ref="header" class="pa-outer d-flex flex-nowrap">
          <h3 class="text-h3 mb-0 font-weight-bold">
            {{ $t("Редактирование наличия на период") }}
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
          :class="['scrollbar px-outer flex-grow-1', $style.content]"
        >
          <div class="set pb-outer">
            <b-alert
              type="warning"
              class="mb-groups"
              data-test="tariff-mass-availability-info-alert"
            >
              {{ $t("Наличие будет обновлено для всех тарифов") }}
            </b-alert>
            <date-periods
              :ref="$options.innerBlocks.dates"
              v-model="formData.datesPeriods"
              @update:error="$set(validationState, $options.innerBlocks.dates, $event)"
              @need-scroll-to-alerts="scrollToAlerts"
            />
            <v-row
              ref="selects"
              no-gutters
              class="mt-groups"
              :class="{ 'align-start': isMobileDevice }"
            >
              <b-col cols="auto" class="mr-groups" data-test="tariff-mass-availability-categories">
                <categories-filter
                  :ref="$options.innerBlocks.categories"
                  v-model="formData.localSelectedRoomtypes"
                  :categories="roomtypeCategories"
                  @close="onCategoriesSelectClose"
                  @update:error="$set(validationState, $options.innerBlocks.categories, $event)"
                />
              </b-col>
              <b-col cols="auto" data-test="tariff-mass-availability-weekdays">
                <week-days-filter
                  :ref="$options.innerBlocks.days"
                  v-model="formData.selectedWeekdays"
                  @update:error="$set(validationState, $options.innerBlocks.days, $event)"
                />
              </b-col>
            </v-row>
          </div>

          <div v-if="canMountAvailabilityTable" data-test="tariff-mass-availability-values">
            <availability-table
              :roomtypes-ids="formData.selectedRoomtypes"
              :weekdays="formData.selectedWeekdays"
              :grid="formData.grid"
              :all-categories-weekdays="formData.allCategoriesWeekdays"
              :get-scroll-container="getContentContainer"
              @input="handleInput"
              @change="changeAvailability"
            />
          </div>
        </v-card-text>
        <updating-availability-alerts
          ref="alerts"
          :class="['px-outer', $style.alerts]"
          :style="{ bottom: `${alertsBottomOffset}px` }"
          :server-error="formData.serverError"
          :has-validation-errors="hasValidationErrors"
          :has-empty-grid-error="emptyGridError"
        />
        <v-card-actions
          ref="footer"
          :class="['justify-space-between py-groups px-outer bordered-t', $style.footer]"
        >
          <b-btn
            outlined
            color="tertiary"
            data-test="tariff-mass-availability-cancel-button"
            @click="internalValue = false"
          >
            {{ $t("Отменить") }}
          </b-btn>
          <b-btn
            :loading="isLoading"
            color="primary"
            data-test="tariff-mass-availability-save-button"
            @click="applyAvailability"
          >
            {{ $t("Сохранить наличие") }}
          </b-btn>
        </v-card-actions>
      </v-card>
    </b-drawer>
  </b-teleport-wrapper>
</template>

<script>
import { mapState } from "vuex";
import { haveDifferentContent, getRightOrderArray } from "@/utils/array-set-content";
import resolveElement from "@/utils/resolve-element.js";
import scrollToElementMixin from "@/mixins/scroll-into-view";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { allWeekdayItem } from "../../config/screen-config.js";
import DatePeriods from "./date-periods.vue";
import WeekDaysFilter from "./week-days-filter.vue";
import CategoriesFilter from "./categories-filter.vue";
import AvailabilityTable from "./availability-table.vue";
import UpdatingAvailabilityAlerts from "./alerts.vue";
import { createMassiveAvailabilityFormData } from "./logic/massive-availability-initial-state.js";
import { applyCrossFillToWeekdayGrid, syncAllCategoriesWeekdays } from "./logic/cross-fill-weekday-grid.js";

const innerBlocks = {
  dates: "dates",
  days: "days",
  categories: "categories",
};

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingAvailability",
  components: {
    DatePeriods,
    WeekDaysFilter,
    CategoriesFilter,
    AvailabilityTable,
    UpdatingAvailabilityAlerts,
  },
  innerBlocks,
  mixins: [scrollToElementMixin],
  props: { value: { type: Boolean, default: false } },
  data() {
    return {
      formData: createMassiveAvailabilityFormData(),
      validationState: {
        [innerBlocks.dates]: false,
        [innerBlocks.days]: false,
        [innerBlocks.categories]: false,
      },
      isLoading: false,
      emptyGridError: false,
      alertsBottomOffset: 0,
      layoutObserver: null,
      layoutRafId: null,
      availabilityTableMountReady: false,
      availabilityTableMountFallbackTimer: null,
      availabilityTableMountOnTransitionEnd: null,
    };
  },
  computed: {
    ...mapState("hotelRoom", ["roomtypes"]),
    internalValue: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit("input", v);
      },
    },
    roomtypeCategories() {
      return (this.roomtypes || []).map((roomtype) => ({
        id: roomtype.id,
        name: roomtype.name,
      }));
    },
    categorySelectOrderTemplate() {
      return this.roomtypeCategories.map((category) => category.id);
    },
    hasValidationErrors() {
      return Object.values(this.validationState).some(Boolean);
    },
    canShowAvailabilityTable() {
      return this.internalValue
        && this.formData.selectedRoomtypes.length
        && this.formData.selectedWeekdays.length;
    },
    canMountAvailabilityTable() {
      return this.canShowAvailabilityTable && this.availabilityTableMountReady;
    },
  },
  watch: {
    value(open) {
      if (!open) {
        this.clearAvailabilityTableMountSchedule();
        this.availabilityTableMountReady = false;
        Object.values(innerBlocks).forEach((block) => {
          if (this.$refs?.[block]?.$v) {
            this.$refs[block].$v.$reset();
          }
        });
        Object.keys(this.validationState).forEach((key) => {
          this.$set(this.validationState, key, false);
        });
        this.emptyGridError = false;
        return;
      }

      this.formData.localSelectedRoomtypes = [
        ...this.formData.selectedRoomtypes,
      ];
      this.scheduleAvailabilityTableMountAfterDrawerOpen();
      this.$nextTick(() => {
        this.refreshLayoutObservation();
        this.updateLayoutMeasurements();
      });
    },
    canMountAvailabilityTable() {
      this.$nextTick(() => this.updateLayoutMeasurements());
    },
  },
  mounted() {
    this.initLayoutObserver();
    this.$nextTick(() => {
      this.refreshLayoutObservation();
      this.updateLayoutMeasurements();
      if (this.value) {
        this.formData.localSelectedRoomtypes = [
          ...this.formData.selectedRoomtypes,
        ];
        this.scheduleAvailabilityTableMountAfterDrawerOpen();
      }
    });
  },
  beforeUnmount() {
    this.clearAvailabilityTableMountSchedule();
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
    resetFormToDefaults() {
      Object.values(innerBlocks).forEach((block) => {
        if (this.$refs?.[block]?.$v) {
          this.$refs[block].$v.$reset();
        }
      });
      this.formData = createMassiveAvailabilityFormData();
      this.emptyGridError = false;
      this.formData.serverError = "";
      Object.keys(this.validationState).forEach((key) => {
        this.$set(this.validationState, key, false);
      });
    },
    clearAvailabilityTableMountSchedule() {
      if (this.availabilityTableMountFallbackTimer != null) {
        clearTimeout(this.availabilityTableMountFallbackTimer);
        this.availabilityTableMountFallbackTimer = null;
      }
      if (this.availabilityTableMountOnTransitionEnd) {
        const root = this.$refs.availabilityDrawer?.getPanelEl?.()
          ?? this.$refs.availabilityDrawer?.$refs?.panel
          ?? this.$refs.availabilityDrawer?.$el;
        if (root) {
          root.removeEventListener("transitionend", this.availabilityTableMountOnTransitionEnd);
        }
        this.availabilityTableMountOnTransitionEnd = null;
      }
    },
    scheduleAvailabilityTableMountAfterDrawerOpen() {
      this.clearAvailabilityTableMountSchedule();
      this.availabilityTableMountReady = false;

      const finishMount = () => {
        if (!this.internalValue) {
          return;
        }
        this.availabilityTableMountReady = true;
      };

      this.$nextTick(() => {
        const root = this.$refs.availabilityDrawer?.getPanelEl?.()
          ?? this.$refs.availabilityDrawer?.$refs?.panel
          ?? this.$refs.availabilityDrawer?.$el;
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
          this.clearAvailabilityTableMountSchedule();
          finishMount();
        };

        this.availabilityTableMountOnTransitionEnd = onTransitionEnd;
        root.addEventListener("transitionend", onTransitionEnd);

        this.availabilityTableMountFallbackTimer = setTimeout(() => {
          this.clearAvailabilityTableMountSchedule();
          finishMount();
        }, 100);
      });
    },
    touchValidationBlocks() {
      Object.values(innerBlocks).forEach((block) => {
        this.$refs?.[block]?.$v?.$touch?.();
      });
    },
    scrollToAlerts() {
      this.$nextTick(() => {
        if (this.$refs.alerts?.$el) {
          this.$scrollToElement(this.$refs.alerts);
        }
      });
    },
    initLayoutObserver() {
      if (this.layoutObserver || typeof ResizeObserver === "undefined") {
        return;
      }

      this.layoutObserver = new ResizeObserver(() => {
        this.updateLayoutMeasurements();
      });
    },
    refreshLayoutObservation() {
      if (!this.layoutObserver) {
        return;
      }

      this.layoutObserver.disconnect();

      [
        resolveElement(this.$refs.header),
        resolveElement(this.$refs.alerts),
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
        this.updateAlertsBottomOffset();
      });
    },
    updateAlertsBottomOffset() {
      this.alertsBottomOffset = resolveElement(this.$refs.footer)?.offsetHeight ?? 0;
    },
    onCategoriesSelectClose() {
      const { localSelectedRoomtypes, selectedRoomtypes } = this.formData;
      if (!haveDifferentContent(localSelectedRoomtypes, selectedRoomtypes)) {
        return;
      }
      this.formData.selectedRoomtypes = getRightOrderArray(
        localSelectedRoomtypes,
        this.categorySelectOrderTemplate,
      );
    },
    getContentContainer() {
      return resolveElement(this.$refs.content);
    },
    handleInput(e) {
      const target = e?.target;
      if (!target || target.nodeName !== "INPUT" || !target.dataset?.weekday) {
        return;
      }
      const sanitized = target.value.replace(/\D/g, "");
      if (target.value !== sanitized) {
        target.value = sanitized;
      }
      this.changeAvailability(e);
    },
    changeAvailability(e) {
      const id = e.target.dataset.id;
      const weekday = e.target.dataset.weekday;
      const value = e.target.value;

      if (!id && weekday) {
        const kind = weekday === allWeekdayItem.value
          ? "allCategoriesAllDays"
          : "allCategoriesDay";
        this.formData.grid = applyCrossFillToWeekdayGrid({
          kind,
          weekday,
          value,
          selectedRoomtypeIds: this.formData.selectedRoomtypes,
          selectedWeekdays: this.formData.selectedWeekdays,
        }, this.formData.grid);
        this.formData.allCategoriesWeekdays = syncAllCategoriesWeekdays({
          kind,
          weekday,
          value,
          selectedWeekdays: this.formData.selectedWeekdays,
        }, this.formData.allCategoriesWeekdays);
        return;
      }

      if (id && weekday) {
        if (weekday === allWeekdayItem.value) {
          this.formData.grid = applyCrossFillToWeekdayGrid({
            kind: "categoryAllDays",
            roomtypeId: id,
            value,
            selectedWeekdays: this.formData.selectedWeekdays,
          }, this.formData.grid);
        } else {
          const next = { ...(this.formData.grid || {}) };
          const key = String(id);
          if (!next[key]) {
            next[key] = {};
          }
          next[key][weekday] = value;
          this.formData.grid = next;
        }
      }
    },
    buildDrawerPayload() {
      return {
        periods: this.formData.datesPeriods,
        roomtypes: this.formData.selectedRoomtypes,
        weekdays: this.formData.selectedWeekdays,
        grid: this.formData.grid,
      };
    },
    async applyAvailability() {
      this.emptyGridError = false;
      this.formData.serverError = "";
      this.onCategoriesSelectClose();
      this.touchValidationBlocks();

      if (this.hasValidationErrors) {
        this.scrollToAlerts();
        return;
      }

      const drawerPayload = this.buildDrawerPayload();

      this.isLoading = true;

      try {
        const { response, sendingData } = await PriceAndRestrictionsService.updateMassiveAvailability(drawerPayload);
        this.$emit("updated", { response, sendingData });
        if (response?.result === "success") {
          this.resetFormToDefaults();
        } else {
          this.formData.serverError = response?.error || this.$t("Не удалось сохранить наличие");
        }
      } catch (error) {
        if (error?.message === "availability.massive.empty") {
          this.emptyGridError = true;
          this.scrollToAlerts();
        } else if (error?.message === "availability.periods.empty") {
          this.scrollToAlerts();
        } else {
          this.formData.serverError = error?.message || this.$t("Не удалось сохранить наличие");
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style lang="scss" module>
.content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: manipulation;
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
</style>
