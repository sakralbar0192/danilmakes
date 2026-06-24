import { ECodeExamples } from 'app/codeExamples'
import { type FC } from 'react'
import { NavLink } from 'react-router-dom'
import classes from './style.module.scss'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

interface INavLinkItemProps {
    to: ECodeExamples
    text: string
    tooltipText: string,
    onClick?: () => void
}

export const NavLinkItem: FC<INavLinkItemProps> = ({ to, text, onClick, tooltipText='stack' }) => {
    return (
        <li>
            <OverlayTrigger
                placement='right'
                delay={ { show: 250, hide: 400 } }
                overlay={ <Tooltip id='button-tooltip'>
                    { tooltipText }
                </Tooltip> }
            >
                <NavLink
                    className={ ({ isActive, isPending }) => isPending ? 'pending' : isActive ? classes.active : '' }
                    to={ `/CodeExample/${to}` }
                    onClick={ onClick }
                >
                    {text}
                </NavLink>
            </OverlayTrigger>

        </li>
    )
}
