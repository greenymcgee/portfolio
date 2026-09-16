import clsx from 'clsx'

import { Experience, Projects } from '@/features/landing/components'
import { LANDING_PAGE_CLASS_NAMES } from '@/features/landing/constants'
import { Socials } from '@/globals/components'

export default function HomePage() {
  return (
    <>
      <main className="mb-23">
        <header
          className={clsx(
            'pointer-events-none z-10 flex w-full flex-col overflow-y-clip',
            'lg:fixed lg:h-[calc(100vh-5.875rem)] lg:justify-between',
          )}
        >
          <div className="mb-8">
            <h1
              className={clsx(
                'font-porter-sans-block leading-md bg-background -ml-[0.3rem] pt-28 text-xl',
                'sm:text-2xl',
                'md:-ml-[1.9rem] md:text-3xl',
                'lg:text-4xl',
                'xl:bg-transparent',
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
              'bg-computer-xs -ml-[0.1rem] h-60 w-60 max-w-lg bg-cover bg-center bg-no-repeat',
              'sm:-ml-6 sm:h-108 sm:w-108',
              'md:bg-computer-md',
              'lg:bg-computer-lg lg:h-128 lg:w-[calc(50%-9rem)]',
              '2xl:max-w-170',
            )}
          />
        </header>
        <div
          className={clsx('pt-10 lg:pt-80', LANDING_PAGE_CLASS_NAMES.column)}
        >
          <article className="text-subtle mb-10 space-y-2 md:mb-24">
            <p>
              My name is Houston, and I&apos;m a software engineer. I&apos;m a
              creative person, and it&apos;s often hard to find enough hours in
              the day between software projects and whatever else I might be
              obsessed with at the moment.
            </p>
            <p>
              I currently serve as the software engineering consultant at
              Thrivant Solutions where we&apos;re creating AI focused tooling
              for software developers.
            </p>
            <p>Please, feel free to scroll and learn more about my work.</p>
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
      </main>
      <footer
        className={clsx(
          LANDING_PAGE_CLASS_NAMES.column,
          'mb-20 text-right text-[1.5rem]',
        )}
      >
        <Socials />
      </footer>
    </>
  )
}
