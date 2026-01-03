# 📋 دليل فحص قاعدة البيانات الشامل

## 🚀 الخطوات السريعة

### 1. تشغيل MySQL (Windows)
```powershell
# إذا كنت تستخدم XAMPP
Start-Service MySQL81

# أو تشغيل يدوي
C:\xampp\mysql\bin\mysql.exe -u root
```

### 2. إنشاء قاعدة البيانات
```powershell
mysql -u root -e "CREATE DATABASE energy_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. التحقق من الاتصال
```bash
cd f:\666666\6666-main
pnpm tsx test-db-connection.ts
```

### 4. إعداد الجداول
```bash
pnpm db:push
```

### 5. تشغيل المشروع
```bash
pnpm dev
```

---

## 📂 هيكل ملفات الاتصال

### الملفات الأساسية:
```
server/
├── db.ts                              # ⭐ الاتصال الرئيسي
│   ├── getDb()                       # دالة الحصول على الاتصال
│   ├── testDatabaseConnection()      # اختبار الاتصال
│   └── [+50 دالة أخرى]              # عمليات قاعدة البيانات
│
├── db-modules/
│   ├── core.ts                       # وحدة اتصال بديلة
│   ├── accounting.ts
│   ├── users.ts
│   ├── inventory.ts
│   ├── hr-employees.ts
│   ├── diesel-1.ts
│   ├── field-ops-core.ts
│   └── [+20 وحدة أخرى]
│
└── database/
    ├── connection-pool.ts             # إدارة Connection Pool
    ├── db-health.ts                  # فحص صحة قاعدة البيانات ⭐
    ├── db-monitor.ts                 # مراقبة الأداء
    └── types.ts                      # الأنواع المخصصة
```

### ملفات الفحص:
```
f:\666666\6666-main\
├── test-db-connection.ts             # ⭐ اختبار سريع
├── check-db-status.ts                # ⭐ فحص شامل
├── db-check-simple.ts                # ⭐ فحص مخصص
├── check-db.ps1                      # ⭐ فحص PowerShell
└── DATABASE_CHECK_REPORT.md          # ⭐ هذا التقرير
```

---

## 🔧 معلومات الاتصال الفنية

### Connection String Format:
```
mysql://[user]:[password]@[host]:[port]/[database]
```

### الإعدادات الافتراضية:
| المعامل | القيمة |
|--------|--------|
| Protocol | mysql:// |
| User | root |
| Password | (empty) |
| Host | localhost |
| Port | 3306 |
| Database | energy_management |
| Charset | utf8mb4 |

### مثال كامل:
```env
DATABASE_URL=mysql://root:@localhost:3306/energy_management?charset=utf8mb4
```

---

## 🧪 دوال الفحص المتاحة

### 1. testDatabaseConnection() ⭐
**الموقع:** `server/db.ts` و `server/db-modules/core.ts`

```typescript
async function testDatabaseConnection(): Promise<boolean>
```

**ماذا تفعل:**
- التحقق من DATABASE_URL
- تنفيذ `SELECT 1`
- إرجاع true/false

**الاستخدام:**
```typescript
import { testDatabaseConnection } from './server/db';

const isConnected = await testDatabaseConnection();
console.log(isConnected ? '✅ متصل' : '❌ غير متصل');
```

### 2. DatabaseHealthChecker ⭐
**الموقع:** `server/database/db-health.ts`

```typescript
class DatabaseHealthChecker {
  async check(): Promise<DatabaseHealth>
  startPeriodicCheck(intervalMs?: number): void
  getLastHealth(): DatabaseHealth | null
  async isHealthy(): Promise<boolean>
}
```

**المعايير:**
- Connection status ✅
- Response time ⏱️
- Pool utilization 📊
- Waiting requests ⏳

### 3. ConnectionPoolManager
**الموقع:** `server/database/connection-pool.ts`

```typescript
class ConnectionPoolManager {
  async acquire(): Promise<Connection>
  release(connection: Connection): void
  getStats(): PoolStats
}
```

---

## 🐛 استكشاف الأخطاء

### الخطأ: ECONNREFUSED
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**السبب:** MySQL غير مشغّل

**الحل:**
```powershell
# Windows
net start MySQL81
# أو
Start-Service MySQL81

# تحقق من الحالة
Get-Service MySQL81
```

---

### الخطأ: ER_ACCESS_DENIED_ERROR
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'
```

**السبب:** كلمة المرور غير صحيحة

**الحل:**
```bash
# اختبر الاتصال يدويًا
mysql -u root -p
# أدخل كلمة المرور إن وجدت

# ثم حدّث DATABASE_URL
DATABASE_URL=mysql://root:password@localhost:3306/energy_management
```

---

### الخطأ: ER_BAD_DB_ERROR
```
Error: ER_BAD_DB_ERROR: Unknown database 'energy_management'
```

**السبب:** قاعدة البيانات غير موجودة

**الحل:**
```bash
mysql -u root -e "CREATE DATABASE energy_management CHARACTER SET utf8mb4;"
```

---

### الخطأ: PROTOCOL_CONNECTION_LOST
```
Error: Connection lost: The server closed the connection
```

**السبب:** انقطاع الاتصال أو timeout

**الحل:**
```typescript
// في server/db.ts، زيادة timeout
const db = drizzle(dbUrl, {
  mode: 'default',
  casing: 'snake_case',
  connectionTimeoutMs: 30000, // 30 ثانية
});
```

---

### الخطأ: HEARTBEAT_LOSS_CONNECTION
```
Error: Net error: read ECONNRESET
```

**السبب:** فقدان الاتصال

**الحل:**
```typescript
// استخدام connection pooling
import { ConnectionPoolManager } from './database/connection-pool';
```

---

## 📊 مراقبة الأداء

### الوصول إلى معلومات الصحة:
```typescript
import { dbHealthChecker } from './database/db-health';

// بدء المراقبة
dbHealthChecker.startPeriodicCheck(30000); // كل 30 ثانية

// الحصول على آخر معلومات
const health = dbHealthChecker.getLastHealth();
console.log({
  status: health.status,           // 'healthy' | 'degraded' | 'unhealthy'
  responseTime: health.responseTime, // ms
  activeConnections: health.activeConnections,
  issues: health.issues
});
```

### المقاييس المهمة:
| المقياس | الحد الأخضر | الحد الأصفر | الحد الأحمر |
|--------|----------|----------|----------|
| Response Time | < 100ms | 100-1000ms | > 1000ms |
| Connection Utilization | < 50% | 50-80% | > 80% |
| Waiting Requests | 0-2 | 3-5 | > 5 |

---

## ✅ قائمة التحقق النهائية

```
قبل التطوير:
[ ] MySQL يعمل بنجاح
[ ] قاعدة البيانات 'energy_management' موجودة
[ ] ملف .env يحتوي على DATABASE_URL الصحيح
[ ] اتصال الاختبار ناجح
[ ] الجداول تم إنشاؤها (pnpm db:push)

أثناء التطوير:
[ ] لا توجد أخطاء اتصال في الـ logs
[ ] الطلبات تستغرق وقتًا معقولًا
[ ] Connection Pool يعمل بكفاءة
[ ] لا توجد تسرب في الاتصالات

في الإنتاج:
[ ] Database replica/backup موجود
[ ] مراقبة الصحة مفعلة
[ ] التنبيهات مكونة
[ ] Failover mechanism موجود
```

---

## 📞 التواصل والدعم

إذا احتجت إلى المساعدة:

1. **شغّل الفحص:**
   ```bash
   pnpm tsx db-check-simple.ts
   ```

2. **اقرأ الرسالة:**
   - الرسالة ستخبرك بالمشكلة والحل

3. **اتبع الحل المقترح:**
   - جرّب الخطوات المذكورة

4. **إذا استمرت المشكلة:**
   - تحقق من DATABASE_URL في .env
   - تأكد من تشغيل MySQL
   - جرب الاتصال اليدوي: `mysql -u root`

---

**آخر تحديث:** January 2, 2026
**النسخة:** 2.1.0

