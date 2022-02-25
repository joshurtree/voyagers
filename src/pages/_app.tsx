import React from 'react';
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Head from 'next/head';
import Styles from '../styles/globals.css';
import Layout from '../components/layout';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const theme = createTheme({
    palette: {
      mode: 'dark',
    }
  });

  return (
    <>
      <Head>
        <title>These are the Voyagers{pageProps.title && ` - pageProps.title`}</title>
        <meta name="description" content="Voyage tracking site for Star Trek Timelines" />
        <link rel="stylesheet/css" href={Styles} />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </>
  );
}
