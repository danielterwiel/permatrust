import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/authenticate")({
  component: Authenticate,
  beforeLoad: async ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: "/organisations",
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
    <div className="grid place-items-center min-h-dvh pb-36">
      <Button
        onClick={async () => {
          await auth.initializeAuth();
          const result = await auth.login();
          console.log("result", result);
          if (result) {
            navigate({
              to: "/organisations",
              search: { page: 1 },
            });
          }
        }}
      >
        Authenticate
      </Button>
    </div>
  );
}
