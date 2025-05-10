import { storage } from './local-storage';

export function getTenantId(): string {
  return storage.getItem('tenantId', '');
}
