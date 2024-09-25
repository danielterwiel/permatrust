import type { TableData } from "@/components/DataTable";

export const stringifyBigIntObject = (obj: TableData | undefined) => {
  if (!obj) {
    return "[]";
  }

  const replacer = (_key: string, value: unknown) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };

  return JSON.stringify(obj, replacer, 2);
};


