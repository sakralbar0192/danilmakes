import { ECodeExamples } from 'app/codeExamples'
import { getCaseStudyBySlug } from 'shared/consts/case-studies'
import { PORTFOLIO_LAYOUTS, PORTFOLIO_PRODUCTS } from 'shared/consts/portfolio'

export const DEFAULT_PAGE_TITLE = 'danilmakes.ru — продуктовый разработчик, Красноярск'

const DEMO_TITLES: Record<string, string> = {
    [ECodeExamples.TARIFF_PRICES]: 'Цены и ограничения',
    [ECodeExamples.REPORT_REVENUE]: 'Отчёт по доходу',
    [ECodeExamples.DIVISIONS]: 'Divisions',
    [ECodeExamples.FAMILY_MEALS]: 'Family Meal Planning',
    [ECodeExamples.LOCAL_LANDING]: 'Студия «Линия»',
    [ECodeExamples.FORM_INTEGRATION]: 'Форма → Telegram + почта',
    [ECodeExamples.EUROPE]: 'Европа',
    [ECodeExamples.BICYCLE]: 'Велосипеды',
    [ECodeExamples.MISHKA]: 'Mishka',
    [ECodeExamples.JEVELLERY]: 'Jewellery',
    [ECodeExamples.SMART_DEVICE]: 'Smart Device',
    [ECodeExamples.KEKSOBOOKING]: 'Keksobooking',
    [ECodeExamples.POKEDEX]: 'PokeDex',
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

export function getPageTitle(pathname: string): string {
    if (pathname === '/') {
        return 'Главная | danilmakes.ru'
    }

    if (pathname === '/portfolio') {
        return 'Портфолио | danilmakes.ru'
    }

    if (pathname === '/contact') {
        return 'Контакты | danilmakes.ru'
    }

    if (pathname === '/PostsList') {
        return 'Посты | danilmakes.ru'
    }

    const caseStudyMatch = pathname.match(/^\/portfolio\/([^/]+)$/)
    if (caseStudyMatch) {
        const caseStudy = getCaseStudyBySlug(caseStudyMatch[1])
        if (caseStudy) {
            return `${caseStudy.title} — кейс | danilmakes.ru`
        }
    }

    const demoMatch = pathname.match(/^\/CodeExample\/([^/]+)$/)
    if (demoMatch) {
        return `Демо: ${getDemoTitle(demoMatch[1])} | danilmakes.ru`
    }

    return DEFAULT_PAGE_TITLE
}
