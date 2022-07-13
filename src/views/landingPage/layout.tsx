import Head from 'next/head';
import { LandingPageHeader } from './header';

export function LandingPageLayout() {
  return (
    <>
      <Head>
        <title>Houston Green</title>
      </Head>
      <div className="h-screen">
        <LandingPageHeader />
      </div>
    </>
  );
}
