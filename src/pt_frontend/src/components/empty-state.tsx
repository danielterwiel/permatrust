import type { IconName } from '@/components/ui/icon';
import { Icon } from '@/components/ui/icon';

interface EmptyStateProps {
  icon: IconName;
  message: string;
  className?: string;
}

export const EmptyState = ({
  icon,
  message,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`text-center py-8 h-full flex-1 ${className}`}>
      <div className="grid grid-rows-[2fr_auto_3fr] place-items-center h-full">
        <div className="text-xl">
          <Icon
            name={icon}
            size="xl"
            className="mx-auto text-muted-foreground mb-4"
          />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};
