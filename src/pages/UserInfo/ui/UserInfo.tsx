import { UserCard } from 'entities/Users/ui/UserCard'
import { type FC, useLayoutEffect } from 'react'
import {  Link, useParams } from 'react-router-dom'
import classes from './styles.module.scss'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { Loader } from 'widgets/Loader'
import { ErrorPlug } from 'widgets/ErrorPlug'
import { PostsList } from 'entities/Posts/ui/PostsList'
import { FIRST_ARRAY_ITEM_INDEX } from 'shared/consts'
import { IUserPostsHistory, setUserPostsHistory } from 'app/store/slices/historySlice'
import { fetchUserAsync, fetchUserPostsAsync, setActiveUser, setActiveUserPosts } from 'app/store/slices/usersSlice'

const UserInfo: FC = () => {
    const { userId } = useParams() as {userId: string}

    const posts = useAppSelector(state => state.posts.posts)

    const activeUser = useAppSelector(state => state.users.activeUser)
    const activeUserPosts = useAppSelector(state => state.users.activeUserPosts)

    const isUserFetching = useAppSelector(state => state.users.isUserFetching)
    const userFetchingError = useAppSelector(state => state.users.userFetchingError)

    const isUserPostsFetching = useAppSelector(state => state.users.isUserPostsFetching)
    const userPostsFetchingError = useAppSelector(state => state.users.userPostsFetchingError)

    const usersPostsHistory = useAppSelector(state => state.history.usersPostsHistory)

    const dispatch = useAppDispatch()

    useLayoutEffect(() => {
        const currentUserId = Number(userId)
        const existingUserHistory = usersPostsHistory.find(historyItem => historyItem.user.id === currentUserId)

        if (existingUserHistory) {
            dispatch(setActiveUser(existingUserHistory.user))
            dispatch(setActiveUserPosts(existingUserHistory.posts))
        } else {
            if (!activeUser || activeUser.id !== currentUserId) {
                dispatch(fetchUserAsync(currentUserId))
            }

            if (posts) {
                const activeUserPost = posts.filter(post => post.userId === currentUserId)
                dispatch(setActiveUserPosts(activeUserPost))
            } else if (
                !activeUserPosts ||
                activeUserPosts[FIRST_ARRAY_ITEM_INDEX].userId !== currentUserId
            ) {
                dispatch(fetchUserPostsAsync(currentUserId))
            }
        }

        return function() {
            if (activeUser && activeUserPosts) {
                const userHistory: IUserPostsHistory = {
                    user: activeUser,
                    posts: activeUserPosts
                }

                const isCurrentUserHistoryExist = usersPostsHistory.find(item => item.user.id === activeUser.id)

                if (!isCurrentUserHistoryExist) {
                    dispatch(setUserPostsHistory([...usersPostsHistory, userHistory]))
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Link to='/PostsList'>На главную</Link>
            <div className={ classes.container }>
                {
                    activeUser
                        ? <UserCard user={ activeUser } />
                        : isUserFetching
                            ? <Loader />
                            : userFetchingError
                                ? <ErrorPlug message={ userFetchingError } />
                                :''
                }
                {
                    activeUserPosts
                        ? <PostsList posts={ activeUserPosts } showAvatar={ false }/>
                        : isUserPostsFetching
                            ? <Loader />
                            : userPostsFetchingError
                                ? <ErrorPlug message={ userPostsFetchingError } />
                                :''
                }
            </div>
        </>
    )
}

export default UserInfo
