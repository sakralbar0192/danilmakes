import { TValueOf } from 'shared/types'

export const ECodeExamples = {
    SMART_DEVICE: 'smartDevice',
    JEVELLERY: 'jevellery',
    EUROPE: 'europe',
    BICYCLE: 'bicycle',
    MISHKA: 'mishka',
    KEKSOBOOKING: 'keksobooking',
    POKEDEX: 'pokedex',
    TARIFF_PRICES: 'tariffPrices',
    REPORT_REVENUE: 'reportRevenue',
    DIVISIONS: 'divisions'
} as const
export type ECodeExamples = TValueOf<typeof ECodeExamples>

export const ECodeExamplesLinksHrefs = {
    SMART_DEVICE: 'https://github.com/sakralbar0192/smart-device',
    JEVELLERY: 'https://github.com/sakralbar0192/Jewellery',
    EUROPE: 'https://github.com/sakralbar0192/Europe',
    BICYCLE: 'https://github.com/sakralbar0192/uhov-bicycles',
    MISHKA: 'https://github.com/sakralbar0192/Mishka',
    KEKSOBOOKING: 'https://github.com/sakralbar0192/Keksobooking',
    POKEDEX: 'https://github.com/sakralbar0192/PokeDex',
    POSTS_LIST: 'https://github.com/sakralbar0192/danilmakes',
    TARIFF_PRICES: '',
    REPORT_REVENUE: '',
    DIVISIONS: 'https://github.com/sakralbar0192/Divisions'
} as const
export type ECodeExamplesLinksHrefs = TValueOf<typeof ECodeExamplesLinksHrefs>
