import { lazy } from 'react'

export const WorkAsync = lazy(async () => await import('./Work'))
