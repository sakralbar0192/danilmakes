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
        title: 'Frontend · ~6 лет · B2B SaaS',
        lead:
            'Frontend · Vue / React · операционные B2B-интерфейсы. ~6 лет, последние 3 — hospitality PMS: тяжёлые таблицы и календари, контракты с API, согласованность данных после сохранения. Full-stack — смежный опыт в кейсах, не главная витрина.',
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
        layoutNote: 'Учебные макеты — демонстрация вёрстки, не коммерческие проекты.',
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
        ctaBody: 'Удалёнка · Frontend · Vue / React · операционные B2B-интерфейсы.',
        audienceTitle: 'Как работаю',
        audienceBody:
            'Проектирую архитектуру операционных экранов и контракты с API. Шесть месяцев вёл кросс-команду — дальше индивидуальный вклад в продукт.',
    },
    workIndex: {
        title: 'Кейсы',
        intro:
            'Кейсы одного продуктового контура — hospitality B2B SaaS (PMS), 2023–2026. Не восемь работодателей: операционные редакторы, контракты API, миграции без остановки. Демо — портфолио-срез на синтетике, не прод Bnovo.',
        ctaLabel: 'Связаться',
    },
    caseCta: {
        defaultPrompt: 'Нужен Frontend под такие операционные экраны?',
        buttonLabel: 'Написать',
    },
}
