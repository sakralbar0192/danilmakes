import OSF from "@/utils/object-structure-formatter.js";
import { externalImage, localImage } from "@/utils/imgfn.js";
import i18n from "@/plugins/i18n";
import { ProductToolId } from "@/constants/product-tools";

const DEFAULT_HOTEL_LOGO = localImage("default-hotel-logo.svg");

// Массив городов, в которых подключена АИС
const aisZones = ["Санкт-Петербург", "Зеленогорск", "Колпино", "Красное Село", "Кронштадт", "Ломоносов", "Павловск", "Петергоф", "Пушкин", "Сестрорецк"];

const objectTypesIndexes = {
  none: 0,
  hotel: 1,
  apartment: 2,
  hostel: 3,
  pension: 4,
  recreationCenter: 5,
  sanatorium: 6,
  glamping: 7,
  countryHotel: 8,
  motel: 9,
  apartHotel: 10,
  childrenHealthCamp: 11,
  other: 12,
  guesthouse: 13,
  simpleHotel: 14,
};

const defaultLabels = () => {
  return [{
    id: 1, color: "#D2192F", content: "Метка 1", createdAt: "2026-02-05T19:48:40.927985+03:00",
  }, {
    id: 2, color: "#E86D00", content: "Метка 2", createdAt: "2026-02-05T19:48:40.927985+03:00",
  }, {
    id: 3, color: "#EFC109", content: "Метка 3", createdAt: "2026-02-05T19:48:40.927985+03:00",
  }, {
    id: 4, color: "#00A563", content: "Метка 4", createdAt: "2026-02-05T19:48:40.927985+03:00",
  }, {
    id: 5, color: "#270BA2", content: "Метка 5", createdAt: "2026-02-05T19:48:40.927985+03:00",
  }, {
    id: 6, color: "#C742F4", content: "Метка 6", createdAt: "2026-02-05T19:48:40.927985+03:00",
  }, {
    id: 7, color: "#3DA4FE", content: "Метка 7", createdAt: "2026-02-05T19:48:40.927985+03:00",
  }, {
    id: 8, color: "#8B4513", content: "Метка 8", createdAt: "2026-02-05T19:48:40.927985+03:00",
  }, {
    id: 9, color: "#44D5C4", content: "Метка 9", createdAt: "2026-02-05T19:48:40.927985+03:00",
  }, {
    id: 10, color: "#FF9814", content: "Метка 10", createdAt: "2026-02-05T19:48:40.927985+03:00",
  }];
};

export default class HotelModel {
  static HOTEL_TYPE_APARTMENT = 2;

  static HOTEL_TYPE_HOTEL = 1;

  static HOTEL_TYPE_HOSTEL = 3;

  static PRODUCT_TYPE_PMS = 1;

  static PRODUCT_TYPE_PMS_MODULE = 2;

  static PRODUCT_TYPE_FULL_OLD = 3;

  static PRODUCT_TYPE_CM_MODULE_OLD = 4;

  static PRODUCT_TYPE_FULL = 5;

  static PRODUCT_TYPE_CM_MODULE = 6;

  static PRODUCT_TYPE_BUSINESS = 7;

  static PRODUCT_TYPE_LIGHT = 8;

  static PRODUCT_TYPE_ZERO = 9;

  static PRODUCT_TYPE_CM_MODULE_BUSINESS = 10;

  static PACKAGE_PRODUCT_TYPE_IDS = Object.freeze([
    HotelModel.PRODUCT_TYPE_BUSINESS,
    HotelModel.PRODUCT_TYPE_LIGHT,
    HotelModel.PRODUCT_TYPE_ZERO,
    HotelModel.PRODUCT_TYPE_CM_MODULE_BUSINESS,
  ]);

  static PRODUCTION_DEMO_HOTELS = ["45938", "45939", "45941", "45942"];

  static IIKO_OLD_PRODUCT_TYPE_HOTELS = ["21461", "37086", "43782"];

  static PRODUCT_TYPES = {
    [HotelModel.PRODUCT_TYPE_PMS]: "PMS",
    [HotelModel.PRODUCT_TYPE_PMS_MODULE]: i18n.t("PMS и модуль бронирования"),
    [HotelModel.PRODUCT_TYPE_FULL_OLD]: i18n.t("Полный продукт (старая версия)"),
    [HotelModel.PRODUCT_TYPE_CM_MODULE_OLD]: i18n.t("Channel Manager, Модуль бронирования и сторонняя PMS (старая версия)"),
    [HotelModel.PRODUCT_TYPE_FULL]: i18n.t("Полный продукт (новая версия)"),
    [HotelModel.PRODUCT_TYPE_CM_MODULE]: i18n.t("Channel Manager, Модуль бронирования и сторонняя PMS (новая версия)"),
    [HotelModel.PRODUCT_TYPE_BUSINESS]: i18n.t("Полный продукт (Максимум)"),
    [HotelModel.PRODUCT_TYPE_LIGHT]: i18n.t("Полный продукт (Рост)"),
    [HotelModel.PRODUCT_TYPE_ZERO]: i18n.t("Полный продукт (Старт)"),
    [HotelModel.PRODUCT_TYPE_CM_MODULE_BUSINESS]: i18n.t("ЧМ+Модуль (Максимум)"),
  };

  static OBJECT_TYPES = {
    [objectTypesIndexes.none]: i18n.t("Тип не указан"),
    [objectTypesIndexes.hotel]: i18n.t("Отель"),
    [objectTypesIndexes.apartment]: i18n.t("Апартаменты"),
    [objectTypesIndexes.hostel]: i18n.t("Хостел"),
    [objectTypesIndexes.pension]: i18n.t("Пансионат"),
    [objectTypesIndexes.recreationCenter]: i18n.t("База отдыха"),
    [objectTypesIndexes.sanatorium]: i18n.t("Санаторий"),
    [objectTypesIndexes.glamping]: i18n.t("Глэмпинг"),
    [objectTypesIndexes.countryHotel]: i18n.t("Загородный отель"),
    [objectTypesIndexes.motel]: i18n.t("Мотель"),
    [objectTypesIndexes.apartHotel]: i18n.t("Апарт-отель"),
    [objectTypesIndexes.childrenHealthCamp]: i18n.t("ДОЛ (детский оздоровительный лагерь)"),
    [objectTypesIndexes.other]: i18n.t("Другое"),
    [objectTypesIndexes.guesthouse]: i18n.t("Гостевой дом"),
    [objectTypesIndexes.simpleHotel]: i18n.t("Гостиница"),
  };

  static HOTEL_PAIDTOOL_ROOMS_RANGE = [
    {
      min: 1,
      max: 30,
      index: 0,
    },
    {
      min: 31,
      max: 100,
      index: 1,
    },
    {
      min: 101,
      max: Infinity,
      index: 2,
    },
  ];

  static HOSTEL_PAIDTOOL_ROOMS_RANGE = [
    {
      min: 1,
      max: 90,
      index: 0,
    },
    {
      min: 91,
      max: 300,
      index: 1,
    },
    {
      min: 301,
      max: Infinity,
      index: 2,
    },
  ];

  constructor(data) {
    this.id = OSF.formatField("", data.id);
    this.accounting_api_key = OSF.formatField("", data.accounting_api_key);
    this.accounting_api_key_native = OSF.formatField("", data.accounting_api_key_native);
    this.address = OSF.formatField("", data.address);
    this.address_eng = OSF.formatField("", data.address_eng);
    this.arrival_time = this.extractHoursMinutes(OSF.formatField("", data.arrival_time));
    this.city = OSF.formatField("", data.city);
    this.city_eng = OSF.formatField("", data.city_eng);
    this.country = OSF.formatField("", data.country);
    this.create_date = OSF.formatField("", data.create_date);
    this.currency = OSF.formatField("RUB", data.currency);
    this.currency_sign = OSF.formatField("₽", data.currency_sign);
    this.dadata = OSF.formatField("", data.dadata);
    this.departure_time = this.extractHoursMinutes(OSF.formatField("", data.departure_time));
    this.email = OSF.formatField("", data.email);
    this.expiring_date = OSF.formatField("", data.expiring_date);
    this.departureArrivalDiff = OSF.formatField(0, data.departureArrivalDiff);
    this.departureArrivalGap = 24 - this.departureArrivalDiff;
    this.accreditationRequired = OSF.formatField(0, data.accreditation_required); // Остается в hotel
    this.extra = OSF.format({
      set_cleaning_status: false,
      set_cleaning_status_limit: false,
      auto_cleaning_status_enabled: false,
      accounting_legal_entity_id: 0,
      after_qs_settings: {},
      pms_expiring_date: "",
      helphero: { connected_ota: "" },
      competitor_analysis_settings: { show_filter_category: false },
      teamjet_expiring_date: "",
      teamjet_trial_expiring_date: "",
      reports_block_expiring_date: "",
      reports_block_trial_expiring_date: "",
      electronic_lock_request: { expiring_date: "" },
      crm_expiring_date: "",
      crm_trial_expiring_date: "",
      telephony_expiring_date: "",
      telephony_trial_expiring_date: "",
      scala_expiring_date: "",
      chm_module_only: false,
      loading_rooms_report_expiring_date: "",
      loading_rooms_report_expiring_date_trial: "",
      services_rooms_report_expiring_date: "",
      services_rooms_report_expiring_date_trial: "",
      demo: "",
      rms_forecast_plan_id: "0", // id базового тарифа от которого строится прогноз тарифов
      rms_forecast_disabled_interface: false,
      rms_automation_enabled: false,
      stars: "0",
      type: "0",
      booking_widget_uid: "",
      marketplace_apps: {},
      is_new_planning_active: false,
      booking_widget_link: "",
      rooms_count: 0, // временная переменная, до момента, пока бэкенд не разберется с хелпхиро
      accounting_native_legal_entity_id: 0,
      is_indexed: 0,
      disable_bguest: 0,
    }, data.extra || {}, { deep: true });

    // При отсутствии labels_names в базе, устанавливаем по умолчанию
    if (this.extra?.labels_names === undefined && data.experimentsCodes) {
      this.extra.labels_names = data.experimentsCodes.includes("dev13851") ? defaultLabels() : {};
    }

    this.geo_data = OSF.format({
      x: "0",
      y: "0",
    }, data.geo_data || {});

    this.gis_point = OSF.formatField("", data.gis_point);
    this.has_teamjet_subscription_active = OSF.formatField(false, data.has_teamjet_subscription_active);

    this.images = OSF.format({ logo: DEFAULT_HOTEL_LOGO }, data.images || {});
    this.language = OSF.formatField("", data.language);
    this.name = OSF.formatField("", data.name);
    this.website = OSF.formatField("", data.website);
    this.notification_emails = OSF.formatField([], data.notification_emails);
    this.owner_email = OSF.formatField("", data.owner_email);
    this.payment_gateway_enabled = OSF.formatField(0, data.payment_gateway_enabled);
    this.phone = OSF.formatField("", data.phone);
    this.plans = OSF.formatField([], data.plans);
    this.postcode = OSF.formatField("", data.postcode);
    this.providers = OSF.formatField([
      {
        id: 0,
        is_active: false,
        provider_id: 0,
      },
    ], data.providers);
    this.rating = OSF.formatField("", data.rating);
    this.segment_id = OSF.formatField(0, data.segment_id);
    this.experimentsCodes = OSF.formatField([], data.experimentsCodes);

    this.segment = OSF.format({
      extra: {
        config: {
          help_phone: "",
          help_phone_ru: "",
          default_menu_logo: "",
        },
        show_chat: false,
        show_news: false,
        show_virtual_assistant: false,
        show_knowledge_base: false,
      },
      name: "",
      id: 0,
      source: "",
    }, data.segment || { extra: {} }, { deep: true });

    this.timezone = OSF.formatField("Moscow/Europe", data.timezone);
    this.tripadvisor_url = OSF.formatField("", data.tripadvisor_url);
    this.electronic_locks = OSF.formatField([], data.electronic_locks);
    this.is_closed = OSF.formatField(false, data.is_closed);
    this.description = OSF.formatField("", data.description);

    // real plans
    this.rplans = OSF.formatField([], data.rplans);
    this.rplansByIds = OSF.formatField({}, data.rplansByIds);
    this.rplansLoading = OSF.formatField(false, data.rplansLoading);
    this.rplansReady = OSF.formatField(false, data.rplansReady);

    this.show_buy_button = OSF.formatField(false, data.show_buy_button);
    this.is_booking_widget_active = OSF.formatField(false, data.is_booking_widget_active);
    this.show_competitors_analysis = OSF.formatField(false, data.show_competitors_analysis);
    this.completed_after_qs_settings = OSF.formatField(true, data.completed_after_qs_settings);
    this.rms_forecast_ready = OSF.formatField(false, data.rms_forecast_ready);

    // Хранит items для селектов в форме настроек гостиницы
    this.selectItemsData = OSF.format({
      currencies: {},
      hours: {},
      languages: {},
      timezones: {},
      types: [],
    }, data.selectItemsData || {});

    this.hasDefaultLogo = OSF.formatField(false, data.hasDefaultLogo);
    this.product_type = OSF.formatField(0, data.product_type);

    this.notification_settings = OSF.formatField({
      url: "",
      channel: "",
    }, data.notification_settings);
  }

  PROVIDER_BOOKING_WIDGET = 2;

  get websocketUrl() {
    // TODO: Корректна ли такая проверка?
    if (!this.notification_settings?.channel) {
      console.warn("no channel specified");
      return false;
    }
    return `${this.notification_settings?.url?.replace(/\/+$/, "")}/?channel=${this.notification_settings?.channel}`;
  }

  extractHoursMinutes(time) {
    return time.split(":").slice(0, 2).join(":");
  }

  hasExperiment(experimentCode = "") {
    if (!experimentCode || !this.experimentsCodes.length) return false;
    return this.experimentsCodes.includes(experimentCode);
  };

  get logoPath() {
    return this.images.logo ? externalImage(this.images.logo) : DEFAULT_HOTEL_LOGO;
  };

  get isApartment() {
    return objectTypesIndexes.apartment === Number(this.extra.type);
  };

  get isChmOnly() {
    return Boolean(this.extra.chm_module_only);
  };

  get isInAisZone() {
    return !this.city || aisZones.includes(this.city);
  };

  get isDemo() {
    return (this.extra.demo && this.extra.demo !== "0") || false;
  };

  get hasCleaningModuleActive() {
    return this.extra.set_cleaning_status;
  };

  get hasTeamjetActive() {
    return this.has_teamjet_subscription_active;
  };

  get hasCleaningModuleActive() {
    return Boolean(this.hasTeamjetActive || this.hasCleaningModuleActive);
  };

  get cleaningStatusesLimited() {
    return this.extra.set_cleaning_status_limit;
  };

  get hasEnabledAutoCleaning() {
    return this.extra.auto_cleaning_status_enabled;
  };

  get isPartnerSegment() {
    return this.segment_id === 1;
  };

  get isNewProductType() {
    return this.product_type === HotelModel.PRODUCT_TYPE_FULL || this.product_type === HotelModel.PRODUCT_TYPE_CM_MODULE;
  };

  get isOldProductType() {
    return this.product_type === HotelModel.PRODUCT_TYPE_FULL_OLD || this.product_type === HotelModel.PRODUCT_TYPE_CM_MODULE_OLD;
  };

  get isCmModuleOldProductType() {
    return this.product_type === HotelModel.PRODUCT_TYPE_CM_MODULE_OLD;
  };

  get isFullProductType() {
    return this.product_type === HotelModel.PRODUCT_TYPE_FULL;
  };

  get isFullProductTypeOld() {
    return this.product_type === HotelModel.PRODUCT_TYPE_FULL_OLD;
  };

  get nameProductType() {
    return this.product_type in HotelModel.PRODUCT_TYPES ? HotelModel.PRODUCT_TYPES[this.product_type] : i18n.t("Нет типа продукта");
  };

  get isBusinessProductType() {
    return this.product_type === HotelModel.PRODUCT_TYPE_BUSINESS;
  };

  get isLightProductType() {
    return this.product_type === HotelModel.PRODUCT_TYPE_LIGHT;
  };

  get isZeroProductType() {
    return this.product_type === HotelModel.PRODUCT_TYPE_ZERO;
  };

  get isCmModuleBusinessProductType() {
    return this.product_type === HotelModel.PRODUCT_TYPE_CM_MODULE_BUSINESS;
  };

  get isPackageFullProductType() {
    return this.isBusinessProductType
    || this.isLightProductType
    || this.isZeroProductType;
  }

  get isPackageProductType() {
    return HotelModel.PACKAGE_PRODUCT_TYPE_IDS.includes(Number(this.product_type));
  }

  get nameObjectType() {
    return this.extra.type in HotelModel.OBJECT_TYPES ? HotelModel.OBJECT_TYPES[this.extra.type] : i18n.t("Нет типа объекта");
  };

  get isIndexed() {
    return Boolean(this.extra?.is_indexed);
  }

  get isLoyaltyAvailable() {
    return this.isFullProductType || (this.isFullProductTypeOld && this.isIndexed) || this.isBusinessProductType || this.isGuestsBenefitsAvailable;
  };

  get isGuestsBenefitsAvailable() {
    if (this.isBusinessProductType) {
      return true;
    }

    if ((this.isFullProductTypeOld && this.isIndexed) || this.isLightProductType || this.isProductionDemoHotel) {
      const isBenefitsToolDisabled = this.extra?.benefits_disabled ?? true;

      return !isBenefitsToolDisabled;
    }

    return false;
  };

  get isStartDashboardAvailable() {
    return this.isFullProductTypeNewOrOldWithIndexed;
  };

  get bookingWidgetProvider() {
    return this.providers.find(i => i?.provider_id === this.PROVIDER_BOOKING_WIDGET) || {};
  }

  get isQuickActionsAvailable() {
    return this.isFullProductTypeNewOrOldWithIndexed;
  }

  get isGuestsDashboardAvailable() {
    return this.isFullProductType || (this.isFullProductTypeOld && this.isIndexed) || this.isLightProductType || this.isBusinessProductType;
  }

  get hasBookingsStatsAdvancedFilters() {
    return this.isFullProductTypeNewOrOldWithIndexed;
  }

  get hasIikoConnected() {
    return this.extra.marketplace_apps?.iiko?.status_id === 3;
  };

  get hasIikoAccess() {
    return this.isFullProductTypeNewOrOldWithIndexed || HotelModel.IIKO_OLD_PRODUCT_TYPE_HOTELS.includes(this.id);
  }

  get isFullProductTypeNewOrOldWithIndexed() {
    return this.isFullProductType || (this.isFullProductTypeOld && this.isIndexed) || this.isPackageFullProductType;
  }

  get isFullProductTypeWithPackage() {
    return this.isFullProductType || this.isPackageFullProductType;
  }

  get isFullProductTypeNewOrOld() {
    return this.isFullProductType || this.isFullProductTypeOld;
  }

  get isProductTypeNewOrOldWithIndexed() {
    return this.isNewProductType || (this.isOldProductType && this.isIndexed);
  }

  get hasWaitingListAccess() {
    return false;
  }

  get hasTimeServicesAccess() {
    return false;
  }

  get hasPromoCodesAccess() {
    return false;
  }

  get hasBookingModalAvailable() {
    return (this.isFullProductType || this.isFullProductTypeOld || this.isPackageFullProductType) && this.hasExperiment("dev3913");
  }

  get hasBookingModalGroupedAvailable() {
    return this.hasBookingModalAvailable && this.hasExperiment("dev8480");
  }

  get hasBookingModalMovingAvailable() {
    return this.hasBookingModalAvailable && this.hasExperiment("dev8482");
  }

  get hasBookingModalServicesAvailable() {
    return this.hasBookingModalAvailable && this.hasExperiment("dev8484");
  }

  /**
   * EA / LD - Early Arrival / Late Departure
   * @returns {*|boolean}
   */
  get hasBookingModalEALDAvailable() {
    return this.hasBookingModalAvailable && this.hasExperiment("dev10391");
  }

  get hasBookingModalHourlyAvailable() {
    return this.hasBookingModalAvailable && this.hasExperiment("dev8481");
  }

  get isClosureCreationBlockingEnabled() {
    return this.hasExperiment("dev19710");
  }

  get isProductionDemoHotel() {
    return HotelModel.PRODUCTION_DEMO_HOTELS.includes(this.id);
  }

  get isAccreditationRequired() {
    if (!this.hasExperiment("dev13555")) {
      return false;
    }

    const hotelType = Number(this.extra?.type);

    // Типы объектов, для которых аккредитация не обязательна:
    // - Апартаменты (2)
    // - ДОЛ (детский оздоровительный лагерь) (11)
    // - Другое (12)
    const typesNotRequiringAccreditation = [
      objectTypesIndexes.apartment,
      objectTypesIndexes.childrenHealthCamp,
      objectTypesIndexes.other,
    ];

    return !typesNotRequiringAccreditation.includes(hotelType);
  };

  get isBguestAvailable() {
    return this.hasExperiment("dev17860") && !this.extra.disable_bguest;
  }

  get isGuestConsentsAvailable() {
    return this.hasExperiment("dev20956");
  }
}
