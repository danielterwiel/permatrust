import type { User } from '@/declarations/tenant_canister/tenant_canister.did.d';

export function formatUserName(user: User): string {
  return `${user.last_name}, ${user.first_name}`;
}
