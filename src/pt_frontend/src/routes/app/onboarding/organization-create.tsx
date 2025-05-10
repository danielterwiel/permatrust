import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { mainMutations, tenantMutations } from '@/api/mutations';
import { useLocalStorage } from '@/hooks/use-local-storage';

import { CreateOrganizationForm } from '@/components/create-organization-form';
import type { createOrganizationFormSchema } from '@/components/create-organization-form';

import type { z } from 'zod';

import { createTenantActorWrapper } from '@/api';
import { Auth } from '@/auth';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarding/onboarding/organization/create',
)({
  beforeLoad: ({ context }) => ({
    authActor: context.actors.auth,
    getTitle: () => 'Create organization',
  }),
  loader: ({ context }) => ({
    authActor: context.authActor,
  }),
  component: CreateOrganization,
});

function CreateOrganization() {
  const [_tenantCanisterId, setTenantCanisterId] = useLocalStorage(
    'tenantCanisterId',
    '',
  );
  const navigate = useNavigate();

  const {
    error: createTenantCanisterError,
    isPending: isCreatingTenantCanister,
    mutate: createTenantCanister,
  } = mainMutations.useCreateTenantCanister();
  const isSubmitting = isCreatingTenantCanister;

  function onSubmit(values: z.infer<typeof createOrganizationFormSchema>) {
    createTenantCanister(
      { company_name: values.name },
      {
        onSuccess: async (tenantCanisterId) => {
          const auth = Auth.getInstance();
          const client = await auth.getClient();

          const tenantCanisterIdStr = tenantCanisterId.toString();
          await createTenantActorWrapper(client, tenantCanisterIdStr);
          setTenantCanisterId(tenantCanisterIdStr.toString());

          navigate({ to: '/onboarding/user/create' });
        },
        onError: (error) => {
          console.error('Error creating tenant canister:', error);
          // Log details for debugging
          if (error.message) {
            console.error('Error message:', error.message);
          }
        },
      },
    );
  }

  return (
    <>
      {createTenantCanisterError && (
        <div>{createTenantCanisterError.message}</div>
      )}
      <CreateOrganizationForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
    </>
  );
}
