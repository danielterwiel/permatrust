/**
 * Creates a TypeScript representation of a Rust enum as exposed through Candid.
 * These are represented as variant records where each variant is an object
 * with a single key (the variant name) and a null value.
 */
export type VariantRecord<T extends string> = { [K in T]: { [P in K]: null } };

export const createCandidVariant = <T extends string>(
  variantNames: ReadonlyArray<T>,
) => {
  const result = {} as VariantRecord<T>;

  for (const name of variantNames) {
    result[name] = { [name]: null } as { [P in typeof name]: null };
  }

  return result;
};
