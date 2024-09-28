import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import type { Auth } from "@/context/auth";
import type { Selected } from "@/context/selected";

type RouteContext = {
  auth: Auth;
  selected: Selected;
};

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
