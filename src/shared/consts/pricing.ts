export interface PricingExample {

    href: string

    label: string

}



export interface PricingTier {

    id: string

    title: string

    price: string

    description: string

    examples: PricingExample[]

}



export const PRICING_TIERS: PricingTier[] = [

    {

        id: 'landing',

        title: 'Лендинг / визитка',

        price: 'от 15 000 ₽',

        description: 'Одностраничник или небольшой сайт: адаптив, форма связи, базовое SEO.',

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

        title: 'MVP / прототип',

        price: 'от 30 000 ₽',

        description: 'Минимальный рабочий продукт для проверки идеи: фронт + API + БД при необходимости.',

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

        description: 'Формы, API, уведомления на почту, подключение внешних сервисов.',

        examples: [

            {

                href: '/portfolio/form-integration',

                label: 'Форма → Telegram + почта'

            }

        ]

    }

]



export const PRICING_NOTE =

    'Точная стоимость — после обсуждения задачи. Работаю с фиксированным объёмом и сроками.'

