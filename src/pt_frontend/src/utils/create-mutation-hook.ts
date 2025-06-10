
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type * as React from 'react';

import { toast } from '@/hooks/use-toast';
import { isAppError } from '@/utils/is-app-error';

import type { ToastProps } from '@/components/ui/toast';

import type { AppError } from '@/declarations/tenant_canister/tenant_canister.did';
import type {
  InvalidateQueryFilters,
  MutationOptions,
} from '@tanstack/react-query';

type ApiFunction<TVariables, TData> = (variables: TVariables) => Promise<TData>;

// Extended mutation options with our custom toast controls
type ExtendedMutationOptions<TData, TError, TVariables> = Omit<
  MutationOptions<TData, TError, TVariables>,
  'mutationFn'
> & {
  /**
   * Custom toast to show on error. When provided, replaces the default error toast.
   * Set to false to disable the error toast entirely.
   */
  errorToast?: false | ToastOptions;

  /**
   * Custom toast to show on success. When provided, replaces the default success toast.
   * Set to false to disable the success toast entirely.
   */
  successToast?: false | ToastOptions;
};

type InvalidationScheme<TVariables> =
  | ((variables: TVariables) => InvalidateQueryFilters | MultiQueryInvalidation)
  | Array<string>;

type MultiQueryInvalidation = {
  queries: Array<InvalidateQueryFilters>;
};

// Toast options that can be passed to control toast appearance
type ToastOptions = Omit<ToastProps, 'id' | 'onOpenChange'> & {
  description?: React.ReactNode;
  title?: React.ReactNode;
};

/**
 * Creates a mutation hook that uses a method from the API
 * Automatically infers input and output types from the provided API method
 */
export function createMutationHook<TVariables, TData>(
  apiMethod: ApiFunction<TVariables, TData>,
  invalidationScheme: InvalidationScheme<TVariables> = [],
  options?: ExtendedMutationOptions<TData, Error, TVariables>,
) {
  return function useMutationHook() {
    const queryClient = useQueryClient();

    const mutationFn = (variables: TVariables): Promise<TData> => {
      return apiMethod(variables);
    };

    // Generate a default error message based on error type
    const getDefaultErrorMessage = (error: Error): string => {
      let errorMessage = 'An unexpected error occurred';

      if (isAppError(error)) {
        // Handle AppError with appropriate message based on error type
        const appError = error as AppError;
        if ('Internal' in appError) {
          errorMessage = 'Internal server error. Please try again later.';
        } else if ('NotFound' in appError) {
          errorMessage = 'Resource not found.';
        } else if ('Unauthorized' in appError) {
          errorMessage = 'Unauthorized. Please login and try again.';
        } else if ('Forbidden' in appError) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (
          'ValidationError' in appError &&
          typeof appError.ValidationError === 'object' &&
          'message' in appError.ValidationError
        ) {
          errorMessage = `Validation error: ${appError.ValidationError}`;
        } else {
          console.log('error', error);
          errorMessage = 'Application error occurred. Please try again.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return errorMessage;
    };

    const defaultOnError = (error: Error) => {
      if (options?.errorToast === false) return;

      if (options?.errorToast) {
        // TODO: move to some part of @tanstack/react-router where there's some
        // feature to handle errors globally (forgot the name)
        toast({
          ...options.errorToast,
          variant: options.errorToast.variant || 'destructive',
        });
        return;
      }

      toast({
        description: getDefaultErrorMessage(error),
        title: 'Error',
        variant: 'destructive',
      });
    };

    const { errorToast, successToast, ...standardOptions } = options || {};

    const mutation = useMutation({
      mutationFn,
      onError: (error, variables, context) => {
        // First call custom error handler if provided
        if (standardOptions.onError) {
          standardOptions.onError(error, variables, context);
        } else {
          // Otherwise use default error handler that shows a toast
          defaultOnError(error);
        }
      },
      onSuccess: (data, variables, context) => {
        // Handle cache invalidation
        if (Array.isArray(invalidationScheme)) {
          for (const key of invalidationScheme) {
            queryClient.invalidateQueries({ queryKey: [key] });
          }
        } else if (typeof invalidationScheme === 'function') {
          const invalidationResult = invalidationScheme(variables);

          if ('queries' in invalidationResult) {
            for (const query of invalidationResult.queries) {
              queryClient.invalidateQueries(query);
            }
          } else {
            queryClient.invalidateQueries(invalidationResult);
          }
        }

        // Show success toast if configured
        if (successToast !== false) {
          if (successToast) {
            toast({
              ...successToast,
              variant: successToast.variant || 'default',
            });
          }
        }

        // Call custom onSuccess if provided in options
        if (standardOptions.onSuccess) {
          standardOptions.onSuccess(data, variables, context);
        }
      },
      ...standardOptions,
    });

    const mutate = async (variables: TVariables): Promise<TData> => {
      return new Promise((resolve, reject) => {
        mutation.mutate(variables, {
          onSuccess: (data) => {
            resolve(data);
          },
          onError: (error) => {
            reject(error);
          },
        });
      });
    };

    return {
      ...mutation,
      mutate,
    };
  };
}
