import { prisma } from "@/server/prisma"
import { z } from "zod"
import { protectedProcedure, router } from "../trpc"
import { ZodIssueObject } from "@/interfaces/issue-types"
import { internalServerError } from "@/lib/trpc"
import { IssueStatus } from "@prisma/client"

export const issuesRouter = router({
  create: protectedProcedure
    .input(ZodIssueObject)
    .mutation(async ({ ctx, input }) => {
      // validate the model id
      const model = await prisma.model.findUnique({
        where: {
          id: input.modelId,
        },
      })

      if (!model) {
        throw internalServerError("Model not found")
      }

      const issue = await prisma.issue.create({
        data: {
          ...input,
          authorId: ctx.auth.userId,
        },
      })

      return issue
    }),
  upvote: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // increase the upvote count
      await prisma.issue.update({
        where: {
          id: input,
        },
        data: {
          upvotes: {
            increment: 1,
          },
        },
      })
    }),
  downvote: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // increase the upvote count
      await prisma.issue.update({
        where: {
          id: input,
        },
        data: {
          downvotes: {
            increment: 1,
          },
        },
      })
    }),
  closeIssue: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // increase the upvote count
      await prisma.issue.update({
        where: {
          id: input,
        },
        data: {
          status: IssueStatus.Closed,
        },
      })
    }),
  update: protectedProcedure
    .input(
      z.object({
        updateData: ZodIssueObject,
        IssueId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const issue = await prisma.issue.update({
        where: {
          id: input.IssueId,
        },
        data: {
          ...input.updateData,
        },
      })

      return issue
    }),
  delete: protectedProcedure
    .input(
      z.object({
        IssueId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const deletedIssue = await prisma.issue.delete({
        where: {
          id: input.IssueId,
        },
      })

      return deletedIssue
    }),
  retriveIssueWithId: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await prisma.issue.findUnique({
        include: {
          suggestions: true,
          comments: true,
        },
        where: {
          id: input,
        },
      })
    }),
  retrieveAllForModelId: protectedProcedure
    .input(z.string().nullish())
    .query(async ({ input }) => {
      if (!input) {
        throw internalServerError("No model id provided")
      }

      return await prisma.issue.findMany({
        where: {
          modelId: input,
        },
      })
    }),
  retrievePaginated: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const PER_PAGE = 20
      const limit = input.limit ?? PER_PAGE
      const { cursor } = input

      const issues = await prisma.issue.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
      })

      let nextCursor: typeof cursor | null = null
      if (issues.length > limit) {
        const nextIssue = issues.pop()
        nextCursor = nextIssue!.id
      }

      return { issues, nextCursor }
    }),
})

export type AppRouter = typeof issuesRouter
