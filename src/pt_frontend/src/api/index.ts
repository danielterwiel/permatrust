import { api as canisterApi } from './api';

const api = new Proxy(canisterApi, {
  get(target, prop, receiver) {
    if (prop in target) {
      return Reflect.get(target, prop, receiver);
    }

    if (target.tenant && typeof prop === 'string' && prop in target.tenant) {
      return target.tenant[prop as keyof typeof target.tenant];
    }

    if (target.main && typeof prop === 'string' && prop in target.main) {
      return target.main[prop as keyof typeof target.main];
    }

    return undefined;
  },
});

export {
  api,
  createMainActorWrapper,
  createTenantActorWrapper,
} from './api';

