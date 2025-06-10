import { ChevronLeftIcon } from '@radix-ui/react-icons';
import type * as React from 'react';

import type { PaginationSearchParams } from '@/schemas/pagination';
import { cn } from '@/utils/cn';

import { Link } from '@/components/link';
import { buttonVariants } from '@/components/ui/button';

interface PaginationPreviousProps
  extends Omit<React.ComponentProps<typeof Link>, 'search'> {
  className?: string;
  search?: PaginationSearchParams;
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
      replace
      search={search}
    >
      <ChevronLeftIcon />
    </Link>
  );
}
