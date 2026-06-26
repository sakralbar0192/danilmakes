export interface WorkExample {
    id: string
    title: string
    description: string
    service: string
    href: string
}

export const WORK_EXAMPLES: WorkExample[] = [
    {
        id: 'danilmakes',
        title: 'Сайт-визитка с формой заявок',
        description: 'Портфолио, цены, FAQ и приём заявок на одном VPS.',
        service: 'Лендинг от 15 000 ₽',
        href: '/portfolio/danilmakes'
    },
    {
        id: 'vball-agregator',
        title: 'Telegram-сервис для записи',
        description: 'Pet-project: боты, подбор слотов и расписание в мессенджере.',
        service: 'MVP / интеграции',
        href: '/portfolio/vball-agregator'
    },
    {
        id: 'tariff-prices',
        title: 'Сложная таблица и админка',
        description: 'Календарь, inline-редактирование и виртуальный скролл.',
        service: 'Доработка / сложный UI',
        href: '/portfolio/tariff-prices'
    }
]
