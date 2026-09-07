export type SiteMode = 'hiring' | 'freelance'

const raw = (import.meta.env.VITE_SITE_MODE as string | undefined)?.toLowerCase()

/** Build-time site mode. Flip with VITE_SITE_MODE=freelance and redeploy. */
export const SITE_MODE: SiteMode = raw === 'freelance' ? 'freelance' : 'hiring'

export const isHiringMode = SITE_MODE === 'hiring'
export const isFreelanceMode = SITE_MODE === 'freelance'
