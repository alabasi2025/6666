import "dotenv/config";
import { and, eq, like } from "drizzle-orm";
import { customAccounts } from "../drizzle/schemas/customSystemV2";
import { getDb } from "../server/db";

async function main() {
  const businessId = Number(process.argv[2] || 1);
  const term = process.argv[3] || "الدهمية";
  const limit = Number(process.argv[4] || 50);

  const db = await getDb();
  if (!db) {
    console.log("db not available");
    return;
  }
  const rows = await db
    .select({
      id: customAccounts.id,
      nameAr: customAccounts.accountNameAr,
      code: customAccounts.accountCode,
      subSystemId: customAccounts.subSystemId,
    })
    .from(customAccounts)
    .where(and(eq(customAccounts.businessId, businessId), like(customAccounts.accountNameAr, `%${term}%`)))
    .limit(limit);

  console.log(`found: ${rows.length}`);
  for (const r of rows) {
    console.log(`${r.id}\t${r.code}\t${r.subSystemId ?? ""}\t${r.nameAr}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


