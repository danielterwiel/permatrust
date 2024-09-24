import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
	useReactTable,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	type ColumnDef,
	type HeaderGroup,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import useDebounce from "@/hooks/useDebounce";
import type { Document } from "@/declarations/pt_backend/pt_backend.did";

interface TableFiltersProps {
	headerGroups: HeaderGroup<TableDataItem>[];
	headers: string[];
	columnFilters: Record<string, string>;
	setColumnFilters: React.Dispatch<
		React.SetStateAction<Record<string, string>>
	>;
	camelCaseToHumanReadable: (input: string) => string;
	columnWidths: Record<string, number>;
}

const TableFilters: React.FC<TableFiltersProps> = ({
	headers,
	columnFilters,
	setColumnFilters,
	columnWidths,
}) => {
	const handleInputChange = useCallback(
		(header: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setColumnFilters((prev) => ({
				...prev,
				[header]: e.target.value,
			}));
		},
		[setColumnFilters],
	);

	return (
		<div className="flex">
			{headers.map((header) => (
				<div key={header}>
					<Input
						type="text"
						value={columnFilters[header] || ""}
						onChange={handleInputChange(header)}
						style={{ width: `${columnWidths[header] || 150}px` }}
					/>
				</div>
			))}
		</div>
	);
};

export type TableDataItem = Document;
export type TableData = TableDataItem[];

interface TableProps {
	tableData?: TableData;
}

export const DataTable: React.FC<TableProps> = ({ tableData = [] }) => {
	const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
		{},
	);
	const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

	const debouncedColumnFilters = useDebounce(columnFilters, 500); // Use the debounced value

	const camelCaseToHumanReadable = useCallback((input: string) => {
		const spaced = input.replace(
			/([a-z])([A-Z])|([A-Z]+)([A-Z][a-z])/g,
			"$1$3 $2$4",
		);
		const capitalized = spaced.charAt(0).toUpperCase() + spaced.slice(1);
		return capitalized;
	}, []);

	if (tableData === undefined) {
		return <p>No data fetched yet</p>;
	}
	if (tableData.length === 0) {
		return <p>No data available</p>;
	}
	if (!Array.isArray(tableData)) {
		return <p>Invalid data</p>;
	}

	const [firstRow] = tableData;
	const headers = useMemo(() => Object.keys(firstRow ?? {}), [firstRow]);

	const columns: ColumnDef<TableDataItem>[] = useMemo(
		() =>
			headers.map((header: string) => ({
				accessorKey: header,
				header: camelCaseToHumanReadable(header),
			})),
		[headers, camelCaseToHumanReadable],
	);

	const filteredData = useMemo(
		() =>
			tableData.filter((row) =>
				headers.every((header) =>
					(row[header as keyof TableDataItem] as unknown as string)
						?.toString()
						.toLowerCase()
						.includes(debouncedColumnFilters[header]?.toLowerCase() || ""),
				),
			),
		[tableData, headers, debouncedColumnFilters],
	);

	const table = useReactTable({
		data: filteredData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	const headerRefs = useRef<(HTMLTableCellElement | null)[]>([]);

	useEffect(() => {
		const newColumnWidths: Record<string, number> = {};
		headerRefs.current.forEach((header, index) => {
			if (header) {
				const headerId = headers[index];
				newColumnWidths[headerId ?? 0] = header.offsetWidth;
			}
		});
		setColumnWidths(newColumnWidths);
	}, [headers]);

	return (
		<div className="grid">
			<div className="overflow-auto py-2">
				<TableFilters
					headerGroups={table.getHeaderGroups()}
					headers={headers}
					columnFilters={columnFilters}
					setColumnFilters={setColumnFilters}
					camelCaseToHumanReadable={camelCaseToHumanReadable}
					columnWidths={columnWidths}
				/>
				<Table className="font-mono">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header, index) => (
									<TableHead
										key={header.id}
										className="text-nowrap"
										ref={(el) => {
											headerRefs.current[index] = el;
										}}
									>
										{header.column.columnDef.header?.toString()}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id} className="whitespace-nowrap">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};
