import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
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
import { Work } from 'pages/Work'
import { WorkCase } from 'pages/WorkCase'
import { PORTFOLIO_TO_WORK_SLUG } from 'shared/consts/work-cases'
import { isHiringMode } from 'shared/config/siteMode'

function PortfolioSlugRedirect() {
    const { slug = '' } = useParams()
    const mapped = PORTFOLIO_TO_WORK_SLUG[slug]
    if (mapped) {
        return <Navigate to={ `/work/${mapped}` } replace />
    }
    return <Navigate to='/work' replace />
}

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
                path: 'work/:slug',
                element: <WorkCase />
            },
            {
                path: 'work',
                element: <Work />
            },
            {
                path: 'portfolio/:slug',
                element: isHiringMode ? <PortfolioSlugRedirect /> : <CaseStudy />
            },
            {
                path: 'portfolio',
                element: isHiringMode ? <Navigate to='/work' replace /> : <Portfolio />
            },
            {
                path: 'contact',
                element: <Contact />
            },
            {
                path: 'for-freelance',
                element: isHiringMode ? <Navigate to='/contact' replace /> : <ForFreelance />
            },
            {
                path: 'portfolio-print',
                element: isHiringMode ? <Navigate to='/work' replace /> : <PortfolioPrint />
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
                path: 'demo/:choosenExample',
                element: <CodeExample />
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
