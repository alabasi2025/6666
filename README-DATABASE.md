# إعداد قاعدة البيانات

## الخطوات المطلوبة:

### 1. تشغيل MySQL من XAMPP
- افتح XAMPP Control Panel (تم فتحه تلقائياً)
- اضغط على زر "Start" بجانب MySQL
- انتظر حتى يتحول إلى اللون الأخضر

### 2. إنشاء قاعدة البيانات
بعد تشغيل MySQL، شغّل الأمر التالي:
```powershell
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS energy_management;"
```

### 3. إعداد ملف .env
ملف .env موجود بالفعل. تأكد من أنه يحتوي على:
```
DATABASE_URL=mysql://root:@localhost:3306/energy_management
DEMO_MODE=false
```

### 4. تشغيل Migrations
```bash
pnpm db:push
```

### 5. إعادة تشغيل الخادم
```bash
pnpm dev
```

## ملاحظات:
- إذا كان MySQL يحتاج كلمة مرور، غيّر DATABASE_URL إلى:
  `mysql://root:password@localhost:3306/energy_management`
- تأكد من أن MySQL يعمل قبل تشغيل migrations

