import { IUserItem } from 'entities/Users/types'
import { type FC } from 'react'
import { Card } from 'react-bootstrap'

interface IUserCardProps {
    user: IUserItem
}

export const UserCard: FC<IUserCardProps> = ({ user }) => {
    return(
        <Card
            bg='primary'
            style={ { width: '100%' } }
        >
            <Card.Header>{ user.username }</Card.Header>
            <Card.Body>
                <Card.Title>{user.name}</Card.Title>
                <Card.Text>Email: { user.email }</Card.Text>
                <Card.Text>Website: {user.website}</Card.Text>
                <Card.Text>{user.phone}</Card.Text>
            </Card.Body>
        </Card>
    )
}
