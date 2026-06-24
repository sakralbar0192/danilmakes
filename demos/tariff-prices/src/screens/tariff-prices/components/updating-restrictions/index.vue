<template>
  <b-teleport-wrapper selector="#bnovo-spa">
    <b-drawer
      v-model="internalValue"
      lock-overflow
      width="650"
      stateless
      data-test="tariff-mass-restrictions-drawer"
    >
      <v-card>
        <v-card-title ref="header" class="pa-outer">
          <h3 class="text-h3 mb-0 font-weight-bold">
            {{ $t("Редактирование ограничений") }}
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
          class="scrollbar overflow-auto d-flex flex-column gap-space px-outer"
          @focusin="handleFocus"
          @focusout="handleBlur"
        >
          <div class="set">
            <div data-test="tariff-mass-restrictions-dates">
              <updating-restrictions-date-periods
                :ref="$options.updatingInnerBlocks.dates"
                v-model="dates"
                @update:error="$set(validationState, $options.updatingInnerBlocks.dates, $event)"
              />
            </div>
            <div data-test="tariff-mass-restrictions-weekdays">
              <updating-restrictions-week-days-filter
                :ref="$options.updatingInnerBlocks.days"
                v-model="form.daysOfTheWeekListChecked"
                @update:error="$set(validationState, $options.updatingInnerBlocks.days, $event)"
              />
            </div>

            <div class="set-x" :style="{[`grid-template-${isMobileDevice ? 'rows' : 'columns' }`]: '1fr 1fr'}">
              <div data-test="tariff-mass-restrictions-tariff-select">
                <updating-restrictions-tariffs-filter
                  :ref="$options.updatingInnerBlocks.tariff"
                  v-model="form.currentTariff"
                  :tarrifs="internalTariffs"
                  @change="checkRestrictions"
                  @update:error="$set(validationState, $options.updatingInnerBlocks.tariff, $event)"
                />
              </div>
              <div data-test="tariff-mass-restrictions-categories-select">
                <updating-restrictions-categories-filter
                  :ref="$options.updatingInnerBlocks.categories"
                  v-model="form.currentRoomTypes"
                  :categories="internalRoomtypes"
                  @update:error="$set(validationState, $options.updatingInnerBlocks.categories, $event)"
                />
              </div>
            </div>
          </div>

          <div v-if="hasFormPuzzels" data-test="tariff-mass-restrictions-puzzles">
            <updating-restrictions-puzzels-form-part
              :ref="$options.updatingInnerBlocks.puzzles"
              v-model="form.puzzle"
              :individual-restrictions="individualRestrictions"
              :universal-restrictions="universalRestrictions"
            />
          </div>

          <div v-if="hasFormStays" data-test="tariff-mass-restrictions-stays">
            <updating-restrictions-stays-form-part
              :ref="$options.updatingInnerBlocks.stays"
              v-model="form.stays"
              :universal-restrictions="universalRestrictions"
              :individual-restrictions="individualRestrictions"
            />
          </div>

          <updating-restrictions-alerts
            :has-categories-select-errors="validationState[$options.updatingInnerBlocks.categories]"
            :has-date-periods-errors="validationState[$options.updatingInnerBlocks.dates]"
            :has-min-max-restriction-errors="hasMinMaxRestrictionErrors"
            :min-max-stay-message="massDrawerMinMaxStayMessage"
            :has-tariff-select-errors="validationState[$options.updatingInnerBlocks.tariff]"
            :has-week-days-errors="validationState[$options.updatingInnerBlocks.days]"
            :has-restriction-errors="hasRestrictionErrors"
            :server-error="form.serverError"
            :server-error-is-plain="form.serverErrorIsPlain"
            class="mt-auto"
          />
        </v-card-text>
        <v-card-actions
          v-if="!isMobileDevice || !needHideFooter"
          ref="footer"
          class="justify-space-between py-groups px-outer bordered-t"
        >
          <b-btn
            outlined
            color="tertiary"
            data-test="tariff-mass-restrictions-cancel-button"
            @click="internalValue = false"
          >
            {{ $t("Отменить") }}
          </b-btn>

          <b-btn
            :loading="isLoading"
            color="primary"
            data-test="tariff-mass-restrictions-save-button"
            @click="saveConstraints"
          >
            {{ saveBtnText }}
          </b-btn>
        </v-card-actions>
      </v-card>
    </b-drawer>
  </b-teleport-wrapper>
</template>

<script>
import { mask } from "vue-the-mask";
import ymHelpers from "@/utils/ym-helpers";
import { mapActions, mapState } from "vuex";
import { isEmptyObject, pick } from "@/utils/object";
import resolveElement from "@/utils/resolve-element.js";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import BTeleportWrapper from "@/uikit/b-teleport-wrapper";
import moment from "moment";
import { updatingRestrictionsInnerBlocks, viewDateFormat } from "../../config/screen-config.js";
import { hasUnacceptableRestrictions, STAY_MIN_MAX_API_ERROR_MESSAGE } from "../../lib/screen/save-flow.js";
import { defineUnacceptableRestrictions } from "../table/lib/store/unacceptable-restrictions.js";
import modules from "./assets/modules.js";
import { createUpdatingRestrictionsValidationState } from "./logic/initial-validation-state.js";
import UpdatingRestrictionsDatePeriods from "./date-periods.vue";
import UpdatingRestrictionsAlerts from "./alerts.vue";
import UpdatingRestrictionsWeekDaysFilter from "./week-days-filter.vue";
import UpdatingRestrictionsTariffsFilter from "./tariffs-filter.vue";
import UpdatingRestrictionsCategoriesFilter from "./categories-filter.vue";
import UpdatingRestrictionsPuzzelsFormPart from "./puzzels-form-part.vue";
import UpdatingRestrictionsStaysFormPart from "./stays-form-part.vue";

export default {
  name: "UpdatingConstraints",
  components: {
    UpdatingRestrictionsDatePeriods,
    UpdatingRestrictionsAlerts,
    UpdatingRestrictionsWeekDaysFilter,
    UpdatingRestrictionsTariffsFilter,
    UpdatingRestrictionsCategoriesFilter,
    UpdatingRestrictionsPuzzelsFormPart,
    UpdatingRestrictionsStaysFormPart,
    BTeleportWrapper,
  },
  directives: { mask },
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    openedFromDragSelection: {
      type: Boolean,
      default: false,
    },
  },
  updatingInnerBlocks: updatingRestrictionsInnerBlocks,
  data() {
    return {
      dates: [modules.createDatePeriodEntry()],
      form: modules.resetFormData(),
      universalRestrictions: [],
      individualRestrictions: this.getClearIndividualRestrictions(),
      needValidateRestrictions: false,
      needHideFooter: false,
      validationState: createUpdatingRestrictionsValidationState(),
      layoutObserver: null,
      layoutRafId: null,
    };
  },
  computed: {
    ...mapState("hotelRoom", ["roomtypes"]),
    ...mapState("hotel", ["rplans"]),
    ...mapState("tariffPricesAndRestrictions", ["isLoading", "currentTariff", "pricesCalendarModel"]),
    internalValue: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit("input", v);
      },
    },
    internalRoomtypes() {
      return this.roomtypes.reduce((arr, roomtype) => {
        arr.push({
          id: roomtype.id,
          name: roomtype.name,
        });
        return arr;
      }, []);
    },
    internalTariffs() {
      return this.rplans.filter(fetchedTariff => {
        const allDependent = PriceAndRestrictionsService.hasAllDependentRestrictionsFor(fetchedTariff);
        return !allDependent;
      });
    },
    saveBtnText() {
      return this.isMobileDevice ? this.$t("Сохранить") : this.$t("Сохранить ограничения");
    },
    hasFormPuzzels() {
      return !isEmptyObject(this.form.puzzle);
    },
    hasFormStays() {
      return !isEmptyObject(this.form.stays);
    },
    hasRestrictionErrors() {
      if (!this.needValidateRestrictions) {
        return false;
      }

      const notValidPuzzles = this.hasFormPuzzels && !this.isValidPuzzles(this.form.puzzle);
      const notValidStays = this.hasFormStays && !this.isValidStays(this.form.stays);

      return notValidPuzzles || notValidStays;
    },
    /**
     * Результат defineUnacceptableRestrictions по синтетическому черновику stay (как в основной таблице).
     */
    massDrawerMinMaxDefineResult() {
      if (!this.needValidateRestrictions || !this.hasFormStays) {
        return { unacceptableRestrictions: {}, hasConflict: false };
      }
      const synthetic = this.buildMassSyntheticStayUpdatedRestrictions();
      if (!Object.keys(synthetic).length) {
        return { unacceptableRestrictions: {}, hasConflict: false };
      }
      const defined = defineUnacceptableRestrictions({
        updatedRestrictions: synthetic,
        pricesCalendarModel: this.pricesCalendarModel,
        currentTariff: this.currentTariff,
        allPlans: this.rplans,
      });
      const hasConflict = hasUnacceptableRestrictions(defined.unacceptableRestrictions);
      return {
        unacceptableRestrictions: defined.unacceptableRestrictions,
        hasConflict,
      };
    },
    hasMinMaxRestrictionErrors() {
      if (!this.needValidateRestrictions || !this.hasFormStays) {
        return false;
      }

      return this.massDrawerMinMaxDefineResult.hasConflict || this.hasMinMaxRestrictionConflicts();
    },
    massDrawerMinMaxStayMessage() {
      return this.buildMassDrawerStayMinMaxMessage();
    },
  },
  watch: {
    internalValue(opened) {
      if (!opened) {
        this.needValidateRestrictions = false;
        this.needHideFooter = false;
        return;
      }

      this.$nextTick(() => {
        this.refreshLayoutObservation();
        this.updateLayoutMeasurements();
      });
    },
    needHideFooter() {
      this.$nextTick(() => {
        this.refreshLayoutObservation();
        this.updateLayoutMeasurements();
      });
    },
  },
  async mounted() {
    if (!this.roomtypes.length) {
      await this.$store.dispatch("hotelRoom/getRoomTypes");
    }
    if (!this.rplans.length) {
      await this.$store.dispatch("hotel/getPlans");
    }

    this.init();
    this.initLayoutObserver();
    this.$nextTick(() => {
      this.refreshLayoutObservation();
      this.updateLayoutMeasurements();
    });
  },
  beforeUnmount() {
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
    ...mapActions("tariffPricesAndRestrictions", ["setIsLoading"]),
    isValidPuzzles: modules.checkRestrictionPuzzelsValid(),
    isValidStays: modules.checkRestrictionStaysValid(),
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
      });
    },
    resetForm() {
      Object.values(this.$options.updatingInnerBlocks).forEach(block => {
        if (this.$refs?.[block]?.$v) {
          this.$refs[block].$v.$reset();
        }
      });
      this.form = modules.resetFormData();
      this.dates = [
        { values: [] },
      ];
    },
    getClearIndividualRestrictions() {
      const individualRestrictions = modules.createEmptyRestrictions();
      Object.keys(individualRestrictions).forEach(key => {
        individualRestrictions[key] = { tariffs: [] };
      });
      return individualRestrictions;
    },
    async saveConstraints() {
      this.needValidateRestrictions = true;
      const blocks = Object.values(this.$options.updatingInnerBlocks);
      blocks.forEach(block => {
        if (this.$refs?.[block]?.$v) {
          this.$refs[block].$v.$touch();
        }
      });

      if (this.hasRestrictionErrors
        || this.hasMinMaxRestrictionErrors
        || blocks.some(block => block !== updatingRestrictionsInnerBlocks.puzzles
        && block !== updatingRestrictionsInnerBlocks.stays
        && this.$refs?.[block]?.$v?.$invalid)) {
        return;
      }

      this.setIsLoading(true);
      const selectedRoomtypesWithSubrooms = this.getSelectedRoomtypesWithSubrooms();

      const restrictionsMassive = {};
      selectedRoomtypesWithSubrooms.forEach(currentRoomType => {
        restrictionsMassive[currentRoomType] = {};
        this.form.daysOfTheWeekList.forEach(day => {
          const dayId = day.value;
          restrictionsMassive[currentRoomType][dayId] = modules.createEmptyRestrictions();

          if (this.form.daysOfTheWeekListChecked.indexOf(dayId) < 0) return;

          for (const [key, value] of Object.entries(this.form.puzzle)) {
            restrictionsMassive[currentRoomType][dayId][key] = String(value.value);
          }
          for (const [key, value] of Object.entries(this.form.stays)) {
            restrictionsMassive[currentRoomType][dayId][key] = String(value.value);
          }
        });
      });
      const formattedDates = {
        dfrom: [],
        dto: [],
      };
      this.dates.forEach(date => {
        formattedDates.dfrom.push(moment(date.values[0]).format(PriceAndRestrictionsService.massiveUpdatingPricesDatesFormats.sending));
        formattedDates.dto.push(moment(date.values[1]).format(PriceAndRestrictionsService.massiveUpdatingPricesDatesFormats.sending));
      });
      const sendingData = {
        plan_select: this.form.currentTariff,
        roomtype_select: selectedRoomtypesWithSubrooms,
        restrictions_massive: restrictionsMassive,
        ...formattedDates,
        week_day_select: this.form.daysOfTheWeekListChecked,
      };

      await this.http.post("/tariff/restrictions_massive_update_any_plans", sendingData)
        .then((response) => {
          if (response && response.result === "success") {
            if (window.statist) {
              window.statist.stopAndSendCounter(["tariffsFromUpdatingConstraintsStartToFinish", "newtariffsFromUpdatingConstraintsStartToFinish"]);
            }
            ymHelpers.reachGoal("main", window.location.pathname === "/tariff/restrictions_overview" ? "massRestrictionsSaveOverview" : "massRestrictionsSavePrices");
            ymHelpers.reachGoal("main", "massRestrictionsSaveRestrictions");
            if (this.openedFromDragSelection) {
              ymHelpers.sendHit(
                "main",
                "restrictions_drag_save",
                "Сохранили ограничения после протягивания в таблице",
                {},
                "pricesAndRestrictions",
              );
            }

            this.$emit("updated", { response, sendingData });
          } else if (response && response.result === "error") {
            if (response.message === STAY_MIN_MAX_API_ERROR_MESSAGE) {
              this.form.serverErrorIsPlain = true;
              this.form.serverError = this.buildMassDrawerStayMinMaxMessage();
            } else {
              this.form.serverErrorIsPlain = false;
              this.form.serverError = response.message || this.$i18n.t("Ошибка отправки запроса. Попробуйте позже");
            }
            this.$emit("updated", { ...response, suppressParentErrorToast: true });
          } else if (response?.result !== "permission") {
            this.form.serverErrorIsPlain = false;
            this.form.serverError = this.$i18n.t("Ошибка отправки запроса. Попробуйте позже");
            this.$emit("updated", { ...response, suppressParentErrorToast: true });
          }
        })
        .catch((e) => {
          console.error("/tariff/restrictions_massive_update_any_plans: ", e);
          this.form.serverErrorIsPlain = false;
          this.form.serverError = e || this.$i18n.t("Ошибка отправки запроса. Попробуйте позже");
          this.$emit("updated", {
            result: "error",
            error: e,
            suppressParentErrorToast: true,
          });
        })
        .finally(() => {
          this.stopLoadingEffects();
          this.needValidateRestrictions = false;
        });
    },
    ifThisTariffInsidePage() {
      const pathname = window.location.pathname;
      if (pathname.includes("tariff/index")) {
        const strToArr = pathname.split("/");
        const id = strToArr[3];
        if (Number(id) && !this.form.currentTariff.includes(id)) {
          this.form.currentTariff.push(id);
        }
      }
    },
    checkRestrictions() {
      const universalRestrictions = [];
      const individualRestrictions = this.getClearIndividualRestrictions();
      const clearRestrictions = modules.createEmptyRestrictions();
      Object.keys(clearRestrictions).forEach(key => {
        clearRestrictions[key] = {
          count: 0,
          tariffs: [],
        };
      });

      if (this.form.currentTariff.length) {
        this.form.currentTariff.forEach(tariffId => {
          const currentTariff = this.internalTariffs.find(tariffItem => Number(tariffItem.id) === Number(tariffId));
          if (currentTariff && currentTariff.dependent_restrictions) {
            Object.keys(clearRestrictions).forEach(restriction => {
              if (Number(currentTariff.dependent_restrictions[restriction])) {
                clearRestrictions[restriction].count++;
                const parentTariff = this.internalTariffs.find(tariffItem => {
                  return Number(tariffItem.id) === Number(currentTariff.dependent_restrictions.parent_plan_id);
                });
                if (parentTariff && !this.form.currentTariff.includes(parentTariff.id)) {
                  clearRestrictions[restriction].tariffs.push(
                    {
                      currentTariffName: currentTariff.name,
                      parentTariffName: parentTariff.name,
                    },
                  );
                }
              }
            });
          }
        });

        Object.entries(clearRestrictions).forEach(([key, value]) => {
          if (Number(value.count) === this.form.currentTariff.length) {
            universalRestrictions.push(key);
          } else if (Number(value.count)) {
            individualRestrictions[key].tariffs = [...value.tariffs];
          }
        });
      }

      this.universalRestrictions = universalRestrictions;
      this.individualRestrictions = individualRestrictions;
    },
    init() {
      this.ifThisTariffInsidePage();
      this.checkRestrictions();
    },
    getSelectedRoomtypesWithSubrooms() {
      return this.form.currentRoomTypes.reduce((arr, roomtypeId) => {
        const currentRoomtype = this.roomtypes.find(roomtype => roomtype.id === roomtypeId);
        if (currentRoomtype) arr.push(roomtypeId, ...(currentRoomtype.subrooms.map(subroom => subroom.id)));
        return arr;
      }, []);
    },
    getUpdatedMinMaxRestrictions() {
      return ["minstay", "maxstay"].reduce((acc, restrictionType) => {
        const value = this.form?.stays?.[restrictionType]?.value;
        if (value) {
          acc[restrictionType] = value;
        }
        return acc;
      }, {});
    },
    /**
     * Черновик stay для выбранных категорий/дат — та же форма, что ожидает defineUnacceptableRestrictions в основной таблице.
     */
    buildMassSyntheticStayUpdatedRestrictions() {
      const patch = this.getUpdatedMinMaxRestrictions();
      if (!Object.keys(patch).length) {
        return {};
      }
      const roomtypes = this.getSelectedRoomtypesWithSubrooms();
      const dates = this.getSelectedDatesForValidation();
      if (!roomtypes.length || !dates.length) {
        return {};
      }
      const out = {};
      roomtypes.forEach((roomtypeId) => {
        out[roomtypeId] = {};
        dates.forEach((date) => {
          out[roomtypeId][date] = { ...patch };
        });
      });
      return out;
    },
    getSelectedDatesForValidation() {
      const selectedWeekdays = new Set(this.form.daysOfTheWeekListChecked.map((day) => Number(day)));
      const dates = [];

      this.dates.forEach(({ values = [] }) => {
        const [startDate, endDate] = values;
        if (!startDate || !endDate) {
          return;
        }

        const currentDate = moment(startDate);
        const lastDate = moment(endDate);
        while (currentDate.isSameOrBefore(lastDate, "day")) {
          if (selectedWeekdays.has(currentDate.isoWeekday())) {
            dates.push(currentDate.format("YYYY-MM-DD"));
          }
          currentDate.add(1, "day");
        }
      });

      return dates;
    },
    getCurrentPlanMinMaxRestrictions(roomtypeId, date) {
      return {
        minstay: this.pricesCalendarModel?.getRestriction?.({
          id: roomtypeId,
          date,
          name: PriceAndRestrictionsService.restrictionTypeEnum.minstay,
        })?.value ?? 0,
        maxstay: this.pricesCalendarModel?.getRestriction?.({
          id: roomtypeId,
          date,
          name: PriceAndRestrictionsService.restrictionTypeEnum.maxstay,
        })?.value ?? 0,
      };
    },
    getTariffBaseMinMaxRestrictions(tariff, roomtypeId, date) {
      if (!tariff) {
        return null;
      }

      if (Number(tariff.id) === Number(this.currentTariff?.id)) {
        return this.getCurrentPlanMinMaxRestrictions(roomtypeId, date);
      }

      if (Number(tariff?.dependent_restrictions?.parent_plan_id || 0) === Number(this.currentTariff?.id || 0)) {
        return this.pricesCalendarModel?.getDependentChildMinmaxRestrictions?.({
          planId: tariff.id,
          id: roomtypeId,
          date,
        }) || { minstay: 0, maxstay: 0 };
      }

      return null;
    },
    hasMinMaxConflictForTariff(tariff, roomtypeId, date, updatedRestrictions) {
      const baseRestrictions = this.getTariffBaseMinMaxRestrictions(tariff, roomtypeId, date);
      if (!baseRestrictions) {
        return false;
      }

      const parentRestrictions = Number(tariff?.dependent_restrictions?.parent_plan_id || 0) === Number(this.currentTariff?.id || 0)
        ? this.getCurrentPlanMinMaxRestrictions(roomtypeId, date)
        : {};

      const effectiveRestrictions = PriceAndRestrictionsService.resolveMinMaxRestrictions({
        baseRestrictions,
        updatedRestrictions,
        parentRestrictions,
        dependencySettings: tariff?.dependent_restrictions || {},
      });

      return PriceAndRestrictionsService.isMinstayGreaterThanMaxstay(effectiveRestrictions);
    },
    /**
     * Дочерние тарифы, у которых после сопоставления с родителем получается min > max.
     */
    collectChildPlanIdsWithMinMaxConflict(roomtypeId, date, updatedRestrictions) {
      if (!this.form.currentTariff.includes(`${this.currentTariff?.id}`) && !this.form.currentTariff.includes(this.currentTariff?.id)) {
        return [];
      }

      const currentRestrictions = PriceAndRestrictionsService.resolveMinMaxRestrictions({
        baseRestrictions: this.getCurrentPlanMinMaxRestrictions(roomtypeId, date),
        updatedRestrictions,
      });

      const conflicting = [];
      PriceAndRestrictionsService.getDirectDependentPlans(this.currentTariff, this.rplans).forEach((childPlan) => {
        const childRestrictions = this.pricesCalendarModel?.getDependentChildMinmaxRestrictions?.({
          planId: childPlan.id,
          id: roomtypeId,
          date,
        }) || {};
        const isChildSelected = this.form.currentTariff.includes(`${childPlan.id}`)
          || this.form.currentTariff.includes(childPlan.id);

        if (PriceAndRestrictionsService.isMinstayGreaterThanMaxstay(
          PriceAndRestrictionsService.resolveMinMaxRestrictions({
            baseRestrictions: childRestrictions,
            updatedRestrictions: isChildSelected ? updatedRestrictions : {},
            parentRestrictions: currentRestrictions,
            dependencySettings: childPlan?.dependent_restrictions || {},
          }),
        )) {
          conflicting.push(String(childPlan.id));
        }
      });
      return conflicting;
    },
    /**
     * ID тарифов, в которых действительно есть конфликт min/max (не весь список выбранных в форме).
     */
    collectMassDrawerConflictingTariffIds() {
      const updatedRestrictions = this.getUpdatedMinMaxRestrictions();
      const ids = new Set();

      if (!Object.keys(updatedRestrictions).length) {
        return [];
      }

      if (PriceAndRestrictionsService.isMinstayGreaterThanMaxstay(updatedRestrictions)) {
        const selected = this.form.currentTariff || [];
        const currentId = this.currentTariff?.id;
        if (currentId != null && selected.some((id) => Number(id) === Number(currentId))) {
          ids.add(String(currentId));
        } else if (selected.length) {
          ids.add(String(selected[0]));
        }
        return [...ids];
      }

      const selectedTariffs = this.form.currentTariff
        .map((tariffId) => this.internalTariffs.find((tariff) => Number(tariff.id) === Number(tariffId)))
        .filter(Boolean);
      const selectedRoomtypesWithSubrooms = this.getSelectedRoomtypesWithSubrooms();
      const selectedDates = this.getSelectedDatesForValidation();

      selectedRoomtypesWithSubrooms.forEach((roomtypeId) => {
        selectedDates.forEach((date) => {
          this.collectChildPlanIdsWithMinMaxConflict(roomtypeId, date, updatedRestrictions).forEach((id) => ids.add(id));

          selectedTariffs.forEach((tariff) => {
            if (this.hasMinMaxConflictForTariff(tariff, roomtypeId, date, updatedRestrictions)) {
              ids.add(String(tariff.id));
            }
          });
        });
      });

      return [...ids];
    },
    formatMassDrawerTariffNamesQuoted(conflictingTariffIds) {
      const quote = this.$i18n.locale === "ru"
        ? (name) => `«${name}»`
        : (name) => `"${name}"`;
      const rawIds = Array.isArray(conflictingTariffIds) && conflictingTariffIds.length
        ? conflictingTariffIds
        : this.collectMassDrawerConflictingTariffIds();
      const ids = rawIds.length
        ? rawIds
        : (this.form.currentTariff || []).map(String);

      const resolveName = (tariffId) => {
        const t = this.internalTariffs.find((x) => Number(x.id) === Number(tariffId))
          || this.rplans.find((x) => Number(x.id) === Number(tariffId));
        return t?.name ?? "";
      };

      return ids
        .map((tariffId) => {
          const name = resolveName(tariffId);
          return name ? quote(name) : "";
        })
        .filter(Boolean)
        .join(", ");
    },
    getMassDrawerPeriodRange() {
      let min = null;
      let max = null;
      for (const { values = [] } of this.dates || []) {
        const [a, b] = values;
        if (!a || !b) continue;
        const ma = moment(a);
        const mb = moment(b);
        if (!min || ma.isBefore(min, "day")) min = ma.clone();
        if (!max || mb.isAfter(max, "day")) max = mb.clone();
      }
      if (!min || !max) return "";
      return `${min.format(viewDateFormat)}-${max.format(viewDateFormat)}`;
    },
    buildMassDrawerStayMinMaxMessage() {
      const tariffNames = this.formatMassDrawerTariffNamesQuoted();
      const periodRange = this.getMassDrawerPeriodRange();
      return this.$t("Минимальный срок проживания не может быть больше максимального в тарифе {tariffNames} на период {periodRange}.", { tariffNames, periodRange });
    },
    hasMinMaxRestrictionConflicts() {
      return this.collectMassDrawerConflictingTariffIds().length > 0;
    },
    calculateContentHeight() {
      const content = resolveElement(this.$refs.content);
      if (!content) {
        return;
      }

      const headerHeight = resolveElement(this.$refs.header)?.offsetHeight ?? 0;
      const footerHeight = resolveElement(this.$refs.footer)?.offsetHeight ?? 0;

      content.style.height = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`;
    },
    isInputTarget(target) {
      return target?.nodeName === "INPUT" || !!target?.closest?.(".b-counter");
    },
    handleFocus(e) {
      if (!this.isMobileDevice || !this.isInputTarget(e?.target)) {
        return;
      }

      this.needHideFooter = true;
    },
    handleBlur(e) {
      if (!this.isMobileDevice) {
        return;
      }

      if (this.$refs.content?.contains?.(e?.relatedTarget)) {
        return;
      }

      this.needHideFooter = false;
    },
    updateFormStateFrom(selectedRestrictionRange) {
      if (!selectedRestrictionRange) {
        return;
      }

      const {
        currentRoomTypeId,
        dateRange,
        type,
      } = selectedRestrictionRange;
      this.form.currentRoomTypes = [currentRoomTypeId];
      this.dates[0].values = [dateRange[0], dateRange[1]];

      const newForm = modules.resetFormData();

      if (newForm.stays[type] != null) {
        this.$set(this.form, "stays", pick(newForm.stays, [type]));
        this.$set(this.form, "puzzle", {});
      } else if (newForm.puzzle[type] != null) {
        this.$set(this.form, "puzzle", pick(newForm.puzzle, [type]));
        this.$set(this.form, "stays", {});
      }
    },
    stopLoadingEffects() {
      setTimeout(() => {
        this.setIsLoading(false);
      }, 600);
    },
  },
};
</script>

<style lang="scss">
@import "./styles";
</style>

<style lang="scss" scoped>
.v-btn-toggle:not(.v-btn-toggle--group) > .v-btn {
  color: $main !important;
  background-color: transparent !important;

  &.v-btn-toggle--active.v-btn--active {
    color: $primary !important;
    background-color: $primary-lighten-4 !important;
    border-color: $secondary-blue-hover !important;
    padding-right: 11px;
  }
}

.row.row-gap {
  row-gap: map-get($gaps, 'groups');
}
</style>
