export const PORTAL_NAMESPACE = "/portal"

export const generateRoute = (namespace: string, route: string) => {
  let cleanedRoute = route
  if (cleanedRoute.startsWith("/")) {
    cleanedRoute = cleanedRoute.substring(1)
  }

  if (!cleanedRoute) {
    return namespace
  }

  return namespace + "/" + cleanedRoute
}

export const generatePortalRoute = (route: string) =>
  generateRoute(PORTAL_NAMESPACE, route)

// Set the paths that don't require the user to be signed in
const publicPaths = ["/", "/sign-in*", "/sign-up*"]
const errorPaths = ["/404"]

export const isPublicRoute = (path: string) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/)")))
  )
}

export const isErrorPath = (path: string) => {
  return errorPaths.includes(path)
}

export const isApiPath = (path: string) => {
  return path.startsWith("/api")
}

export const isPortalRoute = (path: string) => {
  return path.startsWith(generatePortalRoute(""))
}

export enum RouteType {
  PUBLIC = 1,
  BASIC_USER = 2,
}

export const getRouteType = (path: string): RouteType | null => {
  let currentRouteType: RouteType | null = null

  if (isPortalRoute(path)) {
    currentRouteType = RouteType.BASIC_USER
  } else if (isPublicRoute(path)) {
    currentRouteType = RouteType.PUBLIC
  }

  return currentRouteType
}
