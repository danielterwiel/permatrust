import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type * as React from 'react';

import { createSort } from '@/utils/pagination';
import { pascalCaseToSnakeCase } from '@/utils/pascal-case-to-snake-case';
import { snakeToPascalCase } from '@/utils/snake-to-pascal-case';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Table as TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Pagination } from './Pagination';
import { DataTableColumnHeader } from './table-column-header';

import { SORT_ORDER } from '@/consts/pagination';

import type {
  PaginationMetadata,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { Entity, EntityName } from '@/types/entities';
import type { FilterFieldName } from '@/types/pagination';
import type { ColumnDef, Row, SortingState } from '@tanstack/react-table';

interface ColumnConfigItem<T extends Entity = Entity> {
  cellPreprocess?: (entity: T) => React.ReactNode;
  headerName?: string;
  key: string;
}

interface TableProps<T extends Entity = Entity> {
  actions?: ((row: Row<T>) => React.ReactNode) | React.ReactNode;
  columnConfig?: Array<ColumnConfigItem<T>>;
  entityName: EntityName;
  getPageChangeParams?: (pageNumber: number) => Record<string, unknown>;
  onSelectionChange?: (selectedRows: Array<T>) => void;
  onSortingChange?: (sort: [] | [SortCriteria]) => void;
  paginationMetaData?: PaginationMetadata;
  sort: [] | [SortCriteria];
  data?: Array<T>;
}

/**
 * Converts TanStack Table sorting state to backend-compatible sort criteria
 */
function convertSortingStateToBackendFormat(
  entityName: EntityName,
  sortingState: SortingState,
): [] | [SortCriteria] {
  if (sortingState.length === 0) {
    return [];
  }

  const [firstSortItem] = sortingState;
  if (!firstSortItem.id) {
    return [];
  }

  try {
    // Remove the index suffix if it exists (format: "name-0" -> "name")
    const columnId = firstSortItem.id.split('-')[0];
    const fieldName = snakeToPascalCase(columnId);
    const sortOrder = firstSortItem.desc ? SORT_ORDER.DESC : SORT_ORDER.ASC;

    return [
      createSort({
        entity: entityName,
        field: fieldName as FilterFieldName,
        order: sortOrder === SORT_ORDER.DESC ? 'Desc' : 'Asc',
      }),
    ];
  } catch (_error) {
    return [];
  }
}

/**
 * Extracts the field name from sort criteria
 */
function extractSortField(sort: [] | [SortCriteria]): string | undefined {
  if (sort.length === 0) return undefined;

  try {
    const sortCriteria = sort[0];
    const entityKey = Object.keys(sortCriteria.field)[0];
    if (!entityKey) return undefined;

    const fieldObj =
      sortCriteria.field[entityKey as keyof typeof sortCriteria.field];
    return Object.keys(fieldObj)[0];
  } catch (_e) {
    return undefined;
  }
}

/**
 * Determines if a column matches the sort field and returns its direction
 */
function determineSortDirection(
  sort: [] | [SortCriteria],
  header: { column: { id: string } },
): 'asc' | 'desc' | false {
  if (sort.length === 0) return false;

  const sortField = extractSortField(sort);
  if (!sortField) return false;

  const columnId = header.column.id.split('-')[0];
  const pascalColumnId = snakeToPascalCase(columnId);

  if (pascalColumnId !== sortField) return false;

  const sortCriteria = sort[0];
  return 'Desc' in sortCriteria.order ? 'desc' : 'asc';
}

export const Table = <T extends Entity = Entity>({
  actions,
  columnConfig = [],
  entityName,
  getPageChangeParams,
  onSelectionChange,
  onSortingChange,
  paginationMetaData,
  sort = [],
  data = [],
}: TableProps<T>) => {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const previousSelectionRef = useRef(rowSelection);

  const headers = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return Object.keys(data[0] ?? {});
  }, [data]);

  // Convert backend sort format to TanStack sorting state
  const convertBackendSortToSortingState = useCallback(
    (sortProp: [] | [SortCriteria]): SortingState => {
      if (!sortProp.length) return [];

      try {
        const sortCriteria = sortProp[0];
        const entityKey = Object.keys(sortCriteria.field)[0];
        if (!entityKey) return [];

        const fieldObj =
          sortCriteria.field[entityKey as keyof typeof sortCriteria.field];
        const fieldName = Object.keys(fieldObj)[0];
        if (!fieldName) return [];

        const columnId = pascalCaseToSnakeCase(fieldName);
        const isDesc = 'Desc' in sortCriteria.order;

        return [{ id: columnId, desc: isDesc }];
      } catch {
        return [];
      }
    },
    [],
  );

  // Initialize and keep track of current sorting state
  const [currentSorting, setCurrentSorting] = useState<SortingState>(() =>
    convertBackendSortToSortingState(sort),
  );

  // Update sorting state when sort prop changes
  useEffect(() => {
    setCurrentSorting(convertBackendSortToSortingState(sort));
  }, [sort, convertBackendSortToSortingState]);

  const handleSortingChange = (
    updater: ((prev: SortingState) => SortingState) | SortingState,
  ) => {
    const newSortingState =
      typeof updater === 'function' ? updater(currentSorting) : updater;

    setCurrentSorting(newSortingState);

    if (onSortingChange) {
      const backendSort = convertSortingStateToBackendFormat(
        entityName,
        newSortingState,
      );
      onSortingChange(backendSort);
    }
  };

  const columns: Array<ColumnDef<T>> = useMemo(() => {
    // Selection column for row selection functionality
    const selectColumn: ColumnDef<T> = {
      id: 'select',
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(checked) =>
            table.toggleAllPageRowsSelected(!!checked)
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        />
      ),
    };

    // Create data columns based on columnConfig
    const dataColumns: Array<ColumnDef<T>> = columnConfig.map(
      (config, idx) => ({
        accessorKey: config.key,
        id: `${config.key}-${idx}`,
        header: config.headerName,
        cell: config.cellPreprocess
          ? ({ row }) => config.cellPreprocess?.(row.original)
          : undefined,
      }),
    ) as Array<ColumnDef<T>>;

    return onSelectionChange ? [selectColumn, ...dataColumns] : dataColumns;
  }, [columnConfig, onSelectionChange]);

  // Manage column visibility
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(() => {
    const initialVisibility: Record<string, boolean> = {};

    // Set all headers hidden by default
    for (const header of headers) {
      initialVisibility[header] = false;
    }

    // Mark columns from columnConfig as visible
    if (columnConfig.length > 0) {
      columnConfig.forEach((col, idx) => {
        initialVisibility[`${col.key}-${idx}`] = true;
      });
    } else {
      // If no columnConfig, show all headers

      for (const header of headers) {
        initialVisibility[header] = true;
      }
    }

    return initialVisibility;
  });

  // Update column visibility when columnConfig changes
  useEffect(() => {
    const newVisibility: Record<string, boolean> = {};

    // Set all headers hidden by default
    for (const header of headers) {
      newVisibility[header] = false;
    }

    // Mark columns from columnConfig as visible
    if (columnConfig.length > 0) {
      columnConfig.forEach((col, idx) => {
        newVisibility[`${col.key}-${idx}`] = true;
      });
    } else {
      // If no columnConfig, show all headers
      for (const header of headers) {
        newVisibility[header] = true;
      }
    }

    setColumnVisibility(newVisibility);
  }, [columnConfig, headers]);

  const table = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting: currentSorting,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: handleSortingChange,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
  });

  // Notify parent component when selection changes
  useEffect(() => {
    if (onSelectionChange && previousSelectionRef.current !== rowSelection) {
      previousSelectionRef.current = rowSelection;
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [onSelectionChange, rowSelection, table]);

  if (!Array.isArray(data)) {
    return <p>Invalid data</p>;
  }

  if (data.length === 0) {
    return <p>No data available</p>;
  }

  return (
    <div className="grid">
      <div className="overflow-auto py-2">
        <TableBase className="font-mono">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) =>
                  header.isPlaceholder ? null : (
                    <TableHead key={header.id}>
                      <DataTableColumnHeader
                        column={header.column}
                        title={
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          ) as string
                        }
                        defaultSortDirection={determineSortDirection(
                          sort,
                          header,
                        )}
                        defaultSortField={extractSortField(sort)}
                      />
                    </TableHead>
                  ),
                )}
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
        {paginationMetaData && (
          <div className="pt-16">
            <Pagination
              paginationMetaData={paginationMetaData}
              getPageChangeParams={getPageChangeParams}
            />
          </div>
        )}
      </div>
    </div>
  );
};
