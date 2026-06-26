import { FC, KeyboardEvent, ReactNode, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Col, Collapse, Row } from 'react-bootstrap'
import classes from './styles.module.scss'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'
import {
    PORTFOLIO_ENTERPRISE_UI_NOTE,
    PORTFOLIO_LAYOUTS,
    PORTFOLIO_PRODUCTS_ENTERPRISE_UI,
    PORTFOLIO_PRODUCTS_OTHER,
    PORTFOLIO_PRODUCTS_PRIMARY,
    PortfolioItem
} from 'shared/consts/portfolio'
import { getCaseStudyByPortfolioId } from 'shared/consts/case-studies'
import { prefetchDemo } from 'shared/lib/prefetchDemo'
import { trackExternalClick } from 'shared/analytics/events'

const trackPortfolioExternalClick = (item: PortfolioItem, target: 'github' | 'demo') => {
    trackExternalClick(target, item.id)
}

const PortfolioCard: FC<{ item: PortfolioItem }> = ({ item }) => {
    const caseStudy = getCaseStudyByPortfolioId(item.id)
    const caseStudyUrl = caseStudy ? `/portfolio/${caseStudy.slug}` : null
    const showDemoLink = item.demoLink !== caseStudyUrl

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
                    {caseStudy && (
                        <Link to={ caseStudyUrl! } className={ classes.detailLink }>
                            Подробнее
                        </Link>
                    )}
                    {showDemoLink && (item.demoExternal ? (
                        <a
                            href={ item.demoLink }
                            target='_blank'
                            rel='noreferrer'
                            className={ classes.demoLink }
                            onClick={ () => trackPortfolioExternalClick(item, 'demo') }
                        >
                            Смотреть
                        </a>
                    ) : (
                        <Link
                            to={ item.demoLink }
                            className={ classes.demoLink }
                            onMouseEnter={ () => prefetchDemo(item.demoLink) }
                            onFocus={ () => prefetchDemo(item.demoLink) }
                        >
                            Смотреть
                        </Link>
                    ))}
                    {item.sourceLink && (
                        <a
                            href={ item.sourceLink }
                            target='_blank'
                            rel='noreferrer'
                            className={ classes.sourceLink }
                            onClick={ () => trackPortfolioExternalClick(item, 'github') }
                        >
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
    columns?: { xs: number; sm?: number; md?: number; lg?: number }
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
                    {columns ? (
                        <Row
                            xs={ columns.xs }
                            sm={ columns.sm }
                            md={ columns.md }
                            lg={ columns.lg }
                            className='g-4'
                        >
                            {children}
                        </Row>
                    ) : (
                        children
                    )}
                </div>
            </Collapse>
        </section>
    )
}

const renderProductRow = (items: PortfolioItem[], columns: { xs: number; md?: number }) => (
    <Row xs={ columns.xs } md={ columns.md } className='g-4'>
        {items.map(item => (
            <Col key={ item.id }>
                <PortfolioCard item={ item } />
            </Col>
        ))}
    </Row>
)

const Portfolio: FC = () => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(setCodeExampleSourceLinkHref(''))
    }, [dispatch])

    return (
        <div className={ classes.wrapper }>
            <h1>Портфолио</h1>
            <p className={ classes.intro }>
                Приложения и макеты, которые показывают уровень работы. Каждый пункт — живая демонстрация или развёрнутый кейс.
            </p>

            <PortfolioSection title='Приложения'>
                {renderProductRow(PORTFOLIO_PRODUCTS_PRIMARY, { xs: 1, md: 2 })}
                <p className={ classes.groupNote }>{ PORTFOLIO_ENTERPRISE_UI_NOTE }</p>
                {renderProductRow(PORTFOLIO_PRODUCTS_ENTERPRISE_UI, { xs: 1, md: 2 })}
                {renderProductRow(PORTFOLIO_PRODUCTS_OTHER, { xs: 1, md: 2 })}
            </PortfolioSection>

            <PortfolioSection
                title='Вёрстка'
                note='Учебные макеты — демонстрация вёрстки, не коммерческие проекты.'
                defaultOpen={ false }
                columns={ { xs: 1, sm: 2 } }
            >
                {PORTFOLIO_LAYOUTS.map(item => (
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
