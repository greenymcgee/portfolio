import { Time } from '@greenymcgee/react-components'

import {
  AdminMenuContentSetter,
  LegacyRichTextEditor,
  Socials,
} from '@/globals/components'
import { Heading } from '@/globals/components/ui'

import { getPost } from '../../actions'
import { PostPageAdminMenuContent } from '../postPageAdminMenuContent'

type Props = { params: Promise<{ id: number }> }

export async function PostPageContent({ params }: Props) {
  const { id } = await params
  const { error, post } = await getPost(id)

  if (error) {
    return (
      <main className="pt-10">
        <Heading>Something went wrong</Heading>
      </main>
    )
  }

  return (
    <>
      <main className="mb-8 pt-10 pl-6">
        <AdminMenuContentSetter
          content={<PostPageAdminMenuContent post={post} />}
        />
        <article>
          <header className="mb-8">
            <Heading className="mb-4 text-right font-extrabold" size="2xl">
              {post.title}
            </Heading>
            <p className="text-subtle text-right text-sm">
              by{' '}
              <span className="text-foreground font-medium">
                {post.author.firstName} {post.author.lastName}
              </span>
              ,{' '}
              <Time
                date={
                  post.publishedAt?.toISOString() ?? new Date().toISOString()
                }
                format="MMMM do, yyyy"
              />
            </p>
          </header>
          <LegacyRichTextEditor
            initialState={
              typeof post.content === 'string' ? post.content : null
            }
          />
        </article>
      </main>
      <footer className="pb-10 pl-6 text-right text-xl">
        <Socials />
      </footer>
    </>
  )
}
