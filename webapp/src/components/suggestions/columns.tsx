"use client"

import { Suggestion } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../ui/data-table-column-header"
import { SuggestionWithUserData } from "@/interfaces/suggestion-types"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { cn } from "@/lib/utils"
import { AlertTriangleIcon, CheckIcon } from "lucide-react"

export const columns: ColumnDef<SuggestionWithUserData>[] = [
  {
    id: "picture",
    header: "User",
    cell: ({ row }) => {
      const s = row.original as SuggestionWithUserData

      if (s.userData) {
        return (
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={s.userData.profileImageUrl}
                alt="@shadcn"
              />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            { s.userData.firstName }
            { ' ' }
            { s.userData.lastName }
          </div>
        )
      }
    }
  },
  {
    accessorKey: "text",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Text" />
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const s = row.original as SuggestionWithUserData

      // format date to be human readable
      const date = new Date(s.createdAt)
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })

      return <div>{formattedDate}</div>
    }
  },
  {
    accessorKey: "evalScore",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Evaluation" />
    ),
    cell: ({ row }) => {
      const v = row.getValue("evalScore") as Number
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
              v === 0 && "bg-red-400",
              v === 1 && "bg-emerald-600"
            )}
          >
            {v === 1 && (
              <CheckIcon className="text-white h-4 w-5" />
            )}
            {v === 0 && (
              <AlertTriangleIcon className="text-white h-4 w-5" />
            )}
          </div>
          {
            v === 1 ? 'Approved' : 'Rejected'
          }
        </div>
      )
    },
  },
]
