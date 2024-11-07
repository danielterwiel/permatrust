import { redirect, type ParsedLocation } from '@tanstack/react-router';
import type { RouteContext } from '@/types/routes';

export async function initializeUserAndRedirect(
  context: RouteContext,
  location: ParsedLocation,
) {
  const redirectWhenUserNotFound = () => {
    if (location.pathname !== '/users/create') {
      throw redirect({ to: '/users/create' });
    }
  };
  const user = await context.api.call.get_user({
    onErr: redirectWhenUserNotFound,
  });
  return user;
}
