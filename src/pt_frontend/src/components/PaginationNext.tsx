import { ChevronRightIcon } from '@radix-ui/react-icons';

import { Link } from '@/components/Link';
import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/utils/cn';

import type * as React from 'react';

interface PaginationNextProps
  extends Omit<React.ComponentProps<typeof Link>, 'search'> {
  className?: string;

  search?: { page_number?: number };
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
      // biome-ignore lint/suspicious/noExplicitAny: Cast to any to bypass type checking on a generic component as Pagination
      search={search as any}
    >
      <ChevronRightIcon />
    </Link>
  );
}
