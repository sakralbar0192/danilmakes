import { FC, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Accordion, Col, Row } from 'react-bootstrap'
import classes from './styles.module.scss'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'
import { getAvailabilityVariant, SITE_CONTACT } from 'shared/consts/contact'
import { FAQ_ITEMS } from 'shared/consts/faq'
import { PRICING_NOTE, PRICING_TIERS } from 'shared/consts/pricing'
import { SITE_CONTENT } from 'shared/content'
import { getFeaturedWorkCases } from 'shared/consts/work-cases'
import { trackCtaClick, trackPricingExampleClick } from 'shared/analytics/events'
import myAvatarUrl from 'widgets/AboutMeCard/assets/myAvatar.webp'

const availabilityVariant = getAvailabilityVariant(SITE_CONTACT.availability)

const AboutMe: FC = () => {
    const dispatch = useAppDispatch()
    const { hero, home } = SITE_CONTENT
    const featured = getFeaturedWorkCases()

    useEffect(() => {
        dispatch(setCodeExampleSourceLinkHref(''))
    }, [dispatch])

    return (
        <div className={ classes.page }>
            <section className={ classes.hero }>
                <div className={ classes.heroGrid } aria-hidden='true' />
                <Row className='align-items-center g-4'>
                    <Col xs={ 12 } md={ 4 } className='text-center text-md-start'>
                        <img
                            src={ myAvatarUrl }
                            alt={ SITE_CONTACT.name }
                            className={ classes.avatar }
                        />
                    </Col>
                    <Col xs={ 12 } md={ 8 }>
                        <p className={ classes.brand }>{ hero.brand }</p>
                        <p className={ classes.eyebrow }>
                            { hero.eyebrow }
                            {' · '}
                            <span className={ `${classes.availabilityBadge} ${classes[`availability_${availabilityVariant}`]}` }>
                                { SITE_CONTACT.availability }
                            </span>
                        </p>
                        <h1 className={ classes.title }>{ hero.title }</h1>
                        <p className={ classes.lead }>{ hero.lead }</p>
                        <div className={ classes.heroActions }>
                            <Link
                                to={ hero.primaryCta.to }
                                className={ classes.ctaPrimary }
                                onClick={ () => trackCtaClick('hero', hero.primaryCta.to) }
                            >
                                { hero.primaryCta.label }
                            </Link>
                            <Link
                                to={ hero.secondaryCta.to }
                                className={ classes.ctaSecondary }
                                onClick={ () => trackCtaClick('hero', hero.secondaryCta.to) }
                            >
                                { hero.secondaryCta.label }
                            </Link>
                        </div>
                    </Col>
                </Row>
            </section>

            {home.showFeaturedWork && (
                <section className={ classes.section }>
                    <h2>{ home.featuredTitle }</h2>
                    <div className={ classes.featuredList }>
                        {featured.map((item, index) => (
                            <Link
                                key={ item.slug }
                                to={ `/work/${item.slug}` }
                                className={ classes.featuredCard }
                                style={ { animationDelay: `${index * 80}ms` } }
                            >
                                <span className={ classes.featuredOrder }>0{ item.order }</span>
                                <div>
                                    <h3>{ item.title }</h3>
                                    <p>{ item.hook }</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {home.stackItems.length > 0 && (
                <section className={ classes.section }>
                    <h2>{ home.stackTitle }</h2>
                    <ul className={ classes.stackList }>
                        {home.stackItems.map(item => (
                            <li key={ item }>{ item }</li>
                        ))}
                    </ul>
                </section>
            )}

            {home.showPricing && (
                <section className={ classes.section }>
                    <h2>Услуги и примеры</h2>
                    <p className={ classes.pricingNote }>{ PRICING_NOTE }</p>
                    <Row xs={ 1 } sm={ 2 } className='g-3'>
                        {PRICING_TIERS.map(tier => (
                            <Col key={ tier.id }>
                                <article className={ classes.pricingCard }>
                                    <div className={ classes.pricingHeader }>
                                        <h3>{ tier.title }</h3>
                                        <span className={ classes.price }>{ tier.price }</span>
                                    </div>
                                    <p>{ tier.description }</p>
                                    {tier.includes && tier.includes.length > 0 && (
                                        <ul className={ classes.pricingIncludes }>
                                            {tier.includes.map(item => (
                                                <li key={ item }>{ item }</li>
                                            ))}
                                        </ul>
                                    )}
                                    {tier.examples.length > 0 && (
                                        <div className={ classes.exampleLinks }>
                                            {tier.examples.map(example => (
                                                <Link
                                                    key={ example.href }
                                                    to={ example.href }
                                                    className={ classes.exampleLink }
                                                    onClick={ () => trackPricingExampleClick(tier.id, example.href) }
                                                >
                                                    Пример: { example.label }
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            </Col>
                        ))}
                    </Row>
                </section>
            )}

            {home.showFaq && (
                <section className={ classes.section }>
                    <h2>Частые вопросы</h2>
                    <Accordion className={ classes.faq }>
                        {FAQ_ITEMS.map((item, index) => (
                            <Accordion.Item key={ item.id } eventKey={ String(index) }>
                                <Accordion.Header>{ item.question }</Accordion.Header>
                                <Accordion.Body>{ item.answer }</Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </section>
            )}

            {home.showAudience && home.audienceTitle && (
                <section className={ classes.section }>
                    <h2>{ home.audienceTitle }</h2>
                    <p className={ classes.text }>{ home.audienceBody }</p>
                </section>
            )}

            <section className={ classes.ctaBlock }>
                <h2>{ home.ctaTitle }</h2>
                <p>{ home.ctaBody }</p>
                <div className={ classes.heroActions }>
                    <Link
                        to='/contact'
                        className={ classes.ctaPrimary }
                        onClick={ () => trackCtaClick('cta_block', '/contact') }
                    >
                        { SITE_CONTENT.caseCta.buttonLabel }
                    </Link>
                    <Link
                        to={ home.showFeaturedWork ? '/work' : '/portfolio' }
                        className={ classes.ctaSecondary }
                        onClick={ () => trackCtaClick('cta_block', home.showFeaturedWork ? '/work' : '/portfolio') }
                    >
                        { home.showFeaturedWork ? 'Все кейсы' : 'Смотреть работы' }
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default AboutMe
