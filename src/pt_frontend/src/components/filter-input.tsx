import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

import { Input } from '@/components/input';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { extractFilterFieldName } from '@/utils/pagination';

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
  const fieldName = extractFilterFieldName(filterCriteria);

  const form = useForm({
    defaultValues: {
      [fieldName]: filterCriteria.value,
    },
    onSubmit: async () => {
      // Form submission is prevented
    },
  });

  // Function to update filter criteria with new value
  const updateFilter = (value: string) => {
    onChange?.({
      entity: filterCriteria.entity,
      field: filterCriteria.field,
      operator: filterCriteria.operator,
      value: value,
    });
  };

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
          <FormItem className="relative">
            <FormLabel className="sr-only" field={field}>
              {placeholder}
            </FormLabel>
            <FormControl field={field}>
              <Input
                {...inputProps}
                aria-label={placeholder}
                className="h-8 w-[250px] lg:w-[350px] text-sm"
                clearTooltip="Clear filter"
                name={fieldName}
                onChange={(value) => {
                  updateFilter(value);
                }}
                onChangeImmediate={(value) => {
                  field.handleChange(value);
                }}
                placeholder={placeholder}
                type="text"
                value={field.state.value}
                withClearButton={true}
              />
            </FormControl>
            <FormMessage field={field} />
          </FormItem>
        )}
      </form.Field>
    </form>
  );
};
