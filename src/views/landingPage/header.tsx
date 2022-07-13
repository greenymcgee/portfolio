import clsx from 'clsx';
import { LandingPageArrow } from './arrow';

export function LandingPageHeader() {
  return (
    <header className="container h-1/2 pt-30">
      <p
        className={clsx(
          'mb-1 font-work-sans text-xl font-bold leading-8 tracking-widest',
          'text-secondary-800 sm:text-2xl lg:text-3xl',
        )}
      >
        Hello, my name is
      </p>
      <h1 className="mb-3 text-5xl font-bold sm:text-6xl lg:text-20 xl:text-22">
        Houston Green
      </h1>
      <p className="text-xl leading-8 lg:text-2xl">
        I write custom web applications,
        <br />
        <span className="relative">
          and I&apos;d like to talk about that... just a little
          <LandingPageArrow />
        </span>
      </p>
    </header>
  );
}
