import clsx from 'clsx'

export default function HomePage() {
  return (
    <header>
      <h1
        className={clsx(
          'font-porter-sans-block absolute top-43 text-balance',
          'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
          'left-[-0.3rem] md:left-[-1.9rem]',
        )}
        data-testid="home-page-heading"
      >
        <span>Houston C. </span>
        <br />
        Green
      </h1>
    </header>
  )
}
