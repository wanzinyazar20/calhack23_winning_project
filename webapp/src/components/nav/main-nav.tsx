import { generatePortalRoute } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { useClerk, useUser } from "@clerk/nextjs"
import { LogOut, ScaleIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { trpc } from "@/lib/trpc"

interface NavigationItem {
  name: string
  href: string
}

const HOME_NAV_ITEM: NavigationItem = {
  name: "Models",
  href: generatePortalRoute("/"),
}

export const MainNav = () => {
  const router = useRouter()
  const [activeRoute, setActiveRoute] = useState(router.pathname)
  const user = useUser()
  const { signOut } = useClerk()

  useEffect(() => {
    const handleRouteChange = () => {
      setActiveRoute(router.pathname)
    }

    router.events.on("routeChangeComplete", handleRouteChange)

    handleRouteChange()

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange)
    }
  }, [router])

  const activeModel = trpc.models.withId.useQuery(
    router.query.model_id as string,
    {
      enabled: !!router.query.model_id,
    }
  )

  const activeIssue = trpc.issues.retriveIssueWithId.useQuery(
    router.query.issue_id as string,
    {
      enabled: !!router.query.model_id,
    }
  )

  return (
    <>
      <div className="width-screen px-12 py-4 flex gap-6 flex-col border-b border-slate-800 mb-8 sticky top-0 left-0 bg-background z-10">
        <div className="justify-between flex items-center">
          <div className="flex items-center gap-4">
            <ScaleIcon className="h-8 text-sky-500 mr-5" />
            <div className="text-slate-500">/</div>
            <Link
              href={HOME_NAV_ITEM.href}
              className={cn(
                "text-slate-200 hover:bg-slate-800 px-4 py-2 rounded-md mx-2 transition-colors duration-100 ease-in-out",
                activeRoute === HOME_NAV_ITEM.href && "text-foreground"
              )}
              id={
                activeRoute === HOME_NAV_ITEM.href
                  ? "main-nav-active"
                  : undefined
              }
            >
              {HOME_NAV_ITEM.name}
            </Link>
            {router.query.model_id && (
              <>
                <div className="text-slate-500">/</div>
                {activeModel.isLoading ? (
                  <div
                    className={cn(
                      "bg-slate-800 animate-pulse h-5 w-24 rounded-md"
                    )}
                  />
                ) : activeModel.data ? (
                  <Link
                    href={generatePortalRoute(
                      `/models/${router.query.model_id}`
                    )}
                    className={cn(
                      "text-slate-200 hover:bg-slate-800 px-4 py-2 rounded-md mx-2 transition-colors duration-100 ease-in-out"
                    )}
                  >
                    {activeModel.data.name}
                  </Link>
                ) : null}
                {activeRoute.endsWith("new") && (
                  <>
                    <div className="text-slate-500">/</div>
                    <div
                      className={cn(
                        "text-slate-200 px-4 py-2 rounded-md mx-2 transition-colors duration-100 ease-in-out"
                      )}
                    >
                      New Issue
                    </div>
                  </>
                )}
                {router.query.issue_id && (
                  <>
                    <div className="text-slate-500">/</div>
                    {activeIssue.isLoading ? (
                      <div
                        className={cn(
                          "bg-slate-800 animate-pulse h-5 w-24 rounded-md"
                        )}
                      />
                    ) : activeIssue.data ? (
                      <Link
                        href={generatePortalRoute(
                          `/models/${router.query.model_id}`
                        )}
                        className={cn(
                          "text-slate-200 hover:bg-slate-800 px-4 py-2 rounded-md mx-2 transition-colors duration-100 ease-in-out"
                        )}
                      >
                        {activeIssue.data.name.length > 20
                          ? activeIssue.data.name.substring(0, 20) + "..."
                          : activeIssue.data.name}
                      </Link>
                    ) : null}
                  </>
                )}
              </>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user?.profileImageUrl} alt="@shadcn" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  {user.user?.firstName && (
                    <p className="text-sm font-medium leading-none">
                      {user.user?.firstName} {user.user?.lastName}
                    </p>
                  )}
                  {user.user?.primaryEmailAddress && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.user?.primaryEmailAddress.emailAddress}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}
