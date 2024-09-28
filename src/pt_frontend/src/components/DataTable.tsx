import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type HeaderGroup,
} from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import useDebounce from "@/hooks/useDebounce";
import type {
  Project,
  Document,
  DocumentRevision,
} from "@/declarations/pt_backend/pt_backend.did";

interface TableFiltersProps {
  headerGroups: HeaderGroup<TableDataItem>[];
  headers: string[];
  columnFilters: Record<string, string>;
  setColumnFilters: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  camelCaseToHumanReadable: (input: string) => string;
  columnWidths: Record<string, number>;
}

const TableFilters: React.FC<TableFiltersProps> = ({
  headers,
  columnFilters,
  setColumnFilters,
  columnWidths,
}) => {
  const handleInputChange = useCallback(
    (header: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setColumnFilters((prev) => ({
        ...prev,
        [header]: e.target.value,
      }));
    },
    [setColumnFilters],
  );

  return (
    <div className="flex">
      {headers.map((header) => (
        <div key={header}>
          <Input
            type="text"
            value={columnFilters[header] || ""}
            onChange={handleInputChange(header)}
            style={{ width: `${columnWidths[header] || 150}px` }}
          />
        </div>
      ))}
    </div>
  );
};

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
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const debouncedColumnFilters = useDebounce(columnFilters, 500);

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

  const filteredData = useMemo(
    () =>
      tableData.filter((row) =>
        headers.every((header) =>
          (row[header as keyof TableDataItem] as unknown as string)
            ?.toString()
            .toLowerCase()
            .includes(debouncedColumnFilters[header]?.toLowerCase() || ""),
        ),
      ),
    [tableData, headers, debouncedColumnFilters],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  const headerRefs = useRef<(HTMLTableCellElement | null)[]>([]);

  useEffect(() => {
    const newColumnWidths: Record<string, number> = {};
    headerRefs.current.forEach((header, index) => {
      if (header) {
        const headerId = headers[index];
        newColumnWidths[headerId ?? 0] = header.offsetWidth;
      }
    });
    setColumnWidths(newColumnWidths);
  }, [headers]);

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
        <TableFilters
          headerGroups={table.getHeaderGroups()}
          headers={headers}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          camelCaseToHumanReadable={camelCaseToHumanReadable}
          columnWidths={columnWidths}
        />
        <Table className="font-mono">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <TableHead
                    key={header.id}
                    className="text-nowrap"
                    ref={(el) => {
                      headerRefs.current[index] = el;
                    }}
                  >
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
