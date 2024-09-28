import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  type ColumnDef,
} from '@tanstack/react-table';
import { Link } from '@/components/Link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type {
  Project,
  Document,
  DocumentRevision,
} from '@/declarations/pt_backend/pt_backend.did';
import type { routeTree } from '@/routeTree.gen';
import type { ParseRoute } from '@tanstack/react-router';

type ValidRoute = ParseRoute<typeof routeTree>['parentRoute'];

export type TableDataItem = Project | Document | DocumentRevision;
export type TableData = TableDataItem[];

interface ColumnConfigItem {
  id: string;
  headerName?: string;
  cellPreprocess?: (value: any) => any;
}

interface TableProps {
  tableData?: TableData;
  showOpenEntityButton?: boolean;
  routePath?: ValidRoute;
  onSelectionChange?: (selectedRows: TableDataItem[]) => void;
  columnConfig?: ColumnConfigItem[]; // Updated prop
}

export const DataTable: React.FC<TableProps> = ({
  tableData = [],
  showOpenEntityButton = false,
  routePath = '',
  onSelectionChange,
  columnConfig = [], // Default to empty array
}) => {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const camelCaseToHumanReadable = useCallback((input: string) => {
    const spaced = input.replace(
      /([a-z])([A-Z])|([A-Z]+)([A-Z][a-z])/g,
      '$1$3 $2$4'
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

  const columns: ColumnDef<TableDataItem>[] = useMemo(() => {
    const selectColumn: ColumnDef<TableDataItem> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    // Map over all possible headers to create columns
    const allColumns = headers.map((header: string) => {
      const config = columnConfig.find((col) => col.id === header);
      const columnDef: ColumnDef<TableDataItem> = {
        accessorKey: header,
        header: config?.headerName || camelCaseToHumanReadable(header),
        cell: config?.cellPreprocess
          ? ({ getValue }) => config.cellPreprocess!(getValue())
          : undefined,
      };
      return columnDef;
    });

    return [selectColumn, ...allColumns];
  }, [headers, camelCaseToHumanReadable, columnConfig]);

  // Set up column visibility state
  const [columnVisibility, setColumnVisibility] = useState(() => {
    // Hide all columns by default
    const initialVisibility: Record<string, boolean> = {};
    headers.forEach((header) => {
      initialVisibility[header] = false;
    });

    // Show columns specified in columnConfig
    columnConfig.forEach((col) => {
      initialVisibility[col.id] = true;
    });

    return initialVisibility;
  });

  const table = useReactTable({
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

  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [onSelectionChange, table]);

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
        <Table className="font-mono">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                {showOpenEntityButton && (
                  <TableCell>
                    <Link
                      to={
                        `${routePath ? `${routePath}/` : ''}${row.getValue(
                          'id'
                        )}` as ValidRoute // TODO: improve type of routePath
                      }
                    >
                      Open
                    </Link>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
