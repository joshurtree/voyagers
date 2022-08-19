import React from 'react';
import type { NextPage } from 'next'
import { LocalVoyageLog, PlayerEntry, VoyageEntry } from '../utils/voyagelog';
import { VoyageFilter } from '../components/voyage-filter';
import { VoyageList } from '../components/voyage-list';
import { DateTime, Duration, Interval } from 'luxon';
import LocalVoyageLogContext from '../components/voyage-context';


const Page : NextPage = () => {
  const [ playerFilter, setPlayerFilter ] = React.useState(undefined);
  const [ dateFilter, setDateFilter ] = React.useState(Interval.before(DateTime.now(), Duration.fromISO('P100Y')));

  const updateFilter = (dateFilter: Interval, playerFilter: number) => {
    setDateFilter(dateFilter);
    setPlayerFilter(playerFilter);
  }
  const players = React.useContext(LocalVoyageLogContext).voyageLog?.players().toArray();

  return (
    <>
      <VoyageFilter onChange={updateFilter} players={players} />
      <VoyageList dateFilter={dateFilter} playerFilter={playerFilter} />
    </>
  );
}

export const getStaticProps = async () => {
  return {
    props: { title: 'Logged Voyages'}
  }
}
export default Page;
