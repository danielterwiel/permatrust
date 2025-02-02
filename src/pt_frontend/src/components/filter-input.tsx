import { useForm } from '@tanstack/react-form';
import { useEffect } from 'react';
import { z } from 'zod';

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { filterCriteriaToFilterFieldName } from '@/utils/filterCriteriaToFilterFieldName';

import { filterCriteriaSchema } from '@/schemas/pagination';

import type { FilterCriteria } from '@/declarations/pt_backend/pt_backend.did';
import type { ComponentProps } from 'react';

type FilterProps = Omit<ComponentProps<typeof Input>, 'onChange'> & {
  filterCriteria: FilterCriteria;
  onChange?: (value: FilterCriteria) => void;
  placeholder: string;
};

export const FilterInput = ({
  filterCriteria,
  onChange,
  placeholder,
  ...inputProps
}: FilterProps) => {
  const fieldName = filterCriteriaToFilterFieldName(
    filterCriteria,
  ) as keyof FilterCriteria;

  const form = useForm({
    defaultValues: {
      [fieldName]: filterCriteria.value,
    },
    onSubmit: async () => {
      // Form submission is prevented
    },
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const value = form.state.values[fieldName];
      if (value !== '') {
        onChange?.({
          entity: filterCriteria.entity,
          field: filterCriteria.field,
          operator: filterCriteria.operator,
          value: String(value),
        });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [form.state.values, fieldName, filterCriteria, onChange]);

  return (
    <form
      className="flex items-center"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name={fieldName}
        validators={{
          onSubmit: ({ value }) => {
            try {
              filterCriteriaSchema.parse({
                ...filterCriteria,
                value: value,
              });
              return undefined;
            } catch (error) {
              if (error instanceof z.ZodError) {
                return error.errors[0]?.message;
              }
              return 'Invalid input';
            }
          },
        }}
      >
        {(field) => (
          <FormItem>
            <FormLabel className="sr-only" field={field}>
              {placeholder}
            </FormLabel>
            <FormControl field={field}>
              <Input
                {...inputProps}
                aria-label={placeholder}
                className="h-8 w-[250px] lg:w-[350px] text-sm"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={placeholder}
                type="text"
                value={field.state.value}
              />
            </FormControl>
            <FormMessage field={field} />
          </FormItem>
        )}
      </form.Field>
    </form>
  );
};
