import { FC, FormEvent, useEffect, useState } from 'react'
import axios from 'axios'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import classes from './styles.module.scss'
import { useAppDispatch } from 'app/hooks'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'
import { SITE_CONTACT, hasPublicPhone } from 'shared/consts/contact'

type FormState = 'idle' | 'loading' | 'success' | 'error'

const Contact: FC = () => {
    const dispatch = useAppDispatch()
    const [formState, setFormState] = useState<FormState>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        dispatch(setCodeExampleSourceLinkHref(''))
    }, [dispatch])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)

        setFormState('loading')
        setErrorMessage('')

        try {
            await axios.post('/api/contact', {
                name: formData.get('name'),
                contact: formData.get('contact'),
                message: formData.get('message'),
                budget: formData.get('budget') || undefined
            })
            setFormState('success')
            form.reset()
        } catch (error) {
            setFormState('error')
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setErrorMessage(String(error.response.data.message))
            } else {
                setErrorMessage('Не удалось отправить заявку. Попробуйте позже или напишите на почту.')
            }
        }
    }

    return (
        <div className={ classes.wrapper }>
            <h1>Контакты</h1>
            <p className={ classes.intro }>
                Расскажите о задаче — отвечу в течение 1–2 рабочих дней.
            </p>

            <div className={ classes.contactInfo }>
                <p>
                    <strong>Email:</strong>{' '}
                    <a href={ `mailto:${SITE_CONTACT.email}` }>{ SITE_CONTACT.email }</a>
                </p>
                {hasPublicPhone(SITE_CONTACT.phone) && (
                    <p>
                        <strong>Телефон:</strong>{' '}
                        <a href={ `tel:${SITE_CONTACT.phone.replace(/\s/g, '')}` }>{ SITE_CONTACT.phone }</a>
                    </p>
                )}
                <p><strong>Город:</strong> { SITE_CONTACT.city }</p>
            </div>

            <h2>Форма заявки</h2>

            {formState === 'success' && (
                <Alert variant='success'>Заявка отправлена. Спасибо!</Alert>
            )}

            {formState === 'error' && (
                <Alert variant='danger'>{ errorMessage }</Alert>
            )}

            <Form onSubmit={ handleSubmit } className={ classes.form }>
                <Form.Group className='mb-3' controlId='contactName'>
                    <Form.Label>Имя</Form.Label>
                    <Form.Control name='name' required maxLength={ 255 } disabled={ formState === 'loading' } />
                </Form.Group>

                <Form.Group className='mb-3' controlId='contactContact'>
                    <Form.Label>Email или телефон</Form.Label>
                    <Form.Control name='contact' required maxLength={ 255 } disabled={ formState === 'loading' } />
                </Form.Group>

                <Form.Group className='mb-3' controlId='contactMessage'>
                    <Form.Label>Описание задачи</Form.Label>
                    <Form.Control
                        as='textarea'
                        name='message'
                        rows={ 5 }
                        required
                        maxLength={ 5000 }
                        disabled={ formState === 'loading' }
                    />
                </Form.Group>

                <Form.Group className='mb-3' controlId='contactBudget'>
                    <Form.Label>Бюджет (необязательно)</Form.Label>
                    <Form.Control name='budget' maxLength={ 100 } disabled={ formState === 'loading' } />
                </Form.Group>

                <Button type='submit' disabled={ formState === 'loading' }>
                    {formState === 'loading' ? (
                        <>
                            <Spinner animation='border' size='sm' className='me-2' />
                            Отправка…
                        </>
                    ) : (
                        'Отправить'
                    )}
                </Button>
            </Form>
        </div>
    )
}

export default Contact
