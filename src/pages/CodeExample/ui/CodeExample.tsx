import { type FC, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import classes from './styles.module.scss'
import { useParams } from 'react-router'
import { ECodeExamples, ECodeExamplesLinksHrefs } from 'app/codeExamples'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'
import { trackDemoLoadError, trackDemoOpen } from 'shared/analytics/events'

const IFRAME_LOAD_TIMEOUT_MS = 30_000

const CodeExample: FC = () => {
    const dispatch = useAppDispatch()
    const { choosenExample } = useParams() as { choosenExample: ECodeExamples }
    const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading')

    useEffect(() => {
        const sourceLink = ECodeExamplesLinksHrefs[choosenExample as keyof typeof ECodeExamplesLinksHrefs]
        dispatch(setCodeExampleSourceLinkHref(sourceLink ?? ''))

        return () => { dispatch(setCodeExampleSourceLinkHref('')) }
    }, [choosenExample, dispatch])

    useEffect(() => {
        setLoadState('loading')
    }, [choosenExample])

    useEffect(() => {
        if (loadState !== 'loading') {
            return
        }

        const timeoutId = window.setTimeout(() => {
            setLoadState(current => {
                if (current === 'loading') {
                    trackDemoLoadError(choosenExample)
                    return 'error'
                }

                return current
            })
        }, IFRAME_LOAD_TIMEOUT_MS)

        return () => window.clearTimeout(timeoutId)
    }, [loadState, choosenExample])

    useEffect(() => {
        if (loadState === 'loaded') {
            trackDemoOpen(choosenExample)
        }
    }, [loadState, choosenExample])

    if (!choosenExample) {
        return null
    }

    const demoUrl = `/${choosenExample}/`

    const handleIframeLoad = () => {
        setLoadState('loaded')
    }

    const handleIframeError = () => {
        trackDemoLoadError(choosenExample)
        setLoadState('error')
    }

    return (
        <div className={ classes.iframeWrapper }>
            {loadState === 'loading' && (
                <div className={ classes.loaderOverlay } aria-live='polite'>
                    <Spinner animation='grow' variant='primary' />
                    <p>Загрузка демо…</p>
                </div>
            )}

            {loadState === 'error' && (
                <div className={ classes.errorOverlay } role='alert'>
                    <p>Не удалось загрузить демо.</p>
                    <a href={ demoUrl } target='_blank' rel='noreferrer' className={ classes.openLink }>
                        Открыть в новой вкладке
                    </a>
                </div>
            )}

            <iframe
                className={ `${classes.iframe} ${loadState !== 'loaded' ? classes.iframeHidden : ''}` }
                src={ demoUrl }
                title={ choosenExample }
                onLoad={ handleIframeLoad }
                onError={ handleIframeError }
            />
        </div>
    )
}

export default CodeExample
