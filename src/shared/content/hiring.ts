import type { ModeContent } from './types'

/** Same URL as SITE_CONTACT.hhFrontend — kept inline to avoid content↔contact cycle. */
const HH_FRONTEND_RESUME =
    'https://hh.ru/resume/08d61cb6ff10ccd1200039ed1f64486d705041'

export const HIRING_CONTENT: ModeContent = {
    mode: 'hiring',
    nav: [
        { to: '/', label: 'Главная', end: true },
        { to: '/work', label: 'Кейсы' },
        { to: '/contact', label: 'Контакты' },
    ],
    hero: {
        brand: 'danilmakes',
        eyebrow: 'Красноярск · удалёнка',
        title: 'Frontend · 5+ лет · B2B SaaS',
        lead:
            'Frontend · Vue / React · операционные B2B-интерфейсы. Последние 3 года — hospitality PMS: тяжёлые таблицы и календари, контракты с API, согласованность данных после сохранения.',
        primaryCta: { to: '/work', label: 'Смотреть кейсы' },
        secondaryCta: { to: HH_FRONTEND_RESUME, label: 'Резюме на HH', external: true },
    },
    contact: {
        status: 'Открыт к предложениям',
        availability: 'Открыт к предложениям',
        availabilityDetail: 'Удалёнка · Frontend (Vue / React) · B2B SaaS',
        responseTime: 'Отвечаю за 1–2 рабочих дня',
        intro:
            'Пишите по вакансиям Frontend (Vue / React) в продуктовых B2B-командах. Full-stack FE-first — если в вакансии явно нужны PHP / API. База в Красноярске, работаю только удалённо.',
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
        showLayoutCases: false,
        featuredTitle: 'Избранные кейсы',
        layoutTitle: 'Вёрстка',
        layoutNote: 'демонстрация вёрстки, не коммерческие проекты.',
        stackTitle: 'Стек',
        stackItems: [
            'Vue 2/3 · Vuex · Pinia',
            'React 18 · Redux',
            'PHP 8 · PostgreSQL',
            'Jest · Playwright ',
            'Service Worker · IndexedDB',
            'Docker · Sentry',
        ],
        ctaTitle: 'Открыт к предложениям',
        ctaBody: 'Удалёнка · Frontend · Vue / React',
        audienceTitle: 'Как работаю',
        audienceBody: 'Проектирую архитектуру экранов и контракты с API. Есть опыт менторинга коллег и координации кросс-функциональной команды',
    },
    workIndex: {
        title: 'Кейсы',
        intro:
            'Кейсы продуктового контура — hospitality B2B SaaS (PMS), 2023–2026',
        ctaLabel: 'Связаться',
    },
    caseCta: {
        defaultPrompt: 'Нужен Frontend под такие операционные экраны?',
        buttonLabel: 'Написать',
    },
}
