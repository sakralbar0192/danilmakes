export default {
  namespaced: true,
  state: {
    id: 1,
    extra: {
      default_plan_mode: "combined",
      has_old_tariff_prices: false,
      is_readonly: false,
    },
  },
  getters: {
    getDefaultPlanMode(state) {
      return state.extra?.default_plan_mode || "combined";
    },
  },
};
