import type { PaginationMetadata } from '@/declarations/pt_backend/pt_backend.did';
import {
  Pagination as PaginationBase,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination';
import { PaginationPrevious } from '@/components/PaginationPrevious';
import { PaginationLink } from '@/components/PaginationLink';
import { PaginationNext } from '@/components/PaginationNext';

type PaginationProps = {
  paginationMetaData: PaginationMetadata;
};

export function Pagination({
  paginationMetaData: {
    total_pages,
    total_items,
    has_previous_page,
    has_next_page,
    page_number,
  },
}: PaginationProps) {
  const totalPages = Number(total_pages);
  const currentPage = Number(page_number);

  // Hide pagination when there are no items or only one page
  if (total_items === 0 || totalPages <= 1) {
    return null;
  }

  const pageNumbers: (number | 'ellipsis')[] = [];

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
                to=""
                search={
                  currentPage - 1 === 1
                    ? undefined
                    : { page_number: currentPage - 1 }
                }
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
                  to=""
                  search={
                    pageNumber === 1 ? undefined : { page_number: pageNumber }
                  }
                  isActive={pageNumber === currentPage}
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
              <PaginationNext to="" search={{ page_number: currentPage + 1 }}>
                Next
              </PaginationNext>
            </PaginationItem>
          )}
        </div>
      </PaginationContent>
    </PaginationBase>
  );
}
