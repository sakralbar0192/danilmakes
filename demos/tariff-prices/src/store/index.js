import { createStore } from "vuex";
import hotel from "./modules/hotel.js";
import hotelRoom from "./modules/hotel-room-demo";
import user from "./modules/user-demo";
import additionalServices from "./modules/additional-services-demo";
import device from "./modules/device-demo";
import tariffPricesAndRestrictions from "./modules/tariff/prices-and-restrictions";

export default createStore({
  modules: {
    hotel,
    hotelRoom,
    user,
    additionalServices,
    device,
    tariffPricesAndRestrictions,
  },
});
