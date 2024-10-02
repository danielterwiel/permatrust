import * as React from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { cn } from '@/utils/cn';
import { buttonVariants } from '@/components/ui/button';

interface PaginationNextProps
  extends Omit<React.ComponentProps<typeof Link>, 'search'> {
  className?: string;

  search?: { page?: number };
}

export function PaginationNext({
  className,
  search,
  ...props
}: PaginationNextProps) {
  return (
    <Link
      {...props}
      search={search as any} // Cast to any to bypass type checking on a generic component as Pagination
      className={cn(buttonVariants({ variant: 'outline' }), className)}
    >
      <ChevronRightIcon />
    </Link>
  );
}
