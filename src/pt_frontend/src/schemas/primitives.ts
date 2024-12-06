import { z } from 'zod';

export const toNumberSchema = z.coerce.number();
export const toBigIntSchema = z.coerce.bigint();
