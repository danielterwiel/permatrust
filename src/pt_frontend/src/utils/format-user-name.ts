import type { User } from '@/declarations/pt_backend/pt_backend.did.d';

export function formatUserName(user: User): string {
  return `${user.last_name}, ${user.first_name}`;
}
