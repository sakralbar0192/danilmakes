import { FC, useEffect } from 'react'
import { Link } from 'react-router-dom'
import classes from './styles.module.scss'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'
import { SITE_CONTENT } from 'shared/content'
import {
    getCioHubCase,
    getIndexWorkCases,
    WorkCase,
} from 'shared/consts/work-cases'
import { trackCtaClick } from 'shared/analytics/events'

const CaseCard: FC<{ item: WorkCase; badge?: string }> = ({ item, badge }) => (
    <article className={ classes.card }>
        {badge ? <span className={ classes.badge }>{ badge }</span> : (
            <span className={ classes.order }>#{ item.order }</span>
        )}
        <h3>
            <Link to={ `/work/${item.slug}` }>{ item.title }</Link>
        </h3>
        <p className={ classes.hook }>{ item.hook }</p>
        <p className={ classes.role }>{ item.role }</p>
        <div className={ classes.links }>
            <Link to={ `/work/${item.slug}` }>Подробнее</Link>
            {item.demos?.[0] && (
                <Link to={ item.demos[0].href }>Демо</Link>
            )}
        </div>
    </article>
)

const Work: FC = () => {
    const dispatch = useAppDispatch()
    const { workIndex } = SITE_CONTENT
    const hub = getCioHubCase()
    const rest = getIndexWorkCases().filter(item => item.slug !== hub?.slug)

    useEffect(() => {
        dispatch(setCodeExampleSourceLinkHref(''))
    }, [dispatch])

    return (
        <div className={ classes.wrapper }>
            <h1>{ workIndex.title }</h1>
            <p className={ classes.intro }>{ workIndex.intro }</p>

            {hub && (
                <section className={ classes.section }>
                    <h2>Календарь ЦиО</h2>
                    <p className={ classes.sectionNote }>
                        Один модуль — архитектура и контракт с API. Главы — срезы: слой сетки, сессия редактирования, миграция наличия, слои цен и дерево влияния.
                    </p>
                    <div className={ classes.hubGrid }>
                        <CaseCard item={ hub } badge='Кластер' />
                    </div>
                </section>
            )}

            <section className={ classes.section }>
                <h2>Кейсы</h2>
                <div className={ classes.grid }>
                    {rest.map(item => (
                        <CaseCard key={ item.slug } item={ item } />
                    ))}
                </div>
            </section>

            <div className={ classes.cta }>
                <Link
                    to='/contact'
                    className={ classes.ctaButton }
                    onClick={ () => trackCtaClick('work', '/contact') }
                >
                    { workIndex.ctaLabel }
                </Link>
                {workIndex.ctaSecondaryTo && workIndex.ctaSecondaryLabel && (
                    <Link
                        to={ workIndex.ctaSecondaryTo }
                        className={ classes.ctaSecondary }
                        onClick={ () => trackCtaClick('work', workIndex.ctaSecondaryTo!) }
                    >
                        { workIndex.ctaSecondaryLabel }
                    </Link>
                )}
            </div>
        </div>
    )
}

export default Work
