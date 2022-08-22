import { NextPage } from 'next';
import React from 'react';
import { Grid } from '@mui/material'
import { CrewContext } from '../components/crew';
import { VoyagerAvatar } from '../components/avatar';
import LocalVoyageLogContext from '../components/voyage-context';
import { VoyageFilter }  from '../components/voyage-filter';
import { Crew } from '../utils';
import { ColumnDef, durationFormatter, simpleSorter, SortableTable } from '../components/sorrtabletable';
import { tr } from '../utils';
import { DateTime, Duration, Interval } from 'luxon';
import { oldestVoyage } from '../utils/queries';

const columns: ColumnDef[] = [
    ColumnDef.create({ id: 'crew', label: tr`Crew` }),
    ColumnDef.create({ id: 'count', label: tr`Voyage Count`, sorter: simpleSorter}),
    ColumnDef.create({ id: 'totalDuration', label: tr`Total Travel Time`, sorter: simpleSorter, formatter: durationFormatter}),
    ColumnDef.create({ id: 'meanDuration', label: tr`Average Voyage Duration`, sorter: simpleSorter, formatter: durationFormatter}),
    ColumnDef.create({ id: 'traitMatches', label: tr`Total Trait Matches`, sorter: simpleSorter})
];

const crewAvatar = (voyager) => (
    <Grid container alignItems='center'>
        <Grid item>
            <VoyagerAvatar voyager={voyager} square={true}/>
        </Grid>
        <Grid item style={{marginLeft: '10px'}}>{voyager.name}</Grid>
    </Grid>
);     

export const Page : NextPage = () => {
    const voyageLog = React.useContext(LocalVoyageLogContext).voyageLog;
    const allCrew = React.useContext(CrewContext);
    const [ playerFilter, setPlayerFilter ] = React.useState(undefined);
    const [ dateFilter, setDateFilter ] = React.useState(Interval.before(DateTime.now(), Duration.fromISO('P100Y')));
    const firstVoyage = oldestVoyage(voyageLog.voyages()) ?? DateTime.now();

    const updateFilter = (dateFilter: Interval, playerFilter: number) => {
      setDateFilter(dateFilter);
      setPlayerFilter(playerFilter);
    }
  
    const voyagers = voyageLog
        .voyagerRecords()
        .group(record => record.symbol)
        .map(([voyager, unfilteredVoyages]) => {
            const voyages = unfilteredVoyages
                .filter(voyage => !playerFilter || playerFilter.map(player => player.dbid).includes(voyage.voyage.dbid))
                .filter(voyage => DateTime.fromSeconds(voyage.voyage.dateStarted.getTime()) > dateFilter.start);
            const totalDuration = voyages.map(voyage => voyage.voyage.duration).reduce((total, duration) => total + duration, 0);
            const meanDuration = totalDuration/voyages.count();
            const traitMatches = voyages.map(voyage => voyage.traitMatch).filter(match => match).count();
            const avatar = crewAvatar(allCrew.find(c => c.symbol == voyager));
             
            return {
                crew: avatar, 
                count: voyages.count(),
                totalDuration,
                meanDuration,
                traitMatches
            };
        }
    );
    
    return <>
        <VoyageFilter onChange={updateFilter} players={voyageLog.players().toArray()} />
        <SortableTable columns={columns} rows={voyagers.toArray()} orderBy={columns[1]} sortAscending={false} />
    </>;
} 

export const getStaticProps = async () => ({props: {title: tr`Greatest Voyagers`}})

export default Page;
