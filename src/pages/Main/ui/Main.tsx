import { useAppDispatch, useAppSelector } from 'app/hooks'
import { type FC, useLayoutEffect } from 'react'
import { Loader } from 'widgets/Loader'
import { ErrorPlug } from 'widgets/ErrorPlug'
import classes from './style.module.scss'
import { PostsList } from 'entities/Posts/ui/PostsList'
import { PostsFilters } from 'widgets/PostsFilters'
import { PostsPagination } from 'widgets/PostsPagination'
import { splitPosts } from 'entities/Posts/helpers/splitPosts'
import { changeSplitedPosts, fetchPostsAsync } from 'app/store/slices/postsSlice'
import { ECodeExamplesLinksHrefs } from 'app/codeExamples'
import { setCodeExampleSourceLinkHref } from 'app/store/slices/mainSlice'

const Main: FC = () => {
    const posts = useAppSelector(state => state.posts.posts)
    const isPostFetching = useAppSelector(state => state.posts.isPostFetching)
    const postFetchingError = useAppSelector(state => state.posts.postFetchingError)

    const splitedPosts = useAppSelector(state => state.posts.splitedPosts)

    const displayedPostsCount = useAppSelector(state => state.posts.displayedPostsCount)
    const activePaginationIndex = useAppSelector(state => state.main.activePaginationIndex)

    const dispatch = useAppDispatch()

    useLayoutEffect(() => {
        if (!posts) {
            dispatch(fetchPostsAsync())
        } else {
            const splitedPosts = splitPosts(posts, displayedPostsCount)
            dispatch(changeSplitedPosts(splitedPosts))
        }

        dispatch(setCodeExampleSourceLinkHref(ECodeExamplesLinksHrefs.POSTS_LIST))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={ classes.postsPage }>
            {
                posts && splitedPosts
                    ? (
                        <>
                            <PostsFilters />
                            <div className={ classes.pagination }>
                                <PostsPagination />
                            </div>
                            <div className={ classes.list }>
                                <PostsList posts={ splitedPosts[activePaginationIndex] } />
                            </div>
                        </>
                    )
                    : isPostFetching
                        ? <Loader />
                        : postFetchingError
                            ? <ErrorPlug message={ postFetchingError } />
                            : ''
            }
        </div>
    )
}

export default Main
