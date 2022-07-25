import { url } from 'inspector';
import Image from 'next/image';
import hero from '../../../public/images/landing-page/hero-2xl.jpeg';
import { useWindowSize } from '../../common/hooks';

export function WelcomeHeader() {
  const { width } = useWindowSize();

  return (
    <div className="grid gap-x-6 gap-y-16 lg:h-screen lg:grid-cols-2">
      <header className="container pt-30 sm:pt-60">
        <h1 className="mb-14">
          Let&apos;s Build
          <br />
          Together
        </h1>
        <p className="text-2xl md:text-3xl">
          I mostly build websites, but Legos are cool too.
        </p>
      </header>
      {/* {width < 640 ? ( */}
      <Image alt="Lego Hero Image" src={hero} />
      {/* ) : (
        <div
          className="h-full"
          style={{
            backgroundImage: "url('/images/landing-page/hero-2xl.jpeg')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />
      )} */}
    </div>
  );
}
