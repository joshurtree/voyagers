import React from 'react';
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import Head from 'next/head';
import * as locales from '@mui/material/locale';
import Layout from '../components/layout';
import { LocalVoyageLog, tr } from '../utils'; 
import { LocalVoyageLogContext } from '../components/voyage-context';
import { CrewContext, loadCrew } from '../components/crew';
import '../styles/globals.css';
import { setLanguage } from '../utils/translate';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const [ locale, setLocale ] = React.useState('en'); 
  const extraOpts = locale == 'kl' ? { typography : { fontFamily : 'Klingon' }} : {};
  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
    ...extraOpts
  });
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  );

  setLanguage(locale);
  const [ logDirty, setLogDirty ] = React.useState(false);
  const [ crew, setCrew ] = React.useState([]);
  const localVoyageLog = React.useMemo(() => new LocalVoyageLog(() => setLogDirty(!logDirty)), []);
    
  React.useEffect(() => {
    localVoyageLog.loadData();
    loadCrew(c => setCrew(c));
  }, [localVoyageLog]);

  return ( 
    <>
      <Head>
        <title>{tr`These are the Voyagers`}{pageProps.title && ` - ${pageProps.title}`}</title>
        <meta name="description" content="Voyage tracking site for Star Trek Timelines" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <LocalVoyageLogContext.Provider value={{voyageLog: localVoyageLog, dirtyFlag: logDirty}}>
      <CrewContext.Provider value={crew}>
      <ThemeProvider theme={themeWithLocale}>
        <CssBaseline /> 
        <Layout 
          onLocaleChange={(value: string) => setLocale(value)} 
          loaded={localVoyageLog?.isLoaded() && crew.length > 0}
          klingon={locale == 'kr'}
        >
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
      </CrewContext.Provider>
      </LocalVoyageLogContext.Provider>
    </>
  );
}
