import { useRouterState, } from '@tanstack/react-router';
import { Loading } from './Loading';
import type { AuthContext } from '@/context/auth';

export const RouterSpinner = () => {
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' });

  return (
    <header className="h-10 col-span-2 flex justify-between">
      <div className="p-4 pt-8 flex items-center gap-4">
        {isLoading ? <Loading text="Loading" /> : null}
      </div>
    </header>
  );
};
