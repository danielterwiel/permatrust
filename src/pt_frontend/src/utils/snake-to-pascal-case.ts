export function snakeToPascalCase(str?: string): string {
  if (!str) {
    throw new Error('No string passed');
  }
  return str
    .toLowerCase()
    .replace(/(^|_)([a-z])/g, (_, __, letter) => letter.toUpperCase());
}
