export interface PricingTier {
    title: string
    price: string
    description: string
}

export const PRICING_TIERS: PricingTier[] = [
    {
        title: 'Лендинг / визитка',
        price: 'от 15 000 ₽',
        description: 'Одностраничник или небольшой сайт: адаптив, форма связи, базовое SEO.'
    },
    {
        title: 'Доработка проекта',
        price: 'от 2 000 ₽',
        description: 'Багфикс, новая функция, правки по существующему коду — оценка по задаче.'
    },
    {
        title: 'MVP / прототип',
        price: 'от 30 000 ₽',
        description: 'Минимальный рабочий продукт для проверки идеи: фронт + API + БД при необходимости.'
    },
    {
        title: 'Интеграции',
        price: 'от 5 000 ₽',
        description: 'Формы, API, уведомления на почту, подключение внешних сервисов.'
    }
] as const

export const PRICING_NOTE =
    'Точная стоимость — после обсуждения задачи. Работаю с фиксированным объёмом и сроками.'
