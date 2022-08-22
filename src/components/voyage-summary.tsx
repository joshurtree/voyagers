import React from 'react';
import { duration, Grid } from '@mui/material';
import { LocalVoyageLog, VoyageEntry, VoyageFilter } from '../utils/voyagelog';
import { tr } from '../utils';
import { VoyagerAvatarGroup } from './avatar';
import { OODBQuery } from '../utils/QueryAdapter';
import { Duration } from 'luxon';
import LocalVoyageLogContext from './voyage-context';
import { formatDuration } from '../utils';
import { CrewContext, symbolToCrew } from './crew';
import { longestVoyage, meanVoyageDuration, mostTravelledVoyagers, mostUsedVoyagers } from '../utils/queries';


class ItemProps {
    title: string;
    children: JSX.Element[] | JSX.Element | string | number;
};

const Item = (props: ItemProps) => {
    return <Grid item xs={6}><Grid container justifyContent='space-between'><Grid item>{props.title}</Grid><Grid item>{props.children}</Grid></Grid></Grid>;
};

class VoyagesSummaryProps {
    filter?: VoyageFilter;
};

export const VoyagesSummary = (props: VoyagesSummaryProps) => {
    const log = React.useContext(LocalVoyageLogContext).voyageLog;
    const voyages  = props.filter ? log.voyages().filter(props.filter) : log.voyages();
    const voyagers = log.voyagerRecords().group(voyager => voyager.symbol);

    //const uniqueVoyagers = log.voyagerRecords().group(voyager => voyager.id);
    const toDuration = seconds => {
        const duration = Duration.fromMillis(seconds*1000);
        return duration.toFormat('h:m');
    };
    const allCrew = React.useContext(CrewContext);

    return (
        <>
        <Grid container justify-content='space-evenly' spacing={2}>
            <Item title={tr`Number of Voyages`}>{voyages.count()}</Item>
            <Item title={tr`Longest voyage`}>
                {formatDuration(longestVoyage(voyages))}
            </Item>
            <Item title={tr`Mean average voyage length`}>
                {formatDuration(meanVoyageDuration(voyages))}
            </Item>
            <Item title={tr`Voyagers used`}>{voyagers.count()}</Item>
            <Item title={tr`Most used voyager(s)`}>
                <VoyagerAvatarGroup 
                    voyagers= {
                        mostUsedVoyagers(voyagers)
                            .map(val => symbolToCrew(val[0], allCrew))
                    }
                />
            </Item>
            <Item title={tr`Most travelled voyager(s)`}>
                <VoyagerAvatarGroup
                    voyagers={
                        mostTravelledVoyagers(voyagers)
                            .map(val => symbolToCrew(val[0], allCrew))
                    }
                />           
            </Item>
        </Grid>
        </>   
    );
};