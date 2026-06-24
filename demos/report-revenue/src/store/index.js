import { createStore } from "vuex";
import hotel from "./modules/hotel.js";
import hotelRoom from "./modules/hotel-room-demo";
import user from "./modules/user-demo";
import device from "./modules/device-demo";
import revenueReport from "./modules/reports/revenue";
import page from "./modules/page-demo";

export default createStore({
  modules: {
    hotel,
    hotelRoom,
    user,
    device,
    revenueReport,
    page,
  },
});
