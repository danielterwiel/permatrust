import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry failed queries once
      staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
      queryKeyHashFn: (queryKey) => {
        return JSON.stringify(queryKey, (_key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        );
      },
    },
  },
});
