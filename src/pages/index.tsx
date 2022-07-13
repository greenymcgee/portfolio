import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Houston Green</title>
      </Head>
      <main>
        <h1 className="text-primary-500">Houston Green</h1>
        <p>i&apos;m gray-900</p>
        <p className="text-purple-800">i&apos;m purple-800</p>
      </main>

      <footer className="text-secondary-500">footer</footer>
    </>
  );
}
