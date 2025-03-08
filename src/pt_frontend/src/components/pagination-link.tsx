import { Link } from '@/components/link';
import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/utils/cn';

import type { PaginationSearchParams } from '@/schemas/pagination';
import type * as React from 'react';

interface PaginationLinkProps
  extends Omit<React.ComponentProps<typeof Link>, 'search'> {
  className?: string;
  isActive?: boolean;
  search?: PaginationSearchParams;
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
      replace
      search={search}
    >
      {children}
    </Link>
  );
}
