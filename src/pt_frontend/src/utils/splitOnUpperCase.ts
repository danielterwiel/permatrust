export const splitOnUpperCase = (str: string): string => {
  return str.replace(/([A-Z])/g, ' $1').trim();
};
