import { useLocation, useNavigate } from '@tanstack/react-router';

import { isDefaultFilter, processPaginationInput } from '@/utils/pagination';

import type {
  FilterCriteria,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { PaginationInput } from '@/types/pagination';

/**
 * Custom hook for handling pagination state updates with URL sync
 *
 * Provides methods for updating filter, sort, and page navigation
 * while automatically cleaning default values from the URL
 */
export function usePagination(
  pagination: PaginationInput,
  defaultPagination: PaginationInput,
) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location?.pathname || '/';

  /**
   * Removes default values from pagination using Zod schema validation
   * and utility functions for comparing complex objects
   */
  const removeDefaultValues = (
    current: PaginationInput,
  ): Partial<PaginationInput> => {
    // Start with an empty object that matches the pagination URL schema
    const result: Partial<PaginationInput> = {};

    // Validate the input pagination to ensure it meets our schema
    const validatedPagination = processPaginationInput(current);

    // Process page_number - only include if different from default
    if (validatedPagination.page_number !== defaultPagination.page_number) {
      result.page_number = validatedPagination.page_number;
    }

    // Process page_size - only include if different from default
    if (validatedPagination.page_size !== defaultPagination.page_size) {
      result.page_size = validatedPagination.page_size;
    }

    // Process filters - only include if they exist and are non-default
    if (validatedPagination.filters?.[0]?.length) {
      const firstFilter = validatedPagination.filters[0][0];

      // Use utility function to compare with default empty value
      if (firstFilter && !isDefaultFilter(firstFilter)) {
        result.filters = validatedPagination.filters;
      }
    }

    // Process sort - only include if they exist and are non-default
    if (validatedPagination.sort?.length) {
      // For deep comparison, stringify both sort arrays
      const currentSortStr = JSON.stringify(validatedPagination.sort);
      const defaultSortStr = JSON.stringify(defaultPagination.sort);

      // Only include if they're different
      if (currentSortStr !== defaultSortStr) {
        result.sort = validatedPagination.sort;
      }
    }

    // Validate the resulting object against our schema
    return result;
  };

  /**
   * Updates pagination with clean URL navigation
   */
  const updatePagination = (updatedPagination: PaginationInput) => {
    // Remove default values from the pagination
    const cleanedPagination = removeDefaultValues(updatedPagination);

    // If all values match defaults, clear URL completely
    if (Object.keys(cleanedPagination).length === 0) {
      navigate({
        search: {},
        replace: true,
        to: currentPath,
      });
    } else {
      // Otherwise, only include non-default values in URL
      navigate({
        search: {
          pagination: cleanedPagination,
        },
        replace: true,
        to: currentPath,
      });
    }
  };

  /**
   * Handles filter changes from FilterInput
   */
  const onFilterChange = (newFilterCriteria: FilterCriteria) => {
    // Update pagination with new filter and validate
    const updatedPagination = processPaginationInput({
      ...pagination,
      filters: [[newFilterCriteria]],
    });

    updatePagination(updatedPagination);
  };

  /**
   * Handles sort changes from DataTableColumnHeader
   */
  const onSortChange = (newSort: [] | [SortCriteria]) => {
    // Create the updated pagination with the new sort
    const updatedPagination = processPaginationInput({
      ...pagination,
      sort: newSort,
    });

    updatePagination(updatedPagination);
  };

  /**
   * Handles page changes from Pagination component
   */
  const onPageChange = (pageNumber: number) => {
    // Create the updated pagination with the new page number
    const updatedPagination = processPaginationInput({
      ...pagination,
      page_number: pageNumber,
    });

    updatePagination(updatedPagination);
  };

  /**
   * Gets search parameters for page changes that can be used directly in Link components
   */
  const getPageChangeParams = (pageNumber: number) => {
    // Create the updated pagination with the new page number
    const updatedPagination = processPaginationInput({
      ...pagination,
      page_number: pageNumber,
    });

    // Remove default values from the pagination
    const cleanedPagination = removeDefaultValues(updatedPagination);

    // If no non-default values remain, return empty object
    if (Object.keys(cleanedPagination).length === 0) {
      return {};
    }

    // Otherwise return the cleaned pagination for the URL
    return {
      pagination: cleanedPagination,
    };
  };

  /**
   * Handles page size changes
   */
  const onPageSizeChange = (pageSize: number) => {
    // Create the updated pagination with the new page size
    const updatedPagination = processPaginationInput({
      ...pagination,
      page_size: pageSize,
    });

    updatePagination(updatedPagination);
  };

  return {
    onFilterChange,
    onSortChange,
    onPageChange,
    onPageSizeChange,
    updatePagination,
    getPageChangeParams,
  };
}
