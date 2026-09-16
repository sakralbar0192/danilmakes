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
            'Senior frontend, ~6 лет. Последние 3 года — B2B SaaS (PMS для тысяч отелей): архитектура ключевых модулей, контракты с API, согласованность данных после сохранения. Коммерчески Vue и React; стек — инструмент. Ищу продуктовую команду на удалёнке.',
        primaryCta: { to: '/work', label: 'Смотреть кейсы' },
        secondaryCta: { to: '/contact#resume', label: 'Резюме на HH' },
    },
    contact: {
        status: 'Открыт к предложениям',
        availability: 'Ищу роль',
        availabilityDetail: 'Удалёнка · Senior Frontend или Senior Full-stack FE-first (PHP + SPA)',
        responseTime: 'Отвечаю за 1–2 рабочих дня',
        intro:
            'Пишите по вакансиям Senior Frontend и Senior Full-stack FE-first. База в Красноярске, работаю только удалённо.',
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
        ctaBody: 'Удалёнка · Senior Frontend или Senior Full-stack IC.',
        audienceTitle: 'Как работаю',
        audienceBody:
            'Senior IC, удалёнка. Проектирую архитектуру операционных экранов и контракты с API. Шесть месяцев вёл кросс-команду — дальше IC.',
    },
    workIndex: {
        title: 'Кейсы',
        intro:
            'Кейсы одного продуктового контура — hospitality B2B SaaS (PMS), 2023–2026. Не восемь работодателей: архитектура операционных редакторов, контракты API, миграции без остановки. Демо на синтетике с живым API.',
        ctaLabel: 'Связаться',
    },
    caseCta: {
        defaultPrompt: 'Нужен Senior IC под архитектуру таких экранов?',
        buttonLabel: 'Написать',
    },
}
