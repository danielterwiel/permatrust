import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
} from '@radix-ui/react-icons';
import { useMatches } from '@tanstack/react-router';
import type * as React from 'react';

import { paginationSearchSchema } from '@/schemas/pagination';
import { cn } from '@/utils/cn';
import { snakeToPascalCase } from '@/utils/snake-to-pascal-case';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Column } from '@tanstack/react-table';

type DataTableColumnHeaderProps<TData, TValue> =
  React.HTMLAttributes<HTMLDivElement> & {
    column: Column<TData, TValue>;
    defaultSortDirection?: 'asc' | 'desc' | false;
    defaultSortField?: string;
    title: React.ReactNode;
  };

export function DataTableColumnHeader<TData, TValue>({
  className,
  column,
  title,
  defaultSortDirection,
  defaultSortField,
}: DataTableColumnHeaderProps<TData, TValue>) {
  // Get current route match for URL params
  const matches = useMatches();
  const currentRoute = matches[matches.length - 1];
  const search = currentRoute.search || {};

  const { pagination } = paginationSearchSchema.parse(search);

  // This will be used for URL-based sorting
  const urlSort = pagination?.sort?.[0];

  // Get the base column ID without index suffix (e.g., "name-0" -> "name")
  const baseColumnId = column.id.split('-')[0];

  // Convert to PascalCase for comparison
  const pascalColumnId = snakeToPascalCase(baseColumnId);

  // Check if this column is being sorted based on URL params, table state, or default settings
  const isColumnSorted = () => {
    // First, check URL-based sorting
    if (urlSort?.field) {
      try {
        // Get entity key and field
        const entityKey = Object.keys(urlSort.field)[0];
        if (!entityKey) return null;

        // Get the field object for this entity
        const fieldObj = urlSort.field[entityKey as keyof typeof urlSort.field];

        // Extract the field name using type assertion
        // oxlint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const sortFieldName = fieldObj
          ? Object.keys(fieldObj as Record<string, unknown>)[0]
          : null;

        // If column matches sort field, return direction from URL
        if (sortFieldName && pascalColumnId === sortFieldName) {
          return 'Desc' in urlSort.order ? 'desc' : 'asc';
        }
      } catch {
        // If any errors in parsing, continue to check table state
      }
    }

    // Next, check if table has an active sort state for this column
    const tableSortDirection = column.getIsSorted();
    if (tableSortDirection) {
      return tableSortDirection;
    }

    // Finally, if no URL or table sort is active, check default sort
    if (defaultSortField && defaultSortDirection) {
      // Check if this column is the default sort column
      if (pascalColumnId === defaultSortField) {
        return defaultSortDirection;
      }
    }

    // No sorting applies to this column
    return false;
  };

  // Get sorting direction
  const sortDirection = isColumnSorted();

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            size="sm"
            variant="ghost"
          >
            {title}
            {sortDirection === 'desc' ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : sortDirection === 'asc' ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <CaretSortIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Ascending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Descending
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
