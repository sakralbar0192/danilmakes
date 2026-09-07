import { ECodeExamples } from 'app/codeExamples'
import { getCaseStudyBySlug } from 'shared/consts/case-studies'
import { getWorkCaseBySlug } from 'shared/consts/work-cases'
import { PORTFOLIO_LAYOUTS, PORTFOLIO_PRODUCTS } from 'shared/consts/portfolio'
import { isHiringMode } from 'shared/config/siteMode'
import { SITE_CONTENT } from 'shared/content'

export const SITE_ORIGIN = 'https://danilmakes.ru'

export const DEFAULT_PAGE_TITLE = isHiringMode
    ? 'Данил Ухов — Frontend / full-stack · Travel & B2B SaaS | danilmakes'
    : 'danilmakes.ru — продуктовый разработчик, Красноярск'

export const DEFAULT_PAGE_DESCRIPTION = isHiringMode
    ? 'Frontend / full-stack инженер, ~6 лет. Hospitality PMS: тарифы, availability, revenue. Интерактивные кейсы с живым API.'
    : 'Данил Ухов — продуктовый разработчик в Красноярске. Сайты, приложения и небольшие проекты для бизнеса.'

const DEMO_TITLES: Record<string, string> = {
    [ECodeExamples.TARIFF_PRICES]: 'Цены и ограничения',
    [ECodeExamples.REPORT_REVENUE]: 'Отчёт по доходу',
    [ECodeExamples.DIVISIONS]: 'Divisions',
    [ECodeExamples.FAMILY_MEALS]: 'Family Meal Planning',
    [ECodeExamples.LOCAL_LANDING]: 'Студия «Линия»',
    [ECodeExamples.CLINIC_LANDING]: 'Стоматология «Дента+»',
    [ECodeExamples.FORM_INTEGRATION]: 'Форма → Telegram + почта',
    [ECodeExamples.BOOKING_ADMIN]: 'Админка записей',
    [ECodeExamples.XLSX_PIPELINE]: 'Streaming XLSX',
    [ECodeExamples.ONCE_MIGRATION]: 'Once-миграция',
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
        title: isHiringMode
            ? DEFAULT_PAGE_TITLE
            : 'Разработка сайтов и приложений в Красноярске | danilmakes.ru',
        description: DEFAULT_PAGE_DESCRIPTION,
    },
    '/work': {
        title: `${SITE_CONTENT.workIndex.title} | danilmakes`,
        description: SITE_CONTENT.workIndex.intro,
    },
    '/portfolio': {
        title: 'Портфолио: лендинги, админки и демо | danilmakes.ru',
        description:
            'Портфолио Данила Ухова: лендинги для салона и клиники, админка записей, заявки в Telegram, сложные Vue/React экраны. Интерактивные демо онлайн.',
    },
    '/contact': {
        title: isHiringMode
            ? 'Связаться — открыт к предложениям | danilmakes'
            : 'Связаться — разработка сайтов, Красноярск | danilmakes.ru',
        description: SITE_CONTENT.contact.intro,
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
        item => item.demoLink === `/CodeExample/${demoId}` || item.demoLink === `/demo/${demoId}`,
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

    const workCaseMatch = pathname.match(/^\/work\/([^/]+)$/)
    if (workCaseMatch) {
        const workCase = getWorkCaseBySlug(workCaseMatch[1])
        if (workCase) {
            const headline = workCase.seoTitle ?? workCase.title
            return `${headline} — кейс | danilmakes`
        }
    }

    const caseStudyMatch = pathname.match(/^\/portfolio\/([^/]+)$/)
    if (caseStudyMatch) {
        const caseStudy = getCaseStudyBySlug(caseStudyMatch[1])
        if (caseStudy) {
            const headline = caseStudy.seoTitle ?? caseStudy.title
            return `${headline} — кейс | danilmakes.ru`
        }
    }

    const demoMatch = pathname.match(/^\/(?:CodeExample|demo)\/([^/]+)$/)
    if (demoMatch) {
        return `Демо: ${getDemoTitle(demoMatch[1])} | danilmakes`
    }

    return DEFAULT_PAGE_TITLE
}

export function getPageDescription(pathname: string): string {
    const route = ROUTE_META[getCanonicalPath(pathname)]
    if (route) {
        return route.description
    }

    const workCaseMatch = pathname.match(/^\/work\/([^/]+)$/)
    if (workCaseMatch) {
        const workCase = getWorkCaseBySlug(workCaseMatch[1])
        if (workCase) {
            return workCase.metaDescription
        }
    }

    const caseStudyMatch = pathname.match(/^\/portfolio\/([^/]+)$/)
    if (caseStudyMatch) {
        const caseStudy = getCaseStudyBySlug(caseStudyMatch[1])
        if (caseStudy) {
            return caseStudy.metaDescription
        }
    }

    const demoMatch = pathname.match(/^\/(?:CodeExample|demo)\/([^/]+)$/)
    if (demoMatch) {
        const demoTitle = getDemoTitle(demoMatch[1])
        return `Интерактивное демо «${demoTitle}» из портфолио danilmakes — можно открыть и посмотреть без установки.`
    }

    return DEFAULT_PAGE_DESCRIPTION
}
