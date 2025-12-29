import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  let connection: mysql.Connection | null = null;
  
  try {
    // قراءة DATABASE_URL من .env
    const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
    
    if (!dbUrlMatch) {
      throw new Error('DATABASE_URL not found in .env');
    }
    
    const dbUrl = dbUrlMatch[1].trim();
    // Parse MySQL URL: mysql://user:password@host:port/database
    const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!urlMatch) {
      throw new Error('Invalid DATABASE_URL format');
    }
    
    const [, user, password, host, port, database] = urlMatch;
    
    console.log(`الاتصال بقاعدة البيانات: ${host}:${port}/${database}`);
    
    connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
    });
    
    console.log('✓ تم الاتصال بقاعدة البيانات');
    
    // قراءة ملف الـ migration
    const migrationPath = path.join(process.cwd(), 'drizzle', 'migrations', '0015_add_custom_accounts_v2_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // تقسيم الـ SQL إلى أوامر منفصلة
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));
    
    console.log(`جاري تطبيق ${statements.length} أمر SQL...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      try {
        await connection.execute(statement);
        console.log(`✓ تم تطبيق الأمر ${i + 1}/${statements.length}`);
      } catch (error: any) {
        // تجاهل الأخطاء إذا كانت الحقول موجودة بالفعل
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠ تم تخطي الأمر ${i + 1} (موجود بالفعل)`);
        } else {
          console.error(`❌ خطأ في الأمر ${i + 1}:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('✅ تم تطبيق migration بنجاح!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ في تطبيق migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

applyMigration();

