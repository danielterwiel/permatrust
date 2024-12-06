import { ChevronLeftIcon } from '@radix-ui/react-icons';

import { Link } from '@/components/link';
import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/utils/cn';

import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';
import type * as React from 'react';

interface PaginationPreviousProps
  extends Omit<React.ComponentProps<typeof Link>, 'search'> {
  className?: string;

  search?: Pick<PaginationInput, 'page_number'>;
}

export function PaginationPrevious({
  className,
  search,
  ...props
}: PaginationPreviousProps) {
  return (
    <Link
      {...props}
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      // biome-ignore lint/suspicious/noExplicitAny: Cast to any to bypass type checking on a generic component as Pagination
      search={search as any}
    >
      <ChevronLeftIcon />
    </Link>
  );
}
