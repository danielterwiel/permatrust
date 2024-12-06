import { Link } from '@/components/link';
import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/utils/cn';

import type * as React from 'react';

interface PaginationLinkProps
  extends Omit<React.ComponentProps<typeof Link>, 'search'> {
  className?: string;
  isActive?: boolean;
  search?: { page_number?: number };
}

export function PaginationLink({
  children,
  className,
  isActive,
  search,
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      {...props}
      className={cn(
        buttonVariants({ variant: isActive ? 'default' : 'outline' }),
        className,
      )}
      // biome-ignore lint/suspicious/noExplicitAny: Cast to any to bypass type checking on a generic component as Pagination
      search={search as any}
    >
      {children}
    </Link>
  );
}
