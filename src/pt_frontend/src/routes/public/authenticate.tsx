import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';

const authenticateSearchSchema = z
  .object({
    error: z.boolean().optional(),
    redirect: z.string().optional(),
  })
  .optional();

export const Route = createFileRoute('/_initialized/authenticate')({
  validateSearch: zodSearchValidator(authenticateSearchSchema),
  loaderDeps: ({ search }) => ({
    error: search?.error,
    redirect: search?.redirect,
  }),
  beforeLoad: async ({ context, location }) => ({
    authActor: context.actors.auth,
    getTitle: () => 'Authenticate',
    location,
  }),
  component: Authenticate,
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
          onClick={authenticate}
          type="submit"
        >
          Authenticate
        </Button>
      )}
    </div>
  );
}
