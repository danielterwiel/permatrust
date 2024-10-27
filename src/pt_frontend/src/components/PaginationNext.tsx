import type * as React from "react";
import { Link } from "@/components/Link";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/utils/cn";
import { buttonVariants } from "@/components/ui/button";

interface PaginationNextProps
  extends Omit<React.ComponentProps<typeof Link>, "search"> {
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
      // biome-ignore lint/suspicious/noExplicitAny: Cast to any to bypass type checking on a generic component as Pagination
      search={search as any}
      className={cn(buttonVariants({ variant: "outline" }), className)}
    >
      <ChevronRightIcon />
    </Link>
  );
}
