export const DEMO_ANALYTICS_SOURCE = 'danilmakes-demo'

export type DemoAnalyticsMessage = {
    source: typeof DEMO_ANALYTICS_SOURCE
    demoId: string
    event: string
    params?: Record<string, string | number | boolean>
}

export function isDemoAnalyticsMessage(data: unknown): data is DemoAnalyticsMessage {
    if (!data || typeof data !== 'object') {
        return false
    }

    const message = data as Partial<DemoAnalyticsMessage>
    return (
        message.source === DEMO_ANALYTICS_SOURCE
        && typeof message.demoId === 'string'
        && typeof message.event === 'string'
    )
}
