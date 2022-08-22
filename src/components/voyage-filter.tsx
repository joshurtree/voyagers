import React from 'react';
import { Container, MenuItem, Select } from '@mui/material';
import { DateTime, Duration, Interval } from 'luxon';
import { VoyageEntry, PlayerEntry } from '../utils/voyagelog';
import DateRangePicker from './interval-picker';
import tr from '../utils/translate';

interface VoyageFilterProps {
  anyDate?: DateTime;
  onChange: (dateFilter: Interval, playerFilter: number) => void;
  players: PlayerEntry[];
};

type VoyageFilterState = {
    dateRange: Interval;
    players?: number;
}

export class VoyageFilter extends React.Component<VoyageFilterProps, VoyageFilterState> {
  constructor(props: VoyageFilterProps) {
    super(props);

    this.state = {
      dateRange: Interval.before(DateTime.now(), Duration.fromISO('P100Y')),
      players: undefined
    }
  }

  _onChange(players = undefined, dateRange = undefined) {
    players = players ?? this.state.players;
    dateRange = dateRange ?? this.state.dateRange;
    this.setState({players, dateRange});
  }

  render() {
    const { onChange, players } = this.props;
    
    return (
      <Container>
        {players.length > 1 &&
          <Select value={tr`Player`} multiple onChange={({ target: { value }}) => this._onChange(value)}>
            <MenuItem value={undefined}>{tr`All`}</MenuItem>
            {players.map((player:PlayerEntry) => <MenuItem key={player.dbid} value={player.dbid}>{player.currentPlayerName}</MenuItem>)}
          </Select>
        }
        <DateRangePicker onChange={newValue => this._onChange(undefined, newValue)} anyInterval=""/>
      </Container>
    );
  }

  dateRange() {
    return this.state.dateRange;
  }

  players() {
    return this.state.players;
  }
}
