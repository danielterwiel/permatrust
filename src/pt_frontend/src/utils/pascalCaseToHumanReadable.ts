export function pascalToHumanReadable(pascalStr: string): string {
  // Add space before capital letters and convert to lowercase
  const spaced = pascalStr
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase();

  // Capitalize the first letter
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
