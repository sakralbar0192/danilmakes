export interface WorkExample {
    id: string
    title: string
    description: string
    service: string
    href: string
}

export const WORK_EXAMPLES: WorkExample[] = [
    {
        id: 'local-landing',
        title: 'Лендинг салона красоты',
        description: 'Услуги, отзывы, форма записи и контакты — адаптив под mobile.',
        service: 'Лендинг от 15 000 ₽',
        href: '/portfolio/local-landing'
    },
    {
        id: 'form-integration',
        title: 'Форма → Telegram + почта',
        description: 'Заявка с сайта сразу уходит владельцу в мессенджер и на email.',
        service: 'Интеграции от 5 000 ₽',
        href: '/portfolio/form-integration'
    },
    {
        id: 'tariff-prices',
        title: 'Сложная таблица и админка',
        description: 'Календарь, inline-редактирование и виртуальный скролл.',
        service: 'Доработка / сложный UI',
        href: '/portfolio/tariff-prices'
    }
]
