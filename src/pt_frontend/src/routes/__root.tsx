import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import type { Auth } from "@/context/auth";
import type {
  Project,
  Document,
  Revision,
} from "@/declarations/pt_backend/pt_backend.did";

type RouteContext = {
  auth: Auth;

  projects?: Project[];
  documents?: Document[];
  revisions?: Revision[];

  active: {
    project?: Project;
    document?: Document;
    revision?: Revision;
  };
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
