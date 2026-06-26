import { createBrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import App from 'app/App'
import { AboutMe } from 'pages/AboutMe'
import { UserInfo } from 'pages/UserInfo'
import { Main } from 'pages/Main'
import { CodeExample } from 'pages/CodeExample'
import { Contact } from 'pages/Contact'
import { Portfolio } from 'pages/Portfolio'
import { CaseStudy } from 'pages/CaseStudy'
import { ForFreelance } from 'pages/ForFreelance'
import { PortfolioPrint } from 'pages/PortfolioPrint'

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
                path: 'portfolio/:slug',
                element: <CaseStudy />
            },
            {
                path: 'portfolio',
                element: <Portfolio />
            },
            {
                path: 'contact',
                element: <Contact />
            },
            {
                path: 'for-freelance',
                element: <ForFreelance />
            },
            {
                path: 'portfolio-print',
                element: <PortfolioPrint />
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
