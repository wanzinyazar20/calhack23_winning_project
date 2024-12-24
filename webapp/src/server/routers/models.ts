import { prisma } from "@/server/prisma"
import { protectedProcedure, router } from "../trpc"
import { z } from "zod"

export const modelsRouter = router({
  withId: protectedProcedure
    .input(z.string().nullish())
    .query(async ({ input }) => {
      if (!input) {
        return null
      }

      return await prisma.model.findUnique({
        where: { id: input },
      })
    }),
  retrieveAll: protectedProcedure.query(async () => {
    return await prisma.model.findMany()
  }),
})

export type AppRouter = typeof modelsRouter
