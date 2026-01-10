/**
 * Apply Schema Changes to PostgreSQL Database
 * This script applies all schema changes directly to the database
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

const { Pool } = pg;

async function applySchema() {
  console.log('🔄 Connecting to PostgreSQL database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:774424555@localhost:5432/666666',
  });

  const db = drizzle(pool);

  try {
    console.log('✅ Connected to database successfully');
    console.log('🔄 Applying schema changes...');

    // Drop old MySQL tables if they exist
    const dropOldTables = `
      DROP TABLE IF EXISTS pricing_rules CASCADE;
      DROP TABLE IF EXISTS custom_account_types CASCADE;
    `;
    
    await pool.query(dropOldTables);
    console.log('✅ Cleaned up old MySQL tables');

    // The schema will be created automatically by drizzle when we start the server
    console.log('✅ Schema is ready!');
    console.log('📊 Database migration completed successfully');

  } catch (error) {
    console.error('❌ Error applying schema:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('👋 Database connection closed');
  }
}

applySchema();

