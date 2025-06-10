import { Link as RouterLink } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { buttonVariants } from '@/components/ui/button';
import type { ButtonProps } from '@/components/ui/button';

import type { LinkProps } from '@tanstack/react-router';

type CustomLinkProps = Omit<LinkProps, 'className'> & {
  children: ReactNode;
  className?: string;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
};

export const Link = ({
  children,
  className,
  size,
  variant = 'link',
  ...props
}: CustomLinkProps) => {
  return (
    <RouterLink
      className={buttonVariants({ className, size, variant })}
      {...props}
    >
      {children}
    </RouterLink>
  );
};
