import { useEffect } from 'react'
import { isDemoAnalyticsMessage } from 'shared/analytics/demoAnalytics'
import {
    trackDemoLeadError,
    trackDemoLeadSubmit,
} from 'shared/analytics/events'
import { trackDemoAction } from 'shared/analytics/yandexMetrika'

const getStringParam = (
    params: Record<string, string | number | boolean> | undefined,
    key: string,
): string | undefined => {
    const value = params?.[key]
    return typeof value === 'string' ? value : undefined
}

const getBooleanParam = (
    params: Record<string, string | number | boolean> | undefined,
    key: string,
): boolean | undefined => {
    const value = params?.[key]
    return typeof value === 'boolean' ? value : undefined
}

export const useDemoAnalyticsBridge = () => {
    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
                return
            }

            if (!isDemoAnalyticsMessage(event.data)) {
                return
            }

            const { demoId, event: action, params } = event.data

            if (action === 'lead_submit') {
                const source = getStringParam(params, 'source') ?? demoId
                trackDemoLeadSubmit(
                    source,
                    getBooleanParam(params, 'demo_mode'),
                    demoId,
                )
                return
            }

            if (action === 'lead_error') {
                const source = getStringParam(params, 'source') ?? demoId
                const status = getStringParam(params, 'status') ?? 'unknown'
                trackDemoLeadError(source, status, demoId)
                return
            }

            trackDemoAction(demoId, action, params)
        }

        window.addEventListener('message', onMessage)

        return () => window.removeEventListener('message', onMessage)
    }, [])
}
