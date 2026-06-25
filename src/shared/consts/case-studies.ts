export interface CaseStudyLink {
    label: string
    href: string
    external?: boolean
}

export interface CaseStudy {
    slug: string
    portfolioId: string
    title: string
    metaDescription: string
    lead: string
    context: string
    challenge: string
    solution: string
    stack: string[]
    results: string[]
    links: CaseStudyLink[]
}

export const CASE_STUDIES: CaseStudy[] = [
    {
        slug: 'danilmakes',
        portfolioId: 'danilmakes',
        title: 'danilmakes.ru',
        metaDescription: 'Кейс: персональный сайт-визитка с портфолио, формой заявок и деплоем на VPS.',
        lead: 'Сайт-визитка фрилансера: портфолио, цены, FAQ, приём заявок без посредников.',
        context: 'Нужен был собственный канал привлечения заказов — с доверием, понятными ценами и рабочей формой связи.',
        challenge: 'Собрать full-stack решение на одном VPS с малым объёмом RAM: SPA, API, БД, SSL, почта и простой деплой без CI-сервера.',
        solution: 'React SPA на Vite, Express API, PostgreSQL в Docker, nginx с Let\'s Encrypt, уведомления через Яндекс SMTP. Демо портфолио — статика и iframe. Деплой одной командой через rsync.',
        stack: [
            'React 18',
            'TypeScript',
            'Vite',
            'Bootstrap',
            'Express',
            'PostgreSQL',
            'Docker',
            'nginx',
            'Let\'s Encrypt'
        ],
        results: [
            'Сайт на danilmakes.ru с HTTPS',
            'Форма заявки сохраняет данные в БД и дублирует на почту',
            'Портфолио с интерактивными демо без отдельного backend',
            'Обновление продакшена через rsync-deploy.sh'
        ],
        links: [
            { label: 'Сайт', href: 'https://danilmakes.ru', external: true },
            { label: 'GitHub', href: 'https://github.com/sakralbar0192/danilmakes', external: true }
        ]
    }
]

export const getCaseStudyBySlug = (slug: string): CaseStudy | undefined =>
    CASE_STUDIES.find(item => item.slug === slug)

export const getCaseStudyByPortfolioId = (portfolioId: string): CaseStudy | undefined =>
    CASE_STUDIES.find(item => item.portfolioId === portfolioId)
