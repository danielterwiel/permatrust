import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  type ColumnDef,
} from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  Project,
  Document,
  DocumentRevision,
} from "@/declarations/pt_backend/pt_backend.did";

export type TableDataItem = Project | Document | DocumentRevision;
export type TableData = TableDataItem[];

interface TableProps {
  tableData?: TableData;
  showOpenEntityButton?: boolean;
  entityName?: string;
  onSelectionChange?: (selectedRows: TableDataItem[]) => void;
}

export const DataTable: React.FC<TableProps> = ({
  tableData = [],
  showOpenEntityButton = false,
  entityName,
  onSelectionChange,
}) => {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const camelCaseToHumanReadable = useCallback((input: string) => {
    const spaced = input.replace(
      /([a-z])([A-Z])|([A-Z]+)([A-Z][a-z])/g,
      "$1$3 $2$4",
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

  const columns: ColumnDef<TableDataItem>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
      },
      ...headers.map((header: string) => ({
        accessorKey: header,
        header: camelCaseToHumanReadable(header),
      })),
    ],
    [headers, camelCaseToHumanReadable],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
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

  console.log("tableData", tableData);

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
                          header.getContext(),
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
                      to={`${entityName ? `${entityName}/` : ""}${row.getValue("id")}`}
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
