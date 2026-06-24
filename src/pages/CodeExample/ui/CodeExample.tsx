import { type FC, useState, useEffect } from 'react'
import classes from './styles.module.scss'
import { useParams } from 'react-router'
import { ECodeExamples, ECodeExamplesLinksHrefs } from 'app/codeExamples'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'

const CodeExample: FC = () => {
    const dispatch = useAppDispatch()
    const { choosenExample } = useParams() as {choosenExample: ECodeExamples}
    const [projectFolder, setprojectFolder] = useState<ECodeExamples | ''>('')

    useEffect(() => {
        setprojectFolder(choosenExample)
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
        }

        return () => {dispatch(setCodeExampleSourceLinkHref(''))}
    }, [choosenExample, dispatch])

    return (
        <div
            dangerouslySetInnerHTML={ { __html: `<iframe class="${classes.iframe}" src="/${projectFolder}/index.html"></iframe>` } }
            className={ classes.iframeWrapper }
        />
    )
}

export default CodeExample
