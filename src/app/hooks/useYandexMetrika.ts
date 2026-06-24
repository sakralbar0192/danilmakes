import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const YANDEX_METRIKA_ID = 110107124

export const useYandexMetrika = () => {
    const location = useLocation()

    useEffect(() => {
        if (typeof window.ym === 'function') {
            window.ym(YANDEX_METRIKA_ID, 'hit', location.pathname + location.search)
        }
    }, [location])
}
