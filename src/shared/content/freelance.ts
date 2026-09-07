import type { ModeContent } from './types'

export const FREELANCE_CONTENT: ModeContent = {
    mode: 'freelance',
    nav: [
        { to: '/', label: 'Главная', end: true },
        { to: '/portfolio', label: 'Портфолио' },
        { to: '/contact', label: 'Контакты' },
    ],
    hero: {
        brand: 'danilmakes',
        eyebrow: 'Красноярск · отвечаю за 1–2 рабочих дня',
        title: 'Продуктовый разработчик в Красноярске',
        lead:
            'Сайты для салонов, клиник и локального бизнеса — с формой записи, уведомлениями в Telegram и понятными сроками. Также доработка сложных интерфейсов для продуктовых команд.',
        primaryCta: { to: '/contact', label: 'Обсудить проект' },
        secondaryCta: { to: '/portfolio', label: 'Смотреть работы' },
    },
    contact: {
        status: 'Принимаю небольшие заказы',
        availability: 'Свободен',
        availabilityDetail: '',
        responseTime: 'Отвечаю за 1–2 рабочих дня',
        intro:
            'Расскажите о задаче — отвечу в течение 1–2 рабочих дней. База в Красноярске, работаю с заказчиками по всей России.',
        formTitle: 'Форма заявки',
        messageLabel: 'Описание задачи',
        submitLabel: 'Отправить',
        successMessage: 'Заявка отправлена. Спасибо!',
        showBudgetField: true,
    },
    home: {
        showPricing: true,
        showFaq: true,
        showAudience: true,
        showFeaturedWork: false,
        featuredTitle: 'Работы',
        stackTitle: 'Стек',
        stackItems: [],
        ctaTitle: 'Есть задача?',
        ctaBody: 'Расскажите о проекте — отвечу в течение 1–2 рабочих дней.',
        audienceTitle: 'Для кого',
        audienceBody:
            'Малый бизнес и стартапы на ранней стадии в Красноярске и по России, а также команды, которым нужна доработка сложных интерфейсов — один ответственный разработчик без агентской наценки.',
    },
    workIndex: {
        title: 'Портфолио',
        intro:
            'Приложения и макеты, которые показывают уровень работы. Каждый пункт — живая демонстрация или развёрнутый кейс.',
        ctaLabel: 'Обсудить такой же проект',
        ctaSecondaryLabel: 'Для бирж',
        ctaSecondaryTo: '/for-freelance',
    },
    caseCta: {
        defaultPrompt: 'Нужен похожий проект?',
        buttonLabel: 'Обсудить такой же проект',
    },
}
