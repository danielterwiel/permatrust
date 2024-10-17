import type * as React from "react";
import { Link } from "@/components/Link";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { cn } from "@/utils/cn";
import { buttonVariants } from "@/components/ui/button";

interface PaginationPreviousProps
  extends Omit<React.ComponentProps<typeof Link>, "search"> {
  className?: string;

  search?: { page?: number };
}

export function PaginationPrevious({
  className,
  search,
  ...props
}: PaginationPreviousProps) {
  return (
    <Link
      {...props}
      // biome-ignore lint/suspicious/noExplicitAny: Cast to any to bypass type checking on a generic component as Pagination
      search={search as any}
      className={cn(buttonVariants({ variant: "outline" }), className)}
    >
      <ChevronLeftIcon />
    </Link>
  );
}
