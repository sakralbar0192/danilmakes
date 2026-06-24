import { FC, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Col, Row } from 'react-bootstrap'
import classes from './styles.module.scss'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'
import { PORTFOLIO_LAYOUTS, PORTFOLIO_PRODUCTS, PortfolioItem } from 'shared/consts/portfolio'

const PortfolioCard: FC<{ item: PortfolioItem }> = ({ item }) => {
    return (
        <Card className={ classes.card }>
            <Card.Body>
                <Card.Title>{ item.title }</Card.Title>
                <p className={ classes.label }>Задача</p>
                <Card.Text>{ item.task }</Card.Text>
                <p className={ classes.label }>Решение</p>
                <Card.Text>{ item.solution }</Card.Text>
                <p className={ classes.label }>Результат</p>
                <Card.Text>{ item.result }</Card.Text>
                <div className={ classes.links }>
                    {item.demoExternal ? (
                        <a
                            href={ item.demoLink }
                            target='_blank'
                            rel='noreferrer'
                            className={ classes.demoLink }
                        >
                            Смотреть
                        </a>
                    ) : (
                        <Link to={ item.demoLink } className={ classes.demoLink }>
                            Смотреть
                        </Link>
                    )}
                    {item.sourceLink && (
                        <a href={ item.sourceLink } target='_blank' rel='noreferrer' className={ classes.sourceLink }>
                            Код
                        </a>
                    )}
                </div>
            </Card.Body>
        </Card>
    )
}

const Portfolio: FC = () => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(setCodeExampleSourceLinkHref(''))
    }, [dispatch])

    return (
        <div className={ classes.wrapper }>
            <h1>Портфолио</h1>
            <p className={ classes.intro }>
                Проекты и макеты, которые показывают уровень работы. Каждый пункт — живая демонстрация.
            </p>

            <section className={ classes.section }>
                <h2>Проекты</h2>
                <Row xs={ 1 } md={ 2 } className='g-4'>
                    {PORTFOLIO_PRODUCTS.map(item => (
                        <Col key={ item.id }>
                            <PortfolioCard item={ item } />
                        </Col>
                    ))}
                </Row>
            </section>

            <section className={ classes.section }>
                <h2>Вёрстка</h2>
                <p className={ classes.sectionNote }>
                    Полноценные адаптивные макеты: от лендингов до многостраничных каталогов.
                </p>
                <Row xs={ 1 } sm={ 2 } lg={ 3 } className='g-4'>
                    {PORTFOLIO_LAYOUTS.map(item => (
                        <Col key={ item.id }>
                            <PortfolioCard item={ item } />
                        </Col>
                    ))}
                </Row>
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

export default Portfolio
