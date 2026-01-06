/**
 * Script to create pricing_rules table in PostgreSQL
 */

import { getDb } from "../server/db";
import { sql } from "drizzle-orm";
import { logger } from "../server/utils/logger";

async function createPricingRulesTable() {
  const db = await getDb();
  if (!db) {
    logger.error("Database not available");
    process.exit(1);
  }

  try {
    // Create table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pricing_rules (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL,
        meter_type VARCHAR(20) NOT NULL,
        usage_type VARCHAR(20) NOT NULL,
        subscription_fee NUMERIC(18,2) NOT NULL,
        deposit_amount NUMERIC(18,2) DEFAULT 0,
        deposit_required BOOLEAN DEFAULT true,
        active BOOLEAN DEFAULT true,
        notes VARCHAR(500),
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_pricing_rules_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_pricing_rules_business_meter_usage ON pricing_rules(business_id, meter_type, usage_type)
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON pricing_rules(active)
    `);

    logger.info("✅ pricing_rules table created successfully");

    // Insert default data (only if table is empty)
    const existingCount = await db.execute(sql`SELECT COUNT(*) as count FROM pricing_rules`);
    const count = parseInt(existingCount.rows[0]?.count || "0");

    if (count === 0) {
      await db.execute(sql`
        INSERT INTO pricing_rules (business_id, meter_type, usage_type, subscription_fee, deposit_amount, deposit_required, active, notes) VALUES
        (1, 'traditional', 'residential', 5000.00, 35000.00, true, true, 'قاعدة افتراضية - عداد تقليدي سكني'),
        (1, 'traditional', 'commercial', 10000.00, 50000.00, true, true, 'قاعدة افتراضية - عداد تقليدي تجاري'),
        (1, 'sts', 'residential', 7000.00, 0.00, false, true, 'قاعدة افتراضية - STS سكني (لا تأمين)'),
        (1, 'sts', 'commercial', 12000.00, 0.00, false, true, 'قاعدة افتراضية - STS تجاري (لا تأمين)'),
        (1, 'iot', 'residential', 6000.00, 30000.00, true, true, 'قاعدة افتراضية - IoT سكني'),
        (1, 'iot', 'commercial', 11000.00, 45000.00, true, true, 'قاعدة افتراضية - IoT تجاري')
      `);
      logger.info("✅ Default pricing rules inserted");
    } else {
      logger.info(`ℹ️  Table already has ${count} records, skipping default data insertion`);
    }

    process.exit(0);
  } catch (error: any) {
    logger.error("Failed to create pricing_rules table", { error: error.message });
    process.exit(1);
  }
}

createPricingRulesTable();

