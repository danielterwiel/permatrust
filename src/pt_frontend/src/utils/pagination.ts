import {
  filterCriteriaSchema,
  paginationInputSchema,
  sortCriteriaSchema,
} from '@/schemas/pagination';

import { entity } from '@/consts/entities';
import { filterField, filterOperator, sortOrder } from '@/consts/pagination';

import type {
  FilterCriteria as ApiFilterCriteria,
  PaginationInput,
} from '@/declarations/pt_backend/pt_backend.did';
import type { EntityName } from '@/types/entities';
import type {
  FilterCriteria,
  FilterCriteriaInput,
  FilterField,
  FilterFieldName,
  FilterOperatorName,
  SortCriteria,
  SortCriteriaInput,
  SortOrderName,
} from '@/types/pagination';

/**
 * Creates a properly typed backend entity variant
 */
const createEntityVariant = (entityName: EntityName) => {
  return entity[entityName];
};

/**
 * Creates a properly typed backend filter field from entity and field names
 */
const createFilterField = (
  entityName: EntityName,
  fieldName: FilterFieldName,
): FilterField => {
  // Check if field exists for this entity
  const entityFields = filterField[entityName];

  // We need to check if this specific field belongs to this entity
  if (!(fieldName in entityFields)) {
    throw new Error(
      `Field '${fieldName}' does not belong to entity '${entityName}'`,
    );
  }

  // Get the field value
  const fieldValue = entityFields[fieldName as keyof typeof entityFields];

  // Create the expected structure - field needs to be nested under entity
  return { [entityName]: fieldValue } as unknown as FilterField;
};

/**
 * Creates a properly typed filter operator variant
 */
const createOperatorVariant = (operatorName: FilterOperatorName) => {
  return filterOperator[operatorName];
};

/**
 * Creates a properly typed sort order variant
 */
const createSortOrderVariant = (orderName: SortOrderName) => {
  return sortOrder[orderName];
};

/**
 * Creates a filter criteria object ready for API use
 */
export const createFilter = ({
  entity: entityName,
  field: fieldName,
  operator: operatorName,
  value,
}: FilterCriteriaInput): FilterCriteria => {
  // Create the filter criteria with proper backend types
  const filterCriteria = {
    entity: createEntityVariant(entityName),
    field: createFilterField(entityName, fieldName),
    operator: createOperatorVariant(operatorName),
    value,
  };

  try {
    // Validate using the schema
    return filterCriteriaSchema.parse(filterCriteria);
  } catch (error) {
    throw new Error(`Invalid filter criteria: ${JSON.stringify(error)}`);
  }
};

/**
 * Creates a sort criteria object ready for API use
 */
export const createSort = ({
  entity: entityName,
  field: fieldName,
  order: orderName,
}: SortCriteriaInput): SortCriteria => {
  // Create the sort criteria with proper backend types
  const sortCriteria = {
    field: createFilterField(entityName, fieldName),
    order: createSortOrderVariant(orderName),
  };

  try {
    // Validate using the schema
    return sortCriteriaSchema.parse(sortCriteria);
  } catch (error) {
    throw new Error(`Invalid sort criteria: ${JSON.stringify(error)}`);
  }
};

/**
 * Extracts the field name from a FilterCriteria object
 *
 * @param filterCriteria The filter criteria to extract the field name from
 * @returns The field name as a string that can be used as a key
 */
export function extractFilterFieldName(
  filterCriteria: ApiFilterCriteria,
): string {
  // Use filterCriteriaSchema to validate and transform the input
  const result = filterCriteriaSchema.safeParse(filterCriteria);

  if (!result.success) {
    throw new Error(`Invalid filter criteria: ${result.error.message}`);
  }

  const validated = result.data;

  // Get entity name (first and only key in the entity object)
  const entityKey = Object.keys(validated.entity)[0];
  if (!entityKey) {
    throw new Error('Invalid entity in filter criteria');
  }

  // Get field object for this entity
  const fieldObj = validated.field[entityKey as keyof typeof validated.field];

  // Get field name (first and only key in the field object)
  const fieldName = Object.keys(fieldObj)[0];
  if (!fieldName) {
    throw new Error('Invalid field in filter criteria');
  }

  return fieldName;
}

/**
 * Checks if a filter criteria matches the default empty filter criteria for an entity
 *
 * @param filterCriteria The filter criteria to check
 * @param defaultFilterValue The default filter value to compare against
 * @returns True if the filter criteria matches the default (empty) state
 */
export function isDefaultFilter(
  filterCriteria: ApiFilterCriteria | undefined,
  defaultFilterValue = '',
): boolean {
  if (!filterCriteria) {
    return false;
  }
  return filterCriteria.value === defaultFilterValue;
}

/**
 * Processes and validates pagination input to ensure it meets backend requirements
 * This replaces the old buildPaginationInput utility
 *
 * @param paginationInput The pagination input to process
 * @returns A validated PaginationInput object
 */
export function processPaginationInput(
  paginationInput: Partial<PaginationInput>,
): PaginationInput {
  try {
    // Validate the input using our schema
    return paginationInputSchema.parse(paginationInput);
  } catch (error) {
    throw new Error(`Invalid pagination input: ${JSON.stringify(error)}`);
  }
}
