export async function getSingleApiResult<T, TPagination extends Array<unknown>>(
  apiCall: () => Promise<[Array<T>, ...TPagination]>,
  errorMessage = 'Item not found',
): Promise<T> {
  const [items] = await apiCall();
  if (items.length !== 1) {
    throw new Error(errorMessage);
  }
  return items[0];
}
