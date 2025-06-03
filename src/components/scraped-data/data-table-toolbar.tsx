"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter" // Assuming this will be created


interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

// Example options for faceted filters
// In a real app, these would be dynamically generated or predefined based on data
const enrichmentStatusOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
]
const sentimentOptions = [
  { label: "Positive", value: "positive" },
  { label: "Negative", value: "negative" },
  { label: "Neutral", value: "neutral" },
]


export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter by source name..."
          value={(table.getColumn("dataSourceName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("dataSourceName")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
         {table.getColumn("isEnriched") && (
          <DataTableFacetedFilter
            column={table.getColumn("isEnriched")}
            title="Enriched"
            options={enrichmentStatusOptions}
          />
        )}
        {table.getColumn("sentiment") && (
          <DataTableFacetedFilter
            column={table.getColumn("sentiment")}
            title="Sentiment"
            options={sentimentOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
