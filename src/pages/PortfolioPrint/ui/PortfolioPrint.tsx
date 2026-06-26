import { FC, useEffect } from 'react'
import { Link } from 'react-router-dom'
import classes from './styles.module.scss'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'
import { SITE_CONTACT } from 'shared/consts/contact'
import { CASE_STUDIES } from 'shared/consts/case-studies'
import { PRICING_TIERS } from 'shared/consts/pricing'

const PRINT_CASE_SLUGS = [
    'local-landing',
    'clinic-landing',
    'form-integration',
    'danilmakes',
    'tariff-prices',
    'vball-agregator'
] as const

const printCases = PRINT_CASE_SLUGS
    .map(slug => CASE_STUDIES.find(item => item.slug === slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

const PortfolioPrint: FC = () => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(setCodeExampleSourceLinkHref(''))
    }, [dispatch])

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className={ classes.page }>
            <div className={ classes.toolbar }>
                <Link to='/for-freelance' className={ classes.backLink }>← К странице для бирж</Link>
                <button type='button' className={ classes.printButton } onClick={ handlePrint }>
                    Печать / сохранить PDF
                </button>
            </div>

            <header className={ classes.header }>
                <p className={ classes.eyebrow }>{ SITE_CONTACT.city }</p>
                <h1>{ SITE_CONTACT.name }</h1>
                <p className={ classes.subtitle }>Продуктовый разработчик · сайты и небольшие приложения для бизнеса</p>
                <ul className={ classes.contacts }>
                    <li><a href={ `mailto:${SITE_CONTACT.email}` }>{ SITE_CONTACT.email }</a></li>
                    {SITE_CONTACT.telegramUrl && (
                        <li>
                            <a href={ SITE_CONTACT.telegramUrl } target='_blank' rel='noreferrer'>
                                { SITE_CONTACT.telegram }
                            </a>
                        </li>
                    )}
                    <li>danilmakes.ru</li>
                </ul>
            </header>

            <section>
                <h2>Услуги</h2>
                <ul className={ classes.pricingList }>
                    {PRICING_TIERS.map(tier => (
                        <li key={ tier.title }>
                            <strong>{ tier.title }</strong>
                            {' — '}
                            { tier.price }
                            {': '}
                            { tier.description }
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2>Кейсы</h2>
                {printCases.map(caseStudy => (
                    <article key={ caseStudy.slug } className={ classes.case }>
                        <h3>{ caseStudy.title }</h3>
                        <p className={ classes.caseLead }>{ caseStudy.lead }</p>
                        <p><strong>Задача.</strong> { caseStudy.context }</p>
                        <p><strong>Решение.</strong> { caseStudy.solution }</p>
                        <ul>
                            {caseStudy.results.slice(0, 3).map(result => (
                                <li key={ result }>{ result }</li>
                            ))}
                        </ul>
                        <p className={ classes.caseUrl }>danilmakes.ru/portfolio/{ caseStudy.slug }</p>
                    </article>
                ))}
            </section>

            <footer className={ classes.footer }>
                <p>Полное портфолио с демо: danilmakes.ru/portfolio</p>
            </footer>
        </div>
    )
}

export default PortfolioPrint
