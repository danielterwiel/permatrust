import { organizationIdSchema } from '@/schemas/entities';

import { storage } from './local-storage';

import type { OrganizationId } from '@/types/entities';

export function getActiveOrganizationId(): OrganizationId {
  const activeOrganizationId = storage.getItem('activeOrganizationId', '');
  return organizationIdSchema.parse(activeOrganizationId);
}
