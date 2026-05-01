import { Suspense } from 'react'
import clsx from 'clsx'

import { LatestPosts } from '@/features/posts/components'
import { PostsPageAdminMenuContent } from '@/features/posts/components'
import { POST_PAGE_CLASS_NAMES } from '@/features/posts/constants'
import { AdminMenuContentSetter } from '@/globals/components'

type Props = { searchParams: Promise<{ page?: string }> }

export default function PostsPage({ searchParams }: Props) {
  return (
    <>
      <AdminMenuContentSetter content={<PostsPageAdminMenuContent />} />
      <main className="mb-23">
        <header
          className={clsx(
            'pointer-events-none z-10 flex w-full translate-x-8 flex-col overflow-y-clip',
            'md:translate-x-10',
            'lg:fixed lg:h-[calc(100vh-5.875rem)] lg:justify-between lg:pr-60',
          )}
        >
          <div className="mb-8">
            <h1
              className={clsx(
                'font-porter-sans-block leading-md bg-background pt-28 text-right text-xl',
                'sm:text-2xl',
                'md:text-3xl',
                'lg:text-4xl',
                'xl:bg-transparent',
              )}
              data-testid="posts-page-heading"
            >
              <span>&apos;Round the</span>
              <br />
              Corner
            </h1>
          </div>
          <div
            className={clsx(
              'bg-typewriter-xs ml-auto bg-cover bg-center bg-no-repeat',
              'aspect-square h-auto w-3/4',
              'md:bg-typewriter-md',
              'lg:bg-typewriter-lg lg:w-[calc(50%-3rem)]',
            )}
          />
        </header>
        <div
          className={clsx('pt-20 pl-11 lg:pt-90', POST_PAGE_CLASS_NAMES.column)}
        >
          <article>
            <h2
              className={clsx(
                'font-porter-sans-block leading-md mb-6 text-lg',
                'sm:text-xl',
                'md:text-2xl',
                'lg:text-3xl',
              )}
            >
              Latest
            </h2>
            <Suspense fallback={<p>Loading posts...</p>}>
              <LatestPosts searchParams={searchParams} />
            </Suspense>
          </article>
        </div>
      </main>
    </>
  )
}
