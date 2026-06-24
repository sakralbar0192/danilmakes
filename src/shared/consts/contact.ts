export const SITE_CONTACT = {
    name: 'Данил Ухов',
    city: 'Красноярск',
    email: 'ya@daniluhov.ru',
    phone: '+7 (950) 103-73-48',
    status: 'Принимаю небольшие заказы'
} as const

export const hasPublicPhone = (phone: string) =>
    phone.length > 0 && !phone.includes('000-00-00')
