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
        title: 'Frontend / full-stack для Travel & B2B SaaS',
        lead:
            '~6 лет опыта. Три года — hospitality PMS: тарифы, availability, revenue. Сложные data-heavy экраны, mobile/WebView, смежный PHP + PostgreSQL. Ищу продуктовую команду.',
        primaryCta: { to: '/work', label: 'Смотреть кейсы' },
        secondaryCta: { to: '/contact', label: 'Связаться' },
    },
    contact: {
        status: 'Открыт к предложениям',
        availability: 'Ищу роль',
        availabilityDetail: 'Удалёнка · Middle+ Frontend (Vue) или full-stack PHP+Vue',
        responseTime: 'Отвечаю за 1–2 рабочих дня',
        intro:
            'Пишите по вакансиям и техническим знакомствам — Travel / Hospitality / сложный B2B SaaS. База в Красноярске, работаю удалённо.',
        formTitle: 'Написать',
        messageLabel: 'Сообщение / ссылка на вакансию',
        submitLabel: 'Отправить',
        successMessage: 'Сообщение отправлено. Спасибо — отвечу в течение 1–2 рабочих дней.',
        showBudgetField: false,
    },
    home: {
        showPricing: false,
        showFaq: false,
        showAudience: false,
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
        ctaBody: 'Удалёнка · Travel / Hospitality / data-heavy B2B SaaS.',
    },
    workIndex: {
        title: 'Кейсы',
        intro:
            'Hospitality B2B SaaS / PMS: сложные календари, inventory, revenue и data-fix. Демо на синтетике с живым API — можно сохранить и увидеть результат.',
        ctaLabel: 'Связаться',
    },
    caseCta: {
        defaultPrompt: 'Похожий опыт нужен в команде?',
        buttonLabel: 'Написать',
    },
}
