import { type FC, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useYandexMetrika } from 'app/hooks/useYandexMetrika'
import { AppHeader } from 'widgets/AppHeader/ui/AppHeader'
import { Loader } from 'widgets/Loader'

const App: FC = () => {
    useYandexMetrika()

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
