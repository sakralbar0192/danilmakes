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

export const PORTFOLIO_ENTERPRISE_UI_NOTE =
    'Сложные интерфейсы (опыт в продуктовой разработке). Демо на синтетических данных — тот же подход применим к расписанию, заказам, каталогу и внутренним панелям.'

export const PORTFOLIO_PRODUCTS_PRIMARY: PortfolioItem[] = [
    {
        id: 'danilmakes',
        title: 'danilmakes.ru',
        category: 'product',
        task: 'Запустить персональный сайт для привлечения заказов: портфолио, цены, FAQ, контакты и приём заявок без посредников.',
        solution: 'Full-stack на своём VPS: React SPA, Express API, PostgreSQL в Docker, nginx, SSL, уведомления через Яндекс SMTP.',
        result: 'Сайт на danilmakes.ru с HTTPS, форма сохраняет заявки в БД и дублирует на почту.',
        demoLink: '/',
        sourceLink: 'https://github.com/sakralbar0192/danilmakes'
    },
    {
        id: 'local-landing',
        title: 'Студия «Линия»',
        category: 'product',
        task: 'Витринный лендинг для бизнеса услуг: салон, барбершоп, косметолог — услуги, отзывы, форма записи и контакты.',
        solution: 'Адаптивная вёрстка HTML/CSS/JS, mobile-first, форма с отправкой на API. Связан с демо интеграции и панелью заявок.',
        result: 'Портфолио-демо под типовый заказ «лендинг от 15 000 ₽» — часть воронки «сайт → заявка → панель».',
        demoLink: `/CodeExample/${ECodeExamples.LOCAL_LANDING}`
    },
    {
        id: 'clinic-landing',
        title: 'Стоматология «Дента+»',
        category: 'product',
        task: 'Витринный лендинг для клиники: услуги, врачи, акции, отзывы, форма записи и контакты — другая ниша, тот же типовой заказ.',
        solution: 'Адаптивная вёрстка HTML/CSS/JS, medical-стилистика, форма с POST на `/api/demo-lead`.',
        result: 'Портфолио-демо для стоматологии и медицинских услуг — открывается с телефона, форма работает.',
        demoLink: `/CodeExample/${ECodeExamples.CLINIC_LANDING}`
    },
    {
        id: 'form-integration',
        title: 'Форма → Telegram + почта',
        category: 'product',
        task: 'Показать интеграцию заявок: форма на сайте сразу уведомляет владельца в Telegram и на email.',
        solution: 'Express endpoint `/api/demo-lead`, Nodemailer, Telegram Bot API, rate limit и валидация Zod.',
        result: 'Живое демо со схемой потока данных и тестовой отправкой.',
        demoLink: `/CodeExample/${ECodeExamples.FORM_INTEGRATION}`
    },
    {
        id: 'booking-admin',
        title: 'Админка записей',
        category: 'product',
        task: 'Витринная панель для услуг: список заявок на запись, фильтр по статусу и смена статуса без backend.',
        solution: 'Статическое демо на HTML/CSS/JS с синтетическими данными и локальным состоянием.',
        result: 'Понятный сценарий для салона или мастера — расписание и статусы в одном экране.',
        demoLink: `/CodeExample/${ECodeExamples.BOOKING_ADMIN}`
    },
    {
        id: 'vball-agregator',
        title: 'VBallAgregator',
        category: 'bot',
        task: 'Pet-project: объединить запись на теннис (RacketMate) и поиск волейбольных игр в один Telegram-сервис для игроков и организаторов.',
        solution: 'Monorepo, Prisma + PostgreSQL, два бота, подбор игроков по расписанию и уровню, интеграционные и e2e-тесты.',
        result: 'Прототип дошёл до стадии тестирования; дальнейшее развитие признано нецелесообразным.',
        demoLink: '/portfolio/vball-agregator',
        sourceLink: 'https://github.com/sakralbar0192/VBallAgregator'
    }
]

export const PORTFOLIO_PRODUCTS_ENTERPRISE_UI: PortfolioItem[] = [
    {
        id: 'report-revenue',
        title: 'Отчёт по доходу',
        category: 'product',
        task: 'Аналитический экран отеля: метрики ADR, RevPAR, загрузка, графики и таблица по категориям номеров.',
        solution: 'Vue 3 + Chart.js + Vuex, фильтры по периоду, группировка данных, MSW с синтетическими ответами API.',
        result: 'Интерактивное демо с графиками, метриками и таблицей без backend.',
        demoLink: `/CodeExample/${ECodeExamples.REPORT_REVENUE}`
    },
    {
        id: 'tariff-prices',
        title: 'Цены и ограничения',
        category: 'product',
        task: 'Сложный экран управления ценами и ограничениями тарифа: календарная таблица, inline-редактирование, виртуальный скролл.',
        solution: 'Vue 3 + Vuex + Vuetify 3, виртуальный скролл, MSW-мок API.',
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
    }
]

export const PORTFOLIO_PRODUCTS_OTHER: PortfolioItem[] = [
    {
        id: 'family-meals',
        title: 'Family Meal Planning (pet-project)',
        category: 'product',
        task: 'Pet-project: библиотека рецептов, недельный план питания и автоматический список покупок на выбранный период.',
        solution: 'Vue 3, Module Federation, microservices (PHP/Go), BFF. Портфолио-демо — MSW с синтетическими данными без backend.',
        result: 'Полный UX-сценарий: рецепты → план → покупки в интерактивном iframe.',
        demoLink: `/CodeExample/${ECodeExamples.FAMILY_MEALS}`
    }
]

export const PORTFOLIO_PRODUCTS: PortfolioItem[] = [
    ...PORTFOLIO_PRODUCTS_PRIMARY,
    ...PORTFOLIO_PRODUCTS_ENTERPRISE_UI,
    ...PORTFOLIO_PRODUCTS_OTHER
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
    }
]
