import { toast } from '@/hooks/use-toast';
import { queryOptions } from '@tanstack/react-query';

import { isAppError } from '@/utils/isAppError'; 

import type { ToastProps } from '@/components/ui/toast';
import type { AppError } from '@/declarations/pt_backend/pt_backend.did';
import type { 
  QueryKey,
  UseQueryOptions 
} from '@tanstack/react-query';
import type * as React from 'react';

// Create a type for options with our custom properties
type QueryOptionsWithErrorHandler<
  TQueryFnData, 
  TError, 
  TData, 
  TQueryKey extends QueryKey
> = 
  UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & { 
    _defaultOnError?: (error: unknown) => void;
    errorToast?: false | ToastOptions;
  };

// Toast options that can be passed to control toast appearance
type ToastOptions = Omit<ToastProps, 'id' | 'onOpenChange'> & {
  description?: React.ReactNode;
  title?: React.ReactNode;
};

/**
 * A wrapper around queryOptions that adds default error handling through toasts.
 * Will show a toast with error details unless onError is explicitly provided or errorToast is false.
 */
export function createQueryOptions<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: {
    [key: string]: unknown;
    errorToast?: false | ToastOptions;
    queryFn: () => Promise<TQueryFnData>;
    queryKey: TQueryKey;
  }
) {
  // Create the query options with the main required properties
  const queryOpts = queryOptions({
    queryFn: options.queryFn,
    queryKey: options.queryKey,
  });
  
  // Extract our custom errorToast option if provided
  const errorToastOption = options.errorToast;
  
  // Generate a default error message based on error type
  const getDefaultErrorMessage = (error: unknown): string => {
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
      } else if ('ValidationError' in appError && 
                typeof appError.ValidationError === 'object' && 
                appError.ValidationError !== null &&
                'message' in appError.ValidationError && 
                typeof appError.ValidationError.message === 'string') {
        errorMessage = `Validation error: ${appError.ValidationError.message}`;
      } else {
        errorMessage = 'Application error occurred. Please try again.';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return errorMessage;
  };

  // Our query hooks will use this for error handling
  // This doesn't go into the queryOptions themselves, but will be used by the useQuery hook
  const handleError = (error: unknown) => {
    // Skip toast if explicitly disabled
    if (errorToastOption === false) return;
    
    // Show a custom error toast if provided
    if (errorToastOption && typeof errorToastOption === 'object') {
      toast({
        ...errorToastOption,
        variant: errorToastOption.variant || 'destructive',
      });
      return;
    }
    
    // Otherwise show default error toast
    toast({
      description: getDefaultErrorMessage(error),
      title: 'Error',
      variant: 'destructive',
    });
  };

  // Create a properly typed object to return with our custom properties
  const extendedOpts = queryOpts as QueryOptionsWithErrorHandler<TQueryFnData, TError, TData, TQueryKey>;
  
  // Attach the error handler so it can be used by useQuery
  extendedOpts._defaultOnError = handleError;
  
  // Copy any additional options excluding our custom properties
  const customProps = Object.entries(options).filter(
    ([key]) => key !== 'queryKey' && key !== 'queryFn' && key !== 'errorToast'
  );
  
  // Apply additional properties if any exist
  if (customProps.length > 0) {
    // Create a properly typed dynamic object
    const additionalProps = Object.fromEntries(customProps);
    // Use a safer approach with an intermediate unknown cast
    Object.assign(extendedOpts as unknown as Record<string, unknown>, additionalProps);
  }
  
  return extendedOpts;
}