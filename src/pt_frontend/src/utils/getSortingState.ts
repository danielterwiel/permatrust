import type { SortingState } from '@tanstack/react-table';

export const getSortingState = (
  updater: ((prev: SortingState) => SortingState) | SortingState,
): SortingState => {
  return typeof updater === 'function'
    ? updater([
        {
          desc: true,
          id: 'title', // TODO: pass current Sort
        },
      ])
    : updater;
};
