import clsx from 'clsx'

export default function HomePage() {
  return (
    <>
      <header
        className={clsx(
          'z-10 mb-23 flex w-full flex-col overflow-y-clip',
          'sm:h-[calc(100vh-5.875rem)] sm:justify-between lg:fixed',
        )}
      >
        <div className="mb-8">
          <h1
            className={clsx(
              'font-porter-sans-block leading-md bg-background -ml-[0.2rem] pt-28 text-xl',
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
      <article
        className={clsx(
          'text-subtle relative z-10 pl-6',
          'md:pl-0 lg:ml-auto lg:max-w-1/2 lg:pt-80 lg:pr-10',
        )}
      >
        <p className="mb-2">
          My name is Houston, and I&apos;m a software engineer, but more
          importantly, I&apos;m a creative person. I get deep fulfillment from
          bringing something new to life, and oftentimes the way I do that comes
          in the form of code.
        </p>
        <p className="mb-2">
          Someone once told me, &quot;...making sure the next dev can read your
          code might be just as important as the code itself.&quot; At first,
          this didn&apos;t stick out to me as something worth paying too much
          attention to. It wasn&apos;t until I built my first feature that I
          realized this advice was profound.
        </p>
        <p>
          After getting lost in my own code a few times, it became clear that
          optimizing readability must be a top priority. This driving force
          helped shape my career, and now I specialize in building scalable web
          apps that stand the test of time.
        </p>
      </article>
    </>
  )
}
