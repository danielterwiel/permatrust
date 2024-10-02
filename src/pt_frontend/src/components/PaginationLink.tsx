import * as React from 'react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/utils/cn';
import { buttonVariants } from '@/components/ui/button';

interface PaginationLinkProps
  extends Omit<React.ComponentProps<typeof Link>, 'search'> {
  search?: { page?: number };
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
      search={search as any} // Cast to any to bypass type checking on a generic component as Pagination
      className={cn(
        buttonVariants({ variant: isActive ? 'default' : 'outline' }),
        className
      )}
    >
      {children}
    </Link>
  );
}
