import { ECodeExamples } from 'app/codeExamples'

export type PortfolioCategory = 'product' | 'layout' | 'bot'

export interface PortfolioItem {
    id: string
    title: string
    category: PortfolioCategory
    task: string
    solution: string
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
        task: 'Запустить персональный сайт для привлечения небольших заказов: портфолио, контакты, приём заявок без посредников.',
        solution: 'Full-stack на своём VPS: React SPA, Express API, PostgreSQL в Docker, nginx, уведомления через Яндекс SMTP.',
        result: 'Сайт в проде по IP, форма сохраняет заявки в БД и дублирует на почту. Готов к домену и SSL.',
        demoLink: '/',
        sourceLink: 'https://github.com/sakralbar0192/danilmakes'
    },
    {
        id: 'tariff-prices',
        title: 'Цены и ограничения',
        category: 'product',
        task: 'Сложный экран управления ценами и ограничениями тарифа: календарная таблица, inline-редактирование, массовые обновления.',
        solution: 'Vue 3 + Vuex + Vuetify 3, виртуальный скролл, drag-selection, MSW-мок API.',
        result: 'Интерактивное демо с переключением тарифов, режимов и сохранением без backend.',
        demoLink: `/CodeExample/${ECodeExamples.TARIFF_PRICES}`
    },
    {
        id: 'divisions',
        title: 'Divisions',
        category: 'product',
        task: 'Модуль администрирования организационной структуры: подразделения, ресурсные пулы, назначение сотрудников и менеджеров.',
        solution: 'TypeScript, Lit Web Components, Feature-Sliced Design, интеграция с legacy ASMX API. Демо на оригинальных компонентах с MSW-моками.',
        result: 'Интерактивное демо со списком подразделений, CRUD, навигацией по пулам и пользователям без backend.',
        demoLink: `/CodeExample/${ECodeExamples.DIVISIONS}`,
        sourceLink: 'https://github.com/sakralbar0192/Divisions'
    },
    {
        id: 'report-revenue',
        title: 'Отчёт по доходу',
        category: 'product',
        task: 'Аналитический экран отеля: метрики ADR, RevPAR, загрузка, графики и таблица по категориям номеров и доп. услугам.',
        solution: 'Vue 3 + Chart.js + Vuex, фильтры по периоду, группировка данных, MSW с синтетическими ответами API.',
        result: 'Интерактивное демо с графиками, метриками и вкладкой доп. услуг без backend.',
        demoLink: `/CodeExample/${ECodeExamples.REPORT_REVENUE}`
    },
    {
        id: 'racketmate',
        title: 'RacketMate',
        category: 'bot',
        task: 'Упростить запись на теннисные корты — бронирование через Telegram без звонков и таблиц.',
        solution: 'Бот на bun + Telegraf, PostgreSQL для расписания и броней, деплой в прод.',
        result: 'Бот работает в продакшене, записи через @RacketMateBot.',
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
        solution: 'HTML5, SCSS, mobile-first, семантическая разметка, Gulp-сборка.',
        result: 'Кроссбраузерная вёрстка, корректное отображение на desktop и mobile.',
        demoLink: `/CodeExample/${ECodeExamples.MISHKA}`,
        sourceLink: 'https://github.com/sakralbar0192/Mishka'
    },
    {
        id: 'jewellery',
        title: 'Jewellery',
        category: 'layout',
        task: 'Многостраничный каталог украшений с фильтрацией и карточкой товара.',
        solution: 'Несколько связанных страниц, единая сетка и компоненты, сборка Webpack.',
        result: 'Согласованный дизайн на всех страницах, удобная навигация по каталогу.',
        demoLink: `/CodeExample/${ECodeExamples.JEVELLERY}`,
        sourceLink: 'https://github.com/sakralbar0192/Jewellery'
    },
    {
        id: 'europe',
        title: 'Europe',
        category: 'layout',
        task: 'Промо-лендинг турагентства: слайдеры, табы, интерактивные формы.',
        solution: 'Сложная страничная структура, JS-анимации, валидация полей форм.',
        result: 'Интерактивный лендинг с рабочими UI-элементами и формами.',
        demoLink: `/CodeExample/${ECodeExamples.EUROPE}`,
        sourceLink: 'https://github.com/sakralbar0192/Europe'
    },
    {
        id: 'smartdevice',
        title: 'SmartDevice',
        category: 'layout',
        task: 'Лендинг tech-продукта с акцентом на типографику и модульную сетку.',
        solution: 'Модульная сетка, SCSS, адаптив под breakpoints desktop/tablet/mobile.',
        result: 'Чистая вёрстка с акцентом на контент и читаемость на всех экранах.',
        demoLink: `/CodeExample/${ECodeExamples.SMART_DEVICE}`,
        sourceLink: 'https://github.com/sakralbar0192/smart-device'
    },
    {
        id: 'bicycle',
        title: 'Bicycle',
        category: 'layout',
        task: 'Промо-сайт веломагазина с каталогом и блоком преимуществ.',
        solution: 'Семантическая разметка, оптимизация изображений, доступные интерактивные элементы.',
        result: 'Быстрая загрузка, понятная структура, адаптив под мобильные.',
        demoLink: `/CodeExample/${ECodeExamples.BICYCLE}`,
        sourceLink: 'https://github.com/sakralbar0192/uhov-bicycles'
    }
]
