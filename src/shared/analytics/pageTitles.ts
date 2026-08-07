import { ECodeExamples } from 'app/codeExamples'
import { getCaseStudyBySlug } from 'shared/consts/case-studies'
import { PORTFOLIO_LAYOUTS, PORTFOLIO_PRODUCTS } from 'shared/consts/portfolio'

export const SITE_ORIGIN = 'https://danilmakes.ru'

export const DEFAULT_PAGE_TITLE = 'danilmakes.ru — продуктовый разработчик, Красноярск'

export const DEFAULT_PAGE_DESCRIPTION =
    'Данил Ухов — продуктовый разработчик в Красноярске. Сайты, приложения и небольшие проекты для бизнеса.'

const DEMO_TITLES: Record<string, string> = {
    [ECodeExamples.TARIFF_PRICES]: 'Цены и ограничения',
    [ECodeExamples.REPORT_REVENUE]: 'Отчёт по доходу',
    [ECodeExamples.DIVISIONS]: 'Divisions',
    [ECodeExamples.FAMILY_MEALS]: 'Family Meal Planning',
    [ECodeExamples.LOCAL_LANDING]: 'Студия «Линия»',
    [ECodeExamples.CLINIC_LANDING]: 'Стоматология «Дента+»',
    [ECodeExamples.FORM_INTEGRATION]: 'Форма → Telegram + почта',
    [ECodeExamples.BOOKING_ADMIN]: 'Админка записей',
    [ECodeExamples.EUROPE]: 'Европа',
    [ECodeExamples.BICYCLE]: 'Велосипеды',
    [ECodeExamples.MISHKA]: 'Mishka',
    [ECodeExamples.JEVELLERY]: 'Jewellery',
    [ECodeExamples.SMART_DEVICE]: 'Smart Device',
    [ECodeExamples.KEKSOBOOKING]: 'Keksobooking',
    [ECodeExamples.POKEDEX]: 'PokeDex',
}

const ROUTE_META: Record<string, { title: string; description: string }> = {
    '/': {
        title: 'Разработка сайтов и приложений в Красноярске | danilmakes.ru',
        description: DEFAULT_PAGE_DESCRIPTION,
    },
    '/portfolio': {
        title: 'Портфолио: лендинги, админки и демо | danilmakes.ru',
        description:
            'Портфолио Данила Ухова: лендинги для салона и клиники, админка записей, заявки в Telegram, сложные Vue/React экраны. Интерактивные демо онлайн.',
    },
    '/contact': {
        title: 'Связаться — разработка сайтов, Красноярск | danilmakes.ru',
        description:
            'Написать Данилу Ухову: сайты, лендинги и доработка интерфейсов в Красноярске и удалённо. Ответ за 1–2 рабочих дня.',
    },
    '/for-freelance': {
        title: 'Сотрудничество с биржами и заказчиками | danilmakes.ru',
        description:
            'Пакеты услуг, условия и ссылки для фриланс-бирж: лендинги, интеграции, доработка сложных экранов.',
    },
    '/portfolio-print': {
        title: 'Портфолио PDF | danilmakes.ru',
        description: 'Краткая версия портфолио danilmakes.ru для печати и вложений в отклики.',
    },
    '/PostsList': {
        title: 'Посты | danilmakes.ru',
        description: DEFAULT_PAGE_DESCRIPTION,
    },
}

const allPortfolio = [...PORTFOLIO_PRODUCTS, ...PORTFOLIO_LAYOUTS]

export function getDemoTitle(demoId: string): string {
    const fromMap = DEMO_TITLES[demoId]
    if (fromMap) {
        return fromMap
    }

    const fromPortfolio = allPortfolio.find(
        item => item.demoLink === `/CodeExample/${demoId}`,
    )

    return fromPortfolio?.title ?? demoId
}

export function getCanonicalPath(pathname: string): string {
    if (pathname === '/') {
        return '/'
    }

    return pathname.replace(/\/+$/, '') || '/'
}

export function getCanonicalUrl(pathname: string): string {
    const path = getCanonicalPath(pathname)
    return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`
}

export function getPageTitle(pathname: string): string {
    const route = ROUTE_META[getCanonicalPath(pathname)]
    if (route) {
        return route.title
    }

    const caseStudyMatch = pathname.match(/^\/portfolio\/([^/]+)$/)
    if (caseStudyMatch) {
        const caseStudy = getCaseStudyBySlug(caseStudyMatch[1])
        if (caseStudy) {
            const headline = caseStudy.seoTitle ?? caseStudy.title
            return `${headline} — кейс | danilmakes.ru`
        }
    }

    const demoMatch = pathname.match(/^\/CodeExample\/([^/]+)$/)
    if (demoMatch) {
        return `Демо: ${getDemoTitle(demoMatch[1])} | danilmakes.ru`
    }

    return DEFAULT_PAGE_TITLE
}

export function getPageDescription(pathname: string): string {
    const route = ROUTE_META[getCanonicalPath(pathname)]
    if (route) {
        return route.description
    }

    const caseStudyMatch = pathname.match(/^\/portfolio\/([^/]+)$/)
    if (caseStudyMatch) {
        const caseStudy = getCaseStudyBySlug(caseStudyMatch[1])
        if (caseStudy) {
            return caseStudy.metaDescription
        }
    }

    const demoMatch = pathname.match(/^\/CodeExample\/([^/]+)$/)
    if (demoMatch) {
        const demoTitle = getDemoTitle(demoMatch[1])
        return `Интерактивное демо «${demoTitle}» из портфолио danilmakes.ru — можно открыть и посмотреть без установки.`
    }

    return DEFAULT_PAGE_DESCRIPTION
}
