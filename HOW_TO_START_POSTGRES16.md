# 🔧 كيفية تشغيل PostgreSQL 16

**المشكلة:** PostgreSQL 16 لا يبدأ بسبب صلاحيات إدارية

---

## ❌ **المشكلة الحالية:**

```
Error: Cannot open postgresql-x64-16 service on computer '.'
```

**السبب:** تشغيل خدمات Windows يتطلب صلاحيات إدارية (Administrator privileges)

---

## ✅ **الحل:**

### **الطريقة 1: تشغيل PowerShell كمدير (موصى به)**

1. **اضغط `Win + X`** واختر **"Windows PowerShell (Admin)"** أو **"Terminal (Admin)"**

2. **في PowerShell الجديد، نفّذ:**
```powershell
# الانتقال لمجلد المشروع
cd f:\666666\6666-main

# حذف ملف PID القديم (إن وجد)
$pidFile = "C:\Program Files\PostgreSQL\16\data\postmaster.pid"
if (Test-Path $pidFile) {
    Remove-Item $pidFile -Force
    Write-Host "Deleted stale PID file"
}

# تشغيل PostgreSQL 16
Start-Service -Name "postgresql-x64-16"

# التحقق من الحالة
Start-Sleep -Seconds 5
Get-Service -Name "postgresql-x64-16" | Select-Object Name, Status

# فحص قاعدة البيانات
pnpm tsx check-postgres16-database.ts
```

---

### **الطريقة 2: استخدام Services Manager**

1. **اضغط `Win + R`** واكتب: `services.msc`

2. **ابحث عن:** `postgresql-x64-16 - PostgreSQL Server 16`

3. **انقر بزر الماوس الأيمن** واختر **"Start"**

---

### **الطريقة 3: استخدام Command Prompt كمدير**

1. **اضغط `Win + X`** واختر **"Command Prompt (Admin)"**

2. **نفّذ:**
```cmd
net start postgresql-x64-16
```

---

## 🔍 **التحقق من التشغيل:**

بعد تشغيل PostgreSQL 16، تحقق من الحالة:

```powershell
# التحقق من حالة الخدمة
Get-Service -Name "postgresql-x64-16"

# التحقق من المنفذ
netstat -ano | findstr ":5432"

# فحص قاعدة البيانات
cd f:\666666\6666-main
pnpm tsx check-postgres16-database.ts
```

---

## 🐛 **استكشاف الأخطاء:**

### **إذا فشل التشغيل:**

1. **فحص سجلات الأخطاء:**
```powershell
# فحص Event Viewer
Get-EventLog -LogName Application -Source "PostgreSQL" -Newest 10 | Where-Object {$_.EntryType -eq "Error"} | Format-List
```

2. **فحص ملفات السجلات:**
```
C:\Program Files\PostgreSQL\16\data\log\
```

3. **التحقق من ملف postgresql.conf:**
```powershell
# التأكد من أن الملف موجود
Test-Path "C:\Program Files\PostgreSQL\16\data\postgresql.conf"
```

4. **فحص ملف pg_hba.conf:**
```powershell
# التأكد من صلاحيات الاتصال
Get-Content "C:\Program Files\PostgreSQL\16\data\pg_hba.conf" | Select-String "localhost"
```

---

## 💡 **ملاحظات مهمة:**

1. **PostgreSQL 16 يستخدم المنفذ 5432** (الافتراضي)
2. **PostgreSQL 18 يستخدم المنفذ 5433**
3. **يمكن تشغيل كلا الإصدارين في نفس الوقت** (على منافذ مختلفة)

---

## ✅ **بعد التشغيل الناجح:**

إذا تم تشغيل PostgreSQL 16 بنجاح:

```powershell
# تحديث ملف .env لاستخدام PostgreSQL 16
cd f:\666666\6666-main

# فحص قاعدة البيانات الأصلية
pnpm tsx check-postgres16-database.ts

# إذا كانت قاعدة البيانات موجودة مع البيانات، قم بتحديث DATABASE_URL:
# DATABASE_URL=postgresql://postgres:774424555@localhost:5432/666666
```

---

**تم إنشاء الدليل:** الجمعة، 10 يناير 2026
