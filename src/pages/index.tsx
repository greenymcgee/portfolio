import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Houston Green</title>
        <meta name="description" content="Houston Green's Portfolio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="bg-blue-500">Houston Green</h1>
      </main>

      <footer>footer</footer>
    </>
  );
}
