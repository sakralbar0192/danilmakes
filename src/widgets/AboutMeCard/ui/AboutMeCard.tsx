import { type FC } from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import myAvatarUrl from '../assets/myAvatar.webp'
import { SITE_CONTACT } from 'shared/consts/contact'

export const AboutMeCard: FC = () => {
    return (
        <Card style={ { width: '18rem' } }>
            <Card.Img variant='top' src={ myAvatarUrl } />
            <Card.Body>
                <Card.Title>{ SITE_CONTACT.name }</Card.Title>
                <Card.Text>{ SITE_CONTACT.city }</Card.Text>
                <Card.Text className='text-muted'>{ SITE_CONTACT.status }</Card.Text>
                <Card.Text>
                    <a href={ SITE_CONTACT.telegramUrl } target='_blank' rel='noreferrer'>
                        { SITE_CONTACT.telegram }
                    </a>
                </Card.Text>
                <Link to='/contact'>Контакты</Link>
            </Card.Body>
        </Card>
    )
}
