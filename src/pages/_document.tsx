import { Html, Head, Main, NextScript } from 'next/document';
import { GoogleFonts } from '../app/components';

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="description" content="Houston Green's Portfolio" />
        <link rel="icon" href="/favicon.ico" />
        <GoogleFonts />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
