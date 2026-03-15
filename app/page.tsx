import clsx from 'clsx'
import Link from 'next/link'

import { Experience, Projects } from '@/features/landing/components'
import { LANDING_PAGE_CLASS_NAMES } from '@/features/landing/constants'
import { GitHub, LinkedIn } from '@/globals/components'
import { EXTERNAL_LINKS } from '@/globals/constants'

export default function HomePage() {
  return (
    <>
      <header
        className={clsx(
          'pointer-events-none z-10 mb-23 flex w-full flex-col overflow-y-clip',
          'lg:fixed lg:h-[calc(100vh-5.875rem)] lg:justify-between',
        )}
      >
        <div className="mb-8">
          <h1
            className={clsx(
              'font-porter-sans-block leading-md bg-background -ml-[0.2rem] pt-28 text-xl xl:bg-transparent',
              'sm:text-2xl md:-ml-[1.9rem] md:text-3xl lg:text-4xl',
            )}
            data-testid="home-page-heading"
          >
            <span>Houston C. </span>
            <br />
            Green
          </h1>
          <p
            className={clsx(
              'pt-2 text-lg uppercase',
              'xs:absolute xs:top-56 xs:-right-20 xs:rotate-90 xs:pt-0',
              'lg:top-40 lg:right-40',
            )}
          >
            Software Engineer
          </p>
        </div>
        <div
          className={clsx(
            'bg-computer-xs -ml-[0.1rem] h-60 max-h-128 w-60 max-w-lg bg-cover bg-center bg-no-repeat',
            'md:bg-computer-md lg:bg-computer-lg sm:-ml-6 sm:h-108 sm:w-108 lg:h-128 lg:w-[calc(50%-9rem)]',
          )}
        />
      </header>
      <div className={clsx('lg:pt-80', LANDING_PAGE_CLASS_NAMES.column)}>
        <article className="text-subtle mb-24">
          <p className="mb-2">
            My name is Houston, and I&apos;m a software engineer, but more
            importantly, I&apos;m a creative person. I get deep fulfillment from
            bringing something new to life, and oftentimes the way I do that
            comes in the form of code.
          </p>
          <p className="mb-2">
            Someone once told me, &quot;...making sure the next dev can read
            your code might be just as important as the code itself.&quot; At
            first, this didn&apos;t stick out to me as something worth paying
            too much attention to. It wasn&apos;t until I built my first feature
            that I realized this advice was profound.
          </p>
          <p>
            After getting lost in my own code a few times, it became clear that
            optimizing readability must be a top priority. This driving force
            helped shape my career, and now I specialize in building scalable
            web apps that stand the test of time.
          </p>
        </article>
        <section className="mb-20">
          <h2 className="font-porter-sans-block leading-md mb-6 text-xl md:text-2xl">
            Experience
          </h2>
          <Experience />
        </section>
        <section>
          <h2 className="font-porter-sans-block leading-md mb-6 text-xl md:text-2xl">
            Projects
          </h2>
          <Projects />
        </section>
      </div>
      <footer
        className={clsx(
          LANDING_PAGE_CLASS_NAMES.column,
          'mb-20 pt-20 text-right text-[1.5rem]',
        )}
      >
        <Link
          aria-label="GitHub profile"
          className="mr-4"
          href={EXTERNAL_LINKS.githubProfile}
          rel="noopener noreferrer"
          target="_blank"
        >
          <GitHub className="inline" />
        </Link>
        <Link
          aria-label="LinkedIn profile"
          href={EXTERNAL_LINKS.linkedInProfile}
          rel="noopener noreferrer"
          target="_blank"
        >
          <LinkedIn className="inline" />
        </Link>
      </footer>
    </>
  )
}
