// get server side props with issue id
// get issue data from db

import { prisma } from "@/server/prisma"
import { Comments, Issue, IssueStatus, Suggestion } from "@prisma/client"
import { GetServerSideProps } from "next"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BugIcon, CheckIcon } from "lucide-react"
import { useRouter } from "next/router"
import { trpc } from "@/lib/trpc"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/suggestions/columns"
import { Separator } from "@/components/ui/separator"

// render issue data
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const issue = await prisma.issue.findUnique({
    where: {
      id: String(params?.issue_id),
    },
    include: {
      suggestions: true,
      comments: true,
    },
  })

  if (!issue) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      issue: JSON.parse(JSON.stringify(issue))
    },
  }
}

type Props = {
  issue: Issue & {
    suggestions: Suggestion[]
    comments: Comments[]
  }
}

const IssuePage: React.FC<Props> = (props) => {
  const { issue } = props

  const router = useRouter()

  const suggestions = trpc.suggestions.retrieveAllForIssueId.useQuery(
    router.query.issue_id as string,
    {
      enabled: router.query.issue_id !== undefined,
    }
  )

  return (
    <div className="space-y-8">
      {
        issue && (
          <>
            <h1 className="flex gap-2 items-center">
              <span className="flex h-2 w-2 rounded-full bg-sky-500" />
              Issue
            </h1>
            <Card>
              <CardHeader className="flex justify-between flex-row items-start">
                <div className="flex flex-col gap-4 flex-1">
                  <CardTitle>{issue.name}</CardTitle>
                  <CardDescription>{ issue.description }</CardDescription>
                  <Separator />
                  <h3>Trigger Prompt</h3>
                  <CardDescription>{ issue.triggerPrompt }</CardDescription>
                  <h3>Bad Response</h3>
                  <CardDescription>{ issue.badResponse }</CardDescription>
                  <h3>Reasoning</h3>
                  <CardDescription>{ issue.reasoning }</CardDescription>
                </div>
                <div className="flex gap-5 flex-col">
                  <div
                    className={cn(
                      "text-center py-1 w-24 text-xs",
                      "flex items-center justify-start gap-2 px-3"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center",
                        issue.status === IssueStatus.Open && "bg-red-400",
                        issue.status === IssueStatus.Closed && "bg-emerald-600"
                      )}
                    >
                      {issue.status === IssueStatus.Closed && (
                        <CheckIcon className="text-white h-4 w-5" />
                      )}
                      {issue.status === IssueStatus.Open && (
                        <BugIcon className="text-white h-4 w-5" />
                      )}
                    </div>
                    {issue.status.toUpperCase()}
                  </div>
                </div>
              </CardHeader>
            </Card>
          </>
        )
      }
      <h1 className="flex gap-2 items-center">
        <span className="flex h-2 w-2 rounded-full bg-sky-500" />
        Suggestions
      </h1>
      <DataTable
        columns={columns}
        data={suggestions.data ?? []}
        isLoading={suggestions.isLoading}
        isError={suggestions.isError}
        errorMessage={suggestions.error?.message}
      />
    </div>
  )
}

export default IssuePage
