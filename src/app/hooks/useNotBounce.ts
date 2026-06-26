import { useEffect } from 'react'
import { notBounce } from 'shared/analytics/yandexMetrika'

const SCROLL_THRESHOLD = 0.25
const TIME_THRESHOLD_MS = 15_000

export const useNotBounce = () => {
    useEffect(() => {
        let triggered = false

        const trigger = () => {
            if (triggered) {
                return
            }

            triggered = true
            notBounce()
        }

        const onScroll = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight
            if (scrollable <= 0) {
                trigger()
                return
            }

            if (window.scrollY / scrollable >= SCROLL_THRESHOLD) {
                trigger()
            }
        }

        const timeoutId = window.setTimeout(trigger, TIME_THRESHOLD_MS)

        window.addEventListener('scroll', onScroll, { passive: true })
        onScroll()

        return () => {
            window.clearTimeout(timeoutId)
            window.removeEventListener('scroll', onScroll)
        }
    }, [])
}
