import { createFileRoute } from '@tanstack/react-router';

import { mutations } from '@/api/mutations';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { tryCatch } from '@/utils/try-catch';

import { CreateProjectForm } from '@/components/create-project-form';
import type { createProjectFormSchema } from '@/components/create-project-form';

import type { z } from 'zod';

import { createTenantActorWrapper, createUpgradeActorWrapper } from '@/api';
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
  } = mutations.main.useCreateTenantCanister();
  const navigate = Route.useNavigate();

  const [_tenantCanisterId, setTenantCanisterId] = useLocalStorage(
    'tenantCanisterId',
    '',
  );

  const user = authActor.getSnapshot().context.user;
  const organization = authActor.getSnapshot().context.organization;

  async function onSubmit(project: z.infer<typeof createProjectFormSchema>) {
    if (!user || !organization) {
      console.error('User or organization is not defined');
      return navigate({ to: '/onboarding/user/create' });
    }

    const tenantCanisterResult = await tryCatch(
      createTenantCanister({
        user,
        organization,
        project,
      }),
    );

    if (tenantCanisterResult.error) {
      console.error(
        'Error creating tenant canister:',
        tenantCanisterResult.error,
      );
      if (
        tenantCanisterResult.error instanceof Error &&
        tenantCanisterResult.error.message
      ) {
        console.error('Error message:', tenantCanisterResult.error.message);
      }
      return;
    }

    const auth = Auth.getInstance();
    const clientResult = await tryCatch(auth.getClient());

    if (clientResult.error) {
      console.error('Error getting auth client:', clientResult.error);
      return;
    }

    const tenantCanisterIdStr = tenantCanisterResult.data.toString();

    const [tenantActorResult, upgradeActorResult] = await Promise.all([
      tryCatch(
        createTenantActorWrapper(clientResult.data, tenantCanisterIdStr),
      ),
      tryCatch(createUpgradeActorWrapper(clientResult.data)),
    ]);

    if (tenantActorResult.error) {
      console.error('Error creating tenant actor:', tenantActorResult.error);
      return;
    }

    if (upgradeActorResult.error) {
      console.error('Error creating tenant actor:', upgradeActorResult.error);
      return;
    }

    setTenantCanisterId(tenantCanisterIdStr.toString());
    navigate({ to: '/documents' });
  }

  return (
    <>
      {createTenantCanisterError && (
        <div>{createTenantCanisterError.message}</div>
      )}
      <CreateProjectForm isSubmitting={isPending} onSubmit={onSubmit} />
    </>
  );
}
