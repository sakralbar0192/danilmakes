import { createBrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import App from 'app/App'
import { AboutMe } from 'pages/AboutMe'
import { UserInfo } from 'pages/UserInfo'
import { Main } from 'pages/Main'
import { CodeExample } from 'pages/CodeExample'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: <AboutMe />
            },
            {
                path: 'PostsList/UserInfo/:userId',
                element: <UserInfo />
            },
            {
                path: 'PostsList',
                element: <Main />
            },
            {
                path: 'CodeExample/:choosenExample',
                element: <CodeExample />
            }
        ],
        errorElement: <ErrorBoundary />
    }
])

export default router
