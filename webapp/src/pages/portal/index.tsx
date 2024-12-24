"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ErrorMessage from "@/components/ui/error-message"
import NoDataWarning from "@/components/ui/no-data-warning"
import { trpc } from "@/lib/trpc"
import { FireIcon } from "@heroicons/react/24/outline"
import { ApexOptions } from "apexcharts"
import { ArrowRightIcon } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function PortalHome() {
  const options = {
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false,
      },
      background: "#000",
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
      ],
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      tooltip: {
        enabled: false,
      },
    },
    theme: {
      mode: "dark",
      palette: "palette1",
    },
  } as ApexOptions

  const series = [
    {
      name: "Total number of issues",
      data: [10, 12, 14, 18, 20, 25, 28, 30, 31, 31], // replace this with actual data
    },
    {
      name: "Total number of resolved issues",
      data: [0, 4, 5, 10, 12, 15, 20, 22, 22, 23], // replace this with actual data
    },
  ]

  const models = trpc.models.retrieveAll.useQuery()

  const modelCards = models.data?.map((model) => (
    <Link
      key={model.name}
      href={`/portal/models/${model.id}`}
      className="cursor-pointer"
    >
      <Card className="hover:border-slate-600">
        <CardHeader className="flex justify-between flex-row align-start">
          <div>
            <CardTitle className="mb-2">{model.name}</CardTitle>
            <CardDescription>{model.description}</CardDescription>
          </div>
          <FireIcon className="text-amber-500 h-8 w-8" />
        </CardHeader>
        <CardContent>
          {typeof window !== "undefined" && (
            <Chart type="area" width="100%" options={options} series={series} />
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button className="bg-transparent p-0 hover:bg-transparent">
            <ArrowRightIcon className="text-foreground" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  ))

  const skeletonCards = [...Array(4)].map((_, ix) => (
    <Card
      className="hover:border-slate-600 animate-pulse"
      key={"skeleton-card-" + ix}
    >
      <CardHeader>
        <CardTitle className="mb-2 w-16 bg-slate-800 h-5" />
        <CardDescription className="w-48 bg-slate-800 h-3" />
      </CardHeader>
      <CardContent>
        <div className="bg-slate-800 w-full h-48" />
      </CardContent>
    </Card>
  ))

  return (
    <div>
      {models.error ? (
        <ErrorMessage message={models.error.message} />
      ) : models.isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 pb-10 items-start">
          {skeletonCards}
        </div>
      ) : models.data.length === 0 ? (
        <NoDataWarning message="No models to display." />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 pb-10 items-start">
          {modelCards}
        </div>
      )}
    </div>
  )
}
