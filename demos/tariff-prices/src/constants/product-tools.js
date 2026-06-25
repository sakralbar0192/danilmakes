/**
 * Числовые id инструментов — зеркало legacy_pms/modules/tools/classes/Tools.php (константы TOOL_*).
 * Соответствует Tools::allKnownToolIds(). При изменении в PMS — обновлять здесь.
 */

/** @type {Readonly<Record<string, number>>} */
export const ProductToolId = Object.freeze({
  // 1. Модуль бронирования
  BOOKING_MODULE: 1,
  // 2. Модуль бронирования - лист ожидания
  BOOKING_WAITLIST: 2,
  // 3. Менеджер каналов
  CHANNEL_MANAGER: 3,
  // 4. PMS: дела
  PMS_TASKS: 4,
  // 5. PMS: комиссия и предоплата в брони
  PMS_COMMISSION_AND_PREPAYMENT: 5,
  // 6. PMS: маркетинг под шестеренкой (маркетинг, причины скидки, причины отмены)
  PMS_MARKETING_UNDER_GEAR: 6,
  // 7. PMS: модуль уборки
  PMS_CLEANING_MODULE: 7,
  // 8. PMS: промокоды
  PMS_PROMO_CODES: 8,
  // 9. PMS: работа с ограничениями и закрытием продаж
  PMS_RESTRICTIONS: 9,
  // 10. PMS: работа с платежами
  PMS_PAYMENT_MANAGEMENT: 10,
  // 11. PMS: работа с тарифной сеткой
  PMS_RATE_MANAGEMENT: 11,
  // 12. PMS: работа с тегами
  PMS_TAG_MANAGEMENT: 12,
  // 13. PMS: реестр бронирований
  PMS_BOOKING_REGISTRY: 13,
  // 14. PMS: шахматка
  PMS_CHESSBOARD: 14,
  // 15. PMS: персональный доступ инвестору
  PMS_INVESTOR_ACCESS: 15,
  // 16. PMS: стартовый дашборд
  PMS_START_DASHBOARD: 16,
  // 17. RMS: анализ конкурентов
  RMS_COMPETITOR_ANALYSIS: 17,
  // 18. RMS: бизнес правила (закрытие продажи по тарифу)
  RMS_BUSINESS_RULES_CLOSE_SALE: 18,
  // 19. RMS: бизнес правила (изменение цены)
  RMS_BUSINESS_RULES_PRICE_CHANGE: 19,
  // 20. RMS: бизнес правила (изм. кол-ва ночей)
  RMS_BUSINESS_RULES_NIGHTS_CHANGE: 20,
  // 21. RMS: бизнес правила
  RMS_BUSINESS_RULES: 21,
  // 22. Доп.услуги: часовые услуги
  EXTRA_SERVICES_HOURLY: 22,
  // 23. Доп.услуги: штучные услуги
  EXTRA_SERVICES_ITEM_BASED: 23,
  // 24. Маркетинг: рассылка писем
  MARKETING_MAILER: 24,
  // 25. База гостей: профили гостей
  GUEST_DATABASE_PROFILES: 25,
  // 26. База гостей: данные по броням
  GUEST_DATABASE_BOOKING_STATS: 26,
  // 27. База гостей: данные по броням (расширенные фильтры)
  GUEST_DATABASE_BOOKING_STATS_EXTENDED_FILTERS: 27,
  // 28. База гостей: настройки постоянного гостя
  GUEST_DATABASE_LOYALTY_PROGRAM: 28,
  // 29. База гостей: поощрения постоянных гостей
  GUEST_DATABASE_BENEFITS: 29,
  // 30. База гостей: дашборд постоянных гостей
  GUEST_DATABASE_GUEST_DASHBOARD: 30,
  // 31. Отчеты: номера для уборки
  REPORT_ROOMS_FOR_CLEANING: 31,
  // 32. Отчеты: поступления и расходы (ДДС)
  REPORT_CASH_DDS: 32,
  // 33. Группировка по статьям ДДС
  GROUPING_BY_ARTICLES_DDS: 33,
  // 34. Отчеты: отчет по тур.налогу
  REPORT_TOURIST_TAX: 34,
  // 35. Отчеты: долги по бронированиям
  REPORT_BOOKING_DEBTS: 35,
  // 36. Отчеты: выставленные счета
  REPORT_INVOICES: 36,
  // 37. Отчеты: отчет-история (аналитика)
  REPORT_HISTORY_ANALYTICS: 37,
  // 38. Отчеты: ADR/RevPar/загрузка
  REPORT_ADR_REVPAR_OCCUPANCY: 38,
  // 39. Отчеты: доход
  REPORT_REVENUE: 39,
  // 40. Отчеты: доход/ADR/загрузка
  REPORT_REVENUE_ADR_OCCUPANCY: 40,
  // 41. Отчеты: статистика аннуляций
  REPORT_CANCELLATION_STATS: 41,
  // 42. Отчеты: загрузка по номерам
  REPORT_OCCUPANCY_BY_ROOM: 42,
  // 43. Отчеты: статистика по источникам бронирований
  REPORT_BOOKING_SOURCE_STATS: 43,
  // 44. Отчеты: отчет комиссионера
  REPORT_COMMISSION_AGENT: 44,
  // 45. Отчеты: продажи пользователей
  REPORT_USER_SALES: 45,
  // 46. Отчеты: продажи по маркетинговым показателям
  REPORT_MARKETING_SALES: 46,
  // 47. Отчеты: платежи по бронированиям
  REPORT_BOOKING_PAYMENTS: 47,
  // 48. Отчеты: Блок отчетов
  REPORT_BLOCK_REPORTS: 48,
  // 49. Отчеты: доход по номерам
  REPORT_REVENUE_BY_ROOM: 49,
  // 50. Отчеты: отчет по питанию
  REPORT_MEAL_PLAN: 50,
  // 51. Отчеты: отчет по доп.услугам
  REPORT_EXTRA_SERVICES: 51,
  // 52. Отчеты: динамика бронирований (pick-up)
  REPORT_BOOKING_PICKUP: 52,
  // 53. Отчеты: окно бронирования
  REPORT_BOOKING_WINDOW: 53,
  // 54. Отчеты: длительность проживания
  REPORT_LENGTH_OF_STAY: 54,
  // 55. Отчеты: длительность проживания и окно бронирования
  REPORT_LOS_AND_BOOKING_WINDOW: 55,
  // 56. Отчеты: отчет менеджера
  REPORT_MANAGER_REPORT: 56,
  // 57. Интеграции: доступ к маркетплейсу интеграций Octopus партнеров
  INTEGRATION_OCTOPUS_MARKETPLACE: 57,
  // 58. Интеграции: чаевые (Octopus)
  INTEGRATION_OCTOPUS_TIPS: 58,
  // 59. Интеграции: доступ к API (односторонний)
  INTEGRATION_API_ONE_WAY: 59,
  // 60. Интеграции: доступ к API (двусторонний)
  INTEGRATION_API_TWO_WAY: 60,
  // 61. Интеграции: интеграция с CRM (Amo/Bitrix)
  INTEGRATION_CRM: 61,
  // 62. Интеграции: 1С Бухгалтерия
  INTEGRATION_1C_ACCOUNTING: 62,
  // 63. Интеграции: IP телефония
  INTEGRATION_IP_TELEPHONY: 63,
  // 64. RMS: прогноз цен (от 30 номеров)
  RMS_PRICE_FORECAST: 64,
  // 65. Модуль интеграции PMS (Google)
  INTEGRATION_PMS_GOOGLE: 65,
  // 66. Платежи: интеграция с шлюзом оплат
  PAYMENT_GATEWAY_INTEGRATION: 66,
  // 67. Интеграции: электронные замки
  INTEGRATION_ELECTRONIC_LOCKS: 67,
  // 68. Интеграции: МВД
  INTEGRATION_UFMS: 68,
  // 69. Интеграции: модуль уборки TeamJet
  INTEGRATION_TEAMJET: 69,
  // 70. Модуль интеграции PMS (Aviasales)
  INTEGRATION_PMS_AVIASALES: 70,
  // 71. Интеграции: магазин модулей NEW
  INTEGRATION_MODULE_STORE: 71,
});

export const ALL_PRODUCT_TOOL_IDS = Object.freeze(
  [...new Set(Object.values(ProductToolId))].sort((a, b) => a - b),
);
