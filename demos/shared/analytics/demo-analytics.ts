export const DEMO_ANALYTICS_SOURCE = 'danilmakes-demo'

export function trackDemoEvent(
    demoId: string,
    event: string,
    params?: Record<string, string | number | boolean>,
) {
    if (typeof window === 'undefined') {
        return
    }

    const message = {
        source: DEMO_ANALYTICS_SOURCE,
        demoId,
        event,
        params,
    }

    if (window.parent !== window) {
        window.parent.postMessage(message, window.location.origin)
        return
    }

    window.postMessage(message, window.location.origin)
}
