"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ScrapedDataItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { format, parseISO } from 'date-fns';

export const columns: ColumnDef<ScrapedDataItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Item ID" />
    ),
    cell: ({ row }) => <div className="w-[80px] truncate">{row.getValue("id")}</div>,
    enableSorting: false, // Usually IDs are not sorted by user
  },
  {
    accessorKey: "dataSourceName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[150px]">{row.getValue("dataSourceName") || row.original.dataSourceId}</div>
    ),
  },
  {
    accessorKey: "rawData",
    header: "Raw Data",
    cell: ({ row }) => {
      const rawData = row.getValue("rawData") as string;
      try {
        const parsed = JSON.parse(rawData);
        // Show a snippet or key field
        const displayValue = parsed.title || parsed.API || Object.values(parsed)[0]?.toString() || "View Details";
        return <div className="max-w-[300px] truncate" title={displayValue.length > 40 ? displayValue : ''}>{displayValue.substring(0,40)}{displayValue.length > 40 ? '...' : ''}</div>;
      } catch {
        return <div className="max-w-[300px] truncate" title={rawData.length > 40 ? rawData : ''}>{rawData.substring(0,40)}{rawData.length > 40 ? '...' : ''}</div>;
      }
    },
  },
  {
    accessorKey: "isEnriched",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Enriched" />
    ),
    cell: ({ row }) => {
      const isEnriched = row.getValue("isEnriched");
      return <Badge variant={isEnriched ? "default" : "secondary"}>{isEnriched ? "Yes" : "No"}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) ? "Yes" : "No");
    },
  },
  {
    accessorKey: "sentiment",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sentiment" />
    ),
    cell: ({ row }) => {
        const sentiment: string | undefined = row.getValue("sentiment");
        if (!sentiment) return <span className="text-muted-foreground">-</span>;
        let variant: "default" | "secondary" | "destructive" = "secondary";
        if (sentiment === 'positive') variant = 'default'; // 'default' for green-ish with default theme
        if (sentiment === 'negative') variant = 'destructive';
        return <Badge variant={variant} className="capitalize">{sentiment}</Badge>;
    },
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: "lastUpdatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => (
      format(parseISO(row.getValue("lastUpdatedAt")), "MMM d, yyyy HH:mm")
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
