import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/authenticate")({
  component: Authenticate,
  beforeLoad: async ({ context }) => {
    if (!context.auth.loggedIn) {
      throw redirect({
        to: "/",
      });
    }
    if (context.auth.authenticated) {
      throw redirect({
        to: "/projects",
        search: { page: 1 },
      });
    }
    return context;
  },
});

function Authenticate() {
  const { auth } = Route.useRouteContext({
    select: ({ auth }) => ({ auth }),
  });
  const navigate = useNavigate();
  return (
    <div className="flex justify-end">
      {!auth.authenticated ? (
        <Button
          onClick={async () => {
            await auth.initAuthClient();
            const result = await auth.authenticate();
            if (result) {
              navigate({
                to: "/projects",
                search: { page: 1 },
              });
            }
          }}
        >
          Authenticate
        </Button>
      ) : (
        <Button type="button" onClick={auth.logout}>
          Logout
        </Button>
      )}
    </div>
  );
}
