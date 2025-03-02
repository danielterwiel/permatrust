import { QueryProvider } from '@/context/query-provider';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import type { RootRouteContext } from '@/types/context';

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: Root,
});

function Root() {
  return (
    <QueryProvider>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </QueryProvider>
  );
}
