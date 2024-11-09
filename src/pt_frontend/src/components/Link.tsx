import type { ReactNode } from 'react';
import { Link as RouterLink, type LinkProps } from '@tanstack/react-router';
import { buttonVariants, type ButtonProps } from '@/components/ui/button';

type CustomLinkProps = Omit<LinkProps, 'className'> & {
  children: ReactNode;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
};

export const Link = ({
  children,
  className,
  variant = 'link',
  size,
  ...props
}: CustomLinkProps) => {
  return (
    <RouterLink
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </RouterLink>
  );
};
