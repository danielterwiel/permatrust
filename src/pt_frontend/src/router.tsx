import { rootContext } from '@/context/root';
import { routeTree } from '@/routeTree.gen';
import { createRouter } from '@tanstack/react-router';

import { parseSearch } from '@/utils/parse-search';
import { stringifySearch } from '@/utils/stringify-search';

export const router = createRouter({
  context: rootContext,
  defaultPreload: 'intent',
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  routeTree,
  scrollRestoration: true,
  parseSearch,
  stringifySearch,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
