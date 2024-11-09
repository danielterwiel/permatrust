import { redirect, type ParsedLocation } from '@tanstack/react-router';
import type { RouteContext } from '@/types/routes';
import { DEFAULT_PAGINATION } from '@/consts/pagination';
import { storage } from '@/utils/localStorage';

export async function initializeOrganisationAndRedirect(
  context: RouteContext,
  location: ParsedLocation,
  defaultReturn: {
    getTitle: () => string;
    context: RouteContext;
  },
) {
  const activeOrganisationId = storage.getItem('activeOrganisationId', '');

  const [organisations] = await context.api.call.list_organisations({
    ...DEFAULT_PAGINATION,
    page_size: 1,
  });

  if (!organisations.length && activeOrganisationId) {
    storage.setItem('activeOrganisationId', '');
  }

  if (activeOrganisationId) {
    return defaultReturn;
  }

  if (!organisations.length && location.pathname !== '/organisations/create') {
    throw redirect({ to: '/organisations/create' });
  }
}
