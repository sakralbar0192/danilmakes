# SEO — чеклист для danilmakes.ru

**Связанные документы:** [IMPROVEMENT-PLAN.md](./IMPROVEMENT-PLAN.md) (10.6) · [METRIKA.md](./METRIKA.md)

Счётчик и цели — в Метрике. Ниже — что должно быть на сайте, чтобы поиск мог находить кейсы.

---

## Уже сделано в коде

| Элемент | Где |
| ------- | --- |
| Уникальный `<title>` по маршруту | `pageTitles.ts` + `usePageTitle` |
| `meta description`, OG title/description/url, canonical | тот же хук |
| Поисковые `seoTitle` / `metaDescription` у кейсов | `case-studies.ts` |
| `sitemap.xml` со всеми `/portfolio/*` | `public/sitemap.xml` |
| `robots.txt` | `public/robots.txt` |
| Яндекс.Вебмастер + sitemap | см. SPEC-BACKLOG O1 |

---

## Чеклист по страницам кейсов

Для каждого slug в `CASE_STUDIES` проверить:

1. **Title** отвечает на запрос заказчика («лендинг для салона», «сайт для стоматологии»), а не только на внутреннее имя демо.
2. **Description** 140–160 символов, без воды, с нишей и форматом (лендинг / админка / бот).
3. **H1** можно оставить бренд кейса («Студия Линия») — смысл для поиска несёт title + lead.
4. **URL** стабильный (`/portfolio/local-landing`), alias редиректит (`racketmate` → `vball-agregator`).
5. **CTA** внизу кейса ведёт на `/contact` с понятным вопросом под нишу.
6. Страница есть в `sitemap.xml`.

Приоритет для органики (по метрике и спросу на биржах):

1. `local-landing`, `clinic-landing`
2. `form-integration`, `booking-admin`
3. `report-revenue`, `tariff-prices`
4. остальное

---

## Операционка (вне кода)

- [ ] В [Вебмастере](https://webmaster.yandex.ru) переобход главной и топ-кейсов после деплоя title/description
- [ ] Google Search Console: свойство `danilmakes.ru`, sitemap
- [ ] Фильтр своих визитов в Метрике (иначе SEO-эффект не видно)
- [ ] 2–3 внешних упоминания со ссылкой (Telegram, отклик на бирже, GitHub README)
- [ ] Позже: `og:image` 1200×630 под шаринг (сейчас нет)

---

## Ограничение SPA

Без SSR/prerender боты без JS видят только meta из `index.html` (главная). Google и Яндекс обычно исполняют JS — клиентские title/description работают. Если понадобится жёсткая индексация без JS — отдельная задача на prerender (не в этом чеклисте).
