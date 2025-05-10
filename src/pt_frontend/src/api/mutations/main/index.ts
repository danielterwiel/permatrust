import { createTenantMutations } from './tenants';

export type MainMutations = ReturnType<typeof createTenantMutations>;

export const mainMutations: MainMutations = {} as MainMutations;

export const createMainMutations = () => {
  Object.assign(mainMutations, {
    ...createTenantMutations(),
  });

  return mainMutations;
};
