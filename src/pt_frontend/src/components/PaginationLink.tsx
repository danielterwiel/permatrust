import type * as React from 'react';
import { Link } from '@/components/Link';
import { cn } from '@/utils/cn';
import { buttonVariants } from '@/components/ui/button';

interface PaginationLinkProps
  extends Omit<React.ComponentProps<typeof Link>, 'search'> {
  search?: { page_number?: number };
  isActive?: boolean;
  className?: string;
}

export function PaginationLink({
  isActive,
  className,
  children,
  search,
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      {...props}
      // biome-ignore lint/suspicious/noExplicitAny: Cast to any to bypass type checking on a generic component as Pagination
      search={search as any}
      className={cn(
        buttonVariants({ variant: isActive ? 'default' : 'outline' }),
        className,
      )}
    >
      {children}
    </Link>
  );
}
