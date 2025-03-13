import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';

import type { _SERVICE } from '@/declarations/pt_backend/pt_backend.did';

const loginSearchSchema = z
  .object({
    error: z.boolean().optional(),
    redirect: z.string().optional(),
  })
  .optional();

export const Route = createFileRoute('/_initialized/login')({
  validateSearch: zodSearchValidator(loginSearchSchema),
  loaderDeps: ({ search }) => ({
    error: search?.error,
    redirect: search?.redirect,
  }),
  beforeLoad: ({ context, location }) => ({
    authActor: context.actors.auth,
    getTitle: () => 'Login',
    location,
  }),
  component: Login,
});

function Login() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { authActor } = Route.useRouteContext();
  const search = Route.useSearch();

  function handleLogin() {
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
          <Loading text="Logging in..." />
        </Button>
      ) : (
        <Button disabled={isAuthenticating} onClick={handleLogin} type="submit">
          Login
        </Button>
      )}
    </div>
  );
}
