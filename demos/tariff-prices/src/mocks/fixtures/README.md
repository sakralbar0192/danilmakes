# Фикстуры для демо tariff-prices

JSON-ответы API для MSW. Каждый файл — **полное тело ответа** (как в DevTools → Response).

Параметры демо (`planId`, `dateFrom` и т.д.) — в [`export-context.json`](./export-context.json).

## Файлы

| Файл | Назначение |
|------|------------|
| [`hotel-get.json`](./hotel-get.json) | Данные отеля |
| [`tariff-get.json`](./tariff-get.json) | Список тарифов |
| [`roomtypes-get.json`](./roomtypes-get.json) | Категории номеров |
| [`service-get.json`](./service-get.json) | Доп. услуги |
| [`calendar/base.json`](./calendar/base.json) | Календарь, часть `base` |
| [`calendar/planPrices.json`](./calendar/planPrices.json) | Часть `planPrices` |
| [`calendar/meta.json`](./calendar/meta.json) | Часть `meta` (наличие) |
| [`calendar/restrictions.json`](./calendar/restrictions.json) | Часть `restrictions` |
| [`calendar/dynamic.json`](./calendar/dynamic.json) | Часть `dynamic` (RMS) |
| [`calendar/extra.json`](./calendar/extra.json) | Допместа |
| [`calendar/otherTariffsPrices.json`](./calendar/otherTariffsPrices.json) | Цены других тарифов (опционально) |

## export-context.json

```json
{
  "exportedAt": "2026-06-24",
  "defaultPlanId": 100,
  "dateFrom": "1-6-2026",
  "hasRmsTariff": true
}
```

## Минимальный набор

- `hotel-get.json`, `tariff-get.json`, `roomtypes-get.json`, `service-get.json`
- `calendar/base.json`, `calendar/planPrices.json`, `calendar/meta.json`, `calendar/restrictions.json`
