import CoreStatic from "@/services/core";
import DemoHotelModel from "@/models/demo/hotel.js";
import { DemoApi } from "@/config/demo-api";

export default class HotelService extends CoreStatic {
  static async getHotel() {
    const response = await this.http.get(DemoApi.hotel);
    return response?.hotel ? new DemoHotelModel(response.hotel) : new DemoHotelModel({});
  }
}
