export interface NavItem {
    to: string
    label: string
    end?: boolean
}

export interface HeroContent {
    brand: string
    eyebrow: string
    title: string
    lead: string
    primaryCta: { to: string; label: string }
    secondaryCta: { to: string; label: string }
}

export interface ContactContent {
    status: string
    availability: string
    availabilityDetail: string
    responseTime: string
    intro: string
    formTitle: string
    messageLabel: string
    submitLabel: string
    successMessage: string
    showBudgetField: boolean
}

export interface HomeSection {
    id: string
    title: string
    body?: string
}

export interface ModeContent {
    mode: 'hiring' | 'freelance'
    nav: NavItem[]
    hero: HeroContent
    contact: ContactContent
    home: {
        showPricing: boolean
        showFaq: boolean
        showAudience: boolean
        showFeaturedWork: boolean
        featuredTitle: string
        stackTitle: string
        stackItems: string[]
        ctaTitle: string
        ctaBody: string
        audienceTitle?: string
        audienceBody?: string
    }
    workIndex: {
        title: string
        intro: string
        ctaLabel: string
        ctaSecondaryLabel?: string
        ctaSecondaryTo?: string
    }
    caseCta: {
        defaultPrompt: string
        buttonLabel: string
    }
}
