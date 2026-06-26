import { type FC, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useDemoAnalyticsBridge } from 'app/hooks/useDemoAnalyticsBridge'
import { useNotBounce } from 'app/hooks/useNotBounce'
import { usePageTitle } from 'app/hooks/usePageTitle'
import { useYandexMetrika } from 'app/hooks/useYandexMetrika'
import { AppHeader } from 'widgets/AppHeader/ui/AppHeader'
import { Loader } from 'widgets/Loader'

const App: FC = () => {
    usePageTitle()
    useYandexMetrika()
    useNotBounce()
    useDemoAnalyticsBridge()

    return (
        <>
            <AppHeader />
            <Suspense fallback={ <Loader /> }>
                <Outlet />
            </Suspense>
        </>
    )
}

export default App
