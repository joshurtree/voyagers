import { Data } from 'dataclass';
import React from 'react';
import { LocalVoyageLog, PlayerEntry, VoyageEntry, VoyagerRecord } from '../utils/voyagelog';
import { AvatarGroup, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from '@mui/material';
import { SKILL_ABBRS } from '../utils/constants';
import tr from '../utils/translate';
import { Duration, Interval } from 'luxon';
import { VoyagerAvatar, VoyagerAvatarGroup } from './avatars';
import { LocalVoyageLogContext } from './voyage-context';
import { ColumnDef, durationFormatter, Formatter, SortableTable, SortableTableHeader, simpleSorter } from './sorrtabletable';
import { CrewContext } from './crew';
import { useVoyageLog } from './usevoyagelog';
   
const baseColumns: ColumnDef[] = [
  ColumnDef.create({id: 'dateStarted', label: tr`Date`, numeric: false, sorter: (a: Date, b: Date) => a.getTime() - b.getTime(), formatter: value => value.toLocaleDateString()}), 
  ColumnDef.create({id: 'skillPair', label: tr`Skill pairing`}),
  ColumnDef.create({id: 'duration', label: tr`Duration`, numeric: true, sorter: simpleSorter, formatter: durationFormatter}),
  ColumnDef.create({id: 'startAm', label: tr`Starting antimatter`, numeric: true, sorter: simpleSorter}),
  ColumnDef.create({id: 'finalAm', label: tr`Remaining antimatter`, numeric: true, sorter: simpleSorter}),
  ColumnDef.create({id: 'voyagers', label: tr`Voyagers`})
];

const columnsWithPlayerField: ColumnDef[]  = [ ColumnDef.create({id: 'player', label: tr`Player`, numeric: false}), ...baseColumns];

type VoyageListProps = {
  playerFilter: number;
  dateFilter: Interval;
  maxEntries?: number;
  orderBy?: ColumnDef;
  simple?: boolean;
  sortAscending?: boolean;
};

export const VoyageList = (props: VoyageListProps) => {
  const  simple  = props.simple ?? false;
  const [ orderBy, setOrderBy ] = React.useState(baseColumns.find(col => col === props.orderBy) ?? baseColumns[0]);
  const [ sortAscending, setSortAscending ] = React.useState(props.sortAscending ?? true);
  const orderByCallback = (header: ColumnDef) => {
    setSortAscending(header === orderBy && !sortAscending);
    setOrderBy(header);
  };
  const voyageContext = React.useContext(LocalVoyageLogContext);
  const allCrew = React.useContext(CrewContext);
  const voyages = voyageContext.voyageLog?.voyages().toArray();
  const players = voyageContext.voyageLog?.players().toArray();

  const rows = voyages?.map((voyage: VoyageEntry) => {
    const { dateStarted, primary_skill, secondary_skill, duration, startAm, finalAm, seats } = voyage
    const voyagers = seats.map(seat => allCrew.find(crew => crew.symbol === seat.symbol));
    return {
      player: players.find((player: PlayerEntry) => player.dbid == voyage.dbid)?.currentPlayerName,
      dateStarted,
      skillPair: SKILL_ABBRS[primary_skill] + "/" + SKILL_ABBRS[secondary_skill],
      duration,
      startAm,
      finalAm,
      voyagers: <VoyagerAvatarGroup max={12} voyagers={voyagers} />
  }}); 

  const columns = players && players.length > 1 ? columnsWithPlayerField : baseColumns;

  return rows && rows.length 
    ? <SortableTable columns={columns} orderBy={orderBy} sortAscending={sortAscending} rows={rows} />
    : <Typography variant='h3' style={{marginLeft: '5%', marginTop: '3%'}}>{tr`No voyages found`}</Typography>;
}
