import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import type { RootRouteContext } from '@/types/context';

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: Root,
});

function Root() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
