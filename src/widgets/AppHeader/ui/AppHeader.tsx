import { useState } from 'react'
import Offcanvas from 'react-bootstrap/Offcanvas'
import Burger_menu from '../assets/menu_burger.svg'
import classes from './style.module.scss'
import { Link, NavLink } from 'react-router-dom'
import { useAppSelector } from 'app/hooks'
import { SITE_CONTENT } from 'shared/content'
import { SITE_CONTACT } from 'shared/consts/contact'

export const AppHeader = () => {
    const codeExampleSourceLinkHref = useAppSelector(state => state.main.codeExampleSourceLinkHref)
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)

    const navClassName = (to: string) => ({ isActive, isPending }: { isActive: boolean; isPending?: boolean }) => {
        if (isPending) {
            return 'pending'
        }
        const active = isActive ? classes.active : undefined
        if (to === '/contact') {
            return [classes.contactCta, active].filter(Boolean).join(' ')
        }
        return active
    }

    return (
        <header className={ classes.header } data-app-header>
            <button
                type='button'
                onClick={ handleShow }
                className={ classes.burgerMenuButton }
                aria-label='Меню'
            >
                <Burger_menu />
            </button>

            <Link to='/' className={ classes.brand } onClick={ handleClose }>
                { SITE_CONTENT.hero.brand }
            </Link>

            <nav className={ classes.desktopNav } aria-label='Основная навигация'>
                {SITE_CONTENT.nav.map(item => (
                    <NavLink
                        key={ item.to }
                        className={ navClassName(item.to) }
                        to={ item.to }
                        end={ item.end }
                    >
                        { item.label }
                    </NavLink>
                ))}
            </nav>

            <div className={ classes.headerAside }>
                {codeExampleSourceLinkHref && (
                    <a href={ codeExampleSourceLinkHref } target='_blank' rel='noreferrer'>
                        Исходный код
                    </a>
                )}
                <a
                    href={ SITE_CONTACT.telegramUrl }
                    target='_blank'
                    rel='noreferrer'
                    className={ classes.ghostLink }
                >
                    Telegram
                </a>
                <a
                    href={ SITE_CONTACT.github }
                    target='_blank'
                    rel='noreferrer'
                    className={ classes.ghostLink }
                >
                    GitHub
                </a>
            </div>

            <Offcanvas show={ show } onHide={ handleClose }>
                <Offcanvas.Header closeButton />
                <Offcanvas.Body className={ classes.sidebarContainer }>
                    {SITE_CONTENT.nav.map(item => (
                        <NavLink
                            key={ item.to }
                            className={ navClassName(item.to) }
                            to={ item.to }
                            end={ item.end }
                            onClick={ handleClose }
                        >
                            { item.label }
                        </NavLink>
                    ))}
                    <a href={ SITE_CONTACT.github } target='_blank' rel='noreferrer' onClick={ handleClose }>
                        GitHub
                    </a>
                    <a href={ SITE_CONTACT.telegramUrl } target='_blank' rel='noreferrer' onClick={ handleClose }>
                        Telegram
                    </a>
                </Offcanvas.Body>
            </Offcanvas>
        </header>
    )
}
