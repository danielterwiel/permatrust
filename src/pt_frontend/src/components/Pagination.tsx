import { useMatches } from '@tanstack/react-router';

import { paginationSearchSchema } from '@/schemas/pagination';
import { toNumberSchema } from '@/schemas/primitives';

import { PaginationLink } from '@/components/pagination-link';
import { PaginationNext } from '@/components/pagination-next';
import { PaginationPrevious } from '@/components/pagination-previous';
import {
  Pagination as PaginationBase,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination';

import type { PaginationMetadata } from '@/declarations/pt_backend/pt_backend.did';

type PaginationProps = {
  getPageChangeParams?: (pageNumber: number) => Record<string, unknown>;
  paginationMetaData: PaginationMetadata;
};

export function Pagination({
  getPageChangeParams,
  paginationMetaData: {
    has_next_page,
    has_previous_page,
    page_number,
    total_items,
    total_pages,
  },
}: PaginationProps) {
  const totalPages = toNumberSchema.parse(total_pages);
  const currentPage = toNumberSchema.parse(page_number);

  const matches = useMatches();
  const currentRoute = matches[matches.length - 1];
  const search = currentRoute.search || {};

  const { pagination: currentPagination } =
    paginationSearchSchema.parse(search);

  // Hide pagination when there are no items or only one page
  if (total_items === 0 || totalPages <= 1) {
    return null;
  }

  const pageNumbers: Array<'ellipsis' | number> = [];

  if (totalPages <= 5) {
    // Less than 5 total pages, show all pages
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // More than 5 total pages, create advanced pagination
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, 4, 'ellipsis', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(
        1,
        'ellipsis',
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pageNumbers.push(
        1,
        'ellipsis',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        'ellipsis',
        totalPages,
      );
    }
  }

  return (
    <PaginationBase>
      <PaginationContent className="flex justify-center gap-8">
        <div className="flex justify-start w-24">
          {has_previous_page && (
            <PaginationItem>
              <PaginationPrevious
                search={
                  getPageChangeParams
                    ? getPageChangeParams(currentPage - 1)
                    : {
                      pagination: {
                        ...currentPagination,
                        page_number: currentPage - 1,
                      },
                    }
                }
                to=""
              >
                Previous
              </PaginationPrevious>
            </PaginationItem>
          )}
        </div>
        <div className="flex gap-4">
          {pageNumbers.map((pageNumber, index) =>
            pageNumber === 'ellipsis' ? (
              <PaginationItem
                key={`ellipsis-${pageNumbers[index - 1]}-${
                  pageNumbers[index + 1]
                }`}
              >
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  isActive={pageNumber === currentPage}
                  search={
                    getPageChangeParams
                      ? getPageChangeParams(pageNumber)
                      : {
                        pagination: {
                          ...currentPagination,
                          page_number: pageNumber,
                        },
                      }
                  }
                  to=""
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
        </div>
        <div className="flex justify-end w-24">
          {has_next_page && (
            <PaginationItem>
              <PaginationNext
                search={
                  getPageChangeParams
                    ? getPageChangeParams(currentPage + 1)
                    : {
                      pagination: {
                        ...currentPagination,
                        page_number: currentPage + 1,
                      },
                    }
                }
                to=""
              >
                Next
              </PaginationNext>
            </PaginationItem>
          )}
        </div>
      </PaginationContent>
    </PaginationBase>
  );
}
