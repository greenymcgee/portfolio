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
              My name is Houston, and I&apos;m a software engineer. I thoroughly
              enjoy creating applications that people find useful, and I love
              expressing my creativity through code.
            </p>
            <p>
              I enjoy keeping up with the latest technologies by experimenting
              with libraries like Next.js, NestJS, and anything else that piques
              my interest in the Node.js/React and TypeScript universe. I
              genuinely love to throw myself into a project in my free time and
              consider different approaches based on what I learned in the last
              project.
            </p>
            <p>
              When I&apos;m not writing code, I&apos;m often playing music,
              carving wood, reading, or playing video games. I have a lot of
              interests, and quite often, it&apos;s also hard to find enough
              time to satisfy them all.
            </p>
            <p>
              Currently, I&apos;m working on a project with a friend and former
              product manager, and I&apos;m very excited to see where we&apos;re
              headed with it.
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
