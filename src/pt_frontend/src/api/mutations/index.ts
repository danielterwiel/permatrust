import { createMainMutations, mainMutations } from './main';
import { createTenantMutations, tenantMutations } from './tenant';
import { createUpgradeMutations, upgradeMutations } from './upgrade';

export { createMainMutations, mainMutations } from './main';
export { createTenantMutations, tenantMutations } from './tenant';
export { createUpgradeMutations, upgradeMutations } from './upgrade';

// Namespaced mutations object
export type Mutations = {
  main: ReturnType<typeof createMainMutations>;
  tenant: ReturnType<typeof createTenantMutations>;
  upgrade: ReturnType<typeof createUpgradeMutations>;
};

export const mutations: Mutations = {
  main: mainMutations,
  tenant: tenantMutations,
  upgrade: upgradeMutations,
};
