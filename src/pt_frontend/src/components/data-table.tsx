
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
import type {
  Entity,
  EntityName,
  EntityName as EntityNameType,
} from '@/types/entities';
import type { FilterFieldName } from '@/types/pagination';
import type { ColumnDef, Row, SortingState } from '@tanstack/react-table';

/**
 * Converts a TanStack Table sorting state to a backend-compatible sort criteria
 * Returns either an empty array or a single-element array with a SortCriteria
 */

// TODO: do we still need this?

const sortingStateToSort = (
  entityName: EntityName,
  sortingStates: SortingState,
): [] | [SortCriteria] => {
  // Handle empty sorting states
  if (sortingStates.length === 0) {
    return [];
  }

  const [sortingState] = sortingStates;
  if (!sortingState.id) {
    return [];
  }

  try {
    // Remove the index suffix if it exists (format: "name-0" -> "name")
    const columnId = sortingState.id.split('-')[0];
    const fieldName = snakeToPascalCase(columnId);

    // Convert the TanStack sort direction to our API's sort order
    // TanStack uses 'desc' boolean flag (true = descending, false = ascending)
    const sortOrder = sortingState.desc ? SORT_ORDER.DESC : SORT_ORDER.ASC;

    // Type cast to make TypeScript happy - we've already verified the entity exists
    const entity = entityName satisfies EntityNameType;
    const field = fieldName as FilterFieldName;

    // Create the sort criteria and return it in a tuple
    return [
      createSort({
        entity,
        field,
        order: sortOrder === SORT_ORDER.DESC ? 'Desc' : 'Asc',
      }),
    ];
  } catch (_error) {
    // Silently handle errors and return empty sort
    return [];
  }
};

interface ColumnConfigItem {
  cellPreprocess?: (value: any) => any;
  headerName?: string;
  key: string;
}

// TableProps interface is defined below

interface TableProps<T extends Entity = Entity> {
  actions?: ((row: Row<T>) => React.ReactNode) | React.ReactNode;
  columnConfig?: Array<ColumnConfigItem>;
  entityName: EntityName;
  getPageChangeParams?: (pageNumber: number) => Record<string, unknown>;
  onSelectionChange?: (selectedRows: Array<T>) => void;
  onSortingChange?: (sort: [] | [SortCriteria]) => void;
  paginationMetaData?: PaginationMetadata;
  sort: [] | [SortCriteria];
  tableData?: Array<T>;
}

/**
 * Determines if a header column matches the default sort field and returns the sort direction
 */
function getDefaultSortDirection(
  sort: [] | [SortCriteria],
  header: { column: { id: string } },
): 'asc' | 'desc' | false {
  if (sort.length === 0) return false;

  const sortField = getDefaultSortField(sort);
  if (!sortField) return false;

  // Get column ID without index suffix
  const columnId = header.column.id.split('-')[0];

  // Convert to PascalCase for comparison with sort field
  const pascalColumnId = snakeToPascalCase(columnId);

  if (pascalColumnId !== sortField) return false;

  // Determine sort direction
  const sortCriteria = sort[0];
  return 'Desc' in sortCriteria.order ? 'desc' : 'asc';
}

/**
 * Extracts the default sort field name from the sort criteria
 */
function getDefaultSortField(sort: [] | [SortCriteria]): string | undefined {
  if (sort.length === 0) return undefined;

  const sortCriteria = sort[0];

  try {
    const entityKey = Object.keys(sortCriteria.field)[0];
    if (!entityKey) return undefined;

    const fieldObj =
      sortCriteria.field[entityKey as keyof typeof sortCriteria.field];
    return Object.keys(fieldObj)[0];
  } catch (_e) {
    return undefined;
  }
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
    // Preserve the current sorting state by passing currentSorting to the updater
    const sortingState =
      typeof updater === 'function' ? updater(currentSorting) : updater;

    // Update our internal state
    setCurrentSorting(sortingState);

    // Convert to backend format and call parent's handler
    const newSort = sortingStateToSort(entityName, sortingState);
    onSortingChange?.(newSort);
  };

  const columns: Array<ColumnDef<T>> = useMemo(() => {
    // Conditionally include the selectColumn based on the presence of onSelectionChange
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

    /**
     * We now allow multiple items from columnConfig that share the same `key`.
     * For each header, we find *all* columnConfig items whose `key` matches
     * that header. Then each config becomes its own column, possibly sharing
     * the same accessorKey but with different cellPreprocess/headerName. [1]
     */
    const allColumns = headers.flatMap((header: string) => {
      const matchingConfigs = columnConfig.filter((col) => col.key === header);

      if (matchingConfigs.length === 0) {
        return [
          {
            accessorKey: header,
          } as ColumnDef<T>,
        ];
      }

      return matchingConfigs.map((config, idx) => ({
        accessorKey: header,
        cell: config.cellPreprocess
          ? ({ getValue }) => config.cellPreprocess?.(getValue())
          : undefined,
        header: config.headerName,
        id: `${config.key}-${idx}`,
      })) as Array<ColumnDef<T>>;
    });

    return onSelectionChange ? [selectColumn, ...allColumns] : allColumns;
  }, [headers, columnConfig, onSelectionChange]);

  const [columnVisibility, setColumnVisibility] = useState(() => {
    const initialVisibility: Record<string, boolean> = {};
    for (const header of headers) {
      initialVisibility[header] = false;
    }
    columnConfig.forEach((col, idx) => {
      initialVisibility[`${col.key}-${idx}`] = true;
    });
    return initialVisibility;
  });

  // Convert sort prop to sorting state
  const getSortingStateFromProp = useCallback(
    (sortProp: [] | [SortCriteria]): SortingState => {
      if (Array.isArray(sortProp) && sortProp.length > 0) {
        // Extract field name from the first sort criteria's field
        const sortCriteria = sortProp[0];
        if (sortCriteria?.field) {
          const entityKey = Object.keys(sortCriteria.field)[0];
          if (entityKey) {
            const fieldObj =
              sortCriteria.field[entityKey as keyof typeof sortCriteria.field];
            const fieldName = Object.keys(fieldObj)[0];

            if (fieldName) {
              // Convert PascalCase to snake_case for column ID
              const columnId = pascalCaseToSnakeCase(fieldName);

              // Determine sort direction
              const isDesc = 'Desc' in sortCriteria.order;

              // Return sorting state
              return [{ id: columnId, desc: isDesc }];
            }
          }
        }
      }
      return [];
    },
    [],
  );

  // Keep track of current sorting state
  const [currentSorting, setCurrentSorting] = useState<SortingState>(() =>
    getSortingStateFromProp(sort),
  );

  // Update sorting state when sort prop changes
  useEffect(() => {
    setCurrentSorting(getSortingStateFromProp(sort));
  }, [sort, getSortingStateFromProp]);

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
      sorting: currentSorting,
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
                {headerGroup.headers.map((header) =>
                  header.isPlaceholder ? null : (
                    <TableHead key={header.id}>
                      <DataTableColumnHeader
                        column={header.column}
                        defaultSortDirection={getDefaultSortDirection(
                          sort,
                          header,
                        )}
                        defaultSortField={getDefaultSortField(sort)}
                        title={
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          ) as string
                        }
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
        <div className="pt-16">
          {paginationMetaData && (
            <Pagination
              getPageChangeParams={getPageChangeParams}
              paginationMetaData={paginationMetaData}
            />
          )}
        </div>
      </div>
    </div>
  );
};
