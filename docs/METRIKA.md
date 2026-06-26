# Яндекс.Метрика — настройка целей

Счётчик: **110107124** ([metrika.yandex.ru](https://metrika.yandex.ru))

## JavaScript-цели

Создайте в интерфейсе Метрики → **Цели** → **JavaScript-событие** с идентификаторами:


| Идентификатор     | Когда срабатывает                                         |
| ----------------- | --------------------------------------------------------- |
| `contact_submit`  | Успешная отправка формы на `/contact`                     |
| `contact_error`   | Ошибка отправки формы                                     |
| `demo_open`       | Демо загрузилось в iframe (`params.demo`)                 |
| `demo_load_error` | Таймаут или ошибка загрузки демо                          |
| `case_study_view` | Просмотр кейса (`params.slug`)                            |
| `external_click`  | Клик по GitHub / Telegram / внешнему демо                 |
| `demo_action`     | Действие внутри Vue-демо (`params.demo`, `params.action`) |


## Параметры `demo_action`


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


## Сегменты (рекомендуемые)

- **Открыли демо** — достигнута цель `demo_open`
- **Отправили заявку** — достигнута цель `contact_submit`
- **Активность в демо** — достигнута цель `demo_action`

## Проверка после деплоя

1. Откройте `https://danilmakes.ru/?_ym_debug=2`
2. Пройдите сценарий: главная → портфолио → демо → контакты → форма
3. В отчёте **Содержание → Страницы** должны быть `/portfolio`, `/contact`, `/CodeExample/`*
4. **Страницы выхода** — последняя страница сессии
5. **Вебвизор** — запись кликов на основном сайте (не внутри iframe)

## Код

- Основной сайт: `src/shared/analytics/`
- Мост iframe: `demos/shared/analytics/demo-analytics.ts`