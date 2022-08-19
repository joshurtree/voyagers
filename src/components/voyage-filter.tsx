import React from 'react';
import { Container, MenuItem, Select } from '@mui/material';
import { DateTime, Duration, Interval } from 'luxon';
import { VoyageEntry, PlayerEntry } from '../utils/voyagelog';
import DateRangePicker from './interval-picker';
import tr from '../utils/translate';

interface VoyageFilterProps {
  players: PlayerEntry[];
  onChange: (dateFilter: Interval, playerFilter: number) => void;
};

type VoyageFilterState = {
    dateRange: Interval;
    player?: number;
}

export class VoyageFilter extends React.Component<VoyageFilterProps, VoyageFilterState> {
  constructor(props: VoyageFilterProps) {
    super(props);

    this.state = {
      dateRange: Interval.before(DateTime.now(), Duration.fromISO('P100Y')),
      player: undefined
    }
  }

  _onChange(player = undefined, dateRange = undefined) {
    player = player ?? this.state.player;
    dateRange = dateRange ?? this.state.dateRange;
    this.setState({player, dateRange});
  }

  render() {
    const { onChange, players } = this.props;

    return (
      <Container>
        {players.length > 1 &&
          <Select value={tr`Player`} onChange={({ target: { value }}) => this._onChange(value)}>
            <MenuItem value={undefined}>{tr`All`}</MenuItem>
            {players.map((player:PlayerEntry) => <MenuItem key={player.dbid} value={player.dbid}>{player.currentPlayerName}</MenuItem>)}
          </Select>
        }
        <DateRangePicker onChange={newValue => this._onChange(undefined, newValue)} />
      </Container>
    )
  }

  dateRange() {
    return this.state.dateRange;
  }

  player() {
    return this.state.player;
  }
}
