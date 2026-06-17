import dynamic from 'next/dynamic';
import Head from 'next/head';

const App = dynamic(() => import('../src/App'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>Sanos y Salvos</title>
        <meta name="description" content="Frontend migrado a Next.js para Sanos y Salvos" />
      </Head>
      <App />
    </>
  );
}
