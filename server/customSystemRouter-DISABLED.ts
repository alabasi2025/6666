// This router has been temporarily disabled as it depends on MySQL schemas that were removed
// To re-enable, recreate the required tables in PostgreSQL format

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";

export const customAccountsRouter = router({
  list: protectedProcedure.query(() => {
    throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Custom accounts system needs to be migrated to PostgreSQL' });
  }),
});

export const customSubSystemsRouter = router({
  list: protectedProcedure.query(() => {
    throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Custom sub systems need to be migrated to PostgreSQL' });
  }),
});

export const customSystemRouter = router({
  accounts: customAccountsRouter,
  subSystems: customSubSystemsRouter,
});

