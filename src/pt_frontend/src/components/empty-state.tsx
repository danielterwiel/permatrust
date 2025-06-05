import type { IconName } from '@/components/ui/icon';
import { Icon } from '@/components/ui/icon';

interface EmptyStateProps {
  icon: IconName;
  message: string;
  className?: string;
}

export const EmptyState = ({ icon, message, className = '' }: EmptyStateProps) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <Icon name={icon} size="lg" className="mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};
