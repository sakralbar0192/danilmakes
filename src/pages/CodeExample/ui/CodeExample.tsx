import { type FC, useEffect } from 'react'
import classes from './styles.module.scss'
import { useParams } from 'react-router'
import { ECodeExamples, ECodeExamplesLinksHrefs } from 'app/codeExamples'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'

const CodeExample: FC = () => {
    const dispatch = useAppDispatch()
    const { choosenExample } = useParams() as { choosenExample: ECodeExamples }

    useEffect(() => {
        switch (choosenExample) {
            case ECodeExamples.BICYCLE:
                dispatch(setCodeExampleSourceLinkHref(ECodeExamplesLinksHrefs.BICYCLE))
                break

            case ECodeExamples.EUROPE:
                dispatch(setCodeExampleSourceLinkHref(ECodeExamplesLinksHrefs.EUROPE))
                break

            case ECodeExamples.JEVELLERY:
                dispatch(setCodeExampleSourceLinkHref(ECodeExamplesLinksHrefs.JEVELLERY))
                break

            case ECodeExamples.MISHKA:
                dispatch(setCodeExampleSourceLinkHref(ECodeExamplesLinksHrefs.MISHKA))
                break

            case ECodeExamples.POKEDEX:
                dispatch(setCodeExampleSourceLinkHref(ECodeExamplesLinksHrefs.POKEDEX))
                break

            case ECodeExamples.SMART_DEVICE:
                dispatch(setCodeExampleSourceLinkHref(ECodeExamplesLinksHrefs.SMART_DEVICE))
                break

            case ECodeExamples.KEKSOBOOKING:
                dispatch(setCodeExampleSourceLinkHref(ECodeExamplesLinksHrefs.KEKSOBOOKING))
                break

            case ECodeExamples.TARIFF_PRICES:
                dispatch(setCodeExampleSourceLinkHref(ECodeExamplesLinksHrefs.TARIFF_PRICES))
                break

            case ECodeExamples.REPORT_REVENUE:
                dispatch(setCodeExampleSourceLinkHref(ECodeExamplesLinksHrefs.REPORT_REVENUE))
                break

            case ECodeExamples.DIVISIONS:
                dispatch(setCodeExampleSourceLinkHref(ECodeExamplesLinksHrefs.DIVISIONS))
                break
        }

        return () => { dispatch(setCodeExampleSourceLinkHref('')) }
    }, [choosenExample, dispatch])

    if (!choosenExample) {
        return null
    }

    return (
        <div className={ classes.iframeWrapper }>
            <iframe
                className={ classes.iframe }
                src={ `/${choosenExample}/` }
                title={ choosenExample }
            />
        </div>
    )
}

export default CodeExample
