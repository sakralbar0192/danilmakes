import { FC, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'
import classes from './styles.module.scss'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'
import { SITE_CONTACT } from 'shared/consts/contact'
import {
    FREELANCE_INTRO,
    FREELANCE_PACKAGES,
    FREELANCE_PLATFORMS
} from 'shared/consts/freelance-packages'
import { PRICING_NOTE } from 'shared/consts/pricing'

const ForFreelance: FC = () => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(setCodeExampleSourceLinkHref(''))
    }, [dispatch])

    return (
        <div className={ classes.page }>
            <header className={ classes.hero }>
                <p className={ classes.eyebrow }>Для Kwork, FL.ru и прямых заказов</p>
                <h1>Сотрудничество</h1>
                <p className={ classes.lead }>{ FREELANCE_INTRO }</p>
                <p className={ classes.note }>{ PRICING_NOTE }</p>
                <div className={ classes.actions }>
                    <Link to='/contact' className={ classes.ctaPrimary }>Обсудить задачу</Link>
                    <Link to='/portfolio-print' className={ classes.ctaSecondary }>Скачать PDF</Link>
                </div>
            </header>

            <section className={ classes.section }>
                <h2>Пакеты услуг</h2>
                <Row xs={ 1 } lg={ 3 } className='g-3'>
                    {FREELANCE_PACKAGES.map(pkg => (
                        <Col key={ pkg.id }>
                            <article className={ classes.packageCard }>
                                <div className={ classes.packageHeader }>
                                    <h3>{ pkg.title }</h3>
                                    <span className={ classes.price }>{ pkg.price }</span>
                                </div>
                                <p>{ pkg.summary }</p>
                                <ul>
                                    {pkg.includes.map(item => (
                                        <li key={ item }>{ item }</li>
                                    ))}
                                </ul>
                                <div className={ classes.packageLinks }>
                                    {pkg.caseLink && (
                                        <Link to={ pkg.caseLink }>Кейс</Link>
                                    )}
                                    {pkg.demoLink && (
                                        <Link to={ pkg.demoLink }>Демо</Link>
                                    )}
                                </div>
                            </article>
                        </Col>
                    ))}
                </Row>
            </section>

            <section className={ classes.section }>
                <h2>Где искать</h2>
                <Row xs={ 1 } sm={ 2 } className='g-3'>
                    {FREELANCE_PLATFORMS.map(platform => (
                        <Col key={ platform.id }>
                            <div className={ classes.platformCard }>
                                <h3>{ platform.title }</h3>
                                <p>{ platform.note }</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </section>

            <section className={ classes.section }>
                <h2>Коротко о процессе</h2>
                <ol className={ classes.process }>
                    <li>Заявка или сообщение на бирже</li>
                    <li>Уточнение задачи и оценка сроков</li>
                    <li>Согласование ТЗ и предоплата 30%</li>
                    <li>Разработка → сдача → оплата остатка</li>
                </ol>
            </section>

            <section className={ classes.ctaBlock }>
                <h2>Готов обсудить проект</h2>
                <p>
                    { SITE_CONTACT.city }
                    {' · '}
                    { SITE_CONTACT.responseTime }
                </p>
                <div className={ classes.actions }>
                    <Link to='/portfolio' className={ classes.ctaSecondary }>Портфолио</Link>
                    <Link to='/contact' className={ classes.ctaPrimary }>Написать</Link>
                </div>
            </section>
        </div>
    )
}

export default ForFreelance
