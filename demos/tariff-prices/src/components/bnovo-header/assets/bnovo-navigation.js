import moment from "moment";
import i18n from "@/plugins/i18n.js";
// eslint-disable-next-line import/no-cycle
import store from "@/store";
import { ProductToolId } from "@/constants/product-tools";
import phoneFormatter from "@/utils/phone-formatter";
import { hasDaysPassed } from "@/utils/date-helpers";
import smartipsService from "@/services/smartips";

const webhookDefaults = { discord: "https://discord.com/api/webhooks/897016815895584808/giX3E9WHJig8pN_abVZY4TUayKMLBhccbJZZO-VmO8l3RU-lOLWFObWC1qxfPEx4NqhZ" };

// пары соответствий старых item.id новым
const oldIdPairs = {
  1: "dashboard",
  2: "planning",
  3: "booking_notes",
  4: null,
  5: "ufms",
  6: "vats",
  7: "locked",
  8: null,
  9: "mailer",
  10: null,
  11: null,
  12: "reports_maid",
  13: "teamjet",
  14: "tariffs",
  15: "promocodes",
  16: "sales_bnovo",
  17: "sales",
  18: "crm",
  19: "finance_details",
  20: "finance_items",
  21: "finance_payment_gateway",
  22: "finance_fiscal_register",
  23: "finance",
  24: "reports",
  25: "reports_services",
  26: "reports_debts",
  27: "reports_services_rooms",
  28: "finance_invoices",
  29: "reports_board",
  30: "reports_other_services",
  31: null,
  32: null,
  33: null,
  34: null,
  35: null,
  36: null,
  37: null,
  38: null,
  39: null,
  40: "reports_adr",
  41: "reports_pick_up",
  42: "reports_arrivals",
  43: "reports_cancellations",
  44: "reports_loading_rooms",
  45: null,
  46: "reports_sources",
  47: "reports_total",
  48: "reports_agencies",
  49: "reports_users",
  50: "reports_marketing",
  51: "reports_manager",
  52: "hotel_edit",
  53: "preferences",
  54: "roomTypes",
  55: "room",
  56: "suppliers",
  57: "service",
  58: "templates",
  59: "marketing",
  60: "backup",
  61: "users",
  62: "cabinet",
  63: "housekeeping",
};

const maps = {
  groups: {
    help: ["knowledge_base", "support_chat", "support_chat_tg", "wishes", "referral"],
    modules: ["octopus", "module_reports", "vats", "crm", "locked", "google", "ufms"],
    settings: ["hotel_edit", "preferences", "roomTypes", "room", "suppliers", "service", "templates", "marketing", "backup", "imports", "users", "cabinet"],
    placing_guests: ["startDashboard", "dashboard", "planning", "booking_notes", "ufms", "vats", "locked", "messages"],
    marketing_management: ["integration_yb", "mailer", "review", "customer"],
    external_connections: ["external_connections_settings"],
    cleaning: ["reports_maid", "teamjet", "housekeeping"],
    sales_management: ["tariffs", "sales", "sales_bnovo", "promocodes", "crm", "dashboard_closures", "send_offer"],
    finance_management: ["finance", "finance_settings", "finance_reports", "finance_invoices"],
    finance_reports: ["reports", "reports_services", "reports_debts", "reports_services_rooms"],
    finance_settings: ["finance_details", "finance_travel_tax_settings", "finance_items", "finance_payment_gateway", "finance_fiscal_register", "finance_accounting"],
    reports_statistics: ["reports_adr", "reports_pick_up", "reports_lengthStay", "reports_arrivals", "reports_cancellations", "reports_loading_rooms"],
    reports_management: ["reports_total_analytics", "reports_board", "reports_other_services", "reports_statistics", "reports_sources", "reports_total", "reports_agencies", "reports_users", "reports_marketing", "reports_manager", "reports_demand", "travel_tax_report"],
    tips_reviews: ["tips_employees", "tips_qr_cods", "tips_statistics"],
    time_services: ["orders", "orders_dashboard"],
  },
  group_titles: ["help", "favorites", "placing_guests", "time_services", "marketing_management", "external_connections", "cleaning", "sales_management", "finance_management", "reports_management", "modules"],
  favorites: ["sales", "planning", "tariffs"],
  adminpanel: ["hotel", "search_user", "search_channel", "paid_tools", "experiments", "googleFeed", "users_api", "pilots", "admin_tasks"],
  spa: [
    "bnovo_ui",
    "bnovo_ui_templates",
    "default_layout_example",
    "default_layout_footer_example",
    "headless_layout_example",
    "blank_layout_example",
    "tabs_layout_example",
    "tabs_layout_example_tab1",
    "tabs_layout_example_tab2",
    "tabs_layout_example_edit",
    "tabs_layout_example_tab2_child",
    "tabs_layout_example_tab2_child_edit",
    "news",
    "bnovo_ui",
    "module_reports",
    "reports_manager",
    "reports_revenue",
    "reports_lengthStay",
    "service_type",
    "service_type_add",
    "service_type_edit",
    "roomTypes_add",
    "roomTypes_edit",
    "roomTypes_childrenAges",
    "external_connections_settings",
    "external_connections_edit",
    "reports_market",
    "paidtools",
    "paidtools_rules",
    "paidtools_rateshopper",
    "paidtools_accounting",
    "finance_accounting",
    "tariff_automation",
    "tariff_optimal_price",
    "tariff_competitors_analysis",
    "tariff_automation/advance-in-price",
    "tariff_automation/restrictions",
    "reports_booking_demand",
    "housekeeping",
    "sales_list",
    "sales_edit_ota",
    "sales_edit_channel_spa",
    "suppliers",
    "sources",
    "sales_edit_yandex",
    "sales_edit_aviasales",
    "customer",
    "hotel_edit",
    "hotel_description",
    "hotel_accreditation",
    "booking_notes",
    "overbookings",
    "waitingList",
    "travel_tax_report",
    "startDashboard",
    "finance_travel_tax_settings",
    "orders",
    "orders_dashboard",
  ],
  mobile: [
    "favorites",
    "placing_guests",
    "time_services",
    "marketing_management",
    "external_connections",
    "cleaning",
    "sales_management",
    "finance_management",
    "reports_management",
    "modules",
    "SEPARATOR",
    "settings",
    "help",
  ],
  desktop: [
    ["placing_guests", "time_services", "marketing_management", "external_connections", "cleaning"],
    ["sales_management", "finance_management"],
    ["reports_management"],
    ["modules"],
  ],
};

const items = {
  profile_edit: {
    render: "link",
    link: "/profile/edit",
    title: i18n.t("Настройки профиля"),
    shortTitle: i18n.t("Настройки профиля"),
    favorite: false,
    hidden: false,
  },
  reports_demand: {
    render: "link",
    link: "/reports/booking_demand",
    title: i18n.t("Статистика спроса по региону"),
    shortTitle: i18n.t("Статистика спроса по региону"),
    is_new: false,
    favorite: false,
    hidden: false,
  },
  favorites: {
    render: "group",
    title: i18n.t("Избранное"),
    shortTitle: i18n.t("Избранное"),
    favorite: false,
    hidden: false,
  },
  placing_guests: {
    render: "group",
    title: i18n.t("Размещение гостей"),
    shortTitle: i18n.t("Размещение гостей"),
    favorite: false,
    hidden: false,
  },
  dashboard: {
    render: "link",
    title: i18n.t("Бронирования"),
    shortTitle: i18n.t("Бронирования"),
    link: "/dashboard/new",
    badge: { name: "notifications" },
    favorite: false,
    hidden: false,
  },
  bookings: {
    render: "link",
    title: i18n.t("Бронирования"),
    shortTitle: i18n.t("Бронирования"),
    link: "/bookings",
    badge: { name: "notifications" },
    favorite: false,
    hidden: false,
  },
  planning: {
    render: "link",
    title: i18n.t("Шахматка"),
    shortTitle: i18n.t("Шахматка"),
    link: "/planning",
    favorite: false,
    hidden: false,
  },
  booking_notes: {
    render: "link",
    title: i18n.t("Дела"),
    shortTitle: i18n.t("Дела"),
    link: "/bookingNotes",
    favorite: false,
    hidden: false,
  },
  overbookings: {
    render: "link",
    title: i18n.t("Овербукинги"),
    shortTitle: i18n.t("Овербукинги"),
    link: "/overBookings",
    favorite: false,
    hidden: false,
  },
  dashboard_closures: {
    render: "link",
    title: i18n.t("Закрытые продажи"),
    shortTitle: i18n.t("Закрытые продажи"),
    link: "/dashboard/closures",
    favorite: false,
    hidden: false,
  },
  ufms: {
    render: "link",
    title: i18n.t("Регистрация гостей в МВД"),
    shortTitle: i18n.t("Регистрация гостей в МВД"),
    link: "/ufms/register",
    highlightLink: "/ufms",
    favorite: false,
    hidden: false,
  },
  google: {
    title: i18n.t("Google travel"),
    shortTitle: i18n.t("Google travel"),
    render: "link",
    link: "https://bnovo.pro/how-to-add-object-googletravel?utm_source=menu&utm_medium=banner&utm_campaign=google&utm_content=button&utm_term=module_google",
    favorite: false,
    hidden: false,
  },
  vats: {
    render: "link",
    title: i18n.t("IP-телефония"),
    shortTitle: i18n.t("IP-телефония"),
    link: "/vats",
    favorite: false,
    hidden: false,
  },
  locked: {
    render: "link",
    title: i18n.t("Электронные замки"),
    shortTitle: i18n.t("Электронные замки"),
    link: "/electronicLocks",
    favorite: false,
    hidden: false,
  },
  marketing_management: {
    render: "group",
    title: i18n.t("Маркетинг"),
    shortTitle: i18n.t("Маркетинг"),
    favorite: false,
    hidden: false,
  },
  mailer: {
    render: "link",
    title: i18n.t("Рассылка писем"),
    shortTitle: i18n.t("Рассылка писем"),
    link: "/mailer",
    highlightLink: "/mailer/settings",
    favorite: false,
    hidden: false,
  },
  mailer_template_list: {
    render: "link",
    title: i18n.t("Шаблоны писем"),
    shortTitle: i18n.t("Шаблоны писем"),
    link: "/mailer/template",
    highlightLink: "/mailer/template",
    favorite: false,
    hidden: true,
  },
  mailer_template_create: {
    render: "link",
    title: i18n.t("Добавление нового шаблона"),
    shortTitle: i18n.t("Добавление нового шаблона"),
    link: "/mailer/template_create",
    highlightLink: "/mailer/template",
    favorite: false,
    hidden: true,
  },
  mailer_template_update: {
    render: "link",
    title: i18n.t("Редактирование шаблона"),
    shortTitle: i18n.t("Редактирование шаблона"),
    link: "/mailer/template",
    highlightLink: "/mailer/template",
    favorite: false,
    hidden: true,
  },
  review: {
    render: "link",
    title: i18n.t("Ответы на отзывы"),
    shortTitle: i18n.t("Ответы на отзывы"),
    link: "/sales/review",
    favorite: false,
    hidden: false,
  },
  cleaning: {
    render: "group",
    title: i18n.t("Уборка"),
    shortTitle: i18n.t("Уборка"),
    favorite: false,
    hidden: false,
  },
  reports_maid: {
    render: "link",
    title: i18n.t("Номера для уборки"),
    shortTitle: i18n.t("Номера для уборки"),
    link: "/reports/maid",
    badge: { name: "notifications" },
    favorite: false,
    hidden: false,
  },
  teamjet: {
    render: "link",
    title: i18n.t("Модуль уборки"),
    shortTitle: i18n.t("Модуль уборки"),
    link: "/teamjet",
    highlightLink: "/teamjet/settings",
    caption: "Powered by Teamjet",
    favorite: false,
    hidden: false,
  },
  housekeeping: {
    render: "link",
    title: i18n.t("Модуль уборки"),
    shortTitle: i18n.t("Модуль уборки"),
    link: "/houseKeeping",
    caption: i18n.t("Внутренний модуль Bnovo"),
    favorite: false,
    hidden: false,
  },
  sales_management: {
    render: "group",
    title: i18n.t("Управление продажами"),
    shortTitle: i18n.t("Управление продажами"),
    favorite: false,
    hidden: false,
  },
  tariffs: {
    render: "link",
    title: i18n.t("Тарифы"),
    shortTitle: i18n.t("Тарифы"),
    link: "/tariff/tariffs",
    favorite: false,
    hidden: false,
  },
  tariff_prices_and_restrictions: {
    render: "link",
    link: "/tariff/index",
    title: i18n.t("Цены и ограничения тарифа"),
    favorite: false,
    hidden: false,
  },
  sources: {
    render: "link",
    title: i18n.t("Системы бронирования"),
    shortTitle: i18n.t("Системы бронирования"),
    link: "/sources/",
    favorite: false,
    hidden: false,
  },
  promocodes: {
    render: "link",
    title: i18n.t("Промокоды"),
    shortTitle: i18n.t("Промокоды"),
    link: "/sales/promocodes",
    favorite: false,
    hidden: false,
  },
  sales_bnovo: {
    render: "link",
    title: i18n.t("Модуль бронирования на сайте"),
    shortTitle: i18n.t("Модуль бронирования на сайте"),
    link: "/sales/bnovo",
    favorite: false,
    hidden: false,
  },
  sales: {
    render: "link",
    title: i18n.t("Каналы продаж (ОТА)"),
    shortTitle: i18n.t("Каналы продаж (ОТА)"),
    link: "/sales",
    favorite: false,
    hidden: false,
    caption: i18n.t("Booking.com, Expedia, Airbnb и другие"),
    mobileCaption: i18n.t("Booking.com, Expedia, Airbnb и другие"),
  },
  sales_list: {
    render: "link",
    title: i18n.t("Каналы продаж (ОТА)"),
    shortTitle: i18n.t("Каналы продаж (ОТА)"),
    link: "/sales/list",
    favorite: false,
    hidden: false,
  },
  sales_edit_ota: {
    render: "link",
    title: i18n.t("Настройки ОТА"),
    shortTitle: i18n.t("Настройки ОТА"),
    link: "/sales/edit_ota",
    favorite: false,
    hidden: false,
  },
  sales_edit_channel_spa: {
    render: "link",
    title: i18n.t("Подключение канала"),
    shortTitle: i18n.t("Подключение канала"),
    link: "/sales/edit_channel_spa",
    favorite: false,
    hidden: false,
  },
  sales_edit_yandex: {
    render: "link",
    title: i18n.t("Настройки канала Яндекс Путешествия"),
    shortTitle: i18n.t("Настройки канала Яндекс Путешествия"),
    link: "/sales/edit_yandex",
    favorite: false,
    hidden: false,
  },
  sales_edit_aviasales: {
    render: "link",
    title: i18n.t("Настройки канала Авиасейлс"),
    shortTitle: i18n.t("Настройки канала Авиасейлс"),
    link: "/sales/edit_aviasales",
    favorite: false,
    hidden: false,
  },
  crm: {
    render: "link",
    title: i18n.t("Интеграция с CRM"),
    shortTitle: i18n.t("Интеграция с CRM"),
    link: "/crm",
    favorite: false,
    hidden: false,
  },
  finance_management: {
    render: "group",
    title: i18n.t("Финансы"),
    shortTitle: i18n.t("Финансы"),
    favorite: false,
    hidden: false,
  },
  finance: {
    render: "link",
    title: i18n.t("Поступления и расходы"),
    shortTitle: i18n.t("Поступления и расходы"),
    link: "/finance",
    favorite: false,
    hidden: false,
  },
  finance_settings: {
    render: "group",
    title: i18n.t("Настройки"),
    shortTitle: i18n.t("Настройки"),
    favorite: false,
    hidden: false,
  },
  finance_details: {
    render: "link",
    title: i18n.t("Реквизиты"),
    shortTitle: i18n.t("Реквизиты"),
    link: "/finance/details",
    favorite: false,
    hidden: false,
  },
  finance_items: {
    render: "link",
    title: i18n.t("Создание статей"),
    shortTitle: i18n.t("Создание статей"),
    link: "/finance/items",
    favorite: false,
    hidden: false,
  },
  finance_payment_gateway: {
    render: "link",
    title: i18n.t("Прием онлайн-оплаты"),
    shortTitle: i18n.t("Прием онлайн-оплаты"),
    link: "/finance/payment_gateway",
    favorite: false,
    hidden: false,
  },
  finance_fiscal_register: {
    render: "link",
    title: i18n.t("Фискальные регистраторы"),
    shortTitle: i18n.t("Фискальные регистраторы"),
    link: "/finance/fiscal_register",
    favorite: false,
    hidden: false,
  },
  finance_reports: {
    render: "group",
    title: i18n.t("Отчеты"),
    shortTitle: i18n.t("Отчеты"),
    favorite: false,
    hidden: false,
  },
  travel_tax_report: {
    render: "link",
    link: "/reports/travelTax",
    title: i18n.t("Отчет турналога"),
    favorite: false,
    hidden: false,
  },
  finance_travel_tax_settings: {
    render: "link",
    link: "/travelTaxSettings/edit",
    title: i18n.t("Турналог"),
    shortTitle: i18n.t("Турналог"),
    favorite: false,
    hidden: false,
  },
  reports: {
    render: "link",
    title: i18n.t("Платежи по бронированиям"),
    shortTitle: i18n.t("Платежи по бронированиям"),
    link: "/reports",
    favorite: false,
    hidden: false,
  },
  reports_services: {
    render: "link",
    title: i18n.t("Доход"),
    shortTitle: i18n.t("Доход"),
    link: "/reports/services",
    favorite: false,
    hidden: false,
  },
  reports_debts: {
    render: "link",
    title: i18n.t("Долги"),
    shortTitle: i18n.t("Долги"),
    link: "/reports/debts",
    favorite: false,
    hidden: false,
  },
  reports_services_rooms: {
    render: "link",
    title: i18n.t("Доход по номерам"),
    shortTitle: i18n.t("Доход по номерам"),
    link: "/reports/services_rooms",
    favorite: false,
    hidden: false,
  },
  finance_invoices: {
    render: "link",
    title: i18n.t("Выставленные счета"),
    shortTitle: i18n.t("Выставленные счета"),
    link: "/finance/invoices",
    favorite: false,
    hidden: false,
  },
  reports_management: {
    render: "group",
    title: i18n.t("Отчеты"),
    shortTitle: i18n.t("Отчеты"),
    favorite: false,
    hidden: false,
  },
  reports_board: {
    render: "link",
    title: i18n.t("Питание"),
    shortTitle: i18n.t("Питание"),
    link: "/reports/board",
    favorite: false,
    hidden: false,
  },
  reports_other_services: {
    render: "link",
    title: i18n.t("Дополнительные услуги"),
    shortTitle: i18n.t("Дополнительные услуги"),
    link: "/reports/other_services",
    favorite: false,
    hidden: false,
  },
  reports_statistics: {
    render: "group",
    title: i18n.t("Статистика"),
    shortTitle: i18n.t("Статистика"),
    favorite: false,
    hidden: false,
  },
  reports_adr: {
    render: "link",
    title: i18n.t("Загрузка/ADR/RevPAR"),
    shortTitle: i18n.t("Загрузка/ADR/RevPAR"),
    link: "/reports/adr",
    favorite: false,
    hidden: false,
  },
  reports_pick_up: {
    render: "link",
    title: i18n.t("Pick up"),
    shortTitle: i18n.t("Pick up"),
    link: "/reports/pick_up",
    favorite: false,
    hidden: false,
  },
  reports_arrivals: {
    render: "link",
    title: i18n.t("Длительность проживания и «окно» бронирования"),
    shortTitle: i18n.t("Длительность проживания и «окно» бронирования"),
    link: "/reports/arrivals",
    favorite: false,
    hidden: false,
  },
  reports_cancellations: {
    render: "link",
    title: i18n.t("Аннуляции"),
    shortTitle: i18n.t("Аннуляции"),
    link: "/reports/cancellations",
    favorite: false,
    hidden: false,
  },
  reports_loading_rooms: {
    render: "link",
    title: i18n.t("Загрузка по номерам"),
    shortTitle: i18n.t("Загрузка по номерам"),
    link: "/reports/loading_rooms",
    favorite: false,
    hidden: false,
  },
  reports_sources: {
    render: "link",
    title: i18n.t("Источники бронирования"),
    shortTitle: i18n.t("Источники бронирования"),
    link: "/reports/sources",
    favorite: false,
    hidden: false,
  },
  reports_total: {
    render: "link",
    title: i18n.t("История"),
    shortTitle: i18n.t("История"),
    link: "/reports/total",
    favorite: false,
    hidden: false,
  },
  reports_total_analytics: {
    render: "link",
    title: i18n.t("Аналитика"),
    shortTitle: i18n.t("Аналитика"),
    link: "/reports/total",
    favorite: false,
    hidden: false,
    is_new: false,
  },
  reports_agencies: {
    render: "link",
    title: i18n.t("Комиссия"),
    shortTitle: i18n.t("Комиссия"),
    link: "/reports/agencies",
    favorite: false,
    hidden: false,
  },
  reports_users: {
    render: "link",
    title: i18n.t("Продажи пользователей"),
    shortTitle: i18n.t("Продажи пользователей"),
    link: "/reports/users",
    favorite: false,
    hidden: false,
  },
  reports_marketing: {
    render: "link",
    title: i18n.t("Маркетинг"),
    shortTitle: i18n.t("Маркетинг"),
    link: "/reports/marketing",
    favorite: false,
    hidden: false,
  },
  reports_manager: {
    render: "link",
    title: i18n.t("Отчет менеджера"),
    shortTitle: i18n.t("Отчет менеджера"),
    link: "/reports/manager",
    favorite: false,
    hidden: false,
  },
  reports_lengthStay: {
    render: "link",
    title: i18n.t("Длительность проживания"),
    shortTitle: i18n.t("Длительность проживания"),
    link: "/reports/lengthStay",
    favorite: false,
    hidden: false,
    is_new: false,
  },
  reports_revenue: {
    render: "link",
    title: i18n.t("Доход"),
    shortTitle: i18n.t("Доход"),
    link: "/reports/revenue",
    favorite: false,
    hidden: false,
    is_new: false,
  },
  reports_market: {
    render: "link",
    title: i18n.t("Рыночная статистика"),
    shortTitle: i18n.t("Рыночная статистика"),
    link: "/reports/market",
    favorite: false,
    hidden: false,
  },
  settings: {
    render: "group",
    title: i18n.t("Настройки"),
    shortTitle: i18n.t("Настройки"),
    favorite: false,
    hidden: false,
  },
  hotel_edit: {
    render: "link",
    title: i18n.t("Гостиница"),
    shortTitle: i18n.t("Данные гостиницы"),
    link: "/hotel/edit",
    favorite: false,
    hidden: false,
  },
  hotel_description: {
    render: "link",
    title: i18n.t("Гостиница"),
    shortTitle: i18n.t("Описание и фото"),
    link: "/hotel/description",
    favorite: false,
    hidden: false,
  },
  hotel_accreditation: {
    render: "link",
    title: i18n.t("Гостиница"),
    shortTitle: i18n.t("Аккредитация"),
    link: "/hotel/accreditation",
    favorite: false,
    hidden: false,
  },
  preferences: {
    render: "link",
    title: i18n.t("Персонализация"),
    shortTitle: i18n.t("Персонализация"),
    link: "/preferences",
    favorite: false,
    hidden: false,
  },
  roomTypes: {
    render: "link",
    title: i18n.t("Категории номеров"),
    shortTitle: i18n.t("Категории номеров"),
    link: "/roomTypes",
    href: "/roomTypes",
    favorite: false,
    hidden: false,
  },
  roomTypes_add: {
    render: "link",
    title: i18n.t("Добавление новой категории номера"),
    shortTitle: i18n.t("Добавить"),
    link: "/roomTypes/add",
    favorite: false,
    hidden: false,
  },
  roomTypes_edit: {
    render: "link",
    title: i18n.t("Редактирование категории номера"),
    shortTitle: i18n.t("Изменить"),
    link: "/roomTypes/edit",
    favorite: false,
    hidden: false,
  },
  roomTypes_childrenAges: {
    render: "link",
    title: i18n.t("Настройки детей"),
    shortTitle: i18n.t("Настройки детей"),
    link: "/roomTypes/hotel_children_ages",
    favorite: false,
    hidden: false,
  },
  room: {
    render: "link",
    title: i18n.t("Номера"),
    shortTitle: i18n.t("Номера"),
    link: "/room",
    favorite: false,
    hidden: false,
  },
  suppliers: {
    render: "link",
    title: i18n.t("Агентства и компании"),
    shortTitle: i18n.t("Агентства и компании"),
    link: "/suppliers",
    favorite: false,
    hidden: false,
  },
  service: {
    render: "link",
    title: i18n.t("Дополнительные услуги"),
    shortTitle: i18n.t("Доп. услуги"),
    link: "/service",
    favorite: false,
    hidden: false,
  },
  time_services: {
    render: "group",
    title: i18n.t("Часовые услуги"),
    shortTitle: i18n.t("Часовые услуги"),
    favorite: false,
    hidden: false,
  },
  time_service: {
    render: "link",
    title: i18n.t("Часовые услуги"),
    shortTitle: i18n.t("Часовые услуги"),
    link: "/timeServices",
    favorite: false,
    hidden: false,
  },
  time_service_form: {
    render: "link",
    title: i18n.t("Часовая услуга"),
    shortTitle: i18n.t("Часовая услуга"),
    link: "/timeServices/form",
    favorite: false,
    hidden: false,
  },
  order: {
    render: "link",
    title: i18n.t("Заказ"),
    shortTitle: i18n.t("Заказ"),
    link: "/order",
    favorite: false,
    hidden: false,
  },
  orders: {
    render: "link",
    title: i18n.t("Список заказов"),
    shortTitle: i18n.t("Список заказов"),
    link: "/orders",
    favorite: false,
    hidden: false,
    is_new: false,
  },
  orders_dashboard: {
    render: "link",
    title: i18n.t("Календарь заказов"),
    shortTitle: i18n.t("Календарь заказов"),
    link: "/orders/dashboard",
    favorite: false,
    hidden: false,
    is_new: true,
  },
  service_type: {
    render: "link",
    title: i18n.t("Типы дополнительных услуг"),
    shortTitle: i18n.t("Типы доп. услуг"),
    link: "/serviceType",
    favorite: false,
    hidden: false,
  },
  service_type_add: {
    render: "link",
    title: i18n.t("Добавление нового типа доп. услуг"),
    shortTitle: i18n.t("Добавить"),
    link: "/serviceType/add",
    favorite: false,
    hidden: false,
  },
  service_type_edit: {
    render: "link",
    title: i18n.t("Изменение типа доп. услуг"),
    shortTitle: i18n.t("Изменить"),
    link: "/serviceType/edit",
    favorite: false,
    hidden: false,
  },
  templates: {
    render: "link",
    title: i18n.t("Шаблоны документов"),
    shortTitle: i18n.t("Шаблоны документов"),
    link: "/templates",
    favorite: false,
    hidden: false,
  },
  marketing: {
    render: "link",
    title: i18n.t("Маркетинг"),
    shortTitle: i18n.t("Маркетинг"),
    link: "/marketing",
    favorite: false,
    hidden: false,
  },
  backup: {
    render: "link",
    title: i18n.t("Экспорт данных"),
    shortTitle: i18n.t("Экспорт данных"),
    link: "/backup",
    favorite: false,
    hidden: false,
  },
  users: {
    render: "link",
    title: i18n.t("Пользователи"),
    shortTitle: i18n.t("Пользователи"),
    link: "/users",
    favorite: false,
    hidden: false,
  },
  cabinet: {
    render: "link",
    title: i18n.t("Личный кабинет"),
    shortTitle: i18n.t("Личный кабинет"),
    link: "/cabinet",
    favorite: false,
    hidden: false,
  },
  help: {
    render: "group",
    title: i18n.t("Помощь"),
    shortTitle: i18n.t("Помощь"),
    favorite: false,
    hidden: false,
  },
  knowledge_base: {
    render: "link",
    title: i18n.t("База знаний"),
    shortTitle: i18n.t("База знаний"),
    link: "https://help.bnovo.ru/?utm_source=pms&utm_medium=pop_up&utm_campaign=pop_up_pms",
    target_blank: true,
    favorite: false,
    hidden: false,
  },
  support_chat: {
    render: "div",
    title: i18n.t("Чат с поддержкой"),
    shortTitle: i18n.t("Чат с поддержкой"),
    dispatch: "helpdeskeddy/openChat",
    target_blank: true,
    favorite: false,
    hidden: false,
  },
  wishes: {
    render: "div",
    title: i18n.t("Оставьте пожелание"),
    shortTitle: i18n.t("Оставьте пожелание"),
    modal: {
      component: () => import("@/components/bnovo-yandex-form"),
      data: {
        type: "wishes",
        name: "ya-form-6486e48084227c321dd929f6", // название iframe с yandex form
        frameUri: "https://forms.yandex.ru/cloud/665d9ca3068ff00549213d09/",
        answerData: {},
      },
    },
    target_blank: true,
    favorite: false,
    hidden: false,
    is_new: false,
  },
  referral: {
    render: "div",
    title: i18n.t("Реферальная программа"),
    shortTitle: i18n.t("Реферальная программа"),
    link: "https://bnovo.pro/partners?utm_source=pms-bnovo&utm_medium=menu&utm_campaign=agent",
    target_blank: true,
    favorite: false,
    hidden: false,
  },
  modules: {
    render: "group",
    title: i18n.t("Больше возможностей!"),
    shortTitle: i18n.t("Больше возможностей!"),
    caption: i18n.t("Подключите дополнительные платные модули, чтобы эффективнее решать ежедневные задачи"),
    icon: "icon-settings",
    favorite: false,
    hidden: false,
  },
  module_reports: {
    render: "link",
    title: i18n.t("Отчеты"),
    shortTitle: i18n.t("Отчеты"),
    link: "/reports/reports_block",
    favorite: false,
    hidden: false,
  },
  imports: {
    render: "link",
    title: i18n.t("Импорт бронирований из файла"),
    shortTitle: i18n.t("Импорт бронирований из файла"),
    link: "/importfile",
    favorite: false,
    hidden: false,
  },
  send_offer: {
    render: "link",
    title: i18n.t("Отправить предложение"),
    shortTitle: i18n.t("Отправить предложение"),
    link: "/offers",
    favorite: false,
    hidden: false,
  },
  messages: {
    render: "link",
    title: i18n.t("Коммуникация с гостями"),
    shortTitle: i18n.t("Коммуникация с гостями"),
    link: "/sales/messages",
    favorite: false,
    hidden: false,
  },
  octopus: {
    render: "link",
    title: i18n.t("Bnovo Octopus"),
    shortTitle: i18n.t("Bnovo Octopus"),
    link: "/octopus",
    favorite: false,
    hidden: false,
  },
  news: {
    render: "link",
    title: i18n.t("Новости Bnovo"),
    shortTitle: i18n.t("Новости Bnovo"),
    link: "/notifications/page",
    favorite: false,
    hidden: false,
  },
  integration_yb: {
    render: "link",
    title: i18n.t("Интеграция с Яндекс.Бизнес"),
    shortTitle: i18n.t("Интеграция с Яндекс.Бизнес"),
    link: "/octopus?app_id=yandexbusiness",
    favorite: false,
    hidden: false,
  },
  paidtools: {
    render: "link",
    title: i18n.t("Инструментарий"),
    link: "/paidtools",
    favorite: false,
    hidden: false,
  },
  paidtools_rules: {
    render: "link",
    title: i18n.t("Бизнес-правила"),
    link: "/paidtools/rules",
    favorite: false,
    hidden: false,
  },
  paidtools_rateshopper: {
    render: "link",
    title: i18n.t("Анализ конкурентов"),
    link: "/paidtools/rateshopper",
    favorite: false,
    hidden: false,
  },
  paidtools_accounting: {
    render: "link",
    title: i18n.t("Интеграция с 1С Бухгалтерия"),
    link: "/paidtools/accounting",
    favorite: false,
    hidden: false,
  },
  finance_accounting: {
    render: "link",
    title: i18n.t("1С Бухгалтерия"),
    link: "/finance/accounting",
    favorite: false,
    hidden: false,
  },
  tariff_automation: {
    render: "link",
    title: i18n.t("Бизнес-правила"),
    link: "/tariff/automation",
    favorite: false,
    hidden: false,
  },
  tariff_optimal_price: {
    render: "link",
    title: i18n.t("Ценовые рекомендации"),
    link: "/tariff/optimal_price",
    favorite: false,
    hidden: false,
  },
  tariff_competitors_analysis: {
    render: "link",
    title: i18n.t("Анализ конкурентов"),
    link: "/tariff/competitors_analysis",
    favorite: false,
    hidden: false,
  },
  tariff_automation_advance_in_price: {
    render: "link",
    title: i18n.t("Изменение цены"),
    link: "/tariff/automation/advance-in-price",
    favorite: false,
    hidden: false,
  },
  tariff_automation_close_rate_sales: {
    render: "link",
    title: i18n.t("Закрытие продажи по тарифу"),
    link: "/tariff/automation/close_rate_sales",
    favorite: false,
    hidden: false,
  },
  tariff_automation_restrictions: {
    render: "link",
    title: i18n.t("Изменение мин. количества ночей"),
    link: "/tariff/automation/restrictions",
    favorite: false,
    hidden: false,
  },
  external_connections_settings: {
    render: "link",
    link: "/externalConnections",
    title: i18n.t("Настройки подключений"),
    shortTitle: i18n.t("Настройки подключений"),
    is_new: false,
    favorite: false,
    hidden: false,
  },
  external_connections_edit: {
    render: "link",
    link: "/externalConnections/edit",
    title: i18n.t("Настройки подключений"),
    shortTitle: i18n.t("Настройки подключений"),
    is_new: false,
    favorite: false,
    hidden: false,
  },
  external_connections: {
    render: "group",
    title: i18n.t("Внешние подключения"),
    shortTitle: i18n.t("Внешние подключения"),
    favorite: false,
    hidden: false,
  },
  tools: {
    render: "link",
    title: i18n.t("Tools"),
    link: "/tools",
    favorite: false,
    hidden: false,
  },
  fees: {
    render: "link",
    title: i18n.t("Сборы"),
    shortTitle: i18n.t("Сборы"),
    link: "/fees",
    highlightLink: "/fees/list",
    favorite: false,
    hidden: false,
  },
  fees_list: {
    render: "link",
    title: i18n.t("Сборы"),
    shortTitle: i18n.t("Сборы"),
    link: "/fees",
    favorite: false,
    hidden: false,
  },
  fees_add: {
    render: "link",
    title: i18n.t("Добавить курортный сбор"),
    shortTitle: i18n.t("Добавление"),
    link: "/fees/add",
    favorite: false,
    hidden: false,
  },
  fees_edit: {
    render: "link",
    title: i18n.t("Курортный сбор"),
    shortTitle: i18n.t("Редактирование"),
    link: "/fees/edit",
  },
  reports_fees: {
    render: "link",
    title: i18n.t("Отчет курортного сбора"),
    shortTitle: i18n.t("Отчет курортного сбора"),
    link: "/reports/fees",
  },
  reports_fees_consolidated: {
    render: "link",
    title: i18n.t("Сводный отчет курортного сбора"),
    shortTitle: i18n.t("Сводный отчет курортного сбора"),
    link: "/reports/fees_consolidated",
  },
  reports_booking_demand: {
    render: "link",
    title: i18n.t("Статистика спроса по региону"),
    shortTitle: i18n.t("Статистика спроса по региону"),
    link: "/reports/booking_demand",
  },
  customer: {
    render: "link",
    title: i18n.t("База гостей"),
    link: "/customer",
    favorite: false,
    hidden: false,
  },
  edit_ota_requisites: {
    render: "link",
    title: i18n.t("Редактирование канала продаж"),
    shortTitle: i18n.t("Редактирование"),
    link: "/sources/edit",
  },
  edit_supplier: {
    render: "link",
    title: i18n.t("Редактирование компании"),
    shortTitle: i18n.t("Редактирование"),
    link: "/suppliers/edit",
  },
  add_supplier: {
    render: "link",
    title: i18n.t("Добавление источника продаж"),
    shortTitle: i18n.t("Добавление"),
    link: "/sources/add",
  },
  hotel: {
    render: "link",
    title: i18n.t("Гостиницы"),
    shortTitle: i18n.t("Гостиницы"),
    link: "/hotel",
    testName: "tab_hotels",
  },
  search_user: {
    render: "link",
    title: i18n.t("Владельцы"),
    shortTitle: i18n.t("Владельцы"),
    link: "/hotel/search_user",
    testName: "tab_owners",
  },
  search_channel: {
    render: "link",
    title: i18n.t("Каналы"),
    shortTitle: i18n.t("Каналы"),
    link: "/hotel/search_channel",
    testName: "tab_channels",
  },
  paid_tools: {
    render: "link",
    title: i18n.t("Инструменты"),
    shortTitle: i18n.t("Инструменты"),
    link: "/hotel/paid_tools/",
    testName: "tab_tools",
  },
  experiments: {
    render: "link",
    title: i18n.t("Эксперименты"),
    shortTitle: i18n.t("Эксперименты"),
    link: "/experiments/hotels/",
    testName: "tab_experiments",
  },
  googleFeed: {
    render: "link",
    title: i18n.t("Подключение Google"),
    shortTitle: i18n.t("Подключение Google"),
    link: "/googleFeed",
    testName: "tab_google_feed",
  },
  users_api: {
    render: "link",
    title: i18n.t("Пользователи API"),
    shortTitle: i18n.t("Пользователи API"),
    link: "/bnovobook/index",
    testName: "tab_api_users",
  },
  pilots: {
    render: "link",
    title: i18n.t("Пилоты"),
    shortTitle: i18n.t("Пилоты"),
    link: "/hotel/pilots",
    testName: "tab_pilots",
  },
  admin: {
    render: "link",
    title: i18n.t("Админ панель"),
    shortTitle: i18n.t("Админ панель"),
    link: "/admin",
    hidden: false,
  },
  admin_tasks: {
    render: "link",
    title: i18n.t("Таски"),
    shortTitle: i18n.t("Таски"),
    link: "/admin/tasks",
    hidden: false,
    testName: "tab_tasks",
  },
  waitingList: {
    render: "link",
    title: i18n.t("Лист ожидания"),
    shortTitle: i18n.t("Лист ожидания"),
    link: "/waitingList",
  },
  iiko: {
    render: "link",
    title: i18n.t("Интеграция с iiko"),
    shortTitle: i18n.t("Интеграция с iiko"),
    link: "/iiko",
    hidden: true,
  },
  electronicTipsBanner: {
    render: "link",
    title: i18n.t("Чаевые smartips"),
    shortTitle: i18n.t("Чаевые smartips"),
    link: "/electronicTips",
    hidden: false,
    disabledComponent: () => import("@/components/bnovo-widget/link-widget.vue"),
    widgetTittle: i18n.t("Подключить Онлайн-чаевые"),
    widgetText: i18n.t("Получайте чаевые и отзывы без лишних действий"),
  },
  electronicTips: {
    render: "link",
    title: i18n.t("Чаевые smartips"),
    shortTitle: i18n.t("Чаевые smartips"),
    link: "/electronicTips",
    hidden: false,
  },
  tips_reviews: {
    render: "group",
    title: i18n.t("Чаевые и отзывы"),
    shortTitle: i18n.t("Чаевые и отзывы"),
    favorite: false,
    hidden: false,
  },
  tips_statistics: {
    render: "link",
    title: i18n.t("Статистика"),
    shortTitle: i18n.t("Статистика"),
    link: `https://po.${smartipsService.HOST}/stats`,
    target_blank: true,
    hidden: false,
  },
  tips_qr_cods: {
    render: "link",
    title: i18n.t("QR-коды"),
    shortTitle: i18n.t("QR-коды"),
    link: `https://po.${smartipsService.HOST}/qr-codes`,
    target_blank: true,
    hidden: false,
  },
  tips_employees: {
    render: "link",
    title: i18n.t("Сотрудники"),
    shortTitle: i18n.t("Сотрудники"),
    link: `https://po.${smartipsService.HOST}/employees`,
    target_blank: true,
    hidden: false,
  },
  publicApi: {
    render: "link",
    title: i18n.t("Публичное API"),
    shortTitle: i18n.t("Публичное API"),
    link: "/publicApi",
    target_blank: true,
    hidden: false,
  },
  finance_deposit: {
    render: "link",
    title: i18n.t("Залоги"),
    shortTitle: i18n.t("Залоги"),
    link: "/finance/deposit",
    is_new: true,
    target_blank: false,
    hidden: false,
  },

  // UIKIT Routes
  bnovo_ui: {
    render: "link",
    title: i18n.t("Bnovo UI Kit"),
    shortTitle: i18n.t("Bnovo UI Kit"),
    link: "/tools/uikit",
    favorite: false,
    hidden: false,
  },
  bnovo_ui_templates: {
    render: "link",
    title: i18n.t("Templates"),
    shortTitle: i18n.t("Templates"),
    link: "/tools/uikit?tab=templates",
    favorite: false,
    hidden: false,
  },
  default_layout_example: {
    render: "link",
    link: "/defaultLayoutExample",
    title: i18n.t("Пример простой страницы с авто-хэдером"),
    shortTitle: i18n.t("Прост. страничка"),
    favorite: false,
    hidden: false,
  },
  default_layout_footer_example: {
    render: "link",
    link: "/defaultFooterLayoutExample",
    title: i18n.t("Пример простой страницы с футером"),
    shortTitle: i18n.t("Прост. футер"),
    favorite: false,
    hidden: false,
  },
  headless_layout_example: {
    render: "link",
    title: i18n.t("Headless Layout Example"),
    shortTitle: i18n.t("Шапка кастом"),
    link: "/headlessLayoutExample",
    favorite: false,
    hidden: false,
  },
  blank_layout_example: {
    render: "link",
    title: i18n.t("Blank Layout Example"),
    shortTitle: i18n.t("Blank"),
    link: "/blankLayoutExample",
    favorite: false,
    hidden: false,
  },
  tabs_layout_example: {
    render: "link",
    link: "/tabsLayoutExample",
    favorite: false,
    hidden: false,
  },
  tabs_layout_example_tab1: {
    render: "link",
    title: i18n.t("Простой таб"),
    link: "/tabsLayoutExample/tab1",
    favorite: false,
    hidden: false,
  },
  tabs_layout_example_tab2: {
    render: "link",
    title: i18n.t("Таб с саб-роутами"),
    link: "/tabsLayoutExample/tab2",
    favorite: false,
    hidden: false,
  },
  tabs_layout_example_edit: {
    render: "link",
    title: i18n.t("Форма редактирования"),
    link: "/tabsLayoutExample/edit",
    favorite: false,
    hidden: false,
  },
  tabs_layout_example_tab2_child: {
    render: "link",
    title: i18n.t("2 слой"),
    link: "/tabsLayoutExample/tab2/child",
    favorite: false,
    hidden: false,
  },
  tabs_layout_example_tab2_child_edit: {
    render: "link",
    title: i18n.t("3 слой"),
    link: "/tabsLayoutExample/tab2/child/edit",
    favorite: false,
    hidden: false,
  },
  tabs_layout_example_sub_tab2_edit: {
    render: "link",
    title: i18n.t("Page subtab #2 Edit form"),
    link: "/tabsLayoutExample/tab2/sub-tab2",
    favorite: false,
    hidden: false,
  },
  startDashboard: {
    render: "link",
    shortTitle: i18n.t("Дашборд"),
    title: i18n.t("Стартовый дашборд"),
    link: "/startDashboard",
    favorite: true,
    hidden: false,
  },
};

function toggleFavorite(index) {
  if (items[index].favorite) {
    maps.favorites = maps.favorites.filter((item) => {
      return item !== index;
    });
    items[index].favorite = false;
  } else if (maps.favorites.length < 3) {
    maps.favorites.push(index);
    items[index].favorite = true;
  }
}

async function recalculate() {
  if (store.state.user.id !== 0 && store.state.hotel !== undefined) {
    const hotel = store.state.hotel;
    /**
     * инструмент включен в тариф или может быть куплен
     */
    const isToolAccessible = toolId => store.getters["productTools/isToolAccessible"](toolId);
    /**
     * инструмент доступен (на текущий момент, куплен или включен в тариф по умолчанию)
     */
    const isToolAvailable = toolId => store.getters["productTools/isToolAvailable"](toolId);
    /**
     * Инструмент может быть куплен
     */
    const isToolPurchasable = toolId => store.getters["productTools/isToolPurchasable"](toolId);

    const user = store.state.user;
    const userExtra = user.extra;
    const hotelExtra = hotel.extra;
    const hotelSegment = hotel.segment;
    const menuSettings = [];
    const menuDesktopBlockModules = 3;
    const canShowLengthStayReport = isToolAvailable(ProductToolId.REPORT_LENGTH_OF_STAY);

    if (canShowLengthStayReport) {
      items.reports_arrivals.title = i18n.t("Окно бронирования");
      items.reports_arrivals.shortTitle = i18n.t("Окно бронирования");

      // Если отель является старым индексированным и с момента индексации не прошло 90 дней, то отчет по длительности проживания помечаем как новый
      const indexedAt = hotelExtra.indexed_at;
      if (hotel.isIndexed || indexedAt) {
        // Дата релиза задачи с отсчетом времени 2025-09-22
        const deployDate = "2025-09-22";
        // Если indexed_at отсутствует, считаем от deployDate
        const startDate = moment(indexedAt || deployDate, "YYYY-MM-DD");

        const is90daysPassed = hasDaysPassed(startDate, 90);
        if (!is90daysPassed) {
          items.reports_lengthStay.is_new = true;
          items.reports_statistics.is_new = true;
        }
      }
    }

    // Add experimental report link
    if (hotel.hasExperiment("r5000")) {
      this.maps.groups.reports_management.push("reports_market");
    }

    if (!this.maps.groups.finance_management.includes("finance_deposit")) {
      this.maps.groups.finance_management.push("finance_deposit");
    }

    if (hotel.id !== "") {
      await store.dispatch("smartips/ensureSmartipsConnection");
      if (!store.getters["user/isGuest"]) {
        if (store?.state?.smartips?.hotelConnectionSmartips) {
          if (!maps.groups.modules.includes("electronicTips")) {
            maps.groups.modules.splice(3, 0, "electronicTips");
          }
          if (!maps.desktop[menuDesktopBlockModules].includes("tips_reviews")) {
            maps.desktop[menuDesktopBlockModules].push("tips_reviews");
          }
          if (!maps.mobile.includes("tips_reviews")) {
            maps.mobile.splice(maps.mobile.indexOf("modules"), 0, "tips_reviews");
          }
        }
      }
    }

    if (!store.getters["user/isGuest"] && !hotel.isChmOnly) {
      if (!store?.state?.smartips?.hotelConnectionSmartips) {
        if (!maps.groups.modules.includes("electronicTipsBanner")) {
          maps.groups.modules.push("electronicTipsBanner");
        }
        if (!maps.groups.modules.includes("electronicTips")) {
          maps.groups.modules.splice(3, 0, "electronicTips");
        }
      }
    }

    for (const item of Object.keys(userExtra.menu_settings)) {
      const key = (item.substr(-1) === "/") ? item.substr(0, item.length - 1) : item;
      menuSettings[key] = userExtra.menu_settings[item];
    }

    // disable mark logic

    // проверка на даты добавлена для блокировки бесконечного триала для ситуации когда инструмент был куплен или взят в триал, но истёк
    const reportsBlockIsAvailable = isToolAvailable(ProductToolId.REPORT_BLOCK_REPORTS)
      || hotelExtra.reports_block_trial_expiring_date
      || hotelExtra.reports_block_expiring_date;
    const reportsBlockIsPurchasable = isToolPurchasable(ProductToolId.REPORT_BLOCK_REPORTS);
    const canReportsBlockBeenPurchased = !reportsBlockIsAvailable && reportsBlockIsPurchasable;
    let demandReportExists = false;
    try {
      // Оставляем упоминание HelpHero, потому что у клиентов в БД уже прописаны подключения в extra.helphero.connected_ota,
      // независимо от подключения и существования HelpHero
      demandReportExists = hotelExtra.helphero.connected_ota.indexOf("booking") !== -1;
      if (hotelExtra.chm_module_only) {
        demandReportExists = false;
      }
    } catch (e) {
      demandReportExists = false;
    }
    const disables = {
      module_reports: !reportsBlockIsAvailable,
      reports_services_rooms: canReportsBlockBeenPurchased,
      reports_board: canReportsBlockBeenPurchased,
      reports_other_services: canReportsBlockBeenPurchased && !isToolAvailable(ProductToolId.REPORT_EXTRA_SERVICES),
      reports_pick_up: canReportsBlockBeenPurchased,
      reports_loading_rooms: canReportsBlockBeenPurchased,
      reports_manager: canReportsBlockBeenPurchased,
      teamjet: !(hotelExtra.teamjet_trial_expiring_date || hotelExtra.teamjet_expiring_date),
      locked: !((hotelExtra.electronic_lock_request && hotelExtra.electronic_lock_request.expiring_date) || "islocks" in hotelExtra.marketplace_apps),
      crm: hotel.isFullProductTypeWithPackage ? false : !(hotelExtra.crm_trial_expiring_date || hotelExtra.crm_expiring_date),
      vats: hotel.isFullProductTypeWithPackage ? false : !(hotelExtra.telephony_trial_expiring_date || hotelExtra.telephony_expiring_date),
      ufms: !(hotelExtra.scala_expiring_date),
      octopus: true,
      google: true,
      electronicTips: true,
      electronicTipsBanner: true,
    };
    const disableRedirects = {
      reports_manager: "/reports/reports_block",
      reports_board: hotelExtra.chm_module_only ? false : "/reports/reports_block",
      reports_pick_up: "/reports/reports_block",
      module_reports: "/reports/reports_block",
      reports_other_services: hotelExtra.chm_module_only ? false : "/reports/reports_block",
      reports_loading_rooms: "/reports/reports_block",
      reports_services_rooms: "/reports/reports_block",
      reports_lengthStay: "/reports",
      reports_revenue: "/reports",
    };

    const hidden = {
      module_reports: !reportsBlockIsPurchasable && !hotel.isBusinessProductType && !hotel.isFullProductType,
      reports_services_rooms: !isToolAccessible(ProductToolId.REPORT_REVENUE_BY_ROOM),
      reports_board: !isToolAccessible(ProductToolId.REPORT_MEAL_PLAN),
      reports_other_services: !isToolAccessible(ProductToolId.REPORT_EXTRA_SERVICES),
      reports_pick_up: !isToolAccessible(ProductToolId.REPORT_BOOKING_PICKUP),
      reports_loading_rooms: !isToolAccessible(ProductToolId.REPORT_OCCUPANCY_BY_ROOM),
      reports_manager: !isToolAccessible(ProductToolId.REPORT_MANAGER_REPORT),
      reports_demand: !demandReportExists,
      cabinet: store.state.device.isIos,
      reports_total_analytics: !hotel.rms_forecast_ready || !isToolAccessible(ProductToolId.REPORT_HISTORY_ANALYTICS),
      reports_total: hotel.rms_forecast_ready || !isToolAccessible(ProductToolId.REPORT_HISTORY_ANALYTICS),
      external_connections: !hotelExtra.chm_module_only,
      reports_lengthStay: !canShowLengthStayReport,

      reports_adr: !isToolAccessible(ProductToolId.REPORT_ADR_REVPAR_OCCUPANCY), // старый ADR
      reports_services: !isToolAccessible(ProductToolId.REPORT_REVENUE), // Старый доход
      reports_revenue: !isToolAccessible(ProductToolId.REPORT_REVENUE_ADR_OCCUPANCY), // Новый доход + adr

      reports_cancellations: !isToolAccessible(ProductToolId.REPORT_CANCELLATION_STATS),
      reports_arrivals: !isToolAccessible(ProductToolId.REPORT_BOOKING_WINDOW) && !isToolAccessible(ProductToolId.REPORT_LOS_AND_BOOKING_WINDOW),
      reports_sources: !isToolAccessible(ProductToolId.REPORT_BOOKING_SOURCE_STATS),
      reports_marketing: hotel.isZeroProductType,
      promocodes: !hotel.hasPromoCodesAccess,
      octopus: hotel.isZeroProductType,
      integration_yb: hotel.isZeroProductType,
      crm: hotel.isZeroProductType,
      vats: hotel.isZeroProductType,
      paidtools_accounting: hotel.isZeroProductType,
      finance_accounting: hotel.isZeroProductType,
      waitingList: !hotel.hasWaitingListAccess,
      time_services: !hotel.hasTimeServicesAccess,
      time_service: !hotel.hasTimeServicesAccess,
      time_service_form: !hotel.hasTimeServicesAccess,
      order: !hotel.hasTimeServicesAccess,
      orders: !hotel.hasTimeServicesAccess,
    };

    // если включен эксперимент, даже при наличии доступа к новому отчёту ADR+Доход, показываме 2 старых
    if (store.state.hotel.hasExperiment("dev2395iteration0")) {
      hidden.reports_adr = false;
      hidden.reports_services = false;
      hidden.reports_revenue = true;
    } else if (!hidden.reports_revenue) {
      // переименовываем итем в меню
      items.reports_revenue.is_new = true;
      items.reports_revenue.title = i18n.t("Доход, ADR, Загрузка");
      items.reports_revenue.shortTitle = i18n.t("Доход, ADR, Загрузка");

      // пярчем антагонистов
      hidden.reports_adr = true;
      hidden.reports_services = true;

      // меняем состав групп
      // на 2 место помещается отчет Доход по номерам (последний в списке)
      const financeReportsGroup = Array.isArray(maps.groups.finance_reports) ? maps.groups.finance_reports : [];
      const reportsManagementGroup = Array.isArray(maps.groups.reports_management) ? maps.groups.reports_management : [];
      const reportsStatisticsGroup = Array.isArray(maps.groups.reports_statistics) ? maps.groups.reports_statistics : [];

      maps.groups.finance_reports = financeReportsGroup.filter(item => item !== "reports_services_rooms");
      maps.groups.reports_management = ["reports_revenue", "reports_services_rooms", ...reportsManagementGroup.filter(item => item !== "reports_revenue" && item !== "reports_services_rooms")];
      maps.groups.reports_statistics = reportsStatisticsGroup.filter(item => item !== "reports_adr");

      // для инвестора revenue отчет показывается только при условии, что есть размещения с доступными номерами
      if (userExtra.is_guest) {
        const roomtypes = await store.dispatch("hotelRoom/getRoomTypes");
        hidden.reports_revenue = roomtypes.some(roomtype => roomtype?.extra?.exclude_for_report !== false);
      }
    }

    // ключи для передачи данных пользователя и отеля при отправке яндекс формы
    const modalData = {
      wishes: {
        answer_short_text_51047232: store.state.hotel.id,
        answer_short_text_51047246: window.location.pathname,
        answer_short_text_51047326: store.state.user.email,
      },
    };

    if (userExtra.menu_favorites && userExtra.menu_favorites.length > 0) {
      maps.favorites = [];
      // для обратной совместимости проверяем формат данных внутри и извлекаем новые id
      const userFavorites = userExtra.menu_favorites.slice();
      for (const item of userFavorites) {
        if (typeof item === "object" && item.id !== undefined && item.render !== "group") {
          maps.favorites.push(oldIdPairs[item.id]);
          continue;
        }
        if (typeof item === "string") {
          maps.favorites.push(item);
        }
      }
    }

    if (userExtra.is_guest) {
      items.favorites.title = i18n.t("Кабинет инвестора");
      items.favorites.shortTitle = i18n.t("Кабинет инвестора");
    }

    if (userExtra.is_housemaid) {
      items.favorites.title = i18n.t("Уборка номеров");
      items.favorites.shortTitle = i18n.t("Уборка номеров");
    }

    // Add calculatable options
    for (const item of Object.keys(items)) {
      let isFavorite = maps.favorites.indexOf(item) !== -1;
      if (isFavorite) {
        if (items[item].render === "group") {
          isFavorite = false;
          maps.favorites.splice(maps.favorites.indexOf(item), 1);
        }
      }
      items[item].favorite = isFavorite;
      items[item].role = (maps.group_titles.includes(item)) ? "group_title" : "group_item";
      items[item].disabled = (typeof disables[item] !== "undefined" && disables[item]);
      if (items[item].disabled && disableRedirects[item]) {
        items[item].highlightLink = items[item].link;
        items[item].link = disableRedirects[item];
      }
      items[item].new = Boolean(items[item].is_new);
      const hasHiddenValue = Object.prototype.hasOwnProperty.call(hidden, item);
      items[item].hidden = hasHiddenValue ? hidden[item] : Boolean(hidden[item]);
      items[item].restricted = false;
      if (items[item].link !== undefined && menuSettings[items[item].link] !== undefined) {
        items[item].new = menuSettings[items[item].link].new || Boolean(items[item].is_new);
        items[item].hidden = hasHiddenValue ? hidden[item] : (menuSettings[items[item].link].hidden || Boolean(hidden[item]));
        items[item].restricted = menuSettings[items[item].link].restricted;
      }
      if (item in modalData) {
        items[item].modal.data.answerData = modalData[item];
      }

      if (item === "help") {
        let phoneBlocks = "";
        if (hotelSegment.extra.config.help_phone !== "") {
          phoneBlocks += `
           <span class="menu-list_mobile-caption-help--contacts-text">
            ${i18n.t("Для звонков из любой точки мира")}
           </span>
           <a class="menu-list_mobile-caption-help--contacts-phone" href="tel:${phoneFormatter.cleanPhoneNumber(hotelSegment.extra.config.help_phone)}">
            ${hotelSegment.extra.config.help_phone}
           </a>
        `;
        }
        if (hotelSegment.extra.config.help_phone_ru !== "") {
          phoneBlocks += `
          <span class="menu-list_mobile-caption-help--contacts-text">
            ${i18n.t("Телефон для звонков на территории РФ")}
          </span>
          <a class="menu-list_mobile-caption-help--contacts-phone" href="tel:${phoneFormatter.cleanPhoneNumber(hotelSegment.extra.config.help_phone_ru)}">
            ${hotelSegment.extra.config.help_phone_ru}
          </a>
          `;
        }

        items[item].caption = `
          <div class="menu-list_mobile-caption-help">
            <div class="menu-list_mobile-caption-help--title">
              ${i18n.t("Есть вопросы? Мы обязательно поможем!")}
            </div>
           <div class="menu-list_mobile-caption-help--contacts">
              ${phoneBlocks}
            </div>
            <div class="menu-list_mobile-caption-help--id">
              <span class="menu-list_mobile-caption-help--id-text">
                ${i18n.t("Ваш номер аккаунта:")}
              </span>
              <span class="menu-list_mobile-caption-help--id-number">
                ${hotel.id}
              </span>
            </div>
          </div>
        `;
      }

      if (item === "knowledge_base") {
        items[item].hidden = !hotelSegment.extra.show_knowledge_base;
      }

      if (item === "support_chat") {
        items[item].hidden = !hotelSegment.extra.show_chat;
      }

      if (item === "support_chat_tg") {
        items[item].hidden = !hotelSegment.extra.show_chat;
      }

      if (item === "referral") {
        items[item].hidden = !store.getters["user/canAccessReferralProgram"];
      }

      if ((item === "dashboard_closures" || item === "modules") && (hotelExtra.chm_module_only || userExtra.is_guest || userExtra.is_housemaid)) {
        items[item].hidden = true;
        maps.groups.modules = [];
      }

      if (item === "admin_tasks") {
        items[item].hidden = !store.state.user.roles.includes("second_line_support");
      }

      if (item === "users_api") {
        items[item].hidden = !store.state.user.roles.includes("bnovobook_admin");
      }


      // mark SPA items to correct router using
      items[item].spa_item = (maps.spa.includes(item));

      // remove hidden item from all the groups
      if (items[item].hidden) {
        for (const group of Object.keys(maps.groups)) {
          // группа help не пряется т.к. содержит доп. информацию
          if (group !== "help") {
            maps.groups[group] = maps.groups[group].filter(gitem => gitem !== item);
            if (maps.groups[group].length < 1) {
              items[group].hidden = true;
            }
          }
        }
      }
    }

    for (const group of Object.keys(maps.groups)) {
      if (!maps.groups[group].length) {
        for (const group1 of Object.keys(maps.groups)) {
          maps.groups[group1] = maps.groups[group1].filter(gitem => gitem !== group);
        }
        delete maps.groups[group];
      }
    }

    // Hide hidden groups
    const pvg = ["SEPARATOR", "favorites"];
    maps.favorites = maps.favorites.filter(item => items[item] && !items[item].hidden);
    maps.mobile = maps.mobile.filter((item) => {
      const rItem = items[item];
      if (!rItem) {
        return false;
      }
      if (pvg.includes(item)) {
        return true;
      }
      if ((rItem.render !== "group" && !rItem.hidden)) {
        return true;
      }
      return (rItem.render === "group" && rItem !== "favorites" && maps.groups[item] !== undefined && maps.groups[item].length);
    });
    maps.adminpanel = maps.adminpanel.filter((item) => {
      const rItem = items[item];
      if (!rItem) {
        return false;
      }
      if (pvg.includes(item)) {
        return true;
      }
      if ((rItem.render !== "group" && !rItem.hidden)) {
        return true;
      }
      return (rItem.render === "group" && rItem !== "favorites" && maps.groups[item] !== undefined && maps.groups[item].length);
    });
    for (const set of Object.keys(maps.desktop)) {
      maps.desktop[set] = maps.desktop[set].filter((item) => {
        const rItem = items[item];
        if (!rItem) {
          return false;
        }
        if (pvg.includes(item)) {
          return true;
        }
        if ((items[item].render !== "group" && !items[item].hidden)) {
          return true;
        }
        return ((items[item].render === "group" && maps.groups[item] !== undefined && maps.groups[item].length));
      });
    }
    maps.desktop = maps.desktop.filter(item => item.length);
  } else {
    console.warn("No app data");
  }
}

const nav = {
  maps,
  items,
  webhookDefaults,
  recalculate,
  toggleFavorite,
};
export default nav;
