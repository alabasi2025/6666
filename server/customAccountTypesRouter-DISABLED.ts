// This router has been temporarily disabled as it depends on MySQL schemas that were removed
// To re-enable, recreate the required tables in PostgreSQL format

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./_core/trpc";

export const customAccountTypesRouter = router({
  list: protectedProcedure.query(() => {
    throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Custom account types need to be migrated to PostgreSQL' });
  }),
});

