# Dual-mode + demo platform

Сайт поддерживает два режима через `VITE_SITE_MODE`:

| Значение | Поведение |
|----------|-----------|
| `hiring` (default) | Портфолио для найма: `/work`, hospitality-кейсы (hub ЦиО + standalone), CTA «Связаться» |
| `freelance` | Витрина заказов: прайс, `/portfolio`, `/for-freelance` |

Переключение после оффера: выставить `VITE_SITE_MODE=freelance`, пересобрать фронт и задеплоить. Код второго режима не удаляется.

Кейсы hiring — text-first (без iframe на `/work/:slug`); демо открываются отдельной ссылкой. Старые slug’и ЦиО и `once-migration` редиректят на hub / `fleet-data-fix`.

## Demo API

Модульный монолит в `server/src/modules/demos/`:

- `GET/POST /api/demos/tariffs/*` — календарь тарифов (фикстуры + overlay в Postgres)
- `GET/POST /api/demos/revenue/*` — revenue report (период по умолчанию — текущий локальный месяц)
- `GET/POST /api/demos/xlsx/*` — streaming XLSX pipeline
- `GET/POST /api/demos/once/*` — fleet CLI data-fix (dry-run / apply / resume)

Демо Vue (`tariffPrices`, `reportRevenue`) по умолчанию ходят в live API (`VITE_DEMO_API=live`). Для офлайн-сборки: `VITE_DEMO_API=msw`.

Mobile-сценарий календаря: `/demo/tariffPrices?focus=mobile` — на desktop заглушка «откройте с телефона».

```bash
# пересобрать Vue-демо под live API
VITE_DEMO_API=live npm run build:tariff-prices
VITE_DEMO_API=live npm run build:report-revenue
npm run build:xlsx-pipeline
npm run build:fleet-data-fix
```

После `npm ci` в `demos/report-revenue` обязательно пересоберите бандл (`build:report-revenue`): в `public/reportRevenue` может лежать вручную пропатченный артефакт под `/api/demos/revenue`.
