import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { DEFAULT_PAGE_TITLE, getPageTitle } from 'shared/analytics/pageTitles'

export const usePageTitle = () => {
    const { pathname } = useLocation()

    useEffect(() => {
        document.title = getPageTitle(pathname)

        return () => {
            document.title = DEFAULT_PAGE_TITLE
        }
    }, [pathname])
}
