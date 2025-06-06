import { createQueryOptions } from '@/utils/create-query-options';

import type { ListLogsInput } from '@/declarations/tenant_canister/tenant_canister.did';

import { api } from '@/api';

export const listLogsOptions = (input: ListLogsInput) =>
  createQueryOptions({
    queryFn: () => api.tenant.list_logs(input),
    queryKey: ['logs', input],
  });

// Additional options for main and upgrade canisters if needed
export const listMainLogsOptions = (input: ListLogsInput) =>
  createQueryOptions({
    queryFn: () => api.main.list_logs(input),
    queryKey: ['main_logs', input],
  });

export const listUpgradeLogsOptions = (input: ListLogsInput) =>
  createQueryOptions({
    queryFn: () => api.upgrade.list_logs(input),
    queryKey: ['upgrade_logs', input],
  });
