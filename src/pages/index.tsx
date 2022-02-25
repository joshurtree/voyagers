import React from 'react';
import type { NextPage } from 'next'
import { Container } from '@mui/material';
import styles from '/styles/Home.module.css';
import NavBar from '../components/navbar';
import tr from '../utils/translate';
import { LocalVoyageLog } from '../utils/voyagelog';

const Home: NextPage = () => {
  const voyageLog = new LocalVoyageLog();
  const [ logLoaded, setLogLoaded ] = React.useState(false);

  return (
    <>
      <Container>
          <img src='images/banner-1600x387.png' style={{display: 'block', marginLeft: 'auto', marginRight: 'auto', width: '100%'}} />
          <h1 style={{fontFamily: 'Star Trek', fontStyle: 'italic', fontWeight: 'bold', color: 'blue', fontSize: '36pt', textAlign: 'center'}}>{tr`These are the Voyagers`}</h1>
          {!logLoaded &&
            <p>
            {tr`Use this website to track your voyages on `}<a href="https://stt.disruptorbeam.com">{tr`Star Trek Timelines`}</a>.&nbsp;
            {tr`By loading the contents of your `}<a href="https://stt.disruptorbeam.com/player">{tr`player file`}</a>{tr` to this site a local copy is stored on the browser. `}
            {tr`Voyage logs can be synced between multiple browsers either by manually syncing via file or automatically via the website.`}
            </p>
          }
      </Container>}
    </>
  );
}

export default Home
