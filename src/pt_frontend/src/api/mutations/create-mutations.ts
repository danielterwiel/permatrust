import { createDocumentMutations } from './documents';
import { createOrganizationMutations } from './organizations';
import { createProjectMutations } from './projects';
import { createRevisionMutations } from './revisions';
import { createRoleMutations } from './roles';
import { createUserMutations } from './users';
import { createWorkflowMutations } from './workflows';

type Mutations = ReturnType<typeof createDocumentMutations> &
  ReturnType<typeof createOrganizationMutations> &
  ReturnType<typeof createProjectMutations> &
  ReturnType<typeof createRevisionMutations> &
  ReturnType<typeof createRoleMutations> &
  ReturnType<typeof createUserMutations> &
  ReturnType<typeof createWorkflowMutations>;

export const mutations: Mutations = {} as Mutations;

export const createMutations = () => {
  Object.assign(mutations, {
    ...createDocumentMutations(),
    ...createOrganizationMutations(),
    ...createProjectMutations(),
    ...createRevisionMutations(),
    ...createRoleMutations(),
    ...createUserMutations(),
    ...createWorkflowMutations(),
  });
};
