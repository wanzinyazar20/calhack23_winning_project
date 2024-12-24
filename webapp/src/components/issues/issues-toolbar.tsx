import { PlusIcon, XIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { DataTableToolbarProps } from "@/interfaces/data-table-types"
import { SearchFilterCombobox } from "../ui/search-filter-combobox"
import { statusFilterOptions } from "@/interfaces/issue-types"
import Link from "next/link"

export function IssuesToolbar<Issue>({ table }: DataTableToolbarProps<Issue>) {
  const isFiltered =
    table &&
    table.getPreFilteredRowModel().rows.length >
      table.getFilteredRowModel().rows.length

  // get all unique tags in table
  const tags = table
    .getPreFilteredRowModel()
    .rows.map((row) => row.getValue("tags") as string[])
    .flat()
    .map((tag) => {
      return { value: tag, label: tag }
    })

  return (
    <div className="flex justify-between items-center min-w-full flex-1">
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Filter issues..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            table.getColumn("name")?.setFilterValue(event.target.value)
          }}
          className="w-80 flex-1"
        />
        {table.getColumn("status") && (
          <SearchFilterCombobox
            column={table.getColumn("status")}
            title="Status"
            options={statusFilterOptions}
          />
        )}
        {table.getColumn("status") && (
          <SearchFilterCombobox
            column={table.getColumn("tags")}
            title="Tags"
            options={tags}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <XIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <Link href={window.location.pathname + "/new"}>
        <Button className="w-40 flex items-center">
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Issue
        </Button>
      </Link>
    </div>
  )
}
