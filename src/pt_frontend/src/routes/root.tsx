import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import type { RootRouteContext } from '@/types/context';

import { QueryProvider } from '@/context/query-provider';

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
