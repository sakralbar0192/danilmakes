import { FC, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Accordion, Col, Row } from 'react-bootstrap'
import classes from './styles.module.scss'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'
import { getAvailabilityVariant, SITE_CONTACT } from 'shared/consts/contact'
import { FAQ_ITEMS } from 'shared/consts/faq'
import { PRICING_NOTE, PRICING_TIERS } from 'shared/consts/pricing'
import { WORK_EXAMPLES } from 'shared/consts/work-examples'
import myAvatarUrl from 'widgets/AboutMeCard/assets/myAvatar.webp'

const availabilityVariant = getAvailabilityVariant(SITE_CONTACT.availability)

const AboutMe: FC = () => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(setCodeExampleSourceLinkHref(''))
    }, [dispatch])

    return (
        <div className={ classes.page }>
            <section className={ classes.hero }>
                <Row className='align-items-center g-4'>
                    <Col xs={ 12 } md={ 4 } className='text-center text-md-start'>
                        <img
                            src={ myAvatarUrl }
                            alt={ SITE_CONTACT.name }
                            className={ classes.avatar }
                        />
                    </Col>
                    <Col xs={ 12 } md={ 8 }>
                        <p className={ classes.eyebrow }>
                            { SITE_CONTACT.city }
                            {' · '}
                            <span className={ `${classes.availabilityBadge} ${classes[`availability_${availabilityVariant}`]}` }>
                                { SITE_CONTACT.availability }
                            </span>
                            {' · '}
                            { SITE_CONTACT.responseTime }
                        </p>
                        <h1 className={ classes.title }>Продуктовый разработчик в Красноярске</h1>
                        <p className={ classes.lead }>
                            Делаю сайты и небольшие приложения для бизнеса — с понятным объёмом,
                            рабочим UX и честными сроками.
                        </p>
                        <div className={ classes.heroActions }>
                            <Link to='/contact' className={ classes.ctaPrimary }>
                                Обсудить проект
                            </Link>
                            <Link to='/portfolio' className={ classes.ctaSecondary }>
                                Смотреть работы
                            </Link>
                        </div>
                    </Col>
                </Row>
            </section>

            <section className={ classes.section }>
                <h2>Примеры работ</h2>
                <p className={ classes.workExamplesIntro }>
                    Три направления — с кейсами и демо. Подробности в портфолио.
                </p>
                <Row xs={ 1 } md={ 3 } className='g-3'>
                    {WORK_EXAMPLES.map(example => (
                        <Col key={ example.id }>
                            <Link to={ example.href } className={ classes.workExampleCard }>
                                <span className={ classes.workExampleService }>{ example.service }</span>
                                <h3 className={ classes.workExampleTitle }>{ example.title }</h3>
                                <p className={ classes.workExampleDescription }>{ example.description }</p>
                                <span className={ classes.workExampleLink }>Смотреть кейс</span>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </section>

            <section className={ classes.section }>
                <h2>Услуги и цены</h2>
                <p className={ classes.pricingNote }>{ PRICING_NOTE }</p>
                <Row xs={ 1 } sm={ 2 } className='g-3'>
                    {PRICING_TIERS.map(tier => (
                        <Col key={ tier.title }>
                            <div className={ classes.pricingCard }>
                                <div className={ classes.pricingHeader }>
                                    <h3>{ tier.title }</h3>
                                    <span className={ classes.price }>{ tier.price }</span>
                                </div>
                                <p>{ tier.description }</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </section>

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

            <section className={ classes.section }>
                <h2>Для кого</h2>
                <p className={ classes.text }>
                    Малый бизнес и стартапы на ранней стадии в Красноярске и по России,
                    а также команды, которым нужна доработка сложных интерфейсов —
                    один ответственный разработчик без агентской наценки.
                </p>
            </section>

            <section className={ classes.ctaBlock }>
                <h2>Есть задача?</h2>
                <p>Расскажите о проекте — отвечу в течение 1–2 рабочих дней.</p>
                <div className={ classes.heroActions }>
                    <Link to='/contact' className={ classes.ctaPrimary }>
                        Написать
                    </Link>
                    <Link to='/portfolio' className={ classes.ctaSecondary }>
                        Портфолио
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default AboutMe
