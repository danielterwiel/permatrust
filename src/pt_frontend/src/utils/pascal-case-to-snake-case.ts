export function pascalCaseToSnakeCase(pascalCaseString: string): string {
  if (!pascalCaseString) {
    return '';
  }

  const snakeCaseString = pascalCaseString
    .replace(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/g, '_')
    .toLowerCase();

  return snakeCaseString;
}
