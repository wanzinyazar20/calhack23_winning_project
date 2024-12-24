import { columns } from "@/components/issues/columns"
import { IssuesToolbar } from "@/components/issues/issues-toolbar"
import { DataTable } from "@/components/ui/data-table"
import { trpc } from "@/lib/trpc"
import { useRouter } from "next/router"

export default function ModelPage() {
  const router = useRouter()

  const issues = trpc.issues.retrieveAllForModelId.useQuery(
    router.query.model_id as string,
    {
      enabled: router.query.model_id !== undefined,
    }
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={issues.data ?? []}
        toolbar={IssuesToolbar}
        isLoading={issues.isLoading}
        isError={issues.isError}
        errorMessage={issues.error?.message}
      />
    </>
  )
}
