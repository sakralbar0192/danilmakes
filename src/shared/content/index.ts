import { SITE_MODE } from 'shared/config/siteMode'
import { FREELANCE_CONTENT } from './freelance'
import { HIRING_CONTENT } from './hiring'
import type { ModeContent } from './types'

export type { ModeContent, NavItem, HeroContent, ContactContent } from './types'

export const SITE_CONTENT: ModeContent =
    SITE_MODE === 'freelance' ? FREELANCE_CONTENT : HIRING_CONTENT
