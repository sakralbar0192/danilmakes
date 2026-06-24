import http from "@/utils/http.js";
import OSF from "@/utils/object-structure-formatter";
import i18n from "@/plugins/i18n.js";
import { externalImage } from "@/utils/imgfn.js";
import FeedbackService from "@/services/feedback";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import UserService from "@/services/user";

// const defaultAvatar = localImage("default-user-avatar.jpg");
const defaultAvatar = "";
const defaultNumericLocale = "ru-RU";

const setStorageLocale = function (loc) {
  const oldLocale = localStorage.getItem("old_locale");
  if (oldLocale === loc) {
    return;
  }
  localStorage.setItem("old_locale", loc);
};

const getClearUser = function (opts = {}) {
  const a = {
    id: 0,
    deleted: null,
    is_admin: false,
    is_guest: false,
    hasRestrictedAccess: false,
    email: "",
    extra: {
      ota_payments_page_viewed: {},
      default_plan_mode: "combined",
      manager_report_filter: {
        reportKeyFigure: [],
        compareType: "none",
        aggregatedCurrent: [],
        choicesRoomtypes: [],
      },
      menu_favorites: [],
      menu_settings: {},
      start_page_url: "",
      contrast_colors: false,
      is_guest: false,
      is_housemaid: false,
      is_readonly: false,
      is_forecast_showed: false,
      rms_forecast_expanded: true, // показн/скрыт показ графика на страние тарифа
      competitor_analysis_settings: {
        adult_quantity: 0,
        day_quantity: 0,
        select_multi_categories: {},
        select_id_multi_categories: {},
        select_filter_categories: {},
        select_id_filter_categories: {},
      },
      duplicateSurveyDate: "",
      scenarios: [],
      has_old_planning: true,
      has_old_tariff_prices: false,
      show_tariff_prices_feedback: false,
      planning_days_length: 0,
      finance_feedback_state: FeedbackService.financeFeedbackStateEnum.hideAll, // Изначально выставляем hideAll, чтобы не мелькали ни диалог ни кнопка при первичной загрузке.
      // Данные для revenue отчета
      revenue_report_data: {
        filters: {
          periodOfStay: [],
          compare: [],
        },
      },
    },
    hotels: [],
    images: { avatar: "" },
    language: "RU",
    last_notifications_view_date: "",
    middlename: "",
    name: "",
    surname: "",
    username: "",
    notifications: [],
    one_time_password: null,
    roles: [],
    rooms: [],
    vats_providers: [],
    user_ready: false,
    user_loading: false,
    profile_name: "",
    locale: "",
    computed_user_locale: defaultNumericLocale,
    avatar: defaultAvatar,
  };
  Object.assign(a, opts);
  return a;
};

const recalculateComputedUserProperties = function (formattedUser) {
  let profileName = "";
  if (formattedUser.name) {
    profileName += formattedUser.name;
  }
  if (formattedUser.surname) {
    profileName += (profileName.length ? " " : "") + formattedUser.surname;
  }
  if (!formattedUser.extra.start_page_url) {
    formattedUser.extra.start_page_url = "/";
  }
  if (!profileName.length) {
    profileName = formattedUser.username;
  }
  if (!profileName.length) {
    profileName = formattedUser.email;
  }
  if (formattedUser.name && formattedUser.surname) {
    formattedUser.profile_name = profileName;
  }
  const newLocale = formattedUser.language.toLowerCase();
  if (formattedUser.language) {
    i18n.locale = newLocale;
    setStorageLocale(newLocale);
  }
  if (formattedUser.images.avatar) {
    formattedUser.avatar = externalImage(formattedUser.images.avatar);
  } else {
    formattedUser.avatar = defaultAvatar;
  }
  formattedUser.computed_numeric_locale = defaultNumericLocale;
};

export default {
  state: getClearUser(),
  namespaced: true,
  mutations: {
    setUserData(state, opts) {
      Object.assign(state, opts);
      recalculateComputedUserProperties(state);
    },

    setUserExtraData(state, opts) {
      Object.assign(state.extra, opts);
      recalculateComputedUserProperties(state);
    },

    setUser(state, opts) {
      const clearUser = getClearUser();
      const formattedUser = OSF.format(clearUser, opts.user);
      formattedUser.extra = OSF.format(clearUser.extra, formattedUser.extra, { deep: true });
      formattedUser.user_ready = true;
      // is_guest return true if user has investor role
      formattedUser.is_guest = formattedUser.extra.is_guest;
      formattedUser.user_loading = false;
      formattedUser.hasRestrictedAccess = formattedUser.is_guest || formattedUser.extra.is_housemaid;
      recalculateComputedUserProperties(formattedUser);
      Object.assign(state, formattedUser);
    },

    logout(state) {
      Object.assign(state, getClearUser({
        user_ready: true,
        user_loading: false,
      }));
    },
    updatePlanningVersion(state, newValue) {
      state.extra.has_old_planning = newValue;
    },
    updateTariffPricesVersion(state, hasOldTariffPrices) {
      state.extra.has_old_tariff_prices = hasOldTariffPrices;
    },
    setShowTariffPricesFeedback(state, value) {
      state.extra.show_tariff_prices_feedback = value;
    },
    updatePlanningDaysLength(state, newValue) {
      state.extra.planning_days_length = newValue;
    },
    setContrastColors(state, newValue) {
      state.extra.contrast_colors = newValue;
    },
  },
  actions: {
    async setCurrentUser({
      commit, state, dispatch,
    }, opts = {}) {
      if (state.user_ready || !opts.response || !opts.response.current_user || state.user_loading) {
        return state;
      }

      commit("setUserData", { user_loading: true });

      const user = opts.response.current_user ? opts.response.current_user : state;

      if (user.id !== 0) {
        commit("setUser", { user });
        return;
      }
      commit("logout");
    },
    async saveManagerUserFilter(st, data) {
      return await http.post("/users/save_manager_filter_user", data);
    },
    async updatePlanningVersion({ commit }, switchingDate) {
      const data = switchingDate ? { switch_date: switchingDate } : {};
      const response = await http.post("/users/switch_planning_version", data);
      if (response.result === "success") {
        commit("updatePlanningVersion", !!switchingDate);
      }
      return response;
    },
    async updateTariffPricesVersion({ commit }, toOld = false) {
      const data = toOld ? { switch_to_old: 1 } : {};
      const response = await http.post("/users/switchTariffPricesVersion", data);
      if (response.result === "success") {
        commit("updateTariffPricesVersion", toOld);
        commit("setShowTariffPricesFeedback", toOld);
      }
      return response;
    },
    async dismissTariffPricesFeedback({ commit }) {
      const response = await http.post("/users/dismissTariffPricesFeedback");
      if (response.result === "success") {
        commit("setShowTariffPricesFeedback", false);
      }
      return response;
    },
    async updatePlanningDaysLength({ commit }, daysLength) {
      const response = await http.post("/users/update_planning_days_length", { length: daysLength });
      if (response.result === "success") {
        commit("updatePlanningDaysLength", daysLength);
      }
    },
    async switchContrastColors({ commit }, contrastColors) {
      const response = await http.post("/users/contrast_switch");
      if (response.result === "success") {
        commit("setContrastColors", contrastColors);
        if (contrastColors) {
          UserService.applyContrastColors();
        } else {
          UserService.removeContrastColors();
        }
      }
    },
    async updateFinanceFeedbackExtra({ commit }, state) {
      const response = await FeedbackService.updateFinanceFeedbackState(state);

      if (response && response.result === "success") {
        commit("setUserExtraData", state);
      }

      return response;
    },
  },
  getters: {
    hasRole: (state) => role => {
      if (Array.isArray(state.roles)) {
        return state.roles.includes(role);
      }
      return false;
    },
    isOwnerOrAdmin: (state, getters) => {
      return getters.hasRole("hotel_owner") || getters.hasRole("hotel_admin");
    },
    // инвестор
    isGuest: (state, getters) => {
      return getters.hasRole("guest");
    },
    isDefaultUser: (state, getters) => {
      return !getters.hasRole("hotel_admin")
        && !getters.hasRole("guest")
        && !getters.hasRole("housemaid")
        && !getters.hasRole("hotel_owner")
        && !getters.hasRole("admin");
    },
    canAccessReferralProgram: (state, getters) => {
      return getters.isOwnerOrAdmin || getters.isGuest || getters.isDefaultUser;
    },
    isHousemaid: (state, getters) => {
      return getters.hasRole("housemaid");
    },
    isAdmin: (state, getters) => {
      return getters.hasRole("admin");
    },
    isHotelBookings: (state, getters) => {
      return getters.hasRole("hotel_bookings");
    },
    hasAccessToMarketing: (state) => {
      const marketingRoutes = ["/mailer", "/customer", "/social", "/sales/review"];

      return !marketingRoutes.every(route => state.extra.menu_settings[route]?.restricted);
    },
    hasAccessToSettings: (state) => {
      const settingsRoutes = ["/hotel/edit"];

      return !settingsRoutes.every(route => state.extra.menu_settings[route]?.restricted);
    },
    getDefaultPlanMode(state) {
      return state?.extra?.default_plan_mode || PriceAndRestrictionsService.modeDefaultPrice;
    },
    isOwner: (state) => {
      return state.roles.includes("hotel_owner");
    },
    hasAccessToGuestsBase: (state) => {
      return !state.extra.menu_settings["/customer"]?.restricted;
    },
  },
};
