import CoreStatic from "@/services/core";
import HotelModel from "@/models/hotel.js";
import OSF from "@/utils/object-structure-formatter.js";
import createFormDataFromObj from "@/utils/form-data";

export default class HotelService extends CoreStatic {
  static isDev = false;

  static get_local_post_prod = this.isDev ? "get" : "post";

  static url = "/hotel/";

  static async getHotel() {
    const response = await this.http.get("/hotel/get");

    const selectItemsData = response && response.form ? response.form : {};

    return response && response.hotel ? new HotelModel({
      ...response.hotel,
      selectItemsData,
    }) : new HotelModel({});
  }

  static async getSelectItems() {
    const response = await this.http.get("/hotel/get");

    return response && response.form ? response.form : {};
  }

  static async updateHotel(data) {
    // formData используется, так как необходимо отправить изображение-логотип в бинарном виде
    const formData = createFormDataFromObj(data);

    return await this.http.post("/hotel/update", formData);
  }

  static async updateDescription(data) {
    // Метод нужен для сохранения описания и изображений отеля. Ввиду особенностей серверного кода для сохранения изображений необходимо выполнить три запроса и один для сохранения описания, если оно было передано
    if (data.hasOwnProperty("description")) {
      const descriptionFormData = new FormData();
      descriptionFormData.append("description", data.description);
      const descriptionResponse = await this.http.post("/hotel/edit_description", descriptionFormData);

      if (descriptionResponse.result !== "success") return descriptionResponse;
    }
    // логика для удаления фото (если они были удалены)
    if (data?.removedImages?.length) {
      const removedFormData = new FormData();
      data.removedImages.forEach((el, index) => {
        removedFormData.append(`delete[${index}]`, el);
      }, {});
      const removedResponse = await this.http.post("/hotel/delete_photo", removedFormData);

      if (removedResponse.result !== "success") return removedResponse;
    }

    let addedImages = [];
    // логика для добавления новых фото
    if (data?.images?.length && data.images.find(img => isNaN(img.id))) {
      const addedFormData = new FormData();
      data.images.forEach((el, index) => {
        addedFormData.append(
          `images[${index}]`,
          isNaN(el.id)
            ? el?.binareFile
            : el?.id,
        );
      });
      const addedResponse = await this.http.post("/hotel/store_photo", addedFormData);
      if (addedResponse.result !== "success") return addedResponse;
      addedImages = addedResponse?.data?.result || [];
    }

    // логика для установления правильного порядка фото
    // Порядок мог быть изменен либо вручную, либо посредством добавления нового изображения с последующим изменением его ордера
    // Для того, чтобы на сервере порядок соответствовал порядку на фронте после сохранения нужно отправить бэку верный порядок после любых изменений
    const orderedFormData = new FormData();
    data.images.forEach((el, index) => {
      if (isNaN(el.id)) {
        // Если у изображения нет  числового идентификатора - значит это только что добавленное изображение и его числовой идентификатор нужно искать в addedImages
        el.id = addedImages[index]?.id;
      }
      if (!isNaN(el.id)) orderedFormData.append(`images[${index}]`, el.id);
    });
    const orderedResponse = await this.http.post("/hotel/edit_photo_order", orderedFormData);

    if (data.hasOwnProperty("description")) orderedResponse.description = data.description;
    return {
      ...orderedResponse,
      images: data.images,
    };
  }

  static async deleteLogo() {
    return this.http.post("/hotel/delete_logo", { id: "logo" });
  }

  // Изменение статуса включения модуля уборки Tariff
  static async changeCleaningStatus(status) {
    return await this.http.post("/hotel/set_cleaning_status", { status });
  }

  // Скрытие статусов 'На проверке' и 'Проверено, чисто'
  static async changeCleaningStatusLimit(status) {
    return await this.http.post("/hotel/set_cleaning_status_limit", { status });
  }

  // Автоматическое изменение статуса уборки
  static async setAutoCleaning(status) {
    return await this.http.post("/hotel/setAutoCleaningStatus", { status });
  }

  static async getPlans() {
    let response = await this.http.get("/tariff/get");

    if (!response) {
      response = {};
    }
    if (!Array.isArray(response.plans)) {
      response.plans = [];
    }

    return {
      rplans: response.plans,
      rplansByIds: OSF.buildMap({ array: response.plans }),
    };
  }

  static async getDescription() {
    const response = await this.http.get("/hotel/get_description_and_photos");
    if (response?.hotel) {
      return new HotelModel({
        ...response.hotel,
        images: response?.images || [],
      });
    }
    return new HotelModel({});
  }

  static async updateLabels(labels) {
    const response = await this.http.post("/hotel/saveLabels", { labels });
    return response;
  }

  static async hasExperimentByCode(experimentCode) {
    const response = await this.http.get("url/hotel/hasExperimentByCode", { code: experimentCode });

    if (response && response.hotelHasExperiment) {
      return response.hotelHasExperiment;
    }
    return false;
  }

  static async changeHotelProductType(value) {
    return await this.http.post("/hotel/transfer_client", { value });
  }

  static async validateHotelProductType(value) {
    if (this.isDev) await this.delay();
    return await this.http.post("/hotel/validate_transfer_client", { value });
  }
}
