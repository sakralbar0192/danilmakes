import { useState } from 'react'

import Offcanvas from 'react-bootstrap/Offcanvas'

import Burger_menu from '../assets/menu_burger.svg'

import classes from './style.module.scss'

import { NavLink } from 'react-router-dom'

import { useAppSelector } from 'app/hooks'

export const AppHeader = () => {

    const codeExampleSourceLinkHref = useAppSelector(state => state.main.codeExampleSourceLinkHref)

    const [show, setShow] = useState(false)

    const handleClose = () => setShow(false)

    const handleShow = () => setShow(true)

    return (

        <div className={ classes.header }>

            <button

                type='button'

                onClick={ handleShow }

                className={ classes.burgerMenuButton }

                aria-label='Меню'

            >

                <Burger_menu />

            </button>

            {codeExampleSourceLinkHref && (

                <a href={ codeExampleSourceLinkHref } target='_blank' rel='noreferrer'>

                    Исходный код

                </a>

            )}

            <Offcanvas show={ show } onHide={ handleClose }>

                <Offcanvas.Header closeButton />

                <Offcanvas.Body className={ classes.sidebarContainer }>

                    <NavLink

                        className={ ({ isActive, isPending }) => isPending ? 'pending' : isActive ? classes.active : '' }

                        to='/'

                        end

                        onClick={ handleClose }

                    >

                        Главная

                    </NavLink>

                    <NavLink

                        className={ ({ isActive, isPending }) => isPending ? 'pending' : isActive ? classes.active : '' }

                        to='/portfolio'

                        onClick={ handleClose }

                    >

                        Портфолио

                    </NavLink>

                    <NavLink

                        className={ ({ isActive, isPending }) => isPending ? 'pending' : isActive ? classes.active : '' }

                        to='/contact'

                        onClick={ handleClose }

                    >

                        Контакты

                    </NavLink>

                </Offcanvas.Body>

            </Offcanvas>

        </div>

    )

}

