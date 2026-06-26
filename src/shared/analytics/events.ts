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
