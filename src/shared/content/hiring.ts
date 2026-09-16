import type { ModeContent } from './types'

export const HIRING_CONTENT: ModeContent = {
    mode: 'hiring',
    nav: [
        { to: '/', label: 'Главная', end: true },
        { to: '/work', label: 'Кейсы' },
        { to: '/contact', label: 'Контакты' },
    ],
    hero: {
        brand: 'danilmakes',
        eyebrow: 'Красноярск · удалёнка · открыт к предложениям',
        title: 'Senior Frontend / Full-stack IC',
        lead:
            'Почти 6 лет. Три года в PMS: проектировал архитектуру модулей тарифов, контракт с API и тяжёлые операционные экраны. Стек — инструмент; коммерчески Vue и React. Ищу продуктовую команду на удалёнке, senior IC.',
        primaryCta: { to: '/work', label: 'Смотреть кейсы' },
        secondaryCta: { to: '/contact', label: 'Связаться' },
    },
    contact: {
        status: 'Открыт к предложениям',
        availability: 'Ищу роль',
        availabilityDetail: 'Удалёнка · Senior Frontend или Senior Full-stack FE-first (PHP + SPA)',
        responseTime: 'Отвечаю за 1–2 рабочих дня',
        intro:
            'Пишите по вакансиям и техническим знакомствам — Travel / Hospitality / сложный B2B SaaS. База в Красноярске, работаю только удалённо.',
        formTitle: 'Написать',
        messageLabel: 'Сообщение / ссылка на вакансию',
        submitLabel: 'Отправить',
        successMessage: 'Сообщение отправлено. Спасибо — отвечу в течение 1–2 рабочих дней.',
        showBudgetField: false,
    },
    home: {
        showPricing: false,
        showFaq: false,
        showAudience: true,
        showFeaturedWork: true,
        featuredTitle: 'Избранные кейсы',
        stackTitle: 'Стек',
        stackItems: [
            'Vue 2/3 · Vuex · Pinia',
            'React 18 · TypeScript',
            'PHP 8 · PostgreSQL',
            'Jest · Playwright · Chart.js',
            'Service Worker · IndexedDB',
            'Docker · Sentry',
        ],
        ctaTitle: 'Открыт к предложениям',
        ctaBody: 'Удалёнка · Senior IC · Travel / Hospitality / сложный B2B SaaS.',
        audienceTitle: 'Как работаю',
        audienceBody:
            'Сам проектировал архитектуру модуля тарифов — календарь на год × категории номеров: слой виртуализации, модель ячейки из данных и черновиков, точечное обновление после сохранения. Схему переиспользовали на других таблицах; коллеги делали фичи поверх неё. Описал контракт UI ↔ API и RFC — по ним онбордили. В First Line Software спроектировал поэтапную миграцию ключевых модулей с jQuery на React: Lighthouse 45 → 80, загрузка примерно на 2 секунды быстрее. Для команды: контур разбора клиентских ошибок (~в 3 раза быстрее поиск), perf-аудит (~на 35% быстрее разбор), подход к миграции Vue 2 → Vue 3. Шесть месяцев вёл кросс-команду — дальше senior IC.',
    },
    workIndex: {
        title: 'Кейсы',
        intro:
            'Архитектура ключевых модулей PMS: операционные редакторы, контракты API, миграции без остановки продукта. Демо на синтетике с живым API — можно сохранить и увидеть результат.',
        ctaLabel: 'Связаться',
    },
    caseCta: {
        defaultPrompt: 'Нужна архитектура таких экранов в команде?',
        buttonLabel: 'Написать',
    },
}
