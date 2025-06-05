// Types for the result object with discriminated union
type Success<TData> = {
  data: TData;
  error: null;
};

type Failure<TError> = {
  data: null;
  error: TError;
};

type Result<TData, TError = Error> = Success<TData> | Failure<TError>;

// Main wrapper function
export async function tryCatch<TData, TError = Error>(
  promise: Promise<TData>,
): Promise<Result<TData, TError>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as TError };
  }
}
