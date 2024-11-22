import { z } from 'zod';
import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/Loading';

const authenticateSearchSchema = z
  .object({
    redirect: z.string().optional(),
    error: z.boolean().optional(),
  })
  .optional();

export const Route = createFileRoute('/_initialized/authenticate')({
  component: Authenticate,
  validateSearch: zodSearchValidator(authenticateSearchSchema),
  loaderDeps: ({ search }) => ({
    redirect: search?.redirect,
    error: search?.error,
  }),
  beforeLoad: async ({ context, location }) => ({
    getTitle: () => 'Authenticate',
    location,
    authActor: context.actors.auth,
  }),
});

function Authenticate() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { authActor } = Route.useRouteContext();
  const search = Route.useSearch();
  // const navigate = Route.useNavigate();

  async function authenticate() {
    // navigate({ search: { error: undefined }, replace: true });
    setIsAuthenticating(true);
    authActor.send({ type: 'LOGIN' });
  }

  useEffect(() => {
    if (search?.error) {
      setIsAuthenticating(false);
    }
  }, [search?.error]);

  return (
    <div className="grid place-items-center min-h-dvh pb-36">
      {search?.error && <div>Login interupted. Try again</div>}
      {isAuthenticating ? (
        <Button disabled={true}>
          <Loading text="Authenticating..." />
        </Button>
      ) : (
        <Button
          disabled={isAuthenticating}
          type="submit"
          onClick={authenticate}
        >
          Authenticate
        </Button>
      )}
    </div>
  );
}
