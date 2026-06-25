const prefetched = new Set<string>()

export const getDemoPrefetchUrl = (demoLink: string): string | null => {
    const match = demoLink.match(/^\/CodeExample\/([^/]+)$/)
    if (!match) {
        return null
    }
    return `/${match[1]}/`
}

export const prefetchDemo = (demoLink: string): void => {
    const url = getDemoPrefetchUrl(demoLink)
    if (!url || prefetched.has(url)) {
        return
    }

    prefetched.add(url)

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    link.as = 'document'
    document.head.appendChild(link)
}
