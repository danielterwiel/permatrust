import { ChevronRightIcon } from '@radix-ui/react-icons';

import { Link } from '@/components/link';
import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/utils/cn';

import type { PaginationSearchParams } from '@/schemas/pagination';
import type * as React from 'react';

interface PaginationNextProps
  extends Omit<React.ComponentProps<typeof Link>, 'search'> {
  className?: string;
  search?: PaginationSearchParams;
}

export function PaginationNext({
  className,
  search,
  ...props
}: PaginationNextProps) {
  return (
    <Link
      {...props}
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      replace
      search={search}
    >
      <ChevronRightIcon />
    </Link>
  );
}
