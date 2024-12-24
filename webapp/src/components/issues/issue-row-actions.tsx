import { Issue, IssueStatus } from "@prisma/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SmallSpinner } from "../ui/small-spinner"
import { useRouter } from "next/router"
import { trpc } from "@/lib/trpc"
import { Button } from "../ui/button"
import { ArrowRight, MoreHorizontal, TrashIcon } from "lucide-react"
import { CheckIcon } from "lucide-react"

type Props = {
  issue: Issue
}

export const IssueRowActions: React.FC<Props> = ({ issue }: Props) => {
  const closeMutation = trpc.issues.closeIssue.useMutation()
  const deleteMutation = trpc.issues.delete.useMutation()
  const utils = trpc.useContext()

  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            router.push(`/portal/models/${issue.modelId}/issues/${issue.id}`)
          }}
          className="flex justify-between items-center"
        >
          View
          <ArrowRight className="h-3 w-3" />
        </DropdownMenuItem>
        {
          issue.status === IssueStatus.Open && (
            <DropdownMenuItem
              onClick={async () => {
                await closeMutation.mutateAsync(issue.id)
                utils.issues.retrieveAllForModelId.refetch()
              }}
              className="flex justify-between items-center"
            >
              Close issue
              {
                closeMutation.isLoading ? (
                  <SmallSpinner />
                ) : (
                  <CheckIcon className="h-3 w-3" />
                )
              }
            </DropdownMenuItem>
          )
        }
        <DropdownMenuItem
          onClick={async () => {
            await deleteMutation.mutateAsync({ IssueId: issue.id })
            utils.issues.retrieveAllForModelId.refetch()
          }}
          className="flex justify-between items-center"
        >
          Delete
          {
            closeMutation.isLoading ? (
              <SmallSpinner />
            ) : (
              <TrashIcon className="h-3 w-3" />
            )
          }
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}