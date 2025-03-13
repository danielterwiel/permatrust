import { z } from 'zod';

/**
 * Creates a validation function for a Zod schema field
 *
 * @param schema The Zod schema object
 * @param fieldName The field name in the schema
 * @returns A validation function for use with @tanstack/react-form
 */
export function createZodFieldValidator<
  TSchema extends z.ZodObject<z.ZodRawShape>,
  TFieldName extends keyof z.infer<TSchema>,
>(schema: TSchema, fieldName: TFieldName) {
  return ({ value }: { value: unknown }) => {
    try {
      // Get the specific field schema and validate
      const fieldSchema = schema.shape[fieldName as string];
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
