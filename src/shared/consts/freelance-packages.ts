export interface FreelancePackage {
    id: string
    title: string
    price: string
    summary: string
    includes: string[]
    demoLink?: string
    caseLink?: string
}

export const FREELANCE_INTRO =
    'Продуктовый разработчик. Беру небольшие проекты с понятным объёмом: лендинги, доработки, интеграции форм и сложные интерфейсы.'

export const FREELANCE_PACKAGES: FreelancePackage[] = [
    {
        id: 'start',
        title: 'Старт',
        price: 'от 15 000 ₽',
        summary: 'Лендинг или визитка для малого бизнеса — готовый к запуску одностраничник.',
        includes: [
            'До 5 блоков: услуги, о компании, отзывы, форма, контакты',
            'Адаптив под телефон и desktop',
            'Форма заявки с уведомлением на почту',
            'Базовое SEO: title, description'
        ],
        demoLink: '/CodeExample/localLanding',
        caseLink: '/portfolio/local-landing'
    },
    {
        id: 'fix',
        title: 'Доработка',
        price: 'от 2 000 ₽',
        summary: 'Баг, новая функция или правка по существующему коду — оценка по задаче.',
        includes: [
            'React, Vue, TypeScript, legacy API',
            'Оценка и сроки до старта работ',
            '1–2 раунда правок по согласованному ТЗ',
            'Передача исходников после оплаты'
        ],
        caseLink: '/portfolio/tariff-prices'
    },
    {
        id: 'integration',
        title: 'Интеграция',
        price: 'от 5 000 ₽',
        summary: 'Заявка с сайта сразу в Telegram и на почту — без ручного копирования.',
        includes: [
            'Форма на сайте → API → Telegram + email',
            'Валидация, защита от спама, rate limit',
            'Демо потока данных для согласования',
            'Деплой на ваш хостинг или VPS'
        ],
        demoLink: '/CodeExample/formIntegration',
        caseLink: '/portfolio/form-integration'
    }
]

export const FREELANCE_PLATFORMS = [
    {
        id: 'kwork',
        title: 'Kwork',
        note: 'Лендинги, доработки, формы → Telegram'
    },
    {
        id: 'fl',
        title: 'FL.ru',
        note: 'Сложный фронт, доработка SaaS, legacy API'
    }
] as const
