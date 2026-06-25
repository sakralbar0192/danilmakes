import { FC, useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import classes from './styles.module.scss'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'
import { getCaseStudyBySlug } from 'shared/consts/case-studies'

const DEFAULT_TITLE = 'danilmakes.ru — разработчик, Красноярск'

const CaseStudy: FC = () => {
    const { slug } = useParams() as { slug: string }
    const dispatch = useAppDispatch()
    const caseStudy = getCaseStudyBySlug(slug)

    useEffect(() => {
        dispatch(setCodeExampleSourceLinkHref(''))
    }, [dispatch])

    useEffect(() => {
        if (!caseStudy) {
            return
        }

        document.title = `${caseStudy.title} — кейс | danilmakes.ru`

        const meta = document.querySelector('meta[name="description"]')
        const previousDescription = meta?.getAttribute('content') ?? ''

        if (meta) {
            meta.setAttribute('content', caseStudy.metaDescription)
        }

        return () => {
            document.title = DEFAULT_TITLE
            if (meta && previousDescription) {
                meta.setAttribute('content', previousDescription)
            }
        }
    }, [caseStudy])

    if (!caseStudy) {
        return <Navigate to='/portfolio' replace />
    }

    return (
        <div className={ classes.wrapper }>
            <nav className={ classes.breadcrumbs } aria-label='Навигация'>
                <Link to='/portfolio'>Портфолио</Link>
                <span aria-hidden='true'> / </span>
                <span>{ caseStudy.title }</span>
            </nav>

            <h1>{ caseStudy.title }</h1>
            <p className={ classes.lead }>{ caseStudy.lead }</p>

            <section className={ classes.block }>
                <h2>Задача</h2>
                <p>{ caseStudy.context }</p>
                <p>{ caseStudy.challenge }</p>
            </section>

            <section className={ classes.block }>
                <h2>Решение</h2>
                <p>{ caseStudy.solution }</p>
                <ul className={ classes.stack }>
                    {caseStudy.stack.map(item => (
                        <li key={ item }>{ item }</li>
                    ))}
                </ul>
            </section>

            <section className={ classes.block }>
                <h2>Результат</h2>
                <ul className={ classes.results }>
                    {caseStudy.results.map(item => (
                        <li key={ item }>{ item }</li>
                    ))}
                </ul>
            </section>

            <section className={ classes.block }>
                <h2>Ссылки</h2>
                <div className={ classes.links }>
                    {caseStudy.links.map(link => (
                        link.external ? (
                            <a
                                key={ link.href }
                                href={ link.href }
                                target='_blank'
                                rel='noreferrer'
                                className={ classes.externalLink }
                            >
                                { link.label }
                            </a>
                        ) : (
                            <Link key={ link.href } to={ link.href } className={ classes.externalLink }>
                                { link.label }
                            </Link>
                        )
                    ))}
                </div>
            </section>

            <div className={ classes.cta }>
                <p>Нужен похожий проект?</p>
                <Link to='/contact' className={ classes.ctaButton }>
                    Обсудить задачу
                </Link>
            </div>
        </div>
    )
}

export default CaseStudy
