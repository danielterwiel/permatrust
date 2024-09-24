import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { pt_backend } from "@/declarations/pt_backend";
import {
	DataTable,
	type TableData,
	type TableDataItem,
} from "@/components/DataTable";
import { Loading } from "@/components/Loading";

export const Route = createFileRoute(
	"/_auth/_layout/projects/_projects/projects/",
)({
	component: Projects,
});

function Projects() {
	const [response, setResponse] = useState<TableData>([]);
	const [loading, setLoading] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		if (loading === undefined) {
			getProjects();
		}
	}, [loading]);

	const stringifyBigIntObjects = (obj: TableData | undefined) => {
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

	const getProjects = async () => {
		setLoading(true);
		const response = await pt_backend.list_documents();
		console.log("response", response);
		const parsedResponse = JSON.parse(stringifyBigIntObjects(response));
		setResponse(parsedResponse);
		setLoading(false);
	};

	return (
		<>
			{loading ? <Loading /> : <></>}
			{!loading ? <DataTable tableData={response} /> : <></>}
		</>
	);
}
