import { redirect, type ParsedLocation } from '@tanstack/react-router';
import type { RouteContext } from '@/types/routes';

export async function initializeAuthAndRedirect(
  context: RouteContext,
  location: ParsedLocation,
) {
  await context.auth.initializeAuth();
  if (!context.auth.isAuthenticated) {
    throw redirect({
      to: '/',
      search: {
        redirect: location.href,
      },
    });
  }
}
