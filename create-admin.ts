import { drizzle } from "drizzle-orm/mysql2";
import { eq, sql } from "drizzle-orm";
import { users } from "./drizzle/schema";
import bcrypt from 'bcrypt';
import { logger } from './server/utils/logger';

const SALT_ROUNDS = 10;

async function main() {
  if (!process.env.DATABASE_URL) {
    logger.error("DATABASE_URL not set");
    process.exit(1);
  }

  logger.info("Connecting to database...");
  const db = drizzle(process.env.DATABASE_URL);

  try {
    // Test connection
    await db.execute(sql`SELECT 1`);
    logger.info("Connected to database");

    // Check if admin exists
    const adminUsers = await db.select().from(users).where(
      sql`${users.role} IN ('admin', 'super_admin')`
    ).limit(1);

    if (adminUsers.length > 0) {
      logger.info("Admin user already exists", { phone: adminUsers[0].phone });
      return;
    }

    // Create admin user
    logger.info("Creating admin user...");
    const hashedPassword = await bcrypt.hash("admin123", SALT_ROUNDS);
    const openId = `local_0500000000_${Date.now()}`;

    await db.insert(users).values({
      openId,
      phone: "0500000000",
      password: hashedPassword,
      name: "مدير النظام",
      role: "super_admin",
      loginMethod: "local",
      isActive: true,
    });

    logger.info("Admin user created successfully!");
    logger.info("Admin credentials", { phone: "0500000000", password: "admin123" });
  } catch (error) {
    logger.error("Error", { error: error instanceof Error ? error.message : error });
    process.exit(1);
  }

  process.exit(0);
}

main();
