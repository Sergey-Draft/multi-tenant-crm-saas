"use client";

import { useMemo, useState } from "react";
import { RowSelectionState, Table as ReactTable } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnToggle } from "@/components/ui/data-table-column-toggle";
import { Input } from "@/components/ui/input";
import type { ImportJobRow } from "../api/import-jobs";
import { createImportJobsColumns } from "./import-jobs-columns";

export function ImportJobsTable({ data, isLoading }: { data: ImportJobRow[]; isLoading?: boolean }) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filter, setFilter] = useState("");

  const columns = useMemo(() => createImportJobsColumns(), []);

  const filteredData = useMemo(() => {
    if (!filter.trim()) return data;
    const q = filter.toLowerCase();
    return data.filter((job) => {
      return (
        String(job.id).toLowerCase().includes(q) ||
        job.name.toLowerCase().includes(q) ||
        job.state.toLowerCase().includes(q)
      );
    });
  }, [data, filter]);

  const toolbar = (table: ReactTable<ImportJobRow>) => (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Поиск по id, названию, статусу..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-xs"
      />
      <div className="ml-auto flex items-center gap-2">
        <DataTableColumnToggle table={table} />
      </div>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      isLoading={isLoading}
      skeletonRows={6}
      toolbar={toolbar}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    />
  );
}
