import { lazy } from 'react'

export const WorkCaseAsync = lazy(async () => await import('./WorkCase'))
