import { router } from "../trpc"
import { issuesRouter } from "./issues"
import { modelsRouter } from "./models"
import { suggestionsRouter } from "./suggestions"

export const appRouter = router({
  issues: issuesRouter,
  models: modelsRouter,
  suggestions: suggestionsRouter,
})

export type AppRouter = typeof appRouter
