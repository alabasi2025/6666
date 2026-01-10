# ✅ حل مشكلة تشغيل PostgreSQL 16

**المشكلة:** PostgreSQL 16 لا يمكن تشغيله بدون صلاحيات إدارية

---

## 🚀 **الحل السريع:**

### **الطريقة 1: استخدام ملف Batch (الأسهل) ⭐**

1. **انقر بزر الماوس الأيمن** على الملف: `start-postgres16-admin.bat`
2. **اختر:** "Run as administrator"
3. **انتظر** حتى يكتمل التشغيل

---

### **الطريقة 2: من PowerShell كمدير**

1. **اضغط `Win + X`** واختر **"Windows PowerShell (Admin)"**

2. **نفّذ الأوامر:**
```powershell
# الانتقال لمجلد المشروع
cd f:\666666\6666-main

# حذف ملف PID القديم
$pidFile = "C:\Program Files\PostgreSQL\16\data\postmaster.pid"
if (Test-Path $pidFile) {
    Remove-Item $pidFile -Force
    Write-Host "Deleted PID file" -ForegroundColor Green
}

# تشغيل PostgreSQL 16
Start-Service -Name "postgresql-x64-16"

# الانتظار
Start-Sleep -Seconds 5

# التحقق من الحالة
Get-Service -Name "postgresql-x64-16"

# فحص قاعدة البيانات
pnpm tsx check-postgres16-database.ts
```

---

### **الطريقة 3: من Services Manager (GUI)**

1. **اضغط `Win + R`** واكتب: `services.msc`
2. **ابحث عن:** `postgresql-x64-16 - PostgreSQL Server 16`
3. **انقر بزر الماوس الأيمن** → **"Start"**

---

## 🔍 **بعد التشغيل الناجح:**

### 1. التحقق من الحالة:
```powershell
Get-Service -Name "postgresql-x64-16"
```

يجب أن ترى: `Status: Running`

### 2. فحص قاعدة البيانات:
```powershell
cd f:\666666\6666-main
pnpm tsx check-postgres16-database.ts
```

### 3. إذا كانت قاعدة البيانات موجودة مع البيانات:
- قم بتحديث ملف `.env`:
```env
DATABASE_URL=postgresql://postgres:774424555@localhost:5432/666666
```

---

## ❌ **إذا فشل التشغيل:**

### فحص الأخطاء:

1. **Event Viewer:**
   - اضغط `Win + R` → `eventvwr.msc`
   - اذهب إلى: **Windows Logs** → **Application**
   - ابحث عن أخطاء من "PostgreSQL"

2. **ملفات السجلات:**
   ```
   C:\Program Files\PostgreSQL\16\data\log\
   ```

3. **فحص ملفات الإعدادات:**
   ```powershell
   # التأكد من وجود الملفات
   Test-Path "C:\Program Files\PostgreSQL\16\data\postgresql.conf"
   Test-Path "C:\Program Files\PostgreSQL\16\data\pg_hba.conf"
   ```

---

## 📋 **ملخص الأوامر:**

### تشغيل PostgreSQL 16:
```powershell
Start-Service -Name "postgresql-x64-16"
```

### إيقاف PostgreSQL 16:
```powershell
Stop-Service -Name "postgresql-x64-16"
```

### فحص الحالة:
```powershell
Get-Service -Name "postgresql-x64-16"
```

### فحص المنفذ:
```powershell
netstat -ano | findstr ":5432"
```

---

## 💡 **ملاحظات مهمة:**

1. **PostgreSQL 16** يستخدم المنفذ **5432**
2. **PostgreSQL 18** يستخدم المنفذ **5433**
3. **يمكن تشغيل كلا الإصدارين** في نفس الوقت (على منافذ مختلفة)
4. **إذا كانت قاعدة البيانات الأصلية على PostgreSQL 16**، يجب تشغيله للوصول إليها

---

## ✅ **بعد نجاح التشغيل:**

إذا تم تشغيل PostgreSQL 16 بنجاح ووجدت قاعدة البيانات `666666` مع البيانات:

1. **قم بتحديث ملف `.env`:**
   ```
   DATABASE_URL=postgresql://postgres:774424555@localhost:5432/666666
   ```

2. **أعد تشغيل السيرفر:**
   ```powershell
   cd f:\666666\6666-main
   pnpm dev
   ```

---

**تم إنشاء الحل:** الجمعة، 10 يناير 2026
