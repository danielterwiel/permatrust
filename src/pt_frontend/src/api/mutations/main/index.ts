import { createManagementMutations } from './management';

export type MainMutations = ReturnType<typeof createManagementMutations>;

export const mainMutations: MainMutations = {} as MainMutations;

export const createMainMutations = () => {
  Object.assign(mainMutations, {
    ...createManagementMutations(),
  });

  return mainMutations;
};
