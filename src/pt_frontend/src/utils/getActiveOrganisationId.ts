import { storage } from './localStorage';

export function getActiveOrganisationId() {
  const activeOrganisationId = storage.getItem('activeOrganisationId', '');
  if (!activeOrganisationId) {
    throw new Error('No activeOrganisationId found');
  }
  return BigInt(activeOrganisationId);
}
