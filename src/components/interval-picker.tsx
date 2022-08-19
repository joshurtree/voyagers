import { FC,  useState } from 'react';
import { MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { DateTime, Duration, Interval} from 'luxon';
import tr from '../utils/translate';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import DateAdapter from '@mui/lab/AdapterLuxon';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const createInterval = (duration: string) => Interval.before(DateTime.now(), Duration.fromISO(duration));

interface Option {
  label: string;
  from: string;
}

const defaultOptions: Option[] = [
  { label: tr`Any`, from: 'P100Y' },
  { label: tr`Last week`, from: 'P7D' },
  { label: tr`Last month`, from: 'P1M' },
  { label: tr`Last 3 months`, from: 'P3M' },
  { label: tr`Last 6 months`, from: 'P6M' },
  { label: tr`Last year`, from: 'P1Y' },
  { label: tr`Custom`, from: undefined }
];

class IntervalPickerProps  {
  defaultInterval?: Option = defaultOptions[0];
  onChange: (interval: Interval) => void;
  options?: Option[];
};

export const IntervalPicker: FC<IntervalPickerProps> = (props: IntervalPickerProps) => {
  const { onChange, options } = props;
  const [ fromValue, setFromValue ] = useState(props.defaultInterval);

  const opts: Option[] = options ?? defaultOptions;
  const defaultInterval = props.defaultInterval ?? opts[0];

  const selectHandler = (event: SelectChangeEvent) => {
    setFromValue(opts.find(opt => opt.from === event.target.value));
  };
  const customIntervalHandler = (value: DateTime|null) => value ? onChange(Interval.fromDateTimes(value, DateTime.now())) : null;
  
  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <DatePicker
        label={tr`From`}
        value={Interval.before(DateTime.now(), Duration.fromISO(fromValue?.from ?? defaultInterval.from)).start}
        onChange={customIntervalHandler}
        renderInput={(params) => <TextField {...params} />}
      />
      <Select onChange={selectHandler} value={"Select date"}>
        {opts.map((option: Option) => <MenuItem key={option.from} value={option.from}>{option.label}</MenuItem>)}
      </Select>
    </LocalizationProvider>
  );
}

export default IntervalPicker;
