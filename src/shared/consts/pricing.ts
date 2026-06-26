export interface PricingExample {
    href: string
    label: string
}

export interface PricingTier {
    id: string
    title: string
    price: string
    description: string
    includes?: string[]
    examples: PricingExample[]
}

export const PRICING_TIERS: PricingTier[] = [
    {
        id: 'landing',
        title: 'Лендинг / визитка',
        price: 'от 15 000 ₽',
        description: 'Одностраничник под ключ — не шаблон, а готовый к запуску сайт для вашего бизнеса.',
        includes: [
            'До 5 блоков: услуги, о компании, отзывы, форма, контакты',
            'Адаптив под телефон и desktop',
            'Форма заявки с уведомлением на почту',
            'Базовое SEO: title, description'
        ],
        examples: [
            {
                href: '/portfolio/local-landing',
                label: 'Лендинг салона красоты'
            },
            {
                href: '/portfolio/clinic-landing',
                label: 'Лендинг стоматологии'
            },
            {
                href: '/portfolio/booking-admin',
                label: 'Панель заявок для салона'
            }
        ]
    },
    {
        id: 'fix',
        title: 'Доработка проекта',
        price: 'от 2 000 ₽',
        description: 'Багфикс, новая функция, правки по существующему коду — оценка по задаче.',
        examples: [
            {
                href: '/portfolio/booking-admin',
                label: 'Панель заявок для бизнеса'
            },
            {
                href: '/portfolio/tariff-prices',
                label: 'Сложная таблица и админка'
            }
        ]
    },
    {
        id: 'mvp',
        title: 'Сайт под ключ / MVP',
        price: 'от 30 000 ₽',
        description: 'Полный сценарий для бизнеса или минимальный продукт для проверки идеи: сайт + форма + уведомления + панель заявок, либо фронт + API + БД.',
        examples: [
            {
                href: '/portfolio/local-landing',
                label: 'Сайт + форма + панель заявок'
            },
            {
                href: '/portfolio/clinic-landing',
                label: 'Лендинг клиники с записью'
            }
        ]
    },
    {
        id: 'integration',
        title: 'Интеграции',
        price: 'от 5 000 ₽',
        description: 'Заявка с сайта сразу в Telegram и на почту — без ручного копирования. Также API, CRM и внешние сервисы.',
        examples: [
            {
                href: '/portfolio/form-integration',
                label: 'Форма → Telegram + почта'
            }
        ]
    }
]

export const PRICING_NOTE =
    'Цены — за пакет «под ключ», не за «страницу за вечер». Точная стоимость — после обсуждения задачи. Работаю с фиксированным объёмом и сроками.'
