export const YANDEX_METRIKA_ID = 110107124

export const METRIKA_GOALS = {
    CONTACT_SUBMIT: 'contact_submit',
    CONTACT_ERROR: 'contact_error',
    DEMO_OPEN: 'demo_open',
    DEMO_LOAD_ERROR: 'demo_load_error',
    CASE_STUDY_VIEW: 'case_study_view',
    EXTERNAL_CLICK: 'external_click',
    DEMO_ACTION: 'demo_action',
} as const

type MetrikaParams = Record<string, string | number | boolean>

function callYm(method: string, ...args: unknown[]) {
    if (typeof window.ym !== 'function') {
        return
    }

    window.ym(YANDEX_METRIKA_ID, method, ...args)
}

export function trackPageView(
    url: string,
    options: { title?: string; referer?: string } = {},
) {
    const params: { title?: string; referer?: string } = {}

    if (options.title) {
        params.title = options.title
    }

    if (options.referer) {
        params.referer = options.referer
    }

    callYm('hit', url, Object.keys(params).length > 0 ? params : undefined)
}

export function reachGoal(goal: string, params?: MetrikaParams) {
    if (params && Object.keys(params).length > 0) {
        callYm('reachGoal', goal, params)
        return
    }

    callYm('reachGoal', goal)
}

export function notBounce() {
    callYm('notBounce')
}

export function trackDemoAction(demoId: string, action: string, params?: MetrikaParams) {
    reachGoal(METRIKA_GOALS.DEMO_ACTION, {
        demo: demoId,
        action,
        ...params,
    })
}
