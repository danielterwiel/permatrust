import type { TableDataItem } from "@/components/DataTable";

export const stringifyBigIntObjects = (obj: TableDataItem) => {
	const replacer = (_key: string, value: unknown) => {
		if (typeof value === "bigint") {
			return value.toString();
		}
		return value;
	};
	return JSON.stringify(obj, replacer, 2);
};
