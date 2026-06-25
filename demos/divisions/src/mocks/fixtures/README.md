# Фикстуры для демо Divisions

Синтетические данные для MSW-моков. Состояние CRUD хранится в памяти в [`store.js`](../store.js).

Параметры демо по умолчанию — в [`export-context.json`](./export-context.json).

## Файлы

| Файл | Назначение |
|------|------------|
| [`users.json`](./users.json) | Справочник пользователей (имя, филиал, даты) |
| [`export-context.json`](./export-context.json) | ID по умолчанию и пример deep-link |

## export-context.json

```json
{
  "exportedAt": "2026-06-24",
  "defaultDivisionId": 1,
  "defaultPoolId": 1,
  "defaultMode": "divisionsLayer",
  "deepLinkExample": "?mode=divisionDetailsLayer&division_id=1"
}
```

## Начальные данные

- 10 подразделений с менеджерами и пулами ресурсов
- 18 пулов, привязанных к подразделениям
- 25 пользователей в `users.json`; назначения — в `store.js` (`divisionUsers`, `poolUsers`)

После перезагрузки страницы изменения CRUD сбрасываются к начальному состоянию.
