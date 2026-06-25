import DemoHotelModel from "@/models/demo/hotel.js";
import HotelService from "@/services/hotel";

export default {
  state: new DemoHotelModel({}),
  namespaced: true,
  mutations: {
    setHotel(state, hotel) {
      Object.keys(hotel).forEach((key) => {
        if (key === "extra" && hotel.extra) {
          state.extra = { ...state.extra, ...hotel.extra };
        } else {
          state[key] = hotel[key];
        }
      });
    },
  },
  actions: {
    async getCurrentHotel({ commit }) {
      const response = await HotelService.getHotel();
      commit("setHotel", response);
    },
  },
};
