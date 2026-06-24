import ServiceModel from "@/models/service";
import CoreService from "@/services/core";
import i18n from "@/plugins/i18n";

// Сервис для взаимодействия с сущностью - Доп.услуга
export default class ServiceEntityService extends CoreService {
  static async getImages() {
    const response = await this.http.get("/service/getImages");

    return response?.images ?? {};
  }

  static async getPrices() {
    const response = await this.http.get("/service/getPrices");

    return response?.prices;
  }

  /**
   * Метод получения всех доп услуг
   * @returns ServiceModel[]
   */
  static async getAll() {
    const response = await this.http.get("/service/get");
    return (response?.services || []).map(service => new ServiceModel(service));
  }

  static getServiceFine() {
    return new ServiceModel({
      id: "999",
      hotel_id: "0",
      name: "Штраф",
      price: "0.00",
      price_type: "service",
      type: "other",
      board_type: "",
      payment_object: null,
      daily: "0",
      is_package: "0",
      apply_after_arrival: "0",
      apply_on_departure: "0",
      max_quantity: "0",
      max_quantity_enabled: "0",
      provider_service_id: null,
      provider_service_settings: [],
      prices: [],
      package: [],
    });
  }
}
