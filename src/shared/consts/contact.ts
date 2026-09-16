import { SITE_CONTENT } from 'shared/content'

export const SITE_CONTACT = {
    name: 'Данил Ухов',
    city: 'Красноярск',
    email: 'ya@daniluhov.ru',
    phone: '+7 (950) 103-73-48',
    telegram: '@danilmakes',
    telegramUrl: 'https://t.me/danilmakes',
    github: 'https://github.com/sakralbar0192',
    hhFrontend: 'https://hh.ru/resume/08d61cb6ff10ccd1200039ed1f64486d705041',
    hhFullstack: 'https://hh.ru/resume/468b2238ff08a6680d0039ed1f447143683971',
    status: SITE_CONTENT.contact.status,
    availability: SITE_CONTENT.contact.availability,
    availabilityDetail: SITE_CONTENT.contact.availabilityDetail,
    responseTime: SITE_CONTENT.contact.responseTime,
}

export type AvailabilityVariant = 'free' | 'limited' | 'busy'

export const getAvailabilityVariant = (availability: string): AvailabilityVariant => {
    const lower = availability.toLowerCase()

    if (lower.includes('занят')) {
        return 'busy'
    }

    if (lower.includes('слот') || lower.includes('1 проект')) {
        return 'limited'
    }

    return 'free'
}

export const hasPublicPhone = (phone: string) =>
    phone.length > 0 && !phone.includes('000-00-00')
