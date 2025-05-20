import { createDocumentMutations } from './documents';
import { createInviteMutations } from './invites';
import { createOrganizationMutations } from './organizations';
import { createProjectMutations } from './projects';
import { createRevisionMutations } from './revisions';
import { createRoleMutations } from './roles';
import { createUserMutations } from './users';
import { createWorkflowMutations } from './workflows';

// All mutations from the tenant canister
export type TenantMutations = ReturnType<typeof createDocumentMutations> &
  ReturnType<typeof createDocumentMutations> &
  ReturnType<typeof createInviteMutations> &
  ReturnType<typeof createOrganizationMutations> &
  ReturnType<typeof createProjectMutations> &
  ReturnType<typeof createRevisionMutations> &
  ReturnType<typeof createRoleMutations> &
  ReturnType<typeof createUserMutations> &
  ReturnType<typeof createWorkflowMutations>;

// Export an empty object that will be populated
export const tenantMutations: TenantMutations = {} as TenantMutations;

// Create and register all tenant canister mutations
export const createTenantMutations = () => {
  Object.assign(tenantMutations, {
    ...createDocumentMutations(),
    ...createInviteMutations(),
    ...createOrganizationMutations(),
    ...createProjectMutations(),
    ...createRevisionMutations(),
    ...createRoleMutations(),
    ...createUserMutations(),
    ...createWorkflowMutations(),
  });

  return tenantMutations;
};
