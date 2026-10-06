export interface ExperienceItem {
    id: string
    period: string
    role: string
    company: string
    bullets?: string[]
    summary?: string
}

export const EXPERIENCE: ExperienceItem[] = [
    {
        id: 'pms',
        period: 'авг 2023 — сен 2026',
        role: 'Frontend / Full-stack (FE-first)',
        company: 'Hospitality B2B SaaS · PMS',
        bullets: [
            'Спроектировал архитектуру операционного календаря: виртуализация, модель ячейки, точечное обновление после сохранения. Схему переиспользовали на других таблицах.',
            'Контракт UI ↔ API: массовые операции, слои цен — по нему онбордили коллег.',
            'Поэтапная миграция с legacy на SPA без остановки продукта.',
        ],
    },
    {
        id: 'fls',
        period: 'авг 2021 — авг 2023',
        role: 'Frontend Engineer · React',
        company: 'First Line Software',
        bullets: [
            'Миграция ключевых модулей с jQuery на React + TypeScript (FSD).',
            'Перевёл 3+ критичных модуля; Lighthouse 45 → 80, загрузка примерно на 2 секунды быстрее.',
        ],
    },
    {
        id: 'liga-a',
        period: 'сен 2020 — авг 2021',
        role: 'Frontend-разработчик',
        company: 'Лига А',
        summary: 'Верстка: 7+ адаптивных проектов (Mobile First).',
    },
]
