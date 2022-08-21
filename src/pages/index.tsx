import React from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';
import { Container } from '@mui/material';
import styles from '/styles/Home.module.css';
import tr from '../utils/translate';
import { LocalVoyageLog } from '../utils/voyagelog';
import { VoyagesSummary } from '../components/voyage-summary';
import { LocalVoyageLogContext } from '../components/voyage-context';

const Home: NextPage = () => {
  const voyageLog = React.useContext(LocalVoyageLogContext)?.voyageLog;
  const showSummary = voyageLog?.isLoaded() && voyageLog.voyages().count() > 0;

  return (
    <Container>
        <Image src='images/banner-1600x387.png' alt={`These Are the Voyagers`} style={{display: 'block', marginLeft: 'auto', marginRight: 'auto', width: '100%'}} />
        <h1 style={{fontFamily: 'Star Trek', fontStyle: 'italic', fontWeight: 'bold', color: 'blue', fontSize: '36pt', textAlign: 'center'}}>{tr`These are the Voyagers`}</h1>
        {!showSummary &&
          <p>
            {tr`Use this website to track your voyages on `}<a href="https://stt.disruptorbeam.com">{tr`Star Trek Timelines`}</a>.&nbsp;
            {tr`By loading the contents of your `}<a href="https://stt.disruptorbeam.com/player">{tr`player file`}</a>{tr` to this site a local copy is stored on the browser. `}
            {tr`Voyage logs can be synced between multiple browsers either by manually syncing via file or automatically via the website.`}
          </p>
        }
        {showSummary &&
          <VoyagesSummary />
        }
    </Container>
  );
}

export default Home
