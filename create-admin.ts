import { drizzle } from "drizzle-orm/mysql2";
import { eq, sql } from "drizzle-orm";
import { users } from "./drizzle/schema";
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not set");
    process.exit(1);
  }

  console.log("🔌 Connecting to database...");
  const db = drizzle(process.env.DATABASE_URL);

  try {
    // Test connection
    await db.execute(sql`SELECT 1`);
    console.log("✅ Connected to database");

    // Check if admin exists
    const adminUsers = await db.select().from(users).where(
      sql`${users.role} IN ('admin', 'super_admin')`
    ).limit(1);

    if (adminUsers.length > 0) {
      console.log("ℹ️ Admin user already exists:", adminUsers[0].phone);
      return;
    }

    // Create admin user
    console.log("📝 Creating admin user...");
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

    console.log("✅ Admin user created successfully!");
    console.log("📱 Phone: 0500000000");
    console.log("🔑 Password: admin123");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
