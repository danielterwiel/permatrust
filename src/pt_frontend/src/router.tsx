import { createRouter } from '@tanstack/react-router';
import { rootContext } from './context/root';

import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,

  defaultPreload: 'intent',
  defaultStaleTime: 5000,
  context: rootContext,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
