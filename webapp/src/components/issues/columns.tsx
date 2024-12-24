"use client"

import { cn } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { BugIcon, CheckIcon, ThumbsDownIcon, ThumbsUpIcon, TrashIcon } from "lucide-react"
import { DataTableColumnHeader } from "../ui/data-table-column-header"
import { Issue, IssueStatus } from "@prisma/client"
import { trpc } from "@/lib/trpc"
import { IssueRowActions } from "./issue-row-actions"
import { SmallSpinner } from "../ui/small-spinner"

export const columns: ColumnDef<Issue>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    filterFn: (row, id, filterValue) => {
      // check if the row has any tags that match the filter value
      if (!filterValue) return true
      return (filterValue as string[]).some((tag) => {
        return (row.original.tags as string[]).includes(tag)
      })
    },
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          {(row.getValue("tags") as []).map((tag, ix) => (
            <div
              key={`${tag}-${ix}-${row.index}`}
              className="text-center py-1 px-5 rounded-full bg-slate-800"
            >
              {tag}
            </div>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    filterFn: (row, id, filterValue) => {
      if (!filterValue) return true
      return (filterValue as string[]).includes(row.original.status)
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const v = row.getValue("status") as string
      return (
        <div
          className={cn(
            "text-center py-1 w-24 text-xs",
            "flex items-center justify-start gap-2 px-3"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center",
              v === IssueStatus.Open && "bg-red-400",
              v === IssueStatus.Closed && "bg-emerald-600"
            )}
          >
            {v === IssueStatus.Closed && (
              <CheckIcon className="text-white h-4 w-5" />
            )}
            {v === IssueStatus.Open && (
              <BugIcon className="text-white h-4 w-5" />
            )}
          </div>
          {v.toUpperCase()}
        </div>
      )
    },
  },
  {
    accessorKey: "upvotes",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Upvotes"
        className="justify-end "
      />
    ),
    cell: ({ row }) => {
      const upvoteMutation = trpc.issues.upvote.useMutation()
      const utils = trpc.useContext()

      return (
        <div className="text-right font-medium flex justify-end gap-5">
          <button
            className="text-right font-medium flex justify-end gap-5"
            disabled={upvoteMutation.isLoading}
            onClick={async () => {
              await upvoteMutation.mutateAsync(row.original.id)
              utils.issues.retrieveAllForModelId.refetch()
            }}
          >
            {row.getValue("upvotes")}
            {upvoteMutation.isLoading ? (
              <SmallSpinner />
            ) : (
              <ThumbsUpIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      )
    },
  },
  {
    accessorKey: "downvotes",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Downvotes"
        className="justify-end "
      />
    ),
    cell: ({ row }) => {
      const downvoteMutation = trpc.issues.downvote.useMutation()
      const utils = trpc.useContext()

      return (
        <div className="text-right font-medium flex justify-end gap-5">
          <button
            disabled={downvoteMutation.isLoading}
            className="flex justify-end gap-5"
            onClick={async () => {
              await downvoteMutation.mutateAsync(row.original.id)
              utils.issues.retrieveAllForModelId.refetch()
            }}
          >
            {row.getValue("downvotes")}
            {downvoteMutation.isLoading ? (
              <SmallSpinner />
            ) : (
              <ThumbsDownIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const issue = row.original

      return <IssueRowActions issue={issue} />
    },
  }
]
