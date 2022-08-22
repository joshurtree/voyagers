import React from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';
import { Container, Link } from '@mui/material';
import styles from '/styles/Home.module.css';
import tr from '../utils/translate';
import { LocalVoyageLog } from '../utils/voyagelog';
import { VoyagesSummary } from '../components/voyage-summary';
import { LocalVoyageLogContext } from '../components/voyage-context';
import { Javascript } from '@mui/icons-material';

const Home: NextPage = () => {
  const voyageLog = React.useContext(LocalVoyageLogContext)?.voyageLog;
  const showSummary = voyageLog?.isLoaded() && voyageLog.voyages().count() > 0;

  return (
    <Container>
        <Image src='/images/banner-1600x387.png' alt={tr`These Are the Voyagers`} width={1600} height={387} style={{display: 'block', marginLeft: 'auto', marginRight: 'auto', width: '100%'}} />
        <h1 style={{fontFamily: 'Star Trek', fontStyle: 'italic', fontWeight: 'bold', color: 'blue', fontSize: '36pt', textAlign: 'center'}}>{tr`These are the Voyagers`}</h1>
        {!showSummary &&
          <p>
            {tr`Use this website to track your voyages on `}
            <Link href="https://stt.disruptorbeam.com">{tr`Star Trek Timelines`}</Link>.&nbsp;
            {tr`By loading the contents of your `}
            <Link href="https://stt.disruptorbeam.com/player">{tr`player file`}</Link>
            {tr` to this site a local copy is stored on the browser. `}
            {tr`Voyage logs can be synced between multiple browsers either by exporting/importing data.`}
            {tr`If you want to try the website immediatly then sample data can be imported `}
            <Link component="button" onClick={() => voyageLog.loadSampleData()}>{tr`here.`}</Link>
          </p>
        }
        {showSummary &&
          <VoyagesSummary />
        }
    </Container>
  );
}

export default Home
