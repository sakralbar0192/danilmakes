import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { getPageTitle } from 'shared/analytics/pageTitles'
import { trackPageView } from 'shared/analytics/yandexMetrika'

export { YANDEX_METRIKA_ID } from 'shared/analytics/yandexMetrika'

export const useYandexMetrika = () => {
    const location = useLocation()
    const previousPathRef = useRef<string | null>(null)

    useEffect(() => {
        const pathKey = location.pathname + location.search

        if (previousPathRef.current === pathKey) {
            return
        }

        const referer = previousPathRef.current
            ? `${window.location.origin}${previousPathRef.current}`
            : document.referrer || undefined

        previousPathRef.current = pathKey

        trackPageView(window.location.href, {
            title: getPageTitle(location.pathname),
            referer,
        })
    }, [location])
}
