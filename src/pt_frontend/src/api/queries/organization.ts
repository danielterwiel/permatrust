import { createQueryOptions } from '@/utils/create-query-options';

import { api } from '@/api';

export const getOrganizationOptions = () => {
  return createQueryOptions({
    queryFn: api.tenant.get_organization,
    queryKey: ['organization'],
  });
};
