import ServiceEntityService from "@/services/entities/service";

export default {
  namespaced: true,
  state: {
    additionalServices: [],
    servicesReady: false,
    images: {},
    imagesReady: false,
    prices: null,
    pricesReady: false,
  },
  mutations: {
    setAdditionalServices(state, value) {
      state.additionalServices = value;
    },
    setImages(state, value) {
      state.images = value;
    },
    setPrices(state, value) {
      state.prices = value;
    },
    setImagesReadyStatus(state, value) {
      state.imagesReady = Boolean(value);
    },
    setPricesReadyStatus(state, value) {
      state.pricesReady = Boolean(value);
    },
    setServicesLoadingStatus(state, value) {
      state.servicesReady = !!value.servicesReady;
    },
  },
  actions: {
    async getAdditionalServices({ state, commit }) {
      if (!state.servicesReady) {
        const servicesModel = await ServiceEntityService.getAll();

        commit("setServicesLoadingStatus", { servicesReady: true });
        commit("setAdditionalServices", servicesModel);
      }
    },
    async getImages({ state, commit }) {
      if (!state.imagesReady) {
        commit("setImages", await ServiceEntityService.getImages());
        commit("setImagesReadyStatus", true);
      }
    },
    async getPrices({ state, commit }) {
      if (!state.pricesReady) {
        commit("setPrices", await ServiceEntityService.getPrices());

        if (state.prices) {
          commit("setPricesReadyStatus", true);
        }
      }
    },
  },
};
