import { FC, useEffect } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import classes from './styles.module.scss'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'
import {
    getWorkCaseBySlug,
    WORK_SLUG_REDIRECTS,
} from 'shared/consts/work-cases'
import { SITE_CONTENT } from 'shared/content'
import { trackCaseStudyView, trackCtaClick } from 'shared/analytics/events'

const WorkCase: FC = () => {
    const { slug } = useParams() as { slug: string }
    const location = useLocation()
    const dispatch = useAppDispatch()

    const redirectTarget = WORK_SLUG_REDIRECTS[slug]
    const workCase = getWorkCaseBySlug(slug)

    useEffect(() => {
        dispatch(setCodeExampleSourceLinkHref(''))
    }, [dispatch])

    useEffect(() => {
        if (workCase) {
            trackCaseStudyView(workCase.slug)
        }
    }, [workCase])

    useEffect(() => {
        if (!location.hash) {
            return
        }
        const id = location.hash.replace(/^#/, '')
        const el = document.getElementById(id)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [location.hash, workCase])

    if (redirectTarget) {
        const [toSlug, hash] = redirectTarget.split('#')
        return <Navigate to={ hash ? `/work/${toSlug}#${hash}` : `/work/${toSlug}` } replace />
    }

    if (!workCase) {
        return <Navigate to='/work' replace />
    }

    const primaryDemo = workCase.demos?.[0]
    const isHub = workCase.groupRole === 'hub' && Boolean(workCase.sections?.length)

    return (
        <div className={ classes.wrapper }>
            <nav className={ classes.breadcrumbs } aria-label='Навигация'>
                <Link to='/work'>{ SITE_CONTENT.workIndex.title }</Link>
                <span aria-hidden='true'> / </span>
                <span>{ workCase.title }</span>
            </nav>

            <p className={ classes.role }>{ workCase.role }</p>
            <p className={ classes.product }>{ workCase.product } · { workCase.period }</p>
            <h1>{ workCase.title }</h1>
            <p className={ classes.hook }>{ workCase.hook }</p>

            {isHub && workCase.sections && (
                <nav className={ classes.toc } aria-label='Главы кейса'>
                    {workCase.sections.map(section => (
                        <a key={ section.id } href={ `#${section.id}` }>{ section.title }</a>
                    ))}
                </nav>
            )}

            <section className={ classes.block }>
                <h2>Проблема</h2>
                <p>{ workCase.problem }</p>
            </section>

            <section className={ classes.block }>
                <h2>Решение</h2>
                <p>{ workCase.solution }</p>
                {workCase.originalStackNote && (
                    <p className={ classes.note }>{ workCase.originalStackNote }</p>
                )}
                <ul className={ classes.stack }>
                    {workCase.stack.map(item => (
                        <li key={ item }>{ item }</li>
                    ))}
                </ul>
            </section>

            <section className={ classes.block }>
                <h2>Эффект</h2>
                <p>{ workCase.effect }</p>
            </section>

            {workCase.loadTest && (
                <section className={ classes.block }>
                    <h2>Нагрузочное тестирование</h2>
                    <p><strong>Зачем:</strong> { workCase.loadTest.goal }</p>
                    <p><strong>Как:</strong> { workCase.loadTest.methods }</p>
                    <p><strong>Что увидели:</strong> { workCase.loadTest.findings }</p>
                    <p><strong>Как повлияло на решение:</strong> { workCase.loadTest.decision }</p>
                </section>
            )}

            {workCase.flowDiagram && (
                <section className={ classes.block } aria-label={ workCase.flowDiagram.title }>
                    <h2>{ workCase.flowDiagram.title }</h2>
                    <div className={ classes.flowDiagram }>
                        <div className={ classes.flowColumn }>
                            <h3>{ workCase.flowDiagram.beforeTitle }</h3>
                            <ol>
                                {workCase.flowDiagram.before.map(step => (
                                    <li key={ step }>{ step }</li>
                                ))}
                            </ol>
                        </div>
                        <div className={ classes.flowColumn }>
                            <h3>{ workCase.flowDiagram.afterTitle }</h3>
                            <ol>
                                {workCase.flowDiagram.after.map(step => (
                                    <li key={ step }>{ step }</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </section>
            )}

            {isHub && workCase.sections?.map(section => (
                <section key={ section.id } id={ section.id } className={ classes.chapter }>
                    <h2>{ section.title }</h2>
                    <h3>Проблема</h3>
                    <p>{ section.problem }</p>
                    <h3>Решение</h3>
                    <p>{ section.solution }</p>
                    <h3>Эффект</h3>
                    <p>{ section.effect }</p>
                    {section.id === 'mobile' && (
                        <p className={ classes.note }>
                            Демо этой главы доступно только с телефона — на desktop откроется заглушка.
                        </p>
                    )}
                </section>
            ))}

            {workCase.guides && workCase.guides.length > 0 && (
                <section className={ classes.block }>
                    <h2>Что посмотреть в демо</h2>
                    <ol className={ classes.guides }>
                        {workCase.guides.map(step => (
                            <li key={ step }>{ step }</li>
                        ))}
                    </ol>
                </section>
            )}

            {workCase.relatedSlugs && workCase.relatedSlugs.length > 0 && (
                <section className={ classes.block }>
                    <h2>Связанные кейсы</h2>
                    <ul className={ classes.related }>
                        {workCase.relatedSlugs.map(relatedSlug => {
                            const related = getWorkCaseBySlug(relatedSlug)
                            if (!related) return null
                            return (
                                <li key={ relatedSlug }>
                                    <Link to={ `/work/${related.slug}` }>{ related.title }</Link>
                                </li>
                            )
                        })}
                    </ul>
                </section>
            )}

            <div className={ classes.cta }>
                <p>{ SITE_CONTENT.caseCta.defaultPrompt }</p>
                <div className={ classes.ctaActions }>
                    <Link
                        to='/contact'
                        className={ classes.ctaButton }
                        onClick={ () => trackCtaClick('work_case', '/contact') }
                    >
                        { SITE_CONTENT.caseCta.buttonLabel }
                    </Link>
                    {primaryDemo && (
                        <Link
                            to={ primaryDemo.href }
                            className={ classes.ctaSecondary }
                            onClick={ () => trackCtaClick('work_case', primaryDemo.href) }
                        >
                            { primaryDemo.label }
                        </Link>
                    )}
                    {isHub && (
                        <Link
                            to='/demo/tariffPrices?focus=mobile'
                            className={ classes.ctaSecondary }
                            onClick={ () => trackCtaClick('work_case_demo', '/demo/tariffPrices?focus=mobile') }
                        >
                            Демо mobile (только телефон)
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default WorkCase
