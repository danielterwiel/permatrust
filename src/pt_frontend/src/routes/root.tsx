import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import type { RouteContext } from '../types/routes';

export const Route = createRootRouteWithContext<RouteContext>()({
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
