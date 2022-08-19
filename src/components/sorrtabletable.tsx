import { Data } from 'dataclass';
import React, { ChangeEvent, MutableRefObject } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TableSortLabel, Typography } from '@mui/material';
import { formatDuration } from '../utils';

export type Sortable = string | number | Date;
export type Sorter = (a: Sortable, b: Sortable) => number;
export type Formatter = (value: any) => JSX.Element;

export const simpleSorter: Sorter = (a: number, b: number) => a - b;
export const durationFormatter: Formatter = (duration: number) => <span>{formatDuration(duration)}</span>

export class ColumnDef extends Data {
  id: string;
  label: string;
  numeric?: boolean = false;
  sorter?: Sorter;
  formatter?: (value: any) => JSX.Element = (value: any) => <span>{value}</span>;
};

type SortableTableHeaderCellProps = {
  header: ColumnDef;
  orderBy?: boolean;
  orderByCallback: (header: ColumnDef) => void;
  simple: boolean;
  sortAscending?: boolean;
};

const SortableTableHeaderCell = (props: SortableTableHeaderCellProps) => {
  const { header, orderBy, orderByCallback, simple, sortAscending } = props;
  return (
    <TableCell key={header.id} align='center'>
      {simple || header.sorter == undefined
        ? header.label
        : (<TableSortLabel
            active={orderBy}
            direction={sortAscending ? 'asc' : 'desc'}
            onClick={() => orderByCallback(header)}
          >
            {header.label}
          </TableSortLabel>)
      }
    </TableCell>
  );
}

type SortableTableHeaderProps = { 
  columns: ColumnDef[];
  orderBy: ColumnDef;
  orderByCallback: (header: ColumnDef) => void;
  simple: boolean;
  sortAscending: boolean;
};

export const SortableTableHeader = (props: SortableTableHeaderProps) => {
  const { columns, orderBy, orderByCallback, simple, sortAscending } = props;
  return (
    <TableHead>
      <TableRow>
        {columns.map(header =>
          <SortableTableHeaderCell
            key={header.id}
            header={header}
            orderBy={orderBy === header}
            orderByCallback={orderByCallback}
            simple={simple}
            sortAscending={sortAscending}
          />
        )}
      </TableRow>
    </TableHead>);
};

export type SortableTableProps<T> = {
  columns: ColumnDef[];
  orderBy: ColumnDef;
  simple?: boolean;
  sortAscending: boolean;
  rows: T[];
};

export const SortableTable = <T,>(props: SortableTableProps<T>): JSX.Element => {
  const { columns, rows, simple } = props;
  
  const [ orderBy, setOrderBy ] = React.useState(props.orderBy);
  const [ sortAscending, setSortAscending ] = React.useState(props.sortAscending);
  const [ page, setPage] = React.useState(0);
  const [ pageSize, setPageSize] = React.useState(25);
  const handlePageSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPageSize(Number.parseInt(event.target.value) ?? 10);
    setPage(0);
  };
  const handleOrderByChange = (column: ColumnDef) => {
    setSortAscending(column === orderBy && !sortAscending);
    setOrderBy(column);
  };
  const offset = page*pageSize;

  return (
    <Table style={{ marginLeft: '5%', marginTop: '1cm', width: 'auto' }}>
      <SortableTableHeader 
        orderBy={orderBy}
        orderByCallback={handleOrderByChange}
        columns={columns}
        simple={simple}
        sortAscending={sortAscending}
      />
        <TableBody>
        {rows
          .slice(offset, offset+pageSize)
          .sort((row1, row2) => orderBy.sorter(row1[orderBy.id], row2[orderBy.id]) * (sortAscending ? 1 : -1))
          .map(row =>
            <TableRow>
              {columns.map(header =>
                <TableCell key={header.id} align={header.numeric ? 'right' : 'left'}>
                  {header.formatter(row[header.id])}
                </TableCell>)
              }
            </TableRow>
          )}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TablePagination
            count={rows.length}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={(_, page) => setPage(page)}
            onRowsPerPageChange={handlePageSizeChange}
          />
        </TableRow>
      </TableFooter>
    </Table>
  )
}
