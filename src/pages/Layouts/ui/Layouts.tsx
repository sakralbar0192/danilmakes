import { FC, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'
import classes from './styles.module.scss'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'
import { PORTFOLIO_LAYOUTS } from 'shared/consts/portfolio'
import { SITE_CONTENT } from 'shared/content'
import { prefetchDemo } from 'shared/lib/prefetchDemo'
import { trackExternalClick } from 'shared/analytics/events'

const Layouts: FC = () => {
    const dispatch = useAppDispatch()
    const { home } = SITE_CONTENT

    useEffect(() => {
        dispatch(setCodeExampleSourceLinkHref(''))
    }, [dispatch])

    return (
        <div className={ classes.page }>
            <h1>{ home.layoutTitle }</h1>
            <p className={ classes.layoutNote }>{ home.layoutNote }</p>
            <Row xs={ 1 } sm={ 2 } className='g-3'>
                {PORTFOLIO_LAYOUTS.map((item, index) => (
                    <Col key={ item.id }>
                        <article
                            className={ classes.layoutCard }
                            style={ { animationDelay: `${index * 60}ms` } }
                        >
                            <h2>{ item.title }</h2>
                            <p>{ item.task }</p>
                            <div className={ classes.layoutLinks }>
                                <Link
                                    to={ item.demoLink }
                                    className={ classes.layoutDemoLink }
                                    onMouseEnter={ () => prefetchDemo(item.demoLink) }
                                    onFocus={ () => prefetchDemo(item.demoLink) }
                                >
                                    Смотреть
                                </Link>
                                {item.sourceLink && (
                                    <a
                                        href={ item.sourceLink }
                                        target='_blank'
                                        rel='noreferrer'
                                        className={ classes.layoutSourceLink }
                                        onClick={ () => trackExternalClick('github', item.id) }
                                    >
                                        Код
                                    </a>
                                )}
                            </div>
                        </article>
                    </Col>
                ))}
            </Row>
        </div>
    )
}

export default Layouts
