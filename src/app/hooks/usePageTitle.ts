import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
    DEFAULT_PAGE_DESCRIPTION,
    DEFAULT_PAGE_TITLE,
    getCanonicalUrl,
    getPageDescription,
    getPageTitle,
    SITE_ORIGIN,
} from 'shared/analytics/pageTitles'

function setMetaContent(selector: string, content: string) {
    const el = document.querySelector(selector)
    if (el) {
        el.setAttribute('content', content)
    }
}

function setCanonicalHref(href: string) {
    const el = document.querySelector('link[rel="canonical"]')
    if (el) {
        el.setAttribute('href', href)
    }
}

export const usePageTitle = () => {
    const { pathname } = useLocation()

    useEffect(() => {
        const title = getPageTitle(pathname)
        const description = getPageDescription(pathname)
        const canonical = getCanonicalUrl(pathname)

        document.title = title
        setMetaContent('meta[name="description"]', description)
        setMetaContent('meta[property="og:title"]', title)
        setMetaContent('meta[property="og:description"]', description)
        setMetaContent('meta[property="og:url"]', canonical)
        setMetaContent('meta[name="twitter:title"]', title)
        setMetaContent('meta[name="twitter:description"]', description)
        setCanonicalHref(canonical)

        return () => {
            document.title = DEFAULT_PAGE_TITLE
            setMetaContent('meta[name="description"]', DEFAULT_PAGE_DESCRIPTION)
            setMetaContent('meta[property="og:title"]', DEFAULT_PAGE_TITLE)
            setMetaContent('meta[property="og:description"]', DEFAULT_PAGE_DESCRIPTION)
            setMetaContent('meta[property="og:url"]', `${SITE_ORIGIN}/`)
            setMetaContent('meta[name="twitter:title"]', DEFAULT_PAGE_TITLE)
            setMetaContent('meta[name="twitter:description"]', DEFAULT_PAGE_DESCRIPTION)
            setCanonicalHref(`${SITE_ORIGIN}/`)
        }
    }, [pathname])
}
