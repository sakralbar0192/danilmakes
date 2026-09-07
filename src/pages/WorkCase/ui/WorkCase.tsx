import { FC, useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import classes from './styles.module.scss'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'
import { getWorkCaseBySlug } from 'shared/consts/work-cases'
import { SITE_CONTENT } from 'shared/content'
import { trackCaseStudyView, trackCtaClick } from 'shared/analytics/events'

const WorkCase: FC = () => {
    const { slug } = useParams() as { slug: string }
    const dispatch = useAppDispatch()
    const workCase = getWorkCaseBySlug(slug)

    useEffect(() => {
        dispatch(setCodeExampleSourceLinkHref(''))
    }, [dispatch])

    useEffect(() => {
        if (workCase) {
            trackCaseStudyView(workCase.slug)
        }
    }, [workCase])

    if (!workCase) {
        return <Navigate to='/work' replace />
    }

    const primaryDemo = workCase.demos?.[0]

    return (
        <div className={ classes.wrapper }>
            <nav className={ classes.breadcrumbs } aria-label='Навигация'>
                <Link to='/work'>{ SITE_CONTENT.workIndex.title }</Link>
                <span aria-hidden='true'> / </span>
                <span>{ workCase.title }</span>
            </nav>

            <p className={ classes.role }>{ workCase.role }</p>
            <h1>{ workCase.title }</h1>
            <p className={ classes.hook }>{ workCase.hook }</p>

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

            {workCase.guides && workCase.guides.length > 0 && (
                <section className={ classes.block }>
                    <h2>Как смотреть демо</h2>
                    <ol className={ classes.guides }>
                        {workCase.guides.map(step => (
                            <li key={ step }>{ step }</li>
                        ))}
                    </ol>
                </section>
            )}

            {primaryDemo && (
                <section className={ classes.demoBlock }>
                    <div className={ classes.demoHeader }>
                        <h2>Интерактивное демо</h2>
                        <Link
                            to={ primaryDemo.href }
                            className={ classes.demoOpen }
                            onClick={ () => trackCtaClick('work_case_demo', primaryDemo.href) }
                        >
                            На весь экран
                        </Link>
                    </div>
                    <div className={ classes.demoFrameWrap }>
                        <iframe
                            className={ classes.demoFrame }
                            src={ `/${primaryDemo.demoId}/` }
                            title={ primaryDemo.label }
                        />
                    </div>
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
                </div>
            </div>
        </div>
    )
}

export default WorkCase
