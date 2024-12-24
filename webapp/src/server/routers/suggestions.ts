import { prisma } from "@/server/prisma"
import { z } from "zod"
import { protectedProcedure, router } from "../trpc"
import { internalServerError } from "@/lib/trpc"
import { SuggestionWithUserData } from "@/interfaces/suggestion-types"
import { clerkClient } from "@clerk/nextjs"

export const suggestionsRouter = router({
  retrieveAllForIssueId: protectedProcedure
    .input(z.string().nullish())
    .query(async ({ input }) => {
      if (!input) {
        throw internalServerError("No issue id provided")
      }

      const sug =  await prisma.suggestion.findMany({
        where: {
          issueId: input,
        },
      })

      const ret: SuggestionWithUserData[] = []

      for (const e of sug) {
        if (!e.authorId) {
          ret.push(e)
          continue
        }

        const clerkUser = await clerkClient.users.getUser(e.authorId)

        if (clerkUser) {
          ret.push({
            ...e,
            userData: clerkUser,
          })
        }
      }

      return ret
    }),
  createHumanSuggestions: protectedProcedure
    .input(
      z.object({
        issueId: z.string(),
        texts: z.array(z.string().min(2).max(500)),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // validate the model id
      const issue = await prisma.issue.findUnique({
        where: {
          id: input.issueId,
        },
      })

      if (!issue) {
        throw internalServerError("Model not found")
      }

      const queries = input.texts.map(async (text) => {
        return prisma.suggestion.create({
          data: {
            text,
            authorId: ctx.auth.userId,
            issue: {
              connect: {
                id: input.issueId,
              },
            },
          },
        })
      })

      return await Promise.all(queries)
    }),
})

export type AppRouter = typeof suggestionsRouter
