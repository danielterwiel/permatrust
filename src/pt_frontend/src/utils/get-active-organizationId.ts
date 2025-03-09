import { organizationIdSchema } from '@/schemas/entities';

import { storage } from './local-storage';

import type { OrganizationId } from '@/types/entities';

export function getActiveOrganizationId(): OrganizationId {
  const activeOrganizationId = storage.getItem('activeOrganizationId', '');
  if (!activeOrganizationId) {
    throw new Error('No activeOrganizationId found');
  }
  return organizationIdSchema.parse(activeOrganizationId);
}
