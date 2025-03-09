import { z } from 'zod';

import { capitalizeFirstLetter } from '@/utils/capitalize-first-letter';

/**
 * A Zod schema that capitalizes the first letter of a string
 */
export const capitalizeFirstLetterSchema = z.string().transform((val) => {
  if (!val) return val;
  return capitalizeFirstLetter(val);
});

/**
 * A field validator for @tanstack/react-form that capitalizes the first letter
 * of a string field value during onChange events
 */
export const capitalizeFirstLetterValidator = ({
  value,
  fieldApi,
}: {
  fieldApi: { setValue: (value: string) => void };
  value: string;
}) => {
  if (!value) return undefined;

  // Only transform the value if it's different from the capitalized version
  const capitalized = capitalizeFirstLetter(value);
  if (value !== capitalized) {
    // Set the value with the capitalized version
    fieldApi.setValue(capitalized);
  }

  return undefined;
};
