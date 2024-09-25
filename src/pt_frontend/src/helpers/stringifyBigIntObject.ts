import type { TableData } from "@/components/DataTable";

export const stringifyBigIntObject = <T extends TableData | undefined>(obj: T): T extends undefined ? "[]" : string => {
  if (!obj) {
    return "[]" as T extends undefined ? "[]" : string;
  }

  const replacer = (_key: string, value: unknown) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };

  return JSON.stringify(obj, replacer, 2) as T extends undefined ? "[]" : string;
};
