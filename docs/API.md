# 📚 توثيق API

## المصادقة

جميع نقاط النهاية تتطلب مصادقة باستثناء `/api/auth/login` و `/api/auth/register`.

### تسجيل الدخول
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "0512345678",
  "password": "********"
}
```

**الاستجابة:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "nameAr": "أحمد محمد",
    "role": "admin"
  }
}
```

---

## المستخدمون

### جلب جميع المستخدمين
```http
GET /api/users
```

### جلب مستخدم بالمعرف
```http
GET /api/users/:id
```

### إنشاء مستخدم
```http
POST /api/users
Content-Type: application/json

{
  "nameAr": "أحمد محمد",
  "phone": "0512345678",
  "email": "ahmed@example.com",
  "password": "********",
  "role": "user"
}
```

### تحديث مستخدم
```http
PUT /api/users/:id
Content-Type: application/json

{
  "nameAr": "أحمد محمد المحدث"
}
```

### حذف مستخدم
```http
DELETE /api/users/:id
```

---

## الأصول

### جلب جميع الأصول
```http
GET /api/assets
```

### إنشاء أصل
```http
POST /api/assets
Content-Type: application/json

{
  "name": "مكيف سبليت",
  "category": "تكييف",
  "purchasePrice": 5000,
  "depreciationRate": 0.1
}
```

---

## الفواتير

### جلب جميع الفواتير
```http
GET /api/invoices
```

### إنشاء فاتورة
```http
POST /api/invoices
Content-Type: application/json

{
  "invoiceNumber": "INV-2024-001",
  "amount": 1500,
  "dueDate": "2024-12-31"
}
```

---

## رموز الأخطاء

| الرمز | الوصف |
|------|-------|
| 400 | طلب غير صالح |
| 401 | غير مصرح |
| 403 | غير مسموح |
| 404 | غير موجود |
| 429 | تجاوز الحد المسموح |
| 500 | خطأ في الخادم |

---

## Rate Limiting

| نقطة النهاية | الحد |
|-------------|------|
| `/api/auth/login` | 10 طلبات / 15 دقيقة |
| `/api/*` | 100 طلب / دقيقة |
