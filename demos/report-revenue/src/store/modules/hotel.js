import HotelModel from "@/models/hotel.js";
import HotelService from "@/services/hotel";

export default {
  state: new HotelModel({}),
  namespaced: true,
  mutations: {
    setHotel(state, hotel) {
      Object.keys(hotel).forEach(key => {
        if (key === "extra" && hotel.extra) {
          state.extra = {
            ...state.extra,
            ...hotel.extra,
          };
        } else {
          state[key] = hotel[key];
        }
      });
    },
    setHotelData(state, data) {
      Object.assign(state, data);
    },
    setHotelExtra(state, extra) {
      state.extra = {
        ...state.extra,
        ...extra,
      };
    },
    logout(state) {
      Object.assign(state, new HotelModel({}));
    },
    updateLabels(state, labels) {
      state.extra.labels_names = labels;
    },
  },
  actions: {
    async getCurrentHotel({
      commit, dispatch, state,
    }) {
      const prevId = state.id;
      const response = await HotelService.getHotel();

      if (prevId && response.id && prevId !== response.id) {
        // no-op in demo
      }
      commit("setHotel", response);
    },
    async getSelectItems({ commit }) {
      const response = await HotelService.getSelectItems();
      commit("setHotelData", { selectItemsData: response });
    },
    async updateCurrentHotel({ commit }, data) {
      const response = await HotelService.updateHotel(data);

      if (response && response.result === "success") {
        const {
          stars,
          type,
          logo,
          accreditation_required,
          ...hotelData
        } = data;

        const extra = {
          stars,
          type,
        };

        commit("setHotel", hotelData);
        commit("setHotelExtra", extra);
      }

      return response;
    },
    async updateDescription({ commit, state }, data) {
      const response = await HotelService.updateDescription(data);
      if (response.result === "success") {
        const newData = {
          images: {
            logo: state.images.logo,
            ...response.images,
          },
        };
        if (response.hasOwnProperty("description")) newData.description = response.description;
        commit("setHotelData", newData);
      }

      return response;
    },

    async deleteLogo({ commit }) {
      const response = await HotelService.deleteLogo();

      if (response && response.result === "success") {
        commit("setHotelData", { hasDefaultLogo: true });
      }

      return response;
    },
    // Изменение статуса включения модуля уборки Bnovo
    async changeCleaningStatus({ commit }, status) {
      const response = await HotelService.changeCleaningStatus(status);

      if (response && response.result === "success") {
        commit("setHotelExtra", { set_cleaning_status: status });
      }

      return response;
    },
    // Скрытие статусов 'На проверке' и 'Проверено, чисто'
    async changeCleaningStatusLimit({ commit }, status) {
      const response = await HotelService.changeCleaningStatusLimit(status);

      if (response && response.result === "success") {
        commit("setHotelExtra", { set_cleaning_status_limit: status });
      }

      return response;
    },
    // Автоматическое изменение статуса уборки
    async setAutoCleaning({ commit }, status) {
      const response = await HotelService.setAutoCleaning(status);

      if (response && response.result === "success") {
        commit("setHotelExtra", { auto_cleaning_status_enabled: status });
      }

      return response;
    },
    async getPlans({
      commit,
      state,
    }) {
      if (state.rplansLoading || state.rplansReady) {
        return state.rplans;
      }
      commit("setHotelData", { rplansLoading: true });

      const {
        rplans,
        rplansByIds,
      } = await HotelService.getPlans();

      commit("setHotelData", {
        rplans,
        rplansByIds,
        rplansReady: true,
        rplansLoading: false,
      });

      return rplansByIds;
    },
    async updatePlans({ commit, dispatch }) {
      commit("setHotelData", { rplansReady: false, rplansLoading: false });
      return dispatch("getPlans");
    },
    async updateLabels({ commit }, labels) {
      const resp = await HotelService.updateLabels(labels);
      if (resp.result === "success") {
        commit("updateLabels", labels);
      }
      return resp;
    },
    // Получение описания и изображений отеля
    async getDescription({ commit }) {
      const hotel = await HotelService.getDescription();
      commit("setHotelData", {
        images: hotel.images,
        description: hotel.description,
      });
    },
  },
  getters: {
    plansWithClosedDependentRestrictions(state) {
      return state.rplans.filter(plan => !Number(plan.dependent_restrictions?.closed || ""));
    },
    hasBnovoChannelManagerEnabled(state) {
      return Number(state.extra.beta_channel) === 1;
    },
    labels(state){
      return structuredClone(state.extra.labels_names);
    },
  },
};
