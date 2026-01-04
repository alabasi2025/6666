# ✅ دليل التحقق من Seed

**خطوات التحقق من نجاح إنشاء البيانات الافتراضية**

---

## 📋 الخطوات

### **الخطوة 1: تشغيل Seed** 🚀

```bash
cd /home/ubuntu/6666
pnpm tsx server/seed.ts
```

**النتيجة المتوقعة:**

```
[Seed] Starting database seeding...
[Seed] Creating default admin user...
[Seed] ✅ Admin user created successfully

===========================================
✅ تم إنشاء المستخدم الافتراضي بنجاح!
===========================================
📱 رقم الهاتف: 0500000000
🔑 كلمة المرور: admin123
👤 الدور: super_admin
===========================================

[Seed] Creating default roles...
[Seed] ✅ Roles created successfully
[Seed] Creating default permissions...
[Seed] ✅ Permissions created successfully
[Seed] Assigning permissions to roles...
[Seed] ✅ Role permissions assigned successfully
[Seed] ✅ Database seeding completed successfully!

✅ تم إنشاء البيانات الافتراضية بنجاح!
```

---

### **الخطوة 2: التحقق من قاعدة البيانات** 🔍

#### **Option 1: عبر Drizzle Studio** (الأسهل)

```bash
cd /home/ubuntu/6666
pnpm db:studio
```

ثم افتح المتصفح على: `https://local.drizzle.studio`

**تحقق من:**
- ✅ جدول `users` يحتوي على مستخدم واحد على الأقل
- ✅ جدول `roles` يحتوي على 7 أدوار
- ✅ جدول `permissions` يحتوي على 30+ صلاحية
- ✅ جدول `role_permissions` يحتوي على روابط

---

#### **Option 2: عبر MySQL CLI**

```bash
# الاتصال بقاعدة البيانات
mysql -u root -p

# اختر قاعدة البيانات
USE your_database_name;

# تحقق من المستخدمين
SELECT id, phone, name, role, isActive FROM users;
```

**النتيجة المتوقعة:**
```
+----+------------+---------------+-------------+----------+
| id | phone      | name          | role        | isActive |
+----+------------+---------------+-------------+----------+
|  1 | 0500000000 | المدير العام | super_admin |        1 |
+----+------------+---------------+-------------+----------+
```

```sql
-- تحقق من الأدوار
SELECT id, name, displayName FROM roles;
```

**النتيجة المتوقعة:**
```
+----+-------------+------------------+
| id | name        | displayName      |
+----+-------------+------------------+
|  1 | super_admin | مدير النظام     |
|  2 | admin       | مدير             |
|  3 | manager     | مدير محطة        |
|  4 | accountant  | محاسب            |
|  5 | technician  | فني              |
|  6 | collector   | محصل             |
|  7 | user        | مستخدم           |
+----+-------------+------------------+
```

```sql
-- تحقق من الصلاحيات
SELECT COUNT(*) as total_permissions FROM permissions;
```

**النتيجة المتوقعة:**
```
+--------------------+
| total_permissions  |
+--------------------+
|                 30 |
+--------------------+
```

```sql
-- تحقق من ربط الصلاحيات بالأدوار
SELECT 
  r.name as role_name,
  COUNT(rp.permissionId) as permissions_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.roleId
GROUP BY r.id, r.name;
```

**النتيجة المتوقعة:**
```
+-------------+-------------------+
| role_name   | permissions_count |
+-------------+-------------------+
| super_admin |                30 |
| admin       |                29 |
| manager     |                15 |
| accountant  |                10 |
| technician  |                 8 |
| collector   |                 5 |
| user        |                 0 |
+-------------+-------------------+
```

---

#### **Option 3: عبر سكريبت Node.js**

إنشاء ملف `scripts/verify-seed.ts`:

```typescript
import { db } from '../server/db';
import { users, roles, permissions, rolePermissions } from '../drizzle/schema';
import { sql } from 'drizzle-orm';

async function verifySeed() {
  console.log('🔍 التحقق من البيانات الافتراضية...\n');
  
  // 1. المستخدمين
  const usersCount = await db.select({ count: sql<number>`count(*)` }).from(users);
  console.log(`✅ المستخدمين: ${usersCount[0].count}`);
  
  if (usersCount[0].count === 0) {
    console.log('❌ لا يوجد مستخدمين! قم بتشغيل seed.');
    return;
  }
  
  // 2. الأدوار
  const rolesCount = await db.select({ count: sql<number>`count(*)` }).from(roles);
  console.log(`✅ الأدوار: ${rolesCount[0].count}`);
  
  if (rolesCount[0].count < 7) {
    console.log('⚠️  عدد الأدوار أقل من المتوقع (7)');
  }
  
  // 3. الصلاحيات
  const permsCount = await db.select({ count: sql<number>`count(*)` }).from(permissions);
  console.log(`✅ الصلاحيات: ${permsCount[0].count}`);
  
  if (permsCount[0].count < 30) {
    console.log('⚠️  عدد الصلاحيات أقل من المتوقع (30+)');
  }
  
  // 4. ربط الصلاحيات
  const rolePermsCount = await db.select({ count: sql<number>`count(*)` }).from(rolePermissions);
  console.log(`✅ روابط الصلاحيات: ${rolePermsCount[0].count}`);
  
  // 5. المستخدم الافتراضي
  const adminUser = await db.select().from(users).where(eq(users.phone, '0500000000')).limit(1);
  
  if (adminUser.length > 0) {
    console.log('\n✅ المستخدم الافتراضي موجود:');
    console.log(`   📱 الهاتف: ${adminUser[0].phone}`);
    console.log(`   👤 الاسم: ${adminUser[0].name}`);
    console.log(`   🔑 الدور: ${adminUser[0].role}`);
  } else {
    console.log('\n❌ المستخدم الافتراضي غير موجود!');
  }
  
  console.log('\n✅ التحقق مكتمل!');
}

verifySeed().catch(console.error);
```

**تشغيل:**
```bash
pnpm tsx scripts/verify-seed.ts
```

---

### **الخطوة 3: اختبار تسجيل الدخول** 🔐

#### **Option 1: عبر واجهة المستخدم**

1. شغل السيرفر:
```bash
cd /home/ubuntu/6666
pnpm dev
```

2. افتح المتصفح:
```
http://localhost:5173/login
```

3. أدخل البيانات:
```
📱 رقم الهاتف: 0500000000
🔑 كلمة المرور: admin123
```

4. اضغط "تسجيل الدخول"

**النتيجة المتوقعة:**
- ✅ يتم تسجيل الدخول بنجاح
- ✅ يتم توجيهك للوحة التحكم
- ✅ يظهر اسمك في الشريط العلوي

---

#### **Option 2: عبر API مباشرة (cURL)**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0500000000",
    "password": "admin123"
  }'
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "phone": "0500000000",
    "name": "المدير العام",
    "role": "super_admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### **Option 3: عبر Postman/Thunder Client**

1. افتح Postman
2. أنشئ طلب POST جديد
3. URL: `http://localhost:3000/api/auth/login`
4. Body (JSON):
```json
{
  "phone": "0500000000",
  "password": "admin123"
}
```
5. أرسل الطلب

---

### **الخطوة 4: التحقق من الصلاحيات** 🔒

بعد تسجيل الدخول، تحقق من:

```bash
# جلب صلاحيات المستخدم
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**النتيجة المتوقعة:**
```json
{
  "user": {
    "id": 1,
    "phone": "0500000000",
    "name": "المدير العام",
    "role": "super_admin",
    "permissions": [
      "view_dashboard",
      "manage_users",
      "manage_roles",
      "manage_settings",
      // ... جميع الصلاحيات (30+)
    ]
  }
}
```

---

## 🐛 استكشاف الأخطاء

### **المشكلة 1: "قاعدة البيانات غير متاحة"**

**الحل:**
```bash
# 1. تحقق من تشغيل قاعدة البيانات
docker ps | grep mysql

# 2. إذا لم تكن تعمل، شغلها
docker-compose up -d

# 3. تحقق من DATABASE_URL في .env
cat .env | grep DATABASE_URL
```

---

### **المشكلة 2: "رقم الهاتف مسجل مسبقاً"**

**الحل:**
```bash
# البيانات موجودة مسبقاً - هذا طبيعي!
# إذا أردت إعادة seed:

# 1. احذف المستخدم الموجود
mysql -u root -p -e "DELETE FROM users WHERE phone='0500000000';"

# 2. أعد تشغيل seed
pnpm tsx server/seed.ts
```

---

### **المشكلة 3: "تسجيل الدخول يفشل"**

**الحل:**
```bash
# 1. تحقق من وجود المستخدم
mysql -u root -p -e "SELECT * FROM users WHERE phone='0500000000';"

# 2. تحقق من كلمة المرور المشفرة
# يجب أن تبدأ بـ $2b$ (bcrypt)

# 3. أعد إنشاء المستخدم
pnpm tsx server/seed.ts
```

---

### **المشكلة 4: "الجداول غير موجودة"**

**الحل:**
```bash
# 1. تشغيل migrations
pnpm db:push

# 2. تحقق من الجداول
mysql -u root -p -e "SHOW TABLES;"

# 3. أعد تشغيل seed
pnpm tsx server/seed.ts
```

---

## ✅ Checklist النهائي

- [ ] تشغيل `pnpm tsx server/seed.ts` بنجاح
- [ ] رؤية رسالة النجاح مع بيانات المستخدم
- [ ] التحقق من الجداول في قاعدة البيانات
- [ ] وجود 1+ مستخدم في جدول `users`
- [ ] وجود 7 أدوار في جدول `roles`
- [ ] وجود 30+ صلاحية في جدول `permissions`
- [ ] وجود روابط في جدول `role_permissions`
- [ ] تسجيل الدخول بنجاح عبر الواجهة
- [ ] تسجيل الدخول بنجاح عبر API
- [ ] رؤية جميع الصلاحيات للمستخدم

---

## 📊 الأوامر السريعة

```bash
# تشغيل seed
pnpm tsx server/seed.ts

# التحقق من قاعدة البيانات
pnpm db:studio

# تشغيل السيرفر
pnpm dev

# اختبار تسجيل الدخول
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0500000000","password":"admin123"}'

# عرض الجداول
mysql -u root -p -e "USE your_db; SHOW TABLES;"

# عد السجلات
mysql -u root -p -e "
  USE your_db;
  SELECT 'users' as table_name, COUNT(*) as count FROM users
  UNION ALL
  SELECT 'roles', COUNT(*) FROM roles
  UNION ALL
  SELECT 'permissions', COUNT(*) FROM permissions;
"
```

---

**✅ إذا نجحت جميع الخطوات، فالنظام جاهز للاستخدام!** 🎉
