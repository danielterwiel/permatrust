export function buildEnum<T extends string>(key: T): Record<T, null> {
  return {
    [key]: null,
  } as Record<T, null>;
}
