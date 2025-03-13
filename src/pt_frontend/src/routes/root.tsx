import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { QueryProvider } from '@/context/query-provider';

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
