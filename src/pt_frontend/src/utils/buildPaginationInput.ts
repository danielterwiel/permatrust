import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';

export function buildPaginationInput(
  defaultPagination: PaginationInput,
  overrides?: Partial<PaginationInput>,
): PaginationInput {
  return {
    ...defaultPagination,
    ...overrides,
    page_number: overrides?.page_number ?? defaultPagination.page_number,
    page_size: overrides?.page_size ?? defaultPagination.page_size,
  };
}
