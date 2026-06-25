import moment from "moment";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import TariffPricesCalendarModel from "@/models/tariff/prices-calendar-model";
import { getDefaultSelectedRestrictionKeys } from "@/screens/tariff-prices/config/screen-config";
import { applyRemovePriceDayFromPricesToDelete,
  applySetUpdatingPriceValueInPlace,
  applyRemoveUpdatingPriceValueInPlace,
  applyPriceDraftIndexKey,
  applyRemovePriceDraftIndexKey,
  applyUnacceptableIndexForPriceInPlace } from "@/screens/tariff-prices/components/table/lib/store/apply-price-draft-in-place";
import { setUpdatingPriceValue } from "@/screens/tariff-prices/components/table/lib/store/price-draft-tree";
import { updateUnacceptableIndex, convertUnacceptableIndexToState } from "@/screens/tariff-prices/components/table/lib/store/unacceptable-price-index";
import { applySetRestrictionDraftInPlace,
  applyRemoveRestrictionDraftInPlace } from "@/screens/tariff-prices/components/table/lib/store/apply-restriction-draft-in-place";
import { applySetUpdatingAvailabilityValueInPlace,
  applyRemoveUpdatingAvailabilityValueInPlace } from "@/screens/tariff-prices/components/table/lib/store/apply-availability-draft-in-place";
import { defineUnacceptableRestrictions } from "@/screens/tariff-prices/components/table/lib/store/unacceptable-restrictions";
import { applyUnacceptableRestrictionsInPlace } from "@/screens/tariff-prices/components/table/lib/store/apply-unacceptable-restrictions-in-place";
import { normalizeRestrictionsForViewMode } from "@/screens/tariff-prices/lib/screen/restriction-view-mode";
import { mapTariffInterfaceSettingsModelToRequest,
  TariffInterfaceSettingsModel } from "@/models/tariff/tariff-interface-settings-model";
import TariffInterfaceSettingsService from "@/services/tariff/interface-settings";
import { roomtypesHaveExtraChargesCategory } from "@/services/tariff/extra-charges";
import { roomtypesNeedHotelChildrenAgesLabels } from "@/screens/tariff-prices/lib/tariff/roomtypes-need-hotel-children-ages";
import { resolveTableContentPartsFromGetters,
  resolveTableShellParts } from "@/screens/tariff-prices/lib/screen/resolve-table-required-parts";
import { isPartsPending } from "@/screens/tariff-prices/lib/screen/table-parts-readiness";
import { resolveTouchedDraftKinds } from "@/screens/tariff-prices/lib/screen/resolve-touched-draft-kinds";
import { resolveUpdateFromReplacePlanIds } from "@/screens/tariff-prices/lib/screen/resolve-branch-plan-ids";

function normalizeCalendarUpdatePayload(payload) {
  if (
    payload != null
    && typeof payload === "object"
    && Object.prototype.hasOwnProperty.call(payload, "response")
  ) {
    return {
      response: payload.response ?? {},
      refetchParts: Array.isArray(payload.refetchParts) ? payload.refetchParts : [],
    };
  }
  return { response: payload ?? {}, refetchParts: [] };
}

/** Мемоизация геттера unacceptablePrices по unacceptableIndexEpoch */
let unacceptablePricesGetterMemo = { epoch: -1, value: {} };
const inflightPartRequests = new Map();

function buildPartsRequestKey(state) {
  return [
    state.currentTariff?.id || "",
    state.dateFrom || "",
    state.mode || "",
  ].join("|");
}

export default {
  namespaced: true,
  state: {
    currentTariff: null,
    mode: PriceAndRestrictionsService.modeDefaultPrice,
    pricesCalendarModel: {},
    dateFrom: moment().format(PriceAndRestrictionsService.sendingDateFormat),
    selectedCategories: [],
    selectedRestrictions: getDefaultSelectedRestrictionKeys(),
    activeInfoTab: "default",
    updatingPrices: {},
    priceDraftIndex: {},
    pricesToDelete: {},
    massiveUpdatingPricesDrawerShowDefaultPrices: false,
    massiveUpdatingPrices: {},
    massiveUpdatingPricesWeekdays: {
      1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", all: "",
    },
    unacceptableIndex: {},
    /** Счётчик версии индекса для мемоизации геттера unacceptablePrices (in-place мутации не меняют ссылку на объект). */
    unacceptableIndexEpoch: 0,
    unacceptableMassivePricesRestricted: {},
    unacceptableMassivePricesSelf: {},
    unacceptableRestrictions: {},
    /** Счётчик версии карты конфликтов stay (in-place мутации не меняют ссылку на корень `unacceptableRestrictions`). */
    unacceptableRestrictionsEpoch: 0,
    /** Имена связанных тарифов (дочерние и/или родительский) при конфликте min/max stay (см. defineUnacceptableRestrictions). */
    unacceptableRestrictionsDependentPlanNames: [],
    /** Timestamps дат, на которых конфликт min/max из-за дочернего тарифа (диалог сохранения). */
    unacceptableRestrictionsChildStayConflictTimestamps: new Set(),
    /** Timestamps дат, на которых конфликт min/max из-за родительского тарифа (диалог сохранения). */
    unacceptableRestrictionsParentStayConflictTimestamps: new Set(),
    updatedRestrictions: {},
    restrictionDraftIndex: {},
    updatingAvailability: {},
    compactMode: false,
    isLoading: false,
    enabledCombinedMode: true,
    pricesCalendarModelUpdatedAt: 0,
    fullscreenMode: false,
    compactRestrictions: false,
    partsLoadState: {
      requestKey: "",
      baseLoaded: false,
      baseLoading: false,
      planPricesLoaded: false,
      planPricesLoading: false,
      restrictionsLoaded: false,
      restrictionsLoading: false,
      metaLoaded: false,
      metaLoading: false,
      dynamicLoaded: false,
      dynamicLoading: false,
      extraLoaded: false,
      extraLoading: false,
      otherTariffsExtraLoaded: false,
      otherTariffsExtraLoading: false,
      otherTariffsPricesLoaded: false,
      otherTariffsPricesLoading: false,
    },
    interfaceSettings: TariffInterfaceSettingsModel.defaults(),
  },
  mutations: {
    setIsLoading(state, value) {
      state.isLoading = !!value;
    },
    setCompactMode(state, value = true) {
      state.compactMode = !!value;
    },
    setCurrentTariff(state, value) {
      const prevId = state.currentTariff?.id;
      const nextId = value?.id;
      if (
        state.pricesCalendarModel?.resetPlanScopedFields
        && nextId != null
        && String(prevId ?? "") !== String(nextId)
      ) {
        state.pricesCalendarModel.resetPlanScopedFields();
      }
      state.currentTariff = value;
    },
    setCurrentMode(state, value) {
      const prevMode = state.mode;
      const nextMode = value;
      if (String(prevMode ?? "") !== String(nextMode ?? "")) {
        state.pricesCalendarModel?.clearDerivedPriceCaches?.();
      }
      state.mode = nextMode;
    },
    invalidatePartsLoadState(state) {
      state.partsLoadState = {
        requestKey: "",
        baseLoaded: false,
        baseLoading: false,
        planPricesLoaded: false,
        planPricesLoading: false,
        restrictionsLoaded: false,
        restrictionsLoading: false,
        metaLoaded: false,
        metaLoading: false,
        dynamicLoaded: false,
        dynamicLoading: false,
        extraLoaded: false,
        extraLoading: false,
        otherTariffsExtraLoaded: false,
        otherTariffsExtraLoading: false,
        otherTariffsPricesLoaded: false,
        otherTariffsPricesLoading: false,
      };
    },
    syncPartsLoadRequestKey(state, requestKey) {
      if (state.partsLoadState.requestKey === requestKey) {
        return;
      }
      state.partsLoadState = {
        requestKey,
        baseLoaded: false,
        baseLoading: false,
        planPricesLoaded: false,
        planPricesLoading: false,
        restrictionsLoaded: false,
        restrictionsLoading: false,
        metaLoaded: false,
        metaLoading: false,
        dynamicLoaded: false,
        dynamicLoading: false,
        extraLoaded: false,
        extraLoading: false,
        otherTariffsExtraLoaded: false,
        otherTariffsExtraLoading: false,
        otherTariffsPricesLoaded: false,
        otherTariffsPricesLoading: false,
      };
    },
    setPartsLoading(state, { part, value }) {
      const key = `${part}Loading`;

      if (Object.prototype.hasOwnProperty.call(state.partsLoadState, key)) {
        state.partsLoadState[key] = Boolean(value);
      }
    },
    setPartsLoaded(state, { part, value }) {
      const key = `${part}Loaded`;
      if (Object.prototype.hasOwnProperty.call(state.partsLoadState, key)) {
        state.partsLoadState[key] = Boolean(value);
      }
    },
    setPricesCalendarModel(state, value) {
      state.pricesCalendarModel = value;
    },
    setPricesCalendarModelUpdatedAt(state, value) {
      state.pricesCalendarModelUpdatedAt = value;
    },
    /** In-place update модели из ответа API (вызывается только из mutation, чтобы не мутировать store вне handlers). */
    updatePricesCalendarModelInPlace(state, payload = {}) {
      const { response, refetchParts } = normalizeCalendarUpdatePayload(payload);
      const model = state.pricesCalendarModel;
      if (model && typeof model.updateFrom === "function") {
        const updateOptions = resolveUpdateFromReplacePlanIds(refetchParts, state.currentTariff);
        model.updateFrom(response, updateOptions);
        state.pricesCalendarModelUpdatedAt = Date.now();
      }
    },
    setDateFrom(state, value) {
      const prevDateFrom = state.dateFrom;
      const nextDateFrom = value || moment().format(PriceAndRestrictionsService.sendingDateFormat);
      if (
        state.pricesCalendarModel?.resetPlanScopedFields
        && String(prevDateFrom ?? "") !== String(nextDateFrom)
      ) {
        state.pricesCalendarModel.resetPlanScopedFields();
      }
      state.dateFrom = nextDateFrom;
    },
    setSelectedCategories(state, value) {
      state.selectedCategories = value;
    },
    setActiveInfoTab(state, value) {
      state.activeInfoTab = value || "default";
    },
    setShowDefaultPrices(state, value) {
      state.massiveUpdatingPricesDrawerShowDefaultPrices = Boolean(value);
    },
    setUpdatingPrices(state, value) {
      state.updatingPrices = value;
    },
    setPriceDraftIndex(state, value) {
      state.priceDraftIndex = value;
    },
    setPricesToDelete(state, value) {
      state.pricesToDelete = value;
    },
    setMassiveUpdatingPrices(state, value) {
      state.massiveUpdatingPrices = value;
    },
    setMassiveUpdatingPricesWeekdays(state, value) {
      state.massiveUpdatingPricesWeekdays = value;
    },
    setUnacceptableMassivePricesRestricted(state, value) {
      state.unacceptableMassivePricesRestricted = value;
    },
    setUnacceptableMassivePricesSelf(state, value) {
      state.unacceptableMassivePricesSelf = value;
    },
    setUnacceptableRestrictions(state, value) {
      const next = value && typeof value === "object" ? value : {};
      applyUnacceptableRestrictionsInPlace(state, next);
      if (!value || (typeof value === "object" && Object.keys(value).length === 0)) {
        state.unacceptableRestrictionsChildStayConflictTimestamps = new Set();
        state.unacceptableRestrictionsParentStayConflictTimestamps = new Set();
      }
    },
    setUnacceptableRestrictionsDependentPlanNames(state, value) {
      state.unacceptableRestrictionsDependentPlanNames = Array.isArray(value) ? value : [];
    },
    setUpdatingRestrictions(state, value) {
      state.updatedRestrictions = value;
    },
    applyRestrictionDraftBundle(state, {
      type,
      roomtypeId,
      day,
      value,
      shouldReset,
      isBooleanRestriction,
      allPlans = [],
    }) {
      if (shouldReset) {
        applyRemoveRestrictionDraftInPlace(state, {
          type,
          roomtypeId,
          day,
        });
      } else {
        const v = isBooleanRestriction ? Number(value) : value;
        applySetRestrictionDraftInPlace(state, {
          type,
          roomtypeId,
          day,
          value: v,
        });
      }
      const defined = defineUnacceptableRestrictions({
        updatedRestrictions: state.updatedRestrictions,
        pricesCalendarModel: state.pricesCalendarModel,
        currentTariff: state.currentTariff,
        allPlans,
      });
      applyUnacceptableRestrictionsInPlace(state, defined.unacceptableRestrictions);
      state.unacceptableRestrictionsDependentPlanNames = defined.dependentRestrictionConflictPlanNames;
      state.unacceptableRestrictionsChildStayConflictTimestamps = defined.childStayConflictTimestamps ?? new Set();
      state.unacceptableRestrictionsParentStayConflictTimestamps = defined.parentStayConflictTimestamps ?? new Set();
    },
    setRestrictionDraftIndex(state, value) {
      state.restrictionDraftIndex = value;
    },
    setSelectedRestrictions(state, value) {
      state.selectedRestrictions = value;
    },
    /**
     * Одна мутация: снять день с pricesToDelete, записать черновик цены, индекс и unacceptable для комнаты.
     */
    applySetUpdatingPriceDraftBundle(state, {
      price,
      discountAmount,
    }) {
      applyRemovePriceDayFromPricesToDelete(state, price);
      applySetUpdatingPriceValueInPlace(state, price);
      applyPriceDraftIndexKey(state, price);
      applyUnacceptableIndexForPriceInPlace(state, price, discountAmount);
    },
    applyUnsetUpdatingPriceDraftBundle(state, {
      price,
      discountAmount,
    }) {
      applyRemoveUpdatingPriceValueInPlace(state, price);
      applyRemovePriceDraftIndexKey(state, price);
      applyUnacceptableIndexForPriceInPlace(
        state,
        { ...price, value: "" },
        discountAmount,
      );
    },
    resetUpdatingPricesDraft(state) {
      state.updatingPrices = {};
      state.priceDraftIndex = {};
    },
    resetUpdatingAvailabilityDraft(state) {
      state.updatingAvailability = {};
    },
    applySetUpdatingAvailabilityDraftBundle(state, {
      roomtypeId, day, value,
    }) {
      applySetUpdatingAvailabilityValueInPlace(state, {
        roomtypeId, day, value,
      });
    },
    applyUnsetUpdatingAvailabilityDraftBundle(state, { roomtypeId, day }) {
      applyRemoveUpdatingAvailabilityValueInPlace(state, { roomtypeId, day });
    },
    resetUnacceptableIndex(state) {
      state.unacceptableIndex = {};
      state.unacceptableIndexEpoch = (state.unacceptableIndexEpoch || 0) + 1;
    },
    setFullscreenMode(state, value) {
      state.fullscreenMode = value;
    },
    setCompactRestrictions(state, value) {
      state.compactRestrictions = value;
    },
    setInterfaceSettings(state, value) {
      state.interfaceSettings = value;
    },
  },
  actions: {
    setIsLoading({ commit }, value) {
      commit("setIsLoading", value);
    },
    setCompactMode({ commit }, value) {
      commit("setCompactMode", value);
    },
    setCurrentTariff({ commit, state }, value) {
      const prevId = state.currentTariff?.id;
      const nextId = value?.id;
      commit("setCurrentTariff", value);
      if (String(prevId ?? "") !== String(nextId ?? "")) {
        commit("invalidatePartsLoadState");
      }
    },
    setCurrentMode({ commit }, value) {
      commit("setCurrentMode", value);
      commit("invalidatePartsLoadState");
    },
    setPricesCalendarModel({ commit }, value) {
      commit("setPricesCalendarModel", value);
    },
    updatePricesCalendarModelFromResponse({ state, commit }, payload = {}) {
      const { response, refetchParts } = normalizeCalendarUpdatePayload(payload);
      const model = state.pricesCalendarModel;
      if (model && typeof model.updateFrom === "function") {
        commit("updatePricesCalendarModelInPlace", { response, refetchParts });
      } else {
        const updateOptions = resolveUpdateFromReplacePlanIds(refetchParts, state.currentTariff);
        const newModel = new TariffPricesCalendarModel();
        newModel.updateFrom(response, updateOptions);
        commit("setPricesCalendarModel", newModel);
      }
    },
    setDateFrom({ commit }, value) {
      commit("setDateFrom", value);
      commit("invalidatePartsLoadState");
    },
    /**
     * После первого полного запроса календаря помечает загруженные части ответа (base / dynamic).
     */
    applyInitialPricesPayloadParts({ commit, state }, { fetchedParts = ["base"] } = {}) {
      const requestKey = buildPartsRequestKey(state);
      commit("syncPartsLoadRequestKey", requestKey);
      (fetchedParts || []).forEach((part) => {
        commit("setPartsLoaded", { part, value: true });
      });
    },
    async ensureDynamicPartForDependentChildTariff({
      dispatch, state, getters,
    }) {
      const parentId = Number(state.currentTariff?.parent_id || 0);
      if (!parentId) return;
      if (!getters.parentUsesRmsPricing) return;
      if (state.partsLoadState.dynamicLoaded) return;
      await dispatch("ensurePartLoaded", { part: "dynamic", withDynamicPrices: true });
    },
    async ensurePartLoaded({
      state,
      getters,
      commit,
      dispatch,
    }, {
      part,
      withDynamicPrices = false,
    }) {
      const requestKey = buildPartsRequestKey(state);
      if (!requestKey || !state.currentTariff?.id) {
        return;
      }
      commit("syncPartsLoadRequestKey", requestKey);

      const loadedKey = `${part}Loaded`;
      const loadingKey = `${part}Loading`;
      if (state.partsLoadState[loadedKey] || state.partsLoadState[loadingKey]) {
        return;
      }

      const inFlightKey = `${part}|${requestKey}`;
      if (inflightPartRequests.has(inFlightKey)) {
        await inflightPartRequests.get(inFlightKey);
        return;
      }
      commit("setPartsLoading", { part, value: true });

      const promise = PriceAndRestrictionsService.getPricesAndRestrictionsDataRaw({
        planId: state.currentTariff.id,
        dateFrom: state.dateFrom,
        withDynamicPrices: withDynamicPrices || getters.isDynamicPricesModeEnabled,
        parts: [part],
      })
        .then((response) => {
          if (buildPartsRequestKey(state) !== requestKey) {
            return;
          }
          dispatch("updatePricesCalendarModelFromResponse", {
            response: response || {},
            refetchParts: [part],
          });
          commit("setPartsLoaded", { part, value: true });
        })
        .finally(() => {
          inflightPartRequests.delete(inFlightKey);
          if (buildPartsRequestKey(state) === requestKey) {
            commit("setPartsLoading", { part, value: false });
          }
        });

      inflightPartRequests.set(inFlightKey, promise);
      await promise;
    },
    async ensurePlanPricesLoaded(context) {
      await context.dispatch("ensurePartLoaded", { part: "planPrices" });
    },
    async ensureRestrictionsLoaded(context) {
      await context.dispatch("ensurePartLoaded", { part: "restrictions" });
    },
    async ensureContextMetaLoaded(context) {
      await context.dispatch("ensureMetaLoaded");
    },
    async ensureMetaLoaded(context) {
      await context.dispatch("ensurePartLoaded", { part: "meta" });
    },
    async ensureDynamicLoaded({ getters, dispatch }) {
      if (!getters.isRmsPricingEnabled) {
        return;
      }
      const withDynamicPrices = getters.isDynamicPricesModeEnabled
        || (getters.isCurrentTariffDepend && getters.parentUsesRmsPricing)
        || (getters.isRmsPricingEnabled && getters.isOneOfPricesModesEnabled);
      await dispatch("ensurePartLoaded", {
        part: "dynamic",
        withDynamicPrices,
      });
    },
    async ensureExtraLoaded(context) {
      await context.dispatch("ensurePartLoaded", { part: "extra" });
    },
    async ensureOtherTariffsExtraLoaded(context) {
      await context.dispatch("ensurePartLoaded", { part: "otherTariffsExtra" });
    },
    async ensureOtherTariffsPricesLoaded(context) {
      await context.dispatch("ensurePartLoaded", {
        part: "otherTariffsPrices",
        withDynamicPrices: true,
      });
    },
    async loadTableContentParts({ getters, dispatch }) {
      const parts = getters.tableContentParts;
      if (!parts.length) {
        return;
      }
      await Promise.all(parts.map((part) => {
        if (part === "dynamic") {
          const withDynamicPrices = getters.isDynamicPricesModeEnabled
            || (getters.isCurrentTariffDepend && getters.parentUsesRmsPricing)
            || (getters.isRmsPricingEnabled && getters.isOneOfPricesModesEnabled);
          return dispatch("ensurePartLoaded", {
            part: "dynamic",
            withDynamicPrices,
          });
        }
        return dispatch("ensurePartLoaded", { part });
      }));
    },
    beginBackgroundPartsRefetch({ commit, state }, { parts = [] } = {}) {
      const requestKey = buildPartsRequestKey(state);
      commit("syncPartsLoadRequestKey", requestKey);
      (parts || []).forEach((part) => {
        commit("setPartsLoading", { part, value: true });
      });
    },
    finishBackgroundPartsRefetch({
      commit,
      state,
      dispatch,
    }, {
      parts = [],
      requestKey = "",
      response = {},
    } = {}) {
      if (buildPartsRequestKey(state) !== requestKey) {
        (parts || []).forEach((part) => {
          commit("setPartsLoading", { part, value: false });
        });
        return;
      }
      return dispatch("updatePricesCalendarModelFromResponse", {
        response,
        refetchParts: parts,
      }).then(() => {
        (parts || []).forEach((part) => {
          commit("setPartsLoaded", { part, value: true });
          commit("setPartsLoading", { part, value: false });
        });
      });
    },
    setSelectedCategories({ commit }, value) {
      PriceAndRestrictionsService.saveChoosenCategoriesFilter(value);
      commit("setSelectedCategories", value);
    },
    setInterfaceSettings({ commit }, value) {
      commit("setInterfaceSettings", value);
    },
    async changeInterfaceSettings({ state, dispatch }, newSettings) {
      const currentSettings = state.interfaceSettings;
      const nextSettings = new TariffInterfaceSettingsModel({
        ...currentSettings,
        ...newSettings,
      });

      const request = mapTariffInterfaceSettingsModelToRequest(nextSettings);
      const success = await TariffInterfaceSettingsService.saveSettings(request);

      if (success) {
        dispatch("setInterfaceSettings", nextSettings);
      }

      return success;
    },
    setActiveInfoTab({ commit }, value) {
      commit("setActiveInfoTab", value);
    },
    setShowDefaultPrices({ commit }, value) {
      commit("setShowDefaultPrices", value);
    },
    setUnacceptableMassivePricesRestricted({ commit }, value) {
      commit("setUnacceptableMassivePricesRestricted", value);
    },
    setUnacceptableMassivePricesSelf({ commit }, value) {
      commit("setUnacceptableMassivePricesSelf", value);
    },
    setUnacceptableRestrictions({ commit }, value) {
      commit("setUnacceptableRestrictions", value);
    },
    setUpdatingPrices({
      commit, state, dispatch,
    }, price = {
      value: 0,
      id: "",
      day: "",
    }) {
      // `ensureMetaLoaded` не блокируем здесь: таблица дергает его после mount / смены контекста,
      // иначе параллельные `input` ждут один и тот же await и гоняют commit в неверном порядке.
      commit("applySetUpdatingPriceDraftBundle", {
        price,
        discountAmount: state.pricesCalendarModel?.maxDiscountChildTariff?.discount_amount,
      });
      dispatch("ensureMetaLoaded");
    },
    setPriceToDelete({ commit, state }, price = {
      id: "",
      day: "",
    }) {
      const newPricesToDelete = { ...(state.pricesToDelete || {}) };
      newPricesToDelete[price.id] = [
        ...(newPricesToDelete[price.id] || []),
        price.day,
      ];
      commit("setPricesToDelete", newPricesToDelete);
    },
    unsetPriceToDelete({ commit, state }, price = {
      id: "",
      day: "",
    }) {
      const newPriceToDelete = { ...(state.pricesToDelete || {}) };
      newPriceToDelete[price.id] = (newPriceToDelete[price.id] || []).filter(day => day !== price.day);
      if (!(newPriceToDelete[price.id] || []).length) delete newPriceToDelete[price.id];
      commit("setPricesToDelete", newPriceToDelete);
    },
    unsetUpdatingPrice({ commit, state }, price = {
      value: 0,
      id: "",
      day: "",
    }) {
      commit("applyUnsetUpdatingPriceDraftBundle", {
        price,
        discountAmount: state.pricesCalendarModel?.maxDiscountChildTariff?.discount_amount,
      });
    },
    resetUpdatingPrices({ commit }) {
      commit("resetUpdatingPricesDraft");
    },
    resetPriceToDelete({ commit }) {
      commit("setPricesToDelete", {});
    },
    setMassiveUpdatingPrices({ commit, state }, prices = [{
      value: 0,
      id: "",
      weekday: "",
    }]) {
      let newUpdatingPrices = { ...(state.massiveUpdatingPrices || {}) };
      let newUnacceptableIndex = Object.entries(state.unacceptableMassivePricesRestricted || {}).reduce((acc, [roomtypeId, days]) => {
        acc[roomtypeId] = (days || []).reduce((dayAcc, day) => {
          dayAcc[day] = true;
          return dayAcc;
        }, {});
        return acc;
      }, {});

      prices?.forEach(price => {
        newUpdatingPrices = setUpdatingPriceValue(newUpdatingPrices, price);
        newUnacceptableIndex = updateUnacceptableIndex(
          newUnacceptableIndex,
          price,
          state.pricesCalendarModel?.maxDiscountChildTariff?.discount_amount,
        );
      });

      commit("setMassiveUpdatingPrices", newUpdatingPrices);
      commit("setUnacceptableMassivePricesRestricted", convertUnacceptableIndexToState(newUnacceptableIndex));
    },
    resetMassiveUpdatingPrices({ commit }) {
      commit("setMassiveUpdatingPrices", {});
    },
    setMassiveUpdatingPricesWeekday({ commit, state }, data = { weekday: "", value: "" }) {
      if (!data.weekday) {
        return;
      }

      const isAllWeekday = data.weekday === PriceAndRestrictionsService.allWeekdayValue;
      const hasSelectedWeekdays = Array.isArray(data.selectedWeekdays) && data.selectedWeekdays.length > 0;
      const hasSyncValue = data.value !== undefined && data.value !== null;

      if (isAllWeekday && !hasSelectedWeekdays && !hasSyncValue) {
        commit("setMassiveUpdatingPricesWeekdays", {
          1: "",
          2: "",
          3: "",
          4: "",
          5: "",
          6: "",
          7: "",
          all: "",
        });
        return;
      }

      if (hasSelectedWeekdays && hasSyncValue) {
        const next = { ...state.massiveUpdatingPricesWeekdays };
        const weekdays = isAllWeekday ? [1, 2, 3, 4, 5, 6, 7] : data.selectedWeekdays;
        weekdays.forEach((weekday) => {
          next[weekday] = data.value || "";
        });
        next.all = "";
        commit("setMassiveUpdatingPricesWeekdays", next);
        return;
      }

      if (isAllWeekday) {
        commit("setMassiveUpdatingPricesWeekdays", {
          1: data.value || "",
          2: data.value || "",
          3: data.value || "",
          4: data.value || "",
          5: data.value || "",
          6: data.value || "",
          7: data.value || "",
          all: data.value || "",
        });
        return;
      }

      commit("setMassiveUpdatingPricesWeekdays", {
        ...state.massiveUpdatingPricesWeekdays,
        [data.weekday]: data.value || "",
        all: "",
      });
    },
    resetUnacceptablePrices({ commit }) {
      commit("resetUnacceptableIndex");
    },
    resetUnacceptableMassivePrices({ commit }) {
      commit("setUnacceptableMassivePricesRestricted", {});
      commit("setUnacceptableMassivePricesSelf", {});
    },
    setUpdatingRestrictions({
      commit, state, rootState, dispatch,
    }, payload = {
      type: "",
      roomtypeId: "",
      day: "",
      value: "",
    }) {
      const {
        type = "",
        roomtypeId = "",
        day = "",
        value = "",
      } = payload;
      const savedRestriction = state.pricesCalendarModel.getRestriction({
        id: roomtypeId, date: day, name: type,
      }).value;
      const isBooleanRestriction = type === PriceAndRestrictionsService.closedRestrictionName
        || type === PriceAndRestrictionsService.closedArrivalRestrictionName
        || type === PriceAndRestrictionsService.closedDepartureRestrictionName;
      const shouldReset = Number(value) === savedRestriction;
      commit("applyRestrictionDraftBundle", {
        type,
        roomtypeId,
        day,
        value,
        shouldReset,
        isBooleanRestriction,
        allPlans: rootState.hotel?.rplans,
      });
      dispatch("ensureMetaLoaded");
    },
    resetUpdatingRestrictions({ commit }) {
      commit("setRestrictionDraftIndex", {});
      commit("setUpdatingRestrictions", {});
      commit("setUnacceptableRestrictions", {});
      commit("setUnacceptableRestrictionsDependentPlanNames", []);
    },
    setUpdatingAvailability({ commit, state }, payload = {
      roomtypeId: "",
      day: "",
      value: "",
    }) {
      const {
        roomtypeId = "",
        day = "",
        value = "",
      } = payload;
      const savedAvailability = state.pricesCalendarModel?.getAvailability?.(roomtypeId, day);
      const shouldReset = Number(value) === Number(savedAvailability);
      if (shouldReset) {
        commit("applyUnsetUpdatingAvailabilityDraftBundle", { roomtypeId, day });
      } else {
        commit("applySetUpdatingAvailabilityDraftBundle", {
          roomtypeId, day, value,
        });
      }
    },
    unsetUpdatingAvailability({ commit }, payload = {
      roomtypeId: "",
      day: "",
    }) {
      const { roomtypeId = "", day = "" } = payload;
      commit("applyUnsetUpdatingAvailabilityDraftBundle", { roomtypeId, day });
    },
    resetUpdatingAvailability({ commit }) {
      commit("resetUpdatingAvailabilityDraft");
    },
    async setSelectedRestrictions({ commit }, value) {
      PriceAndRestrictionsService.saveChoosenRestrictionsFilter(value);
      commit("setSelectedRestrictions", value);
    },
    resetMainChanges({ dispatch }) {
      dispatch("resetUpdatingPrices");
      dispatch("resetPriceToDelete");
      dispatch("resetUnacceptablePrices");
      dispatch("resetUpdatingRestrictions");
      dispatch("resetUpdatingAvailability");
    },
    resetPriceDrafts({ dispatch }) {
      dispatch("resetUpdatingPrices");
      dispatch("resetPriceToDelete");
      dispatch("resetUnacceptablePrices");
    },
    resetRestrictionDrafts({ dispatch }) {
      dispatch("resetUpdatingRestrictions");
    },
    resetAvailabilityDrafts({ dispatch }) {
      dispatch("resetUpdatingAvailability");
    },
    resetDraftsForSendingData({ dispatch }, sendingData) {
      const {
        prices, restrictions, availability,
      } = resolveTouchedDraftKinds(sendingData);
      if (prices) {
        dispatch("resetPriceDrafts");
      }
      if (restrictions) {
        dispatch("resetRestrictionDrafts");
      }
      if (availability) {
        dispatch("resetAvailabilityDrafts");
      }
    },
    async resetMassiveChanges({ dispatch }) {
      await dispatch("resetUnacceptableMassivePrices");
      dispatch("resetMassiveUpdatingPrices");
    },
    setCompactRestrictions({ commit }, value) {
      const nextCompactRestrictions = Boolean(value);
      commit("setCompactRestrictions", nextCompactRestrictions);
    },
    async applyCompactRestrictionsViewMode({
      commit,
      dispatch,
      state,
    }, value) {
      const nextCompactRestrictions = Boolean(value);

      commit("setCompactRestrictions", nextCompactRestrictions);

      const normalizedRestrictions = normalizeRestrictionsForViewMode(state.selectedRestrictions);

      const currentRestrictions = state.selectedRestrictions || [];
      const restrictionsChanged = normalizedRestrictions.length !== currentRestrictions.length
        || normalizedRestrictions.some((restrictionType, index) => restrictionType !== currentRestrictions[index]);

      if (restrictionsChanged) {
        await dispatch("setSelectedRestrictions", normalizedRestrictions);
      }

      await PriceAndRestrictionsService.saveChoosenCompactRestrictionsFilter(nextCompactRestrictions);
    },
  },
  getters: {
    /** Проекция unacceptableIndex → форма для UI и API (раньше дублировалась в state). */
    unacceptablePrices(state) {
      const epoch = state.unacceptableIndexEpoch || 0;
      if (unacceptablePricesGetterMemo.epoch === epoch) {
        return unacceptablePricesGetterMemo.value;
      }
      const value = convertUnacceptableIndexToState(state.unacceptableIndex);
      unacceptablePricesGetterMemo = { epoch, value };
      return value;
    },
    isRmsPricingEnabled(state) {
      return !!Number(state.currentTariff?.extra?.rms_pricing_rules_enabled);
    },
    isTariffMain(state) {
      return !!Number(state.currentTariff?.is_main);
    },
    isCombinedModeEnabled(state) {
      return [PriceAndRestrictionsService.modeRestrictionsWithPrices, PriceAndRestrictionsService.modeRestrictionsWithDynamicPrices].includes(state.mode);
    },
    isOneOfPricesModesEnabled(state, getters) {
      return getters.isCombinedModeEnabled || state.mode.includes(PriceAndRestrictionsService.modeDefaultPrice);
    },
    isRestrictionModeEnabled(state, getters) {
      return getters.isCombinedModeEnabled || state.mode === PriceAndRestrictionsService.modeRestrictions;
    },
    isOneOfDynamicPricesModesEnabled(state) {
      return state.mode.includes("rms_prices");
    },
    isCurrentTariffDepend(state) {
      return !!Number(state.currentTariff?.parent_id);
    },
    isCurrentTariffHasDependedRestrictions(state) {
      return !!Number(state.currentTariff?.dependent_restrictions?.parent_plan_id);
    },
    isDynamicPricesModeEnabled(state) {
      return [PriceAndRestrictionsService.modeDynamicPrice, PriceAndRestrictionsService.modeRestrictionsWithDynamicPrices].includes(state.mode);
    },
    parentUsesRmsPricing(state, getters, rootState) {
      return PriceAndRestrictionsService.parentPlanUsesRmsPricing(
        rootState.hotel?.rplansByIds,
        state.currentTariff?.parent_id,
      );
    },
    /** Есть ли в отеле категории с типом ценообразования "Наценки". */
    hasExtraChargesCategories(state, getters, rootState) {
      return roomtypesHaveExtraChargesCategory(rootState.hotelRoom?.roomtypes);
    },
    /** Нужен ли справочник возрастов детей для подписей в tooltip/table. */
    needsHotelChildrenAgesLabels(state, getters, rootState) {
      return roomtypesNeedHotelChildrenAgesLabels(rootState.hotelRoom?.roomtypes);
    },
    parentPriceModification(state) {
      if (Number(state.currentTariff?.parent_id)) {
        if (Number(state?.currentTariff?.discount_type) === PriceAndRestrictionsService.tariffDiscountTypePercent) {
          return `*${Math.abs(
            (Math.abs(state.currentTariff.discount_amount) / 100) + (Number(state.currentTariff.discount_amount) > 0 ? 1 : -1),
          )}`;
        } if (Number(state?.currentTariff?.discount_type) === PriceAndRestrictionsService.tariffDiscountTypeCurrency) {
          return `+${state.currentTariff.discount_amount}`;
        }
      } return null;
    },
    hasCurrentTariffDefaultMinstayRestriction(state) {
      return state?.currentTariff?.has_default_restriction || false;
    },
    hasCurrentTariffSomeDependedRestrictions(state) {
      return !!Number(state.currentTariff?.dependent_restrictions?.parent_plan_id)
      && Object.keys(PriceAndRestrictionsService.restrictionTypeEnum).some(type => {
        return !Number(state.currentTariff?.dependent_restrictions?.[PriceAndRestrictionsService.getServerRestrictionTypeName(type)]);
      });
    },
    hasCurrentTariffEveryDependedRestrictions(state) {
      return Object.keys(PriceAndRestrictionsService.restrictionTypeEnum).every(type => {
        return Number(state.currentTariff?.dependent_restrictions?.[PriceAndRestrictionsService.getServerRestrictionTypeName(type)]);
      });
    },
    tableShellParts() {
      return resolveTableShellParts();
    },
    tableContentParts(state, getters) {
      return resolveTableContentPartsFromGetters(getters);
    },
    isTableShellReady(state) {
      return Boolean(state.partsLoadState.baseLoaded)
        && (state.pricesCalendarModel?.calendar?.length > 0);
    },
    isTableContentPending(state, getters) {
      return isPartsPending(getters.tableContentParts, state.partsLoadState);
    },
  },
};
