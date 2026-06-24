export default {
  namespaced: true,
  state: {
    additionalServices: [],
    servicesReady: false,
  },
  mutations: {
    setAdditionalServices(state, value) {
      state.additionalServices = value;
      state.servicesReady = true;
    },
  },
  actions: {
    async getAdditionalServices({ commit, state }) {
      if (state.servicesReady) return;
      const http = (await import("@/utils/http")).default;
      const response = await http.get("/service/get");
      commit("setAdditionalServices", response?.services || []);
    },
  },
};
