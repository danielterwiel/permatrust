import { createRouter } from '@tanstack/react-router';

import { rootContext } from './context/root';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
  context: rootContext,

  defaultPreload: 'intent',
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  routeTree,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
