import { z } from 'zod';
import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/Loading';

const authenticateSearchSchema = zodSearchValidator(
  z
    .object({
      redirect: z.string().optional(),
    })
    .optional(),
);

export const Route = createFileRoute('/authenticate')({
  component: Authenticate,
  validateSearch: authenticateSearchSchema,
});

function Authenticate() {
  const { auth } = Route.useRouteContext({
    select: ({ auth }) => ({ auth }),
  });
  const navigate = Route.useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticate = async () => {
    setIsAuthenticating(true);
    await auth.initializeAuth();

    if (auth.isAuthenticated) {
      navigate({
        to: '/organisations',
      });
      return;
    }
    const result = await auth.login();
    if (result) {
      navigate({
        to: '/organisations',
      });
    }
  };

  return (
    <div className="grid place-items-center min-h-dvh pb-36">
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
