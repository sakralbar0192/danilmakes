import { ECodeExamples } from 'app/codeExamples'

export interface CaseStudyLink {
    label: string
    href: string
    external?: boolean
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
            { label: 'Сайт', href: 'https://danilmakes.ru', external: true },
            { label: 'GitHub', href: 'https://github.com/sakralbar0192/danilmakes', external: true }
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
    }
]

export const getCaseStudyBySlug = (slug: string): CaseStudy | undefined =>
    CASE_STUDIES.find(item => item.slug === slug)

export const getCaseStudyByPortfolioId = (portfolioId: string): CaseStudy | undefined =>
    CASE_STUDIES.find(item => item.portfolioId === portfolioId)
