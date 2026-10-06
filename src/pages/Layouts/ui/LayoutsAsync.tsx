import { lazy } from 'react'

export const LayoutsAsync = lazy(async () => await import('./Layouts'))
