import Vue from "@/shims/vue2-compat";
import http from "@/utils/http";
import i18n from "@/plugins/i18n";
import wordCase from "@/utils/language";
import HotelModel from "./hotel";

const Roomtype = {
  TYPE_ROOM: 1,
  TYPE_APARTMENT: 2,
  TYPE_BED: 3,
  TYPE_LIVING_ROOM: 4,
  TYPE_SERVICE: 5,
  TYPE_OTHER_LIVING: 6,

  SUCCESS_SAVE_MESSAGE: i18n.t("Данные успешно сохранены."),
  ERROR_SAVE_MESSAGE: i18n.t("При сохранении возникли ошибки."),
  FAILED_RESPONSE_STATUS: "error",
  SUCCESS_RESPONSE_STATUS: "success",
  PERMISSION_RESPONSE_STATUS: "permission",

  DEFAULT_SELECTED_TYPE: "1",

  SERVICE_TYPE_STRING: i18n.t("Услуга"),
  BED_IN_ROOM_TYPE_STRING: i18n.t("Кровать в номере"),
  PRICING_TYPES: {
    extraCharges: i18n.t("Наценки"),
    placements: i18n.t("Размещение"),
  },

  DEFAULT_ROOMTYPES_VALUES: {
    1: i18n.t("Номер"),
    2: i18n.t("Квартира"),
    3: i18n.t("Кровать в номере"),
    4: i18n.t("Комната"),
    5: i18n.t("Услуга"),
    6: i18n.t("Другое проживание"),
  },
  DEFAULT_BEDS_TYPES: [
    i18n.t("основное место"),
    i18n.t("доп. место"),
    i18n.t("без места"),
  ],
  DEFAULT_BEDS_VARIANTS: [
    i18n.t("Не указано"),
    i18n.t("Одна большая кровать"),
    i18n.t("Две раздельные кровати"),
    i18n.t("На выбор гостя"),
  ],
  DEFAULT_BED_VARIANT: 0,
  MAIN_BEDS_TYPE_INDEX: 0,
  ADDITIONAL_BEDS_TYPE_INDEX: 1,
  WITHOUT_PLACE_TYPE_INDEX: 2,

  DEFAULT_ROOM_CAPACITY: {
    min_adults: 1,
    max_adults: 1,
    main_beds: 1,
    extra_beds: 0,
  },
  VIRTUAL_AGE_ID: 0,
  MIN_PEOPLE_LIMIT: 1,
  serviceTypeIndex: 5,
  bedInRoomTypeIndex: 3,

  categoryId: null,
  savedChildrenAges: {},

  OTA_EDIT_PAGES: {
    "Ozon Travel": "edit_ota",
    "Ростелеком Travel Tech": "edit_ota",
  },

  defaultBedTypesExtraCharge() {
    return {
      people_count: this.MIN_PEOPLE_LIMIT,
      price: 0,
    };
  },

  getClearRoomtype() {
    return {
      id: "0",
      hotel_id: 0,
      parent_id: 0,
      name: "",
      type: 0,
      adults: 0,
      children: 0,
      children_age: 0,
      price: "0.00",
      board: 0,
      code: "",
      description: "",
      sort_order: 0,
      country: "",
      city: "",
      address: "",
      city_eng: "",
      address_eng: "",
      postcode: "",
      geo_data: {},
      provider_roomtype_settings: [],
      provider_roomtype_id: null,
      deleted: 0,
      subrooms: [],
      rooms: [],
      extra: {
        excluded: false,
        exclude_for_report: false,
      },
    };
  },

  defaultAddRoomtypesData() {
    return {
      room_types_values: this.DEFAULT_ROOMTYPES_VALUES,
      children_ages: {},
      beds_types: this.DEFAULT_BEDS_TYPES,
      beds: {},
      configuredExtraCharges: {},
      people: this.DEFAULT_ROOM_CAPACITY,
      hotelType: HotelModel.HOTEL_TYPE_HOTEL,
      hotelLanguage: "RU",
      categoryType: this.DEFAULT_SELECTED_TYPE,
      categoryName: "",
      categoryPrice: "",
      categoryDescription: "",
      mayChangePricingType: true,
      selectedPricingType: this.PRICING_TYPES.extraCharges,
      selectedBedVariant: this.DEFAULT_BED_VARIANT,
      adultsCount: this.MIN_PEOPLE_LIMIT,
      convertedChildrenAges: {},
      displayedExtraChargeInfo: [],
      childrenAgesWithoutPlaces: [],
      setGuests: false,
      excluded: false,
      isTravelTaxable: "1",
    };
  },

  getOtaEditPage(ota) {
    return this.OTA_EDIT_PAGES[ota] ? this.OTA_EDIT_PAGES[ota] : "edit_channel";
  },

  async postAddData(data) {
    const response = await http.post("/roomTypes/save", data);

    if (response && response.result === this.SUCCESS_RESPONSE_STATUS) {
      Vue.prototype.$dialog.toast({
        content: this.SUCCESS_SAVE_MESSAGE,
        type: "success",
      });
      return true;
    }

    if (response && response.result === this.PERMISSION_RESPONSE_STATUS) {
      // обрабатывается в глобальном интерцепторе http
      return false;
    }

    Vue.prototype.$dialog.toast({
      content: this.ERROR_SAVE_MESSAGE,
      type: "error",
    });

    return false;
  },

  async postEditData(data) {
    const response = await http.post(`/roomTypes/update/${this.categoryId}`, {
      ...data,
      room_type_id: this.categoryId,
    });

    if (response && response.result === this.SUCCESS_RESPONSE_STATUS) {
      Vue.prototype.$dialog.toast({
        content: this.SUCCESS_SAVE_MESSAGE,
        type: "success",
      });
    } else if (response?.data?.check_external_data?.[1]?.[0]) {
      const validationErrorData = response.data.check_external_data[1][0];

      const subroomsValidationErrorText = Object.values(validationErrorData?.subrooms || {}).length
        ? `${i18n.t("Нельзя изменить количество основных мест на")} ${validationErrorData.new_main_beds}, ${i18n.t("так как")} ${
          Object.values(validationErrorData.subrooms).map(item => {
            return `${i18n.t("размещение на")} <b>${item.adults}</b> ${
              wordCase(Number(item.adults), i18n.t("взрослого"), i18n.t("взрослых"), i18n.t("взрослых"))
            } ${i18n.t("сопоставлено в")} ${
              wordCase(Object.values(item.ota_id).length, i18n.t("канале"), i18n.t("каналах"), i18n.t("каналах"))
            } ${
              Object.entries(item.ota_id).map(([key, value]) => `<a class="d-inline" href="/sales/${this.getOtaEditPage(value)}/${key}">${value}</a>`).join(", ")
            }`;
          })
        }. ${i18n.t("Внесите изменения в настройки каналов продаж, выбрав в сопоставлении другое размещение")}`
        : "";

      const extraChargesErrorText = Object.values(validationErrorData?.children_ages || {}).length
        ? `${i18n.t("Нельзя удалить наценку за размещение")} ${
          Object.entries(validationErrorData.children_ages).map(([key, item]) => {
            return `${String(key) === "0" ? `<b>${i18n.t("взрослого")}</b>` : `${i18n.t("ребенка")} <b>${item.min_age}-${item.max_age} ${wordCase(Number(item.max_age), i18n.t("года"), i18n.t("лет"), i18n.t("лет"))}</b>`}, ${i18n.t("так как она сопоставлена в")} ${
              wordCase(Object.values(item.ota_id).length, i18n.t("канале"), i18n.t("каналах"), i18n.t("каналах"))
            } ${
              Object.entries(item.ota_id).map(([channelKey, value]) => `<a class="d-inline" href="/sales/${this.getOtaEditPage(value)}/${channelKey}">${value}</a>`).join(", ")
            }`;
          }).join(", ")
        }. ${i18n.t("Внесите изменения в настройки каналов продаж, выбрав в сопоставлении другое размещение")}.`
        : "";

      const childrenAgesCountErrorText = Object.values(validationErrorData?.children_ages_count || {}).length
        ? `${i18n.t("Нельзя изменить максимальное количество человек в наценке за размещение")} ${
          Object.entries(validationErrorData.children_ages_count).map(([key, item]) => {
            return `${String(key) === "0" ? `<b>${i18n.t("взрослого")}</b>` : `${i18n.t("ребенка")} <b>${item.min_age}-${item.max_age} ${wordCase(Number(item.max_age), i18n.t("года"), i18n.t("лет"), i18n.t("лет"))}</b>`}, ${i18n.t("так как она сопоставлена в")} ${
              wordCase(Object.values(item.ota_id).length, i18n.t("канале"), i18n.t("каналах"), i18n.t("каналах"))
            } ${
              Object.entries(item.ota_id).map(([channelKey, value]) => `<a class="d-inline" href="/sales/${this.getOtaEditPage(value)}/${channelKey}">${value}</a>`).join(", ")
            }`;
          }).join(", ")
        }. ${i18n.t("Внесите изменения в настройки каналов продаж, выбрав в сопоставлении другое размещение.")}`
        : "";

      const otelloSubroomsErrorText = Object.values(validationErrorData?.otello_subrooms || {}).length
        ? `${
          Object.keys(validationErrorData?.otello_subrooms.roomtype_names).length > 1
            ? i18n.t("Варианты размещения")
            : i18n.t("Вариант размещения")
        } ${
          Object.values(validationErrorData?.otello_subrooms.roomtype_names).map(name => `"${name}"`).join(", ")
        } ${
          i18n.t("категории")
        } ${
          Object.keys(validationErrorData?.otello_subrooms.roomtype_names).length > 1
            ? i18n.t("синхронизированы с")
            : i18n.t("синхронизирован с")
        } ${
          validationErrorData?.otello_subrooms.ota_full_name || "Otello"
        }${
          ` (${validationErrorData?.otello_subrooms.ota_hotel_id})` || ""
        } <p>${
          i18n.t("Уберите синхронизацию по вариантам размещения в указанной системе. После чего вернитесь к настройкам категории.")
        } <a target="_blank" href="https://help.bnovo.ru/knowledgebase/otello-connection/#selection1">${
          i18n.t("Пошаговая инструкция")
        }</a></p>`
        : "";

      const validationErrorText = `
        ${otelloSubroomsErrorText.length ? `<p>${otelloSubroomsErrorText}</p>` : ""}
        ${subroomsValidationErrorText.length ? `<p>${subroomsValidationErrorText}</p>` : ""}
        ${extraChargesErrorText.length ? `<p>${extraChargesErrorText}</p>` : ""}
        ${childrenAgesCountErrorText.length ? `<p>${childrenAgesCountErrorText}</p>` : ""}
      `;

      Vue.prototype.$dialog.message({
        content: validationErrorText,
        title: otelloSubroomsErrorText
          ? i18n.t("Смена типа ценообразования невозможна")
          : i18n.t("Изменение категории"),
        textAlign: "left",
        size: "large",
        buttons: otelloSubroomsErrorText
          ? [
            {
              text: i18n.t("Перейти к списку каналов"),
              callback: () => { window.location.href = "/sales"; },
              closeOnHandler: true,
            },
            {
              type: "outlined",
              text: i18n.t("Отменить"),
              color: "secondary",
              closeOnHandler: true,
              outlined: true,
            },
          ]
          : [
            {
              text: i18n.t("Ok"),
              closeOnHandler: true,
            },
          ],
      });
    } else if (response && response.data && response.data.bed_variant && response.data.bed_variant[1] && response.data.bed_variant[1][0]) {
      Vue.prototype.$dialog.toast({
        content: i18n.t("Невозможно изменить тип кроватей, так как в категории есть бронирования"),
        type: "error",
      });
    } else if (response && response.data && response.data.type && response.data.type[0] === "check_has_virtuals") {
      Vue.prototype.$dialog.message({
        content: i18n.t("Для данной категории созданы варианты размещения с указанием взрослых/детей. Укажите количество взрослых для данной категории или удалите созданные варианты размещения"),
        title: i18n.t("Изменение категории"),
        type: "error",
        textAlign: "left",
        size: "medium",
        buttons: [
          {
            text: i18n.t("OK"),
            color: "primary",
            closeOnHandler: true,
          },
        ],
      });
    } else if (response && response.result === this.PERMISSION_RESPONSE_STATUS) {
      // обрабатывается в глобальном интерцепторе http
    } else {
      Vue.prototype.$dialog.toast({
        content: response?.error ?? this.ERROR_SAVE_MESSAGE,
        type: "error",
      });
    }
  },

  async fetchEditRoomtypesData(id) {
    // TODO: убрать из респонза hotel, он уже есть в store
    // TODO: перенести в appstate справочники
    const response = await http.get(`/roomTypes/get/${id}`);
    return this.prepareResultData(response);
  },

  async fetchAddRoomtypesData() {
    // TODO: убрать из респонза hotel, он уже есть в store
    // TODO: перенести в appstate справочники
    const response = await http.get("/roomTypes/getHotelData");
    return this.prepareResultData(response);
  },

  prepareResultData(response) {
    const resultData = this.defaultAddRoomtypesData();
    if (response) {
      Object.assign(resultData, response);

      if (!resultData.room_types_values) {
        resultData.room_types_values = this.DEFAULT_ROOMTYPES_VALUES;
      }
      if (!resultData.children_ages) {
        resultData.children_ages = {};
      }
      if (!resultData.people) {
        resultData.people = this.DEFAULT_ROOM_CAPACITY;
      }

      // TODO: убрать, использовать ключ из appstateMixin hotel
      if (resultData.hotel) {
        resultData.hotelType = resultData.hotel.extra.type ? resultData.hotel.extra.type : HotelModel.HOTEL_TYPE_HOTEL;
        if (resultData.hotel.language) {
          resultData.hotelLanguage = resultData.hotel.language;
        }
      }

      if (resultData.room_type) {
        this.categoryId = resultData.room_type.id;

        // get address
        if (resultData.room_type.geo_data) {
          resultData.addressComponents = {
            latitude: resultData.room_type.geo_data.x ? Number(resultData.room_type.geo_data.x) : 0,
            longitude: resultData.room_type.geo_data.y ? Number(resultData.room_type.geo_data.y) : 0,
            country: resultData.room_type.country ? resultData.room_type.country : "",
            postcode: resultData.room_type.postcode ? resultData.room_type.postcode : "",
            city: resultData.room_type.city ? resultData.room_type.city : "",
            latCity: resultData.room_type.city_eng ? resultData.room_type.city_eng : "",
            address: resultData.room_type.address ? resultData.room_type.address : "",
            latAddress: resultData.room_type.address_eng ? resultData.room_type.address_eng : "",
            dadata: resultData.room_type.dadata ? resultData.room_type.dadata : null,
          };
        } else if (resultData.hotel) {
          resultData.addressComponents = {
            latitude: (resultData.hotel.geo_data && resultData.hotel.geo_data.x) ? Number(resultData.hotel.geo_data.x) : 0,
            longitude: (resultData.hotel.geo_data && resultData.hotel.geo_data.y) ? Number(resultData.hotel.geo_data.y) : 0,
            country: resultData.hotel.country ? resultData.hotel.country : "",
            postcode: resultData.hotel.postcode ? resultData.hotel.postcode : "",
            city: resultData.hotel.city ? resultData.hotel.city : "",
            latCity: resultData.hotel.city_eng ? resultData.hotel.city_eng : "",
            address: resultData.hotel.address ? resultData.hotel.address : "",
            latAddress: resultData.hotel.address_eng ? resultData.hotel.address_eng : "",
            dadata: resultData.hotel.dadata ? resultData.hotel.dadata : "",
          };
        }

        resultData.selectedBedVariant = resultData.room_type.bed_variant || this.DEFAULT_BED_VARIANT;
        resultData.categoryType = resultData.room_type.type;
        resultData.categoryName = resultData.room_type.name;
        resultData.categoryPrice = resultData.room_type.price;
        resultData.categoryDescription = resultData.room_type.description ? resultData.room_type.description : "";
        resultData.adultsCount = resultData.room_type.adults;
        resultData.isTravelTaxable = resultData.room_type.is_travel_taxable;

        if (resultData.room_type.extra) {
          if ((resultData.room_type.extra.people && Object.entries(resultData.room_type.extra.people).length)) {
            resultData.people = resultData.room_type.extra.people;
            resultData.mayChangePricingType = false;
            resultData.selectedPricingType = this.PRICING_TYPES.extraCharges;
          } else if ("enable_extra_charges" in resultData && !resultData.enable_extra_charges) {
            // TODO enable_extra_charges - это свойство отеля, нужно использовать его
            resultData.mayChangePricingType = false;
            resultData.selectedPricingType = this.PRICING_TYPES.placements;
          } else {
            resultData.mayChangePricingType = true;
            resultData.selectedPricingType = this.PRICING_TYPES.placements;
          }

          if (resultData.room_type.extra.beds) {
            resultData.beds = resultData.room_type.extra.beds;
          }
          if (resultData.room_type.extra.set_guests || resultData.room_type.adults) {
            resultData.setGuests = Number(resultData.room_type.extra.set_guests) || Number(resultData.room_type.adults);
          }
          if (resultData.room_type.extra.excluded) {
            resultData.excluded = resultData.room_type.extra.excluded;
          }
          if (resultData.room_type.extra.children_ages) {
            this.savedChildrenAges = resultData.room_type.extra.children_ages;
          }
        }
      } else if (("enable_extra_charges" in resultData && !resultData.enable_extra_charges)) {
        // TODO enable_extra_charges - это свойство отеля, нужно использовать его
        resultData.mayChangePricingType = false;
        resultData.selectedPricingType = this.PRICING_TYPES.placements;
      }
    }

    const roomTypesValue = [];
    Object.entries(resultData.room_types_values).forEach(([key, value]) => {
      if (value === this.SERVICE_TYPE_STRING) {
        this.serviceTypeIndex = Number(key);
      }
      if (value === this.BED_IN_ROOM_TYPE_STRING) {
        this.bedInRoomTypeIndex = Number(key);
      }
      roomTypesValue.push({
        value: key,
        text: value,
      });
    });

    resultData.room_types_values = roomTypesValue;

    const [convertedChildrenAges, childrenAgesWithoutPlaces] = this.createConvertedChildrenAges(
      resultData.children_ages,
      resultData.beds,
    );
    resultData.convertedChildrenAges = convertedChildrenAges;
    resultData.childrenAgesWithoutPlaces = childrenAgesWithoutPlaces;

    resultData.displayedExtraChargeInfo = this.createDisplayedExtraChargeInfo(
      resultData.children_ages,
      resultData.convertedChildrenAges,
      resultData.beds_types,
      resultData.people,
      resultData.beds,
    );

    return resultData;
  },

  createConvertedChildrenAges(childrenAges, beds) {
    const convertedChildrenAges = {};
    const childrenAgesWithoutPlaces = [];
    Object.entries(childrenAges).forEach(([key, value]) => {
      if (value.beds_types) {
        const currentBedsTypes = value.beds_types.split("");
        currentBedsTypes.forEach((bedType, index) => {
          if (Number(bedType) === 1) {
            const savedChildrenAgeExist = (this.savedChildrenAges[key] !== undefined && this.savedChildrenAges[key][index] !== undefined);

            convertedChildrenAges[key] = {
              ...convertedChildrenAges[key],
              [index]: {
                price: savedChildrenAgeExist ? this.savedChildrenAges[key][index].price : this.defaultBedTypesExtraCharge().price,
                people_count: savedChildrenAgeExist ? this.savedChildrenAges[key][index].people_count : this.defaultBedTypesExtraCharge().people_count,
              },
            };

            if (index === this.WITHOUT_PLACE_TYPE_INDEX) {
              let checkedStatus = false;
              const bedEntry = beds?.[index];

              if (Array.isArray(bedEntry)) {
                checkedStatus = bedEntry.includes(`${key}`);
              } else if (bedEntry && typeof bedEntry === "object") {
                checkedStatus = Object.values(bedEntry).includes(`${key}`);
              }

              childrenAgesWithoutPlaces.push({
                ...value,
                childrenAgeId: key,
                bedsTypesId: bedType,
                checked: checkedStatus,
              });
            }
          }
        });
      }
    });

    return [convertedChildrenAges, childrenAgesWithoutPlaces];
  },

  syncConvertedChildrenAges(displayedExtraChargeInfo, convertedChildrenAges) {
    const newConvertedChildrenAges = {};

    Object.entries(convertedChildrenAges).forEach(([key, value]) => {
      Object.entries(value).forEach(([innerKey, innerValue]) => {
        const correspondingDisplayedElement = displayedExtraChargeInfo.find(item => {
          return item.childrenAgeId === key && item.bedsTypesId === innerKey;
        });

        if (correspondingDisplayedElement) {
          newConvertedChildrenAges[key] = {
            ...newConvertedChildrenAges[key],
            [innerKey]: {
              ...innerValue,
              people_count: correspondingDisplayedElement.people_count,
              price: correspondingDisplayedElement.price,
            },
          };
        } else {
          newConvertedChildrenAges[key] = { ...value };
        }
      });
    });

    return newConvertedChildrenAges;
  },

  createDisplayedExtraChargeInfo(childrenAges, convertedChildrenAges, bedsTypes, roomCapacity, beds = [], oldDisplayedExtraChargeInfo = []) {
    const displayedExtraChargeInfo = [];
    Object.entries(convertedChildrenAges).forEach(([key, value]) => {
      Object.entries(value).forEach(([innerKey, innerValue]) => {
        let checkedStatus = false;
        let alternativeModeEnabled = false;
        let oldDisplayedElement = null;
        let peopleCount = innerValue.people_count;
        let price = innerValue.price;
        const maxLimit = this.getMaxLimit(innerKey, roomCapacity);
        let displayedExtraChargeInfoItem = {
          ...childrenAges[key],
          ...innerValue,
          childrenAgeId: key,
          bedsTypesId: innerKey,
          bedTypeString: bedsTypes[innerKey],
        };

        if (oldDisplayedExtraChargeInfo.length) {
          oldDisplayedElement = oldDisplayedExtraChargeInfo.find(item => {
            return item.childrenAgeId === key && item.bedsTypesId === innerKey;
          });

          if ((Number(innerKey) === this.MAIN_BEDS_TYPE_INDEX || Number(innerKey) === this.WITHOUT_PLACE_TYPE_INDEX) && oldDisplayedElement) {
            alternativeModeEnabled = oldDisplayedElement.alternativeModeEnabled;
          }
        } else if (Number(innerKey) === this.MAIN_BEDS_TYPE_INDEX && beds[innerKey] && beds[innerKey].includes(key)) {
          alternativeModeEnabled = true;
          price = "";
        }

        if (alternativeModeEnabled) {
          checkedStatus = true;
        }

        if (!checkedStatus) {
          if (oldDisplayedElement) {
            checkedStatus = oldDisplayedElement.checked;
          } else if (this.savedChildrenAges[key] && this.savedChildrenAges[key][innerKey]) {
            checkedStatus = true;
          }
        }

        if (oldDisplayedElement) {
          price = oldDisplayedElement.price;
          peopleCount = oldDisplayedElement.people_count;
          if (peopleCount > maxLimit) {
            peopleCount = maxLimit;
          }
          if (peopleCount < this.MIN_PEOPLE_LIMIT) {
            peopleCount = this.MIN_PEOPLE_LIMIT;
          }
        }
        if (
          !oldDisplayedExtraChargeInfo.length
          && Number(innerKey) === this.WITHOUT_PLACE_TYPE_INDEX
          && checkedStatus
          && Number(price) === 0
        ) {
          alternativeModeEnabled = true;
        }

        displayedExtraChargeInfoItem = {
          ...displayedExtraChargeInfoItem,
          price,
          people_count: peopleCount,
          alternativeModeEnabled,
          checked: checkedStatus,
        };
        displayedExtraChargeInfo.push(displayedExtraChargeInfoItem);
      });
    });

    const filteredDisplayedExtraChargeInfo = displayedExtraChargeInfo.reduce((arr, item) => {
      if (Number(item.bedsTypesId) === this.MAIN_BEDS_TYPE_INDEX) {
        if (
          Number(roomCapacity.main_beds) > Number(roomCapacity.min_adults)
        ) {
          arr.push(item);
        }
      } else if (Number(item.bedsTypesId) === this.ADDITIONAL_BEDS_TYPE_INDEX) {
        if (Number(roomCapacity.extra_beds) >= this.MIN_PEOPLE_LIMIT) {
          arr.push(item);
        }
      } else {
        arr.push(item);
      }

      return arr;
    }, []);

    if (
      Number(roomCapacity.extra_beds) >= this.MIN_PEOPLE_LIMIT
      && Number(roomCapacity.main_beds) < Number(roomCapacity.max_adults)
    ) {
      const savedChildrenAgeExist = Boolean(
        this.savedChildrenAges[this.VIRTUAL_AGE_ID]
        && this.savedChildrenAges[this.VIRTUAL_AGE_ID][this.ADDITIONAL_BEDS_TYPE_INDEX],
      );

      let peopleCount = this.defaultBedTypesExtraCharge().people_count;
      const maxLimit = this.getMaxLimit(this.ADDITIONAL_BEDS_TYPE_INDEX, roomCapacity, true);
      if (savedChildrenAgeExist) {
        peopleCount = this.savedChildrenAges[this.VIRTUAL_AGE_ID][this.ADDITIONAL_BEDS_TYPE_INDEX].people_count;
        if (peopleCount > maxLimit) {
          peopleCount = maxLimit;
        }
        if (peopleCount < this.MIN_PEOPLE_LIMIT) {
          peopleCount = this.MIN_PEOPLE_LIMIT;
        }
      }

      let adultInAdditionalPlace = {
        people_count: peopleCount,
        price: savedChildrenAgeExist
          ? this.savedChildrenAges[this.VIRTUAL_AGE_ID][this.ADDITIONAL_BEDS_TYPE_INDEX].price
          : this.defaultBedTypesExtraCharge().price,
        childrenAgeId: this.VIRTUAL_AGE_ID,
        bedsTypesId: this.ADDITIONAL_BEDS_TYPE_INDEX,
        bedTypeString: bedsTypes[this.ADDITIONAL_BEDS_TYPE_INDEX],
        checked: savedChildrenAgeExist,
      };

      if (oldDisplayedExtraChargeInfo && oldDisplayedExtraChargeInfo.length) {
        const displayedAdultInAdditionalPlace = oldDisplayedExtraChargeInfo.find(item => {
          return Boolean(
            item.childrenAgeId === this.VIRTUAL_AGE_ID
            && item.bedsTypesId === this.ADDITIONAL_BEDS_TYPE_INDEX,
          );
        });

        if (displayedAdultInAdditionalPlace) {
          peopleCount = displayedAdultInAdditionalPlace.people_count;
          if (peopleCount > maxLimit) {
            peopleCount = maxLimit;
          }
          if (peopleCount < this.MIN_PEOPLE_LIMIT) {
            peopleCount = this.MIN_PEOPLE_LIMIT;
          }

          adultInAdditionalPlace = {
            ...adultInAdditionalPlace,
            people_count: peopleCount,
            price: displayedAdultInAdditionalPlace.price,
            checked: displayedAdultInAdditionalPlace.checked,
          };
        }
      }

      filteredDisplayedExtraChargeInfo.push(adultInAdditionalPlace);
    }
    return filteredDisplayedExtraChargeInfo;
  },

  getConvertedChildrenAgesForSending(displayedExtraChargeInfo, convertedChildrenAges) {
    const childrenAgesForSending = {};
    Object.entries(convertedChildrenAges).forEach(([key, value]) => {
      Object.entries(value).forEach(([innerKey]) => {
        const correspondingDisplayedElement = displayedExtraChargeInfo.find(item => {
          return item.childrenAgeId === key && item.bedsTypesId === innerKey;
        });
        if (
          correspondingDisplayedElement
          && correspondingDisplayedElement.checked
          && (!correspondingDisplayedElement.alternativeModeEnabled || Number(innerKey) !== this.MAIN_BEDS_TYPE_INDEX)
        ) {
          childrenAgesForSending[key] = {
            ...childrenAgesForSending[key],
            [innerKey]: {
              people_count: correspondingDisplayedElement.people_count,
              price: correspondingDisplayedElement.price,
            },
          };
        }
      });
    });

    const virtualItem = displayedExtraChargeInfo.find(item => {
      return Number(item.childrenAgeId) === this.VIRTUAL_AGE_ID && Number(item.bedsTypesId) === this.ADDITIONAL_BEDS_TYPE_INDEX;
    });

    if (virtualItem && virtualItem.checked) {
      childrenAgesForSending[this.VIRTUAL_AGE_ID] = {
        [this.ADDITIONAL_BEDS_TYPE_INDEX]: {
          people_count: virtualItem.people_count,
          price: virtualItem.price,
        },
      };
    }

    return childrenAgesForSending;
  },

  getMaxLimit(bedsTypesId, roomCapacity, isAdult = false) {
    let maxLimit = 100;
    switch (Number(bedsTypesId)) {
      case this.MAIN_BEDS_TYPE_INDEX:
        maxLimit = Number(roomCapacity.main_beds) - Number(roomCapacity.min_adults);
        break;
      case this.ADDITIONAL_BEDS_TYPE_INDEX:
        maxLimit = isAdult
          ? Number(roomCapacity.max_adults) - Number(roomCapacity.main_beds)
          : Number(roomCapacity.extra_beds);
        break;
      case this.WITHOUT_PLACE_TYPE_INDEX:
        maxLimit = Number(roomCapacity.extra_beds) + Number(roomCapacity.main_beds) - 1;
        break;
      default:
        break;
    }
    return maxLimit;
  },
};

export default Roomtype;
