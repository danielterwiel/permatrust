import { createFileRoute } from '@tanstack/react-router';

import { mainMutations } from '@/api/mutations';
import { useLocalStorage } from '@/hooks/use-local-storage';

import { CreateProjectForm } from '@/components/create-project-form';
import type { createProjectFormSchema } from '@/components/create-project-form';

import type { z } from 'zod';

import { createTenantActorWrapper } from '@/api';
import { Auth } from '@/auth';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarding/onboarding/project/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create project',
  }),
  loader: ({ context }) => ({
    authActor: context.actors.auth,
  }),
  component: CreateProject,
});

function CreateProject() {
  const { authActor } = Route.useLoaderData();
  const {
    error: createTenantCanisterError,
    isPending,
    mutate: createTenantCanister,
  } = mainMutations.useCreateTenantCanister();
  const navigate = Route.useNavigate();

  const [_tenantCanisterId, setTenantCanisterId] = useLocalStorage(
    'tenantCanisterId',
    '',
  );

  const user = authActor.getSnapshot().context.user;
  const organization = authActor.getSnapshot().context.organization;

  function onSubmit(project: z.infer<typeof createProjectFormSchema>) {
    if (!user || !organization) {
      console.error('User or organization is not defined');
      return navigate({ to: '/onboarding/user/create' });
    }
    createTenantCanister(
      { user, organization, project },
      {
        onSuccess: async (tenantCanisterId) => {
          const auth = Auth.getInstance();
          const client = await auth.getClient();

          const tenantCanisterIdStr = tenantCanisterId.toString();
          await createTenantActorWrapper(client, tenantCanisterIdStr);
          setTenantCanisterId(tenantCanisterIdStr.toString());

          navigate({ to: '/documents' });
        },
        onError: (error) => {
          console.error('Error creating tenant canister:', error);
          if (error.message) {
            console.error('Error message:', error.message);
          }
        },
      },
    );

  }

  return (
    <>
      {createTenantCanisterError && <div>{createTenantCanisterError.message}</div>}
      <CreateProjectForm isSubmitting={isPending} onSubmit={onSubmit} />
    </>
  );
}
