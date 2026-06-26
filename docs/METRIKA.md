# Яндекс.Метрика — настройка целей

Счётчик: **110107124** ([metrika.yandex.ru](https://metrika.yandex.ru))

**Связанные документы:** [IMPROVEMENT-PLAN.md](./IMPROVEMENT-PLAN.md) (фаза 10.3)

---

## Текущее состояние

### Цели в интерфейсе Метрики ✅

| Тип | ID (примеры) | Статус |
| --- | ------------ | ------ |
| Автоцели: форма, мессенджер, контакты | 573531045–048 | Настроены |
| `contact_submit` / `contact_error` | 574055204, 574055226 | Настроены |
| `demo_open` / `demo_load_error` | 574055334, 574055435 | Настроены |
| `case_study_view` | 574055504 | Настроена |
| `external_click` | 574055556 | Настроена |
| `demo_action` | 574055628 | Настроена |

### Что уже трекается в коде

| Событие | Где | Цель |
| ------- | --- | ---- |
| Отправка `/contact` | `Contact.tsx` | `contact_submit` / `contact_error` |
| Загрузка iframe-демо | `CodeExample.tsx` | `demo_open` / `demo_load_error` |
| Просмотр кейса | `CaseStudy.tsx` | `case_study_view` |
| GitHub / Telegram / внешнее демо | `Portfolio`, `CaseStudy`, `Contact` | `external_click` |
| Действия в Vue-демо | postMessage → `useDemoAnalyticsBridge` | `demo_action` |
| Просмотры SPA | `useYandexMetrika` | `hit` |
| Не отказ | `useNotBounce` | `notBounce` (15 с или 25 % скролла) |

### Пробелы (главные)

1. **Формы в статических демо** (`localLanding`, `clinicLanding`, `formIntegration`) — отправка на `/api/demo-lead` **без** `reachGoal`; Метрика на родителе не видит iframe-формы.
2. **Клики с главной** — «Пример: …» в блоке услуг, CTA «Обсудить проект» / «Смотреть работы» не трекаются.
3. **Админка записей** — смена статуса, фильтр, поиск без событий.
4. **Воронки в интерфейсе** — цели есть, сегменты и составные отчёты не настроены.

---

## JavaScript-цели (уже созданные)

| Идентификатор     | Когда срабатывает                                         |
| ----------------- | --------------------------------------------------------- |
| `contact_submit`  | Успешная отправка формы на `/contact`                     |
| `contact_error`   | Ошибка отправки формы                                     |
| `demo_open`       | Демо загрузилось в iframe (`params.demo`)                 |
| `demo_load_error` | Таймаут или ошибка загрузки демо                          |
| `case_study_view` | Просмотр кейса (`params.slug`)                            |
| `external_click`  | Клик по GitHub / Telegram / внешнему демо                 |
| `demo_action`     | Действие внутри демо (`params.demo`, `params.action`) |
| `demo_lead_submit`| Успешная заявка из демо-формы (`params.source`, `params.demo_mode`) |
| `demo_lead_error` | Ошибка демо-формы (`params.source`, `params.status`) |
| `pricing_example_click` | Клик «Пример: …» на главной (`params.tier`, `params.href`) |
| `cta_click`       | CTA на главной и `/for-freelance` (`params.place`, `params.target`) |

### Автоцели — как использовать

Автоцели 573531045–048 **дублируют** кастомные на части сценариев. Для отчётов и воронок опирайтесь на **кастомные** идентификаторы — у них есть параметры (`demo`, `slug`, `target`). Автоцели оставить как запасной сигнал, не строить на них основную аналитику.

---

## План доработок

**Горизонт:** 1–2 недели, 3 фазы.  
**Принцип:** переиспользовать существующий мост `postMessage` (`demos/shared/analytics/demo-analytics.ts` → `useDemoAnalyticsBridge`).

### Фаза M1 — Формы в демо-лендингах (P0, ~0.5–1 день)

**Зачем:** закрыть воронку «открыл демо → отправил заявку» — ключевая метрика для SMB-портфолио.

#### Новые цели в Метрике (создать до деплоя кода)

| Идентификатор      | Параметры              | Когда                          |
| ------------------ | ---------------------- | ------------------------------ |
| `demo_lead_submit` | `source`, `demo_mode`  | Успешный POST `/api/demo-lead` |
| `demo_lead_error`  | `source`, `status`     | Ошибка отправки или валидации  |

`source`: `local-landing` | `clinic-landing` | `form-integration`

#### Изменения в коде

| # | Задача | Файлы |
| - | ------ | ----- |
| M1.1 | Общий хелпер `trackDemoEvent` для статики в `public/` (копия postMessage-логики или `public/shared/demo-analytics.js`) | `public/shared/demo-analytics.js` |
| M1.2 | Вызов `lead_submit` / `lead_error` после fetch | `public/localLanding/main.js`, `public/clinicLanding/main.js`, `public/formIntegration/main.js` |
| M1.3 | Расширить мост: события `lead_submit` / `lead_error` → `reachGoal(demo_lead_*)`, остальное → `demo_action` как сейчас | `useDemoAnalyticsBridge.ts`, `events.ts`, `yandexMetrika.ts` |
| M1.4 | Документировать параметры | этот файл |

**Критерий приёмки:** в `?_ym_debug=2` при отправке формы на «Линии» в консоли видно `demo_lead_submit` с `source: local-landing`.

---

### Фаза M2 — Воронка с главной (P1, ~0.5 дня)

**Зачем:** пункт 10.3 IMPROVEMENT-PLAN — «переходы в демо с главной».

#### Новые цели в Метрике

| Идентификатор           | Параметры           | Когда                                      |
| ----------------------- | ------------------- | ------------------------------------------ |
| `pricing_example_click` | `tier`, `href`      | Клик «Пример: …» в блоке услуг             |
| `cta_click`             | `place`, `target`   | CTA hero / footer («Обсудить», «Портфолио») |

`place`: `hero` | `footer` | `cta_block`  
`target`: путь (`/contact`, `/portfolio`, …)

#### Изменения в коде

| # | Задача | Файлы |
| - | ------ | ----- |
| M2.1 | `trackPricingExampleClick`, `trackCtaClick` | `events.ts` |
| M2.2 | onClick на ссылках-примерах | `AboutMe.tsx` |
| M2.3 | onClick на CTA-кнопках | `AboutMe.tsx` |
| M2.4 | Опционально: клик «Кейс» / «Демо» на `/for-freelance` | `ForFreelance.tsx` |

**Критерий:** из главной клик по «Лендинг стоматологии» → `pricing_example_click` с `tier: landing`.

---

### Фаза M3 — Вовлечённость в демо (P2, ~0.5 дня)

**Зачем:** отличить «открыл и ушёл» от «поиграл с админкой / лендингом».

#### Вариант A — через `demo_action` (без новых целей)

Добавить события в существующую цель `demo_action`:

| demo            | action          | Где                    |
| --------------- | --------------- | ---------------------- |
| `localLanding`  | `lead_submit`   | M1 (дубль — лучше M1)  |
| `bookingAdmin`  | `status_change` | смена статуса записи   |
| `bookingAdmin`  | `filter_change` | фильтр / поиск         |
| `clinicLanding` | `section_view`  | опционально: скролл до врачей |

#### Вариант B — отдельная цель `demo_engagement` (если отчёты перегружены)

Только если `demo_action` станет слишком шумной после M1.

#### Изменения в коде

| # | Задача | Файлы |
| - | ------ | ----- |
| M3.1 | postMessage из `bookingAdmin/main.js` | `public/bookingAdmin/main.js`, `public/shared/demo-analytics.js` |
| M3.2 | Таблица action в этом документе | `METRIKA.md` |

**Критерий:** смена статуса в админке → `demo_action` с `demo: bookingAdmin`, `action: status_change`.

---

### Фаза M4 — Настройка в интерфейсе Метрики (P1, без кода)

| # | Задача | Где в Метрике |
| - | ------ | ------------- |
| M4.1 | Сегмент «Открыл демо» | Цели → `demo_open` |
| M4.2 | Сегмент «Отправил заявку (контакт)» | `contact_submit` |
| M4.3 | Сегмент «Заявка из демо» | `demo_lead_submit` (после M1) |
| M4.4 | Воронка: `demo_open` → `demo_lead_submit` | Отчёты → Воронки |
| M4.5 | Воронка: `pricing_example_click` → `demo_open` | после M2 |
| M4.6 | Отчёт по параметру `demo` у `demo_open` | какие демо смотрят чаще |
| M4.7 | Отчёт по `slug` у `case_study_view` | какие кейсы читают |
| M4.8 | Дашборд «Конверсия портфолио» | избранные виджеты |

---

## Параметры `demo_action` (текущие)

| demo            | action               | Описание                   |
| --------------- | -------------------- | -------------------------- |
| `tariffPrices`  | `demo_ready`         | Демо инициализировано      |
| `tariffPrices`  | `period_change`      | Смена периода календаря    |
| `tariffPrices`  | `restriction_filter` | Фильтр ограничений         |
| `tariffPrices`  | `category_filter`    | Фильтр категорий           |
| `tariffPrices`  | `price_edit_start`   | Начало редактирования цены |
| `reportRevenue` | `demo_ready`         | Демо инициализировано      |
| `reportRevenue` | `period_change`      | Смена периода              |
| `reportRevenue` | `category_filter`    | Фильтр категорий           |
| `reportRevenue` | `report_loaded`      | Данные отчёта загружены    |
| `divisions`     | `demo_ready`         | Демо инициализировано      |
| `divisions`     | `division_open`      | Открыто подразделение      |
| `divisions`     | `user_assign`        | Назначение пользователей   |

### После M3 (дополнить)

| demo           | action          | Описание              |
| -------------- | --------------- | --------------------- |
| `bookingAdmin` | `status_change` | Смена статуса записи  |
| `bookingAdmin` | `filter_change` | Фильтр или поиск      |

---

## Матрица приоритетов

```
Срочно + важно           │ Можно позже
─────────────────────────┼──────────────────────────
M1 demo_lead_*           │ M3 bookingAdmin actions
M4 воронка demo→lead      │ M3 section_view
M2 pricing_example_click │ Отдельный счётчик в iframe
M4 сегменты              │ Server-side лог заявок
```

---

## Чеклист реализации

### Перед кодом M1

- [ ] Создать цели `demo_lead_submit`, `demo_lead_error` в Метрике
- [ ] Создать цели `pricing_example_click`, `cta_click` в Метрике

### M1

- [x] `public/shared/demo-analytics.js`
- [x] Трекинг в трёх формах демо
- [x] Расширить `useDemoAnalyticsBridge`
- [ ] Проверка `?_ym_debug=2`

### M2

- [x] Трекинг в `AboutMe.tsx`
- [x] Трекинг в `ForFreelance.tsx`
- [ ] Проверка с главной

### M3–M4

- [x] `bookingAdmin` events
- [ ] Сегменты и воронки в интерфейсе
- [ ] Отметить 10.3 в IMPROVEMENT-PLAN выполненным

---

## Проверка после деплоя

1. Откройте `https://danilmakes.ru/?_ym_debug=2`
2. **Сценарий A (контакт):** `/contact` → отправка → `contact_submit`
3. **Сценарий B (демо-форма):** `/CodeExample/localLanding` → форма → `demo_lead_submit` (после M1)
4. **Сценарий C (главная):** клик «Пример: …» → `pricing_example_click` (после M2)
5. **Сценарий D (портфолио):** демо Vue → `demo_open` → действие → `demo_action`
6. В отчёте **Содержание → Страницы**: `/portfolio`, `/contact`, `/CodeExample/*`
7. **Вебвизор** — только основной сайт, не клики внутри iframe (ограничение Метрики)

---

## Архитектура

```
┌─────────────────────────────────────────────────────────┐
│  SPA (danilmakes)          ym(110107124)                │
│  useYandexMetrika ─ hit                                   │
│  events.ts ─────── reachGoal(contact_*, demo_open, …)   │
│  useDemoAnalyticsBridge ◄── postMessage                 │
└────────────────────────────▲────────────────────────────┘
                             │ origin + source: danilmakes-demo
┌────────────────────────────┴────────────────────────────┐
│  iframe: /localLanding/, /clinicLanding/,               │
│          /formIntegration/, /bookingAdmin/,             │
│          /tariffPrices/, /reportRevenue/, /divisions/   │
│  trackDemoEvent() → parent.postMessage                    │
└─────────────────────────────────────────────────────────┘
```

**Код:**

- Основной сайт: `src/shared/analytics/`
- Мост iframe: `src/app/hooks/useDemoAnalyticsBridge.ts`
- Vue-демо: `demos/shared/analytics/demo-analytics.ts`
- Статика (после M1): `public/shared/demo-analytics.js`

---

## Чего не делать

- Не дублировать счётчик Метрики внутри каждого iframe — один счётчик на SPA + postMessage достаточно
- Не строить KPI на автоцелях — только кастомные с параметрами
- Не ждать Вебвизор для кликов в демо — использовать `demo_action` / `demo_lead_submit`
