import { useQuery } from '@tanstack/react-query';
import type * as React from 'react';

import type { ToastProps } from '@/components/ui/toast';

import type {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

// Options that can be passed to the hook
type ExtendedHookOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
> = Partial<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>> & {
  errorToast?: false | ToastOptions;
  onError?: (error: TError) => void;
};

// Options from the createQueryOptions function
type ExtendedQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  _defaultOnError?: (error: unknown) => void;
  errorToast?: false | ToastOptions;
};

// Toast options that can be passed to control toast appearance
type ToastOptions = Omit<ToastProps, 'id' | 'onOpenChange'> & {
  description?: React.ReactNode;
  title?: React.ReactNode;
};

/**
 * Creates a query hook that uses queryOptions from our query definitions
 * with automatic error toast handling.
 */
export function createQueryHook<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  getQueryOptions: () => ExtendedQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  >,
): (
  options?: ExtendedHookOptions<TQueryFnData, TError, TData, TQueryKey>,
) => UseQueryResult<TData, TError> {
  return function useQueryHook(
    options?: ExtendedHookOptions<TQueryFnData, TError, TData, TQueryKey>,
  ) {
    // Get the base query options with the default error handler
    const queryOptions = getQueryOptions();

    // Use our default error handler if one is attached and user didn't override
    const defaultOnError = queryOptions._defaultOnError;

    // Create a filtered version of user options without our custom properties
    // to avoid React Query warnings
    const { errorToast, ...standardOptions } = options || {};

    // Create the final options object for useQuery
    const mergedOptions = { ...queryOptions };

    // Add standard options if provided
    if (Object.keys(standardOptions).length > 0) {
      Object.assign(mergedOptions, standardOptions);
    }

    // Add default error handler if no custom one is provided
    // Give priority to hook options, then fallback to the query options
    const shouldUseDefaultErrorHandler =
      defaultOnError &&
      !standardOptions.onError &&
      errorToast !== false &&
      queryOptions.errorToast !== false;

    if (shouldUseDefaultErrorHandler) {
      // We need to use a type assertion since TypeScript doesn't know about onError
      const enhancedOptions = mergedOptions as unknown as {
        onError: typeof defaultOnError;
      };
      enhancedOptions.onError = defaultOnError;
    }

    // Remove our custom properties before passing to useQuery
    const { _defaultOnError, errorToast: _, ...finalOptions } = mergedOptions;

    return useQuery(
      finalOptions as UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    );
  };
}
