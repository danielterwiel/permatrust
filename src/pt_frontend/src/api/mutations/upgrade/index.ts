import { createManagementMutations } from './management';

export type UpgradeMutations = ReturnType<typeof createManagementMutations>;

export const upgradeMutations: UpgradeMutations = {} as UpgradeMutations;

export const createUpgradeMutations = () => {
  Object.assign(upgradeMutations, {
    ...createManagementMutations(),
  });

  return upgradeMutations;
};
