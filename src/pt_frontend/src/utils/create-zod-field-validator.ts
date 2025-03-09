import { z } from 'zod';

/**
 * Creates a validation function for a Zod schema field
 *
 * @param schema The Zod schema object
 * @param fieldName The field name in the schema
 * @returns A validation function for use with @tanstack/react-form
 */
export function createZodFieldValidator<
  T extends z.ZodObject<z.ZodRawShape>,
  K extends keyof z.infer<T>,
>(schema: T, fieldName: K) {
  return ({ value }: { value: unknown }) => {
    try {
      // Get the specific field schema and validate
      const fieldSchema = schema.shape[fieldName as string] as z.ZodTypeAny;
      fieldSchema.parse(value);
      return undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message;
      }
      return 'Invalid input';
    }
  };
}
