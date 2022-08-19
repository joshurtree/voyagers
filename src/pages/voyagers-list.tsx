import { NextPage } from 'next';
import React from 'react';
import { Grid } from '@mui/material'
import { CrewContext } from '../components/crew';
import { VoyagerAvatar } from '../components/avatars';
import LocalVoyageLogContext from '../components/voyage-context';
import { Crew } from '../utils';
import { ColumnDef, durationFormatter, simpleSorter, SortableTable } from '../components/sorrtabletable';
import { tr } from '../utils';

const columns: ColumnDef[] = [
    ColumnDef.create({ id: 'crew', label: tr`Crew` }),
    ColumnDef.create({ id: 'count', label: tr`Voyage Count`, sorter: simpleSorter}),
    ColumnDef.create({ id: 'totalDuration', label: tr`Total Travel Time`, sorter: simpleSorter, formatter: durationFormatter}),
    ColumnDef.create({ id: 'meanDuration', label: tr`Average Voyage Duration`, sorter: simpleSorter, formatter: durationFormatter}),
    ColumnDef.create({ id: 'traitMatches', label: tr`Total Trait Matches`, sorter: simpleSorter})
];

export const Page : NextPage = () => {
    const voyageLog = React.useContext(LocalVoyageLogContext).voyageLog;
    const allCrew = React.useContext(CrewContext);

    const voyagers = voyageLog.voyagerRecords().group(record => record.symbol).map(([voyager, voyages]) => {
        const totalDuration = voyages.map(voyage => voyage.duration).reduce((total, duration) => total + duration, 0);
        const meanDuration = totalDuration/voyages.count();
        const traitMatches = voyages.map(voyage => voyage.traitMatch).filter(match => match).count();
        const crew = allCrew.find(c => c.symbol === voyager);
        const crewEntry = <Grid container alignItems='center'><Grid item><VoyagerAvatar voyager={crew} square={true}/></Grid><Grid item style={{marginLeft: '10px'}}>{crew.name}</Grid></Grid>
        return {
            crew: crewEntry, 
            count: voyages.count(),
            totalDuration,
            meanDuration,
            traitMatches
        };
    });
    
    return <SortableTable columns={columns} rows={voyagers.toArray()} orderBy={columns[1]} sortAscending={false} />;
} 

export const getStaticProps = async () => ({props: {title: tr`Greatest Voyagers`}})

export default Page;
