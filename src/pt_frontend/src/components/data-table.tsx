import {
  type ColumnDef,
  type Row,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Table as TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getSortingState } from '@/utils/getSortingState';
import { sortingStateToSort } from '@/utils/sortingStateToSort';

import { Pagination } from './Pagination';
import { DataTableColumnHeader } from './table-column-header';

import type {
  PaginationMetadata,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { Entity, EntityName } from '@/types/entities';
import type * as React from 'react';

interface ColumnConfigItem {
  // biome-ignore lint/suspicious/noExplicitAny: columnConfig can pass any value
  cellPreprocess?: (value: any) => any;
  headerName?: string;
  id: string;
}

interface TableProps<T extends Entity = Entity> {
  actions?: ((row: Row<T>) => React.ReactNode) | React.ReactNode;
  columnConfig?: ColumnConfigItem[];
  entityName: EntityName;
  onSelectionChange?: (selectedRows: T[]) => void;
  onSortingChange?: (sort: [] | [SortCriteria]) => void;
  paginationMetaData?: PaginationMetadata;
  sort: [] | [SortCriteria];
  tableData?: T[];
}

export const Table = <T extends Entity = Entity>({
  actions,
  columnConfig = [],
  entityName,
  onSelectionChange,
  onSortingChange,
  paginationMetaData,
  tableData = [],
}: TableProps<T>) => {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const headers = useMemo(() => {
    if (!Array.isArray(tableData) || tableData.length === 0) {
      return [];
    }
    return Object.keys(tableData[0] ?? {});
  }, [tableData]);

  const handleSortingChange = (
    updater: ((prev: SortingState) => SortingState) | SortingState,
  ) => {
    const sortingState = getSortingState(updater);
    const newSort = sortingStateToSort(entityName, sortingState);
    onSortingChange?.(newSort);
  };

  const columns: ColumnDef<T>[] = useMemo(() => {
    const selectColumn: ColumnDef<T> = {
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        />
      ),
      enableHiding: false,
      enableSorting: false,
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(checked) =>
            table.toggleAllPageRowsSelected(!!checked)
          }
        />
      ),
      id: 'select',
    };

    const allColumns = headers.map((header: string) => {
      const config = columnConfig.find((col) => col.id === header);
      const columnDef: ColumnDef<T> = {
        accessorKey: header,
        cell: config?.cellPreprocess
          ? ({ getValue }) => config.cellPreprocess?.(getValue())
          : undefined,
        header: config?.headerName,
      };
      return columnDef;
    });

    // Conditionally include the selectColumn based on the presence of onSelectionChange
    return onSelectionChange ? [selectColumn, ...allColumns] : allColumns;
  }, [headers, columnConfig, onSelectionChange]);

  const [columnVisibility, setColumnVisibility] = useState(() => {
    const initialVisibility: Record<string, boolean> = {};
    for (const header of headers) {
      initialVisibility[header] = false;
    }

    for (const col of columnConfig) {
      initialVisibility[col.id] = true;
    }

    return initialVisibility;
  });

  const table = useReactTable<T>({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    state: {
      columnVisibility,
      rowSelection,
    },
  });

  const previousSelection = useRef(rowSelection);

  useEffect(() => {
    if (onSelectionChange && previousSelection.current !== rowSelection) {
      previousSelection.current = rowSelection;
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [onSelectionChange, rowSelection, table]);

  if (tableData === undefined) {
    return <p>No data fetched yet</p>;
  }
  if (tableData.length === 0) {
    return <p>No data available</p>;
  }
  if (!Array.isArray(tableData)) {
    return <p>Invalid data</p>;
  }
  return (
    <div className="grid">
      <div className="overflow-auto py-2">
        <TableBase className="font-mono">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return header.isPlaceholder ? null : (
                    <TableHead key={header.id}>
                      <DataTableColumnHeader
                        column={header.column}
                        title={
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          ) as string
                        }
                      />
                    </TableHead>
                  );
                })}
                <TableHead>
                  <div className="flex justify-end pr-4">Actions</div>
                </TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell className="whitespace-nowrap" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell>
                    <div className="flex justify-end pr-4">
                      {typeof actions === 'function' ? actions(row) : actions}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </TableBase>
        <div className="pt-16">
          {paginationMetaData && (
            <Pagination paginationMetaData={paginationMetaData} />
          )}
        </div>
      </div>
    </div>
  );
};
