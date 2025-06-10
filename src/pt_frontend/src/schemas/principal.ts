import { Principal } from '@dfinity/principal';
import { z } from 'zod';

export const principalSchema = z.custom<Principal>(
  (value: unknown) => value instanceof Principal,
  {
    message: 'Expected an instance of Principal',
  },
);
