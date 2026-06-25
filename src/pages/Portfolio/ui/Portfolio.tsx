import { FC, KeyboardEvent, ReactNode, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Col, Collapse, Row } from 'react-bootstrap'
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

interface PortfolioSectionProps {
    title: string
    note?: string
    defaultOpen?: boolean
    columns: { xs: number; sm?: number; md?: number; lg?: number }
    children: ReactNode
}

const PortfolioSection: FC<PortfolioSectionProps> = ({
    title,
    note,
    defaultOpen = true,
    columns,
    children
}) => {
    const [open, setOpen] = useState(defaultOpen)
    const sectionId = title.replace(/\s+/g, '-').toLowerCase()

    const toggle = () => setOpen(prev => !prev)

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggle()
        }
    }

    return (
        <section className={ classes.section }>
            <div className={ classes.sectionHeader }>
                <div className={ classes.sectionHeaderText }>
                    <h2 id={ `${sectionId}-title` }>{ title }</h2>
                    {note && <p className={ classes.sectionNote }>{ note }</p>}
                </div>
                <button
                    type='button'
                    className={ classes.sectionToggle }
                    onClick={ toggle }
                    onKeyDown={ handleKeyDown }
                    aria-expanded={ open }
                    aria-controls={ `${sectionId}-content` }
                    aria-labelledby={ `${sectionId}-title` }
                >
                    <span className={ `${classes.chevron} ${open ? classes.chevronOpen : ''}` } aria-hidden='true' />
                    <span className='visually-hidden'>{ open ? 'Свернуть' : 'Развернуть' } { title }</span>
                </button>
            </div>
            <Collapse in={ open }>
                <div id={ `${sectionId}-content` }>
                    <Row
                        xs={ columns.xs }
                        sm={ columns.sm }
                        md={ columns.md }
                        lg={ columns.lg }
                        className='g-4'
                    >
                        {children}
                    </Row>
                </div>
            </Collapse>
        </section>
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
                Макеты и приложения, которые показывают уровень работы. Каждый пункт — живая демонстрация.
            </p>

            <PortfolioSection
                title='Вёрстка'
                note='Полноценные адаптивные макеты: от лендингов до многостраничных каталогов.'
                columns={ { xs: 1, sm: 2, lg: 3 } }
            >
                {PORTFOLIO_LAYOUTS.map(item => (
                    <Col key={ item.id }>
                        <PortfolioCard item={ item } />
                    </Col>
                ))}
            </PortfolioSection>

            <PortfolioSection
                title='Приложения'
                columns={ { xs: 1, md: 2 } }
            >
                {PORTFOLIO_PRODUCTS.map(item => (
                    <Col key={ item.id }>
                        <PortfolioCard item={ item } />
                    </Col>
                ))}
            </PortfolioSection>

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
