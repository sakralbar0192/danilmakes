import { useEffect } from 'react'
import { isDemoAnalyticsMessage } from 'shared/analytics/demoAnalytics'
import { trackDemoAction } from 'shared/analytics/yandexMetrika'

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
            trackDemoAction(demoId, action, params)
        }

        window.addEventListener('message', onMessage)

        return () => window.removeEventListener('message', onMessage)
    }, [])
}
