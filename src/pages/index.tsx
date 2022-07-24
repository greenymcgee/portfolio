import Head from 'next/head';
import { WelcomeHeader } from '../views/landingPage';

export default function Home() {
  return (
    <>
      <Head>
        <title>Houston Green - Web Developer</title>
      </Head>
      <WelcomeHeader />
      <main>
        <h2>Inside Main</h2>
      </main>
    </>
  );
}
