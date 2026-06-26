import { ECodeExamples } from 'app/codeExamples'

export interface CaseStudyLink {
    label: string
    href: string
    external?: boolean
}

export interface CaseStudyRelatedDemo {
    label: string
    href: string
}

export interface CaseStudy {
    slug: string
    portfolioId: string
    title: string
    metaDescription: string
    lead: string
    context: string
    challenge: string
    solution: string
    stack: string[]
    results: string[]
    relatedDemos?: CaseStudyRelatedDemo[]
    links: CaseStudyLink[]
}

export const CASE_STUDIES: CaseStudy[] = [
    {
        slug: 'danilmakes',
        portfolioId: 'danilmakes',
        title: 'danilmakes.ru',
        metaDescription: 'Кейс: персональный сайт-визитка с портфолио, формой заявок и деплоем на VPS.',
        lead: 'Сайт-визитка фрилансера: портфолио, цены, FAQ, приём заявок без посредников.',
        context: 'Нужен был собственный канал привлечения заказов — с доверием, понятными ценами и рабочей формой связи.',
        challenge: 'Собрать full-stack решение на одном VPS с малым объёмом RAM: SPA, API, БД, SSL, почта и простой деплой без CI-сервера.',
        solution: 'React SPA на Vite, Express API, PostgreSQL в Docker, nginx с Let\'s Encrypt, уведомления через Яндекс SMTP. Демо портфолио — статика и iframe. Деплой одной командой через rsync.',
        stack: [
            'React 18',
            'TypeScript',
            'Vite',
            'Bootstrap',
            'Express',
            'PostgreSQL',
            'Docker',
            'nginx',
            'Let\'s Encrypt'
        ],
        results: [
            'Сайт на danilmakes.ru с HTTPS',
            'Форма заявки сохраняет данные в БД и дублирует на почту',
            'Портфолио с интерактивными демо без отдельного backend',
            'Обновление продакшена через rsync-deploy.sh'
        ],
        links: [
            { label: 'GitHub', href: 'https://github.com/sakralbar0192/danilmakes', external: true },
            { label: 'Сайт', href: 'https://danilmakes.ru', external: true }
        ]
    },
    {
        slug: 'local-landing',
        portfolioId: 'local-landing',
        title: 'Студия «Линия»',
        metaDescription: 'Кейс: витринный лендинг для услуг — салон, барбершоп, косметолог. Услуги, отзывы, форма записи, адаптив.',
        lead: 'Учебный лендинг под типовый заказ малого бизнеса: подходит для салона, барбершопа, косметолога и маникюрного кабинета.',
        context: 'Для портфолио не хватало коммерчески узнаваемого примера — «сайт для такого же бизнеса, как у заказчика», а не учебного макета HTML Academy. Ниша услуг с онлайн-записью — один из самых частых запросов на биржах.',
        challenge: 'Собрать лендинг, который выглядит как реальный бизнес услуг, корректно работает на телефоне и содержит форму с интеграцией в backend.',
        solution: 'Статический лендинг в `public/localLanding/`: hero, услуги, отзывы (вымышленные), форма записи, контакты. Форма отправляет POST на `/api/demo-lead`. Связан с демо интеграции и панелью заявок как единая воронка.',
        stack: [
            'HTML5',
            'CSS',
            'JavaScript',
            'Express API',
            'Адаптивная вёрстка'
        ],
        results: [
            'Одностраничник с 5 блоками — готов к запуску под ваш бренд',
            'Подходит для салона красоты, барбершопа, косметолога, маникюрного кабинета',
            'Адаптив: mobile-first, бургер-меню',
            'Форма записи связана с Telegram и почтой через API',
            'Помечен как портфолио-демо с вымышленными данными'
        ],
        relatedDemos: [
            {
                label: 'Лендинг «Студия Линия»',
                href: `/CodeExample/${ECodeExamples.LOCAL_LANDING}`
            },
            {
                label: 'Форма → Telegram + почта',
                href: '/portfolio/form-integration'
            },
            {
                label: 'Панель заявок',
                href: '/portfolio/booking-admin'
            }
        ],
        links: [
            { label: 'Демо', href: `/CodeExample/${ECodeExamples.LOCAL_LANDING}` },
            { label: 'Интеграция', href: '/portfolio/form-integration' },
            { label: 'Панель заявок', href: '/portfolio/booking-admin' }
        ]
    },
    {
        slug: 'clinic-landing',
        portfolioId: 'clinic-landing',
        title: 'Стоматология «Дента+»',
        metaDescription: 'Кейс: витринный лендинг стоматологии — услуги, врачи, акции, форма записи, адаптив.',
        lead: 'Учебный лендинг для медицинской ниши: доверие, врачи, прозрачные цены и онлайн-запись — отдельно от салона красоты.',
        context: 'После лендинга «Студия Линия» портфолио закрывало только нишу beauty. На биржах часто ищут «сайт для стоматологии / клиники» — нужен второй узнаваемый пример с другим визуалом и структурой.',
        challenge: 'Собрать medical-лендинг: блок врачей, акцент на доверии и лицензии, форма записи с тем же API — без копирования дизайна салона.',
        solution: 'Статический лендинг в `public/clinicLanding/`: hero, услуги с ценами, врачи, отзывы (вымышленные), форма записи, контакты. Teal-палитра, mobile-first. Форма — POST на `/api/demo-lead` с `source: clinic-landing`.',
        stack: [
            'HTML5',
            'CSS',
            'JavaScript',
            'Express API',
            'Адаптивная вёрстка'
        ],
        results: [
            'Лендинг для стоматологии и клиник с блоком врачей',
            'Подходит для стоматологии, ортодонтии, детской стоматологии',
            'Адаптив: mobile-first, бургер-меню',
            'Форма записи связана с Telegram и почтой через общий API',
            'Помечен как портфолио-демо с вымышленными данными'
        ],
        relatedDemos: [
            {
                label: 'Лендинг «Дента+»',
                href: `/CodeExample/${ECodeExamples.CLINIC_LANDING}`
            },
            {
                label: 'Форма → Telegram + почта',
                href: '/portfolio/form-integration'
            },
            {
                label: 'Лендинг салона (другая ниша)',
                href: '/portfolio/local-landing'
            }
        ],
        links: [
            { label: 'Демо', href: `/CodeExample/${ECodeExamples.CLINIC_LANDING}` },
            { label: 'Интеграция', href: '/portfolio/form-integration' },
            { label: 'Лендинг салона', href: '/portfolio/local-landing' }
        ]
    },
    {
        slug: 'form-integration',
        portfolioId: 'form-integration',
        title: 'Форма → Telegram + почта',
        metaDescription: 'Кейс: интеграция заявок с сайта — Express API, Telegram Bot API и SMTP.',
        lead: 'Заявка с формы уходит владельцу в Telegram и на почту — с наглядной схемой потока данных.',
        context: 'Услуга «интеграции от 5 000 ₽» нуждалась в наглядном примере: заказчик должен увидеть, что происходит после нажатия «Отправить».',
        challenge: 'Сделать минимальный, но рабочий pipeline: валидация, защита от спама, два канала уведомлений и понятный demo-режим без настроенных credentials.',
        solution: 'Endpoint `POST /api/demo-lead` на Express: Zod-валидация, honeypot, rate limit. Параллельная отправка в Telegram Bot API и через Nodemailer. Отдельная демо-страница со схемой и JSON-ответом сервера.',
        stack: [
            'Express',
            'Zod',
            'Telegram Bot API',
            'Nodemailer',
            'express-rate-limit'
        ],
        results: [
            'Схема потока: форма → API → Telegram + почта',
            'Тестовая форма с отображением ответа сервера',
            'Используется на лендингах «Студия Линия» и «Дента+»',
            'В демо-режиме заявка принимается даже без настроенных каналов'
        ],
        links: [
            { label: 'Демо', href: `/CodeExample/${ECodeExamples.FORM_INTEGRATION}` },
            { label: 'Лендинг салона', href: `/CodeExample/${ECodeExamples.LOCAL_LANDING}` },
            { label: 'Лендинг клиники', href: `/CodeExample/${ECodeExamples.CLINIC_LANDING}` }
        ]
    },
    {
        slug: 'booking-admin',
        portfolioId: 'booking-admin',
        title: 'Админка записей',
        metaDescription: 'Кейс: демо панели записей для услуг — фильтр, статусы, демо-данные.',
        lead: 'Панель для администратора: список заявок, фильтр по статусу и поиск по клиенту.',
        context: 'После лендинга и формы интеграции не хватало примера «внутренней панели» — то, что владелец бизнеса видит после заявки клиента.',
        challenge: 'Показать типовой сценарий работы с заявками без серверной части: фильтрация, смена статуса, мобильная таблица — на понятном языке услуг.',
        solution: 'Статическое демо `public/bookingAdmin/`: таблица записей, фильтр по статусу, поиск, смена статуса в памяти. Демо-данные салона «Линия».',
        stack: [
            'HTML5',
            'CSS',
            'JavaScript',
            'Адаптивная таблица'
        ],
        results: [
            'Список записей с услугой, датой и телефоном',
            'Фильтр и поиск по клиенту',
            'Смена статуса: новая → подтверждена → завершена',
            'Связан с лендингом «Студия Линия» как следующий шаг воронки'
        ],
        links: [
            { label: 'Демо', href: `/CodeExample/${ECodeExamples.BOOKING_ADMIN}` },
            { label: 'Лендинг', href: `/CodeExample/${ECodeExamples.LOCAL_LANDING}` }
        ]
    },
    {
        slug: 'report-revenue',
        portfolioId: 'report-revenue',
        title: 'Отчёт по доходу',
        metaDescription: 'Кейс: аналитический экран с графиками, метриками ADR и RevPAR — портфолио-демо на MSW.',
        lead: 'Отчёт для владельца: выручка по дням, загрузка и динамика — демо на синтетических данных без backend.',
        context: 'В продуктовой разработке нужен был экран аналитики дохода: ключевые показатели, динамика по периодам и детализация. Подходит для дашбордов, отчётов по мастерам и внутренней аналитики бизнеса.',
        challenge: 'Свести несколько источников данных в понятные графики и таблицу, дать фильтры по периоду и вынести экран в автономное портфолио-демо без production API.',
        solution: 'Vue 3 + Chart.js + Vuex, фильтры и группировка данных, MSW с синтетическими ответами. Сборка в статику под `/reportRevenue/`, встраивание через iframe на danilmakes.ru.',
        stack: [
            'Vue 3',
            'Chart.js',
            'Vuex',
            'MSW',
            'Vite',
            'TypeScript'
        ],
        results: [
            'Графики выручки, загрузки и динамики по периодам',
            'Таблица с группировкой по категориям',
            'Фильтры по периоду без backend в портфолио',
            'Подход применим к дашбордам, отчётам и внутренней аналитике'
        ],
        links: [
            { label: 'Демо', href: `/CodeExample/${ECodeExamples.REPORT_REVENUE}` },
            { label: 'Портфолио', href: '/portfolio' }
        ]
    },
    {
        slug: 'tariff-prices',
        portfolioId: 'tariff-prices',
        title: 'Цены и ограничения',
        metaDescription: 'Кейс: календарный экран управления ценами и ограничениями тарифа с виртуальным скроллом и MSW-демо.',
        lead: 'Сложный hotel-экран: календарная таблица, inline-редактирование, виртуальный скролл — без backend в портфолио.',
        context: 'Нужно было показать уровень работы с enterprise UI: плотная таблица, десятки режимов отображения, мобильная адаптация.',
        challenge: 'Перенести production-экран в автономное демо: сохранить UX оригинала, заменить API на синтетические данные, уложиться в разумное время загрузки.',
        solution: 'Vue 3 + Vuex + Vuetify 3, виртуальный скролл, MSW перехватывает ASMX-подобные запросы. Сборка в статику под `/tariffPrices/`, встраивание через iframe на danilmakes.ru.',
        stack: [
            'Vue 3',
            'Vuex',
            'Vuetify 3',
            'MSW',
            'Vite',
            'TypeScript'
        ],
        results: [
            'Интерактивное демо с переключением тарифов и режимов',
            'Inline-редактирование и сохранение без backend',
            'Виртуальный скролл для больших календарей',
            'Автономная статика в портфолио'
        ],
        links: [
            { label: 'Демо', href: `/CodeExample/${ECodeExamples.TARIFF_PRICES}` },
            { label: 'Портфолио', href: '/portfolio' }
        ]
    },
    {
        slug: 'divisions',
        portfolioId: 'divisions',
        title: 'Divisions',
        metaDescription: 'Кейс: модуль администрирования организационной структуры на Lit Web Components с MSW-демо.',
        lead: 'Модуль подразделений и ресурсных пулов на Lit Web Components — демо на оригинальных компонентах.',
        context: 'Заказчик в hotel-tech нуждался в модуле org-structure с CRUD, навигацией и интеграцией с legacy API.',
        challenge: 'Собрать FSD-архитектуру на Web Components, обеспечить типизацию и вынести демо в портфолио без production backend.',
        solution: 'TypeScript, Lit, Feature-Sliced Design. Webpack-сборка с MSW-моками ASMX-сервисов. Shims для portfolio-режима. Деплой как статика `/divisions/`.',
        stack: [
            'TypeScript',
            'Lit',
            'Webpack',
            'MSW',
            'Feature-Sliced Design'
        ],
        results: [
            'CRUD подразделений и назначение менеджеров в демо',
            'Навигация по ресурсным пулам и пользователям',
            'Работает без backend через MSW',
            'Открытый исходный код на GitHub'
        ],
        links: [
            { label: 'Демо', href: `/CodeExample/${ECodeExamples.DIVISIONS}` },
            { label: 'GitHub', href: 'https://github.com/sakralbar0192/Divisions', external: true }
        ]
    },
    {
        slug: 'family-meals',
        portfolioId: 'family-meals',
        title: 'Family Meal Planning',
        metaDescription: 'Кейс: семейное приложение планирования питания с Module Federation и MSW-демо.',
        lead: 'Рецепты → недельный план → список покупок: полный UX-сценарий в микрофронтенд-архитектуре.',
        context: 'Pet-project для семейного планирования питания: библиотека рецептов, планировщик и автоматический shopping list.',
        challenge: 'Показать microfrontend-архитектуру в портфолио без поднятия PHP/Go backend — сохранить полный пользовательский сценарий.',
        solution: 'Vue 3 host + 3 remote (recipes, planner, shopping) через Module Federation. MSW с синтетическими данными. Сборка `build:demo` в единый бандл `/familyMeals/`.',
        stack: [
            'Vue 3',
            'Module Federation',
            'MSW',
            'Vite',
            'Microservices (PHP/Go)',
            'BFF'
        ],
        results: [
            'Полный сценарий: рецепты → план → покупки',
            'Три независимых микрофронтенда в одном демо',
            'Работает без backend в портфолио',
            'Демо встроено в danilmakes.ru через iframe'
        ],
        links: [
            { label: 'Демо', href: `/CodeExample/${ECodeExamples.FAMILY_MEALS}` },
            { label: 'Портфолио', href: '/portfolio' }
        ]
    },
    {
        slug: 'vball-agregator',
        portfolioId: 'vball-agregator',
        title: 'VBallAgregator',
        metaDescription: 'Кейс: pet-project — мульти-спорт Telegram-сервис для волейбола и тенниса. Эволюция RacketMate, стадия тестирования.',
        lead: 'От бота для теннисных кортов до агрегатора спортивных игр — pet-project с полным циклом разработки и тестирования.',
        context: 'RacketMate закрывал запись на корты через Telegram. Идею расширили: один сервис для волейбола и большого тенниса — поиск игр, подбор по уровню и расписанию, роли игрока и организатора.',
        challenge: 'Объединить два спортивных домена в одной архитектуре, сохранить удобный UX в Telegram, покрыть сценарии тестами и довести прототип до стадии, готовой к проверке с реальными пользователями.',
        solution: 'Monorepo: общее ядро на TypeScript, Prisma + PostgreSQL, отдельные боты для волейбола и тенниса, scheduler-service, интеграционные и e2e-тесты. RacketMate вошёл в модуль теннисного подбора.',
        stack: [
            'TypeScript',
            'Telegraf',
            'Prisma',
            'PostgreSQL',
            'Jest',
            'Docker'
        ],
        results: [
            'Мульти-спорт прототип: волейбол и большой теннис в одном backend',
            'RacketMate эволюционировал в часть VBallAgregator',
            'Проект дошёл до стадии тестирования с регрессионным чеклистом',
            'Дальнейшая доработка и вывод на рынок признаны нецелесообразными',
            'Опыт применим к Telegram-ботам, записи и подбору для сервисов'
        ],
        links: [
            { label: 'GitHub', href: 'https://github.com/sakralbar0192/VBallAgregator', external: true },
            { label: 'Портфолио', href: '/portfolio' }
        ]
    }
]

export const getCaseStudyBySlug = (slug: string): CaseStudy | undefined =>
    CASE_STUDIES.find(item => item.slug === slug)

export const getCaseStudyByPortfolioId = (portfolioId: string): CaseStudy | undefined =>
    CASE_STUDIES.find(item => item.portfolioId === portfolioId)
