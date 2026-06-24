import { ECodeExamples } from 'app/codeExamples'

export type PortfolioCategory = 'product' | 'layout' | 'bot'

export interface PortfolioItem {
    id: string
    title: string
    category: PortfolioCategory
    task: string
    result: string
    demoLink: string
    demoExternal?: boolean
    sourceLink?: string
}

export const PORTFOLIO_PRODUCTS: PortfolioItem[] = [
    {
        id: 'danilmakes',
        title: 'danilmakes.ru',
        category: 'product',
        task: 'Сайт-визитка для поиска небольших заказов: портфолио, контакты, форма заявок.',
        result: 'React + Node API + PostgreSQL, деплой на VPS, уведомления на почту.',
        demoLink: '/',
        sourceLink: 'https://github.com/sakralbar0192/danilmakes'
    },
    {
        id: 'cyberzilla',
        title: 'CyberZilla',
        category: 'product',
        task: 'Интернет-магазин с каталогом, корзиной и оформлением заказа.',
        result: 'SPA на Vue 3: роутинг, состояние, UI-компоненты, работа с API.',
        demoLink: `/CodeExample/${ECodeExamples.CYBER_ZILLA}`,
        sourceLink: 'https://github.com/sakralbar0192/CyberZilla'
    },
    {
        id: 'racketmate',
        title: 'RacketMate',
        category: 'bot',
        task: 'Telegram-бот для записи на теннисные корты и управления бронированием.',
        result: 'Backend на bun + Telegraf, PostgreSQL, развёрнутый бот в проде.',
        demoLink: 'https://t.me/RacketMateBot',
        demoExternal: true
    }
]

export const PORTFOLIO_LAYOUTS: PortfolioItem[] = [
    {
        id: 'mishka',
        title: 'Mishka',
        category: 'layout',
        task: 'Адаптивный интернет-магазин: сетка каталога, карточки товаров, формы.',
        result: 'Кроссбраузерная вёрстка, mobile-first, семантическая разметка.',
        demoLink: `/CodeExample/${ECodeExamples.MISHKA}`,
        sourceLink: 'https://github.com/sakralbar0192/Mishka'
    },
    {
        id: 'jewellery',
        title: 'Jewellery',
        category: 'layout',
        task: 'Многостраничный каталог украшений с фильтрацией и карточкой товара.',
        result: 'Несколько страниц, единая дизайн-система, сборка через Webpack.',
        demoLink: `/CodeExample/${ECodeExamples.JEVELLERY}`,
        sourceLink: 'https://github.com/sakralbar0192/Jewellery'
    },
    {
        id: 'europe',
        title: 'Europe',
        category: 'layout',
        task: 'Промо-лендинг турагентства: слайдеры, табы, интерактивные формы.',
        result: 'Сложная страничная структура, анимации, валидация форм.',
        demoLink: `/CodeExample/${ECodeExamples.EUROPE}`,
        sourceLink: 'https://github.com/sakralbar0192/Europe'
    },
    {
        id: 'smartdevice',
        title: 'SmartDevice',
        category: 'layout',
        task: 'Лендинг tech-продукта с акцентом на типографику и модульную сетку.',
        result: 'Адаптив под desktop и mobile, BEM-подобная организация стилей.',
        demoLink: `/CodeExample/${ECodeExamples.SMART_DEVICE}`,
        sourceLink: 'https://github.com/sakralbar0192/smart-device'
    },
    {
        id: 'bicycle',
        title: 'Bicycle',
        category: 'layout',
        task: 'Промо-сайт веломагазина с каталогом и блоком преимуществ.',
        result: 'Семантическая вёрстка, оптимизация графики, доступность.',
        demoLink: `/CodeExample/${ECodeExamples.BICYCLE}`,
        sourceLink: 'https://github.com/sakralbar0192/uhov-bicycles'
    }
]
