import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type Row,
} from '@tanstack/react-table';
import {
  Table as TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { Entity } from '@/consts/entities';
import type { PaginationMetadata } from '@/declarations/pt_backend/pt_backend.did';
import { Pagination } from './Pagination';

interface ColumnConfigItem {
  id: string;
  headerName?: string;
  // biome-ignore lint/suspicious/noExplicitAny: columnConfig can pass any value
  cellPreprocess?: (value: any) => any;
}

interface TableProps<T extends Entity = Entity> {
  tableData?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  columnConfig?: ColumnConfigItem[];
  paginationMetaData?: PaginationMetadata;
  actions?: React.ReactNode | ((row: Row<T>) => React.ReactNode);
}

export const Table = <T extends Entity = Entity>({
  tableData = [],
  onSelectionChange,
  columnConfig = [],
  paginationMetaData,
  actions,
}: TableProps<T>) => {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const camelCaseToHumanReadable = useCallback((input: string) => {
    const spaced = input.replace(
      /([a-z])([A-Z])|([A-Z]+)([A-Z][a-z])/g,
      '$1$3 $2$4',
    );
    const capitalized = spaced.charAt(0).toUpperCase() + spaced.slice(1);
    return capitalized;
  }, []);

  const headers = useMemo(() => {
    if (!Array.isArray(tableData) || tableData.length === 0) {
      return [];
    }
    return Object.keys(tableData[0] ?? {});
  }, [tableData]);

  const columns: ColumnDef<T>[] = useMemo(() => {
    const selectColumn: ColumnDef<T> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(checked) =>
            table.toggleAllPageRowsSelected(!!checked)
          }
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    const allColumns = headers.map((header: string) => {
      const config = columnConfig.find((col) => col.id === header);
      const columnDef: ColumnDef<T> = {
        accessorKey: header,
        header: config?.headerName || camelCaseToHumanReadable(header),
        cell: config?.cellPreprocess
          ? ({ getValue }) => config.cellPreprocess?.(getValue())
          : undefined,
      };
      return columnDef;
    });

    // Conditionally include the selectColumn based on the presence of onSelectionChange
    return onSelectionChange ? [selectColumn, ...allColumns] : allColumns;
  }, [headers, camelCaseToHumanReadable, columnConfig, onSelectionChange]);

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
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
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
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
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
                  <TableCell key={cell.id} className="whitespace-nowrap">
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
