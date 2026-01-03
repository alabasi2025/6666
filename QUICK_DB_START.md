# 🚀 دليل اتصال قاعدة البيانات بالنظام - سريع

## ⚡ البدء السريع (5 دقائق)

### 1. تشغيل MySQL
```powershell
net start MySQL81
```

### 2. إنشاء قاعدة البيانات
```bash
mysql -u root -e "CREATE DATABASE energy_management CHARACTER SET utf8mb4;"
```

### 3. إضافة البيانات للـ .env
```env
DATABASE_URL=mysql://root:@localhost:3306/energy_management
```

### 4. تشغيل النظام
```bash
cd f:\666666\6666-main
pnpm dev
```

### 5. اختبار الاتصال
```bash
# في terminal آخر
pnpm tsx test-db-system-integration.ts
```

✅ **تم! النظام متصل**

---

## 🎯 مسارات الاتصال الرئيسية

### المسار 1: تسجيل الدخول
```
Request → /api/trpc/auth.login
          ↓
       context.ts (يتحقق من DATABASE_URL)
          ↓
       sdk.ts (يصادق المستخدم)
          ↓
       db.ts (يبحث في جدول users)
          ↓
       Response
```

**الملفات:**
- `server/_core/context.ts` - إنشاء السياق
- `server/_core/sdk.ts` - المصادقة
- `server/db.ts` - استعلامات قاعدة البيانات

---

### المسار 2: بدء الخادم
```
startServer()
      ↓
setupVite()
      ↓
ensureDefaultAdmin()
      ↓
getDb() (يتحقق من DATABASE_URL)
      ↓
ينشئ مستخدم افتراضي (إن لزم الحال)
      ↓
Server Ready
```

**الملفات:**
- `server/_core/index.ts` - نقطة البدء
- `server/auth.ts` - إنشاء المستخدم
- `server/db.ts` - الاتصال بـ MySQL

---

## 🔍 نقاط الفحص

### Health Endpoints

```bash
# حالة عامة
curl http://localhost:5000/health

# هل الخادم حي؟
curl http://localhost:5000/health/live

# هل النظام جاهز؟
curl http://localhost:5000/health/ready

# الإحصائيات
curl http://localhost:5000/metrics
```

---

## 📊 وضع العمل الحالي

### وضع 1: مع قاعدة بيانات ✅
```env
DATABASE_URL=mysql://root:@localhost:3306/energy_management
DEMO_MODE=false
```

✅ يستخدم MySQL الحقيقي  
✅ البيانات محفوظة دائمًا  
✅ متعدد المستخدمين

---

### وضع 2: بدون قاعدة بيانات 🔄
```env
DATABASE_URL=
DEMO_MODE=true
```

✅ يعمل بدون MySQL  
⚠️ البيانات في الذاكرة فقط  
⚠️ مناسب للاختبار

---

## 🛠️ استكشاف الأخطاء

### خطأ: ECONNREFUSED
**الحل:**
```powershell
net start MySQL81
```

### خطأ: ER_BAD_DB_ERROR
**الحل:**
```bash
mysql -u root -e "CREATE DATABASE energy_management;"
```

### خطأ: DATABASE_URL not set
**الحل:**
```
1. افتح .env
2. أضف: DATABASE_URL=mysql://root:@localhost:3306/energy_management
3. أعد تشغيل pnpm dev
```

---

## 📁 الملفات المهمة

| الملف | الوصف |
|------|--------|
| `server/db.ts` | الاتصال الرئيسي |
| `server/auth.ts` | المصادقة |
| `server/_core/index.ts` | البدء |
| `server/_core/context.ts` | السياق |
| `server/_core/sdk.ts` | SDK |
| `DB_SYSTEM_INTEGRATION_REPORT.md` | تقرير شامل |
| `DATABASE_TROUBLESHOOTING.md` | حل المشاكل |

---

## ✅ تحقق من الاتصال

```bash
# اختبار سريع
pnpm tsx db-check-simple.ts

# اختبار شامل
pnpm tsx test-db-system-integration.ts

# فحص الحالة
pnpm tsx check-db-status.ts
```

---

**النظام متصل وجاهز! ✅**

