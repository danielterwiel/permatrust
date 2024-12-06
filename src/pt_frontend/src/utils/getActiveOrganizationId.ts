import { storage } from './localStorage';

import { toNumberSchema } from '@/schemas/primitives';

export function getActiveOrganizationId(): number {
  const activeOrganizationId = storage.getItem('activeOrganizationId', '');
  if (!activeOrganizationId) {
    throw new Error('No activeOrganizationId found');
  }
  return toNumberSchema.parse(activeOrganizationId);
}
