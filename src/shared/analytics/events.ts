import { METRIKA_GOALS, reachGoal } from './yandexMetrika'

export function trackContactSubmit() {
    reachGoal(METRIKA_GOALS.CONTACT_SUBMIT)
}

export function trackContactError(status?: number) {
    reachGoal(METRIKA_GOALS.CONTACT_ERROR, status ? { status } : undefined)
}

export function trackDemoOpen(demo: string) {
    reachGoal(METRIKA_GOALS.DEMO_OPEN, { demo })
}

export function trackDemoLoadError(demo: string) {
    reachGoal(METRIKA_GOALS.DEMO_LOAD_ERROR, { demo })
}

export function trackCaseStudyView(slug: string) {
    reachGoal(METRIKA_GOALS.CASE_STUDY_VIEW, { slug })
}

export function trackExternalClick(target: 'github' | 'telegram' | 'demo', label?: string) {
    reachGoal(METRIKA_GOALS.EXTERNAL_CLICK, label ? { target, label } : { target })
}

export function trackDemoLeadSubmit(source: string, demoMode?: boolean, demo?: string) {
    const params: Record<string, string | boolean> = { source }

    if (demoMode !== undefined) {
        params.demo_mode = demoMode
    }

    if (demo) {
        params.demo = demo
    }

    reachGoal(METRIKA_GOALS.DEMO_LEAD_SUBMIT, params)
}

export function trackDemoLeadError(source: string, status: string, demo?: string) {
    const params: Record<string, string> = { source, status }

    if (demo) {
        params.demo = demo
    }

    reachGoal(METRIKA_GOALS.DEMO_LEAD_ERROR, params)
}

export function trackPricingExampleClick(tier: string, href: string) {
    reachGoal(METRIKA_GOALS.PRICING_EXAMPLE_CLICK, { tier, href })
}

export function trackCtaClick(place: 'hero' | 'cta_block' | 'for_freelance', target: string) {
    reachGoal(METRIKA_GOALS.CTA_CLICK, { place, target })
}
