# توثيق API - نظام إدارة الطاقة

## نظرة عامة

هذا النظام يستخدم **tRPC** للتواصل بين العميل والخادم، مما يوفر type-safety كامل.

## Base URL

```
/api/trpc
```

## المصادقة

جميع الـ endpoints تتطلب مصادقة باستثناء:
- `auth.login`
- `auth.register`
- `auth.logout`

## Rate Limiting

| Endpoint | الحد الأقصى | الفترة |
|----------|-------------|--------|
| auth.login | 10 طلبات | 15 دقيقة |
| auth.register | 10 طلبات | 15 دقيقة |
| جميع الـ API | 100 طلب | دقيقة |

---

## 1. المصادقة (Auth)

### تسجيل الدخول
```typescript
auth.login.mutate({
  email: string,
  password: string
})
```

### تسجيل مستخدم جديد
```typescript
auth.register.mutate({
  email: string,
  password: string,
  name: string,
  phone?: string
})
```

### تسجيل الخروج
```typescript
auth.logout.mutate()
```

### الحصول على المستخدم الحالي
```typescript
auth.me.query()
```

---

## 2. المستخدمين (Users)

### قائمة المستخدمين
```typescript
users.list.query({ businessId: number })
```

### الحصول على مستخدم
```typescript
users.getById.query({ id: number })
```

### إنشاء مستخدم
```typescript
users.create.mutate({
  businessId: number,
  name: string,
  email: string,
  role: string,
  phone?: string
})
```

### تحديث مستخدم
```typescript
users.update.mutate({
  id: number,
  data: { name?, email?, role?, phone? }
})
```

### حذف مستخدم
```typescript
users.delete.mutate({ id: number })
```

---

## 3. العملاء (Customers)

### قائمة العملاء
```typescript
customers.list.query({
  businessId: number,
  status?: string,
  search?: string
})
```

### الحصول على عميل
```typescript
customers.getById.query({ id: number })
```

### إنشاء عميل
```typescript
customers.create.mutate({
  businessId: number,
  accountNumber: string,
  nameAr: string,
  nameEn?: string,
  phone?: string,
  email?: string,
  address?: string,
  meterNumber?: string,
  status?: string
})
```

### تحديث عميل
```typescript
customers.update.mutate({
  id: number,
  data: { ... }
})
```

### حذف عميل
```typescript
customers.delete.mutate({ id: number })
```

---

## 4. الفواتير (Invoices)

### قائمة الفواتير
```typescript
invoices.list.query({
  businessId: number,
  customerId?: number,
  status?: string,
  fromDate?: string,
  toDate?: string
})
```

### الحصول على فاتورة
```typescript
invoices.getById.query({ id: number })
```

### إنشاء فاتورة
```typescript
invoices.create.mutate({
  businessId: number,
  customerId: number,
  invoiceNumber: string,
  invoiceDate: string,
  dueDate: string,
  totalAmount: string,
  status?: string
})
```

### تحديث فاتورة
```typescript
invoices.update.mutate({
  id: number,
  data: { ... }
})
```

### حذف فاتورة
```typescript
invoices.delete.mutate({ id: number })
```

---

## 5. الأصول (Assets)

### قائمة الأصول
```typescript
assets.list.query({
  businessId: number,
  categoryId?: number,
  status?: string
})
```

### الحصول على أصل
```typescript
assets.getById.query({ id: number })
```

### إنشاء أصل
```typescript
assets.create.mutate({
  businessId: number,
  categoryId: number,
  nameAr: string,
  nameEn?: string,
  code: string,
  purchaseDate?: string,
  purchasePrice?: string,
  currentValue?: string,
  status?: string
})
```

### تحديث أصل
```typescript
assets.update.mutate({
  id: number,
  data: { ... }
})
```

### حذف أصل
```typescript
assets.delete.mutate({ id: number })
```

---

## 6. أوامر العمل (Work Orders)

### قائمة أوامر العمل
```typescript
maintenance.workOrders.list.query({
  businessId: number,
  status?: string,
  type?: string,
  assigneeId?: number
})
```

### الحصول على أمر عمل
```typescript
maintenance.workOrders.getById.query({ id: number })
```

### إنشاء أمر عمل
```typescript
maintenance.workOrders.create.mutate({
  businessId: number,
  title: string,
  description?: string,
  type: string,
  priority?: string,
  assetId?: number,
  assigneeId?: number,
  scheduledDate?: string
})
```

### تحديث حالة أمر العمل
```typescript
maintenance.workOrders.updateStatus.mutate({
  id: number,
  status: string,
  notes?: string
})
```

---

## 7. المخزون (Inventory)

### قائمة الأصناف
```typescript
inventory.items.list.query({
  businessId: number,
  warehouseId?: number,
  categoryId?: number
})
```

### الحصول على صنف
```typescript
inventory.items.getById.query({ id: number })
```

### إنشاء صنف
```typescript
inventory.items.create.mutate({
  businessId: number,
  code: string,
  nameAr: string,
  nameEn?: string,
  categoryId?: number,
  unit: string,
  quantity: number,
  minQuantity?: number,
  unitPrice?: string
})
```

---

## 8. الموظفين (HR)

### قائمة الموظفين
```typescript
hr.employees.list.query({
  businessId: number,
  departmentId?: number,
  status?: string
})
```

### الحصول على موظف
```typescript
hr.employees.getById.query({ id: number })
```

### إنشاء موظف
```typescript
hr.employees.create.mutate({
  businessId: number,
  employeeNumber: string,
  nameAr: string,
  nameEn?: string,
  departmentId?: number,
  positionId?: number,
  hireDate?: string,
  email?: string,
  phone?: string
})
```

---

## 9. المشاريع (Projects)

### قائمة المشاريع
```typescript
projects.list.query({
  businessId: number,
  status?: string
})
```

### الحصول على مشروع
```typescript
projects.getById.query({ id: number })
```

### إنشاء مشروع
```typescript
projects.create.mutate({
  businessId: number,
  code: string,
  nameAr: string,
  nameEn?: string,
  description?: string,
  startDate?: string,
  endDate?: string,
  budget?: string,
  status?: string
})
```

---

## 10. SCADA

### قائمة المعدات
```typescript
scada.equipment.list.query({
  businessId: number,
  stationId?: number,
  type?: string
})
```

### قائمة المستشعرات
```typescript
scada.sensors.list.query({
  businessId: number,
  stationId?: number
})
```

### قائمة التنبيهات
```typescript
scada.alerts.list.query({
  businessId: number,
  status?: string
})
```

### الاعتراف بتنبيه
```typescript
scada.alerts.acknowledge.mutate({
  id: number
})
```

---

## 11. Health Checks

### فحص الصحة الكامل
```
GET /health
```

**الاستجابة:**
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "checks": {
    "database": { "status": "pass", "message": "..." },
    "memory": { "status": "pass", "message": "..." },
    "disk": { "status": "pass", "message": "..." }
  }
}
```

### فحص Liveness
```
GET /health/live
```

### فحص Readiness
```
GET /health/ready
```

### المقاييس
```
GET /metrics
```

---

## أكواد الخطأ

| الكود | الوصف |
|-------|-------|
| 400 | طلب غير صالح |
| 401 | غير مصرح |
| 403 | ممنوع |
| 404 | غير موجود |
| 429 | تجاوز الحد المسموح |
| 500 | خطأ في الخادم |

---

## أمثلة الاستخدام

### React Query مع tRPC

```typescript
import { trpc } from "@/lib/trpc";

// جلب البيانات
const { data: customers } = trpc.customers.list.useQuery({
  businessId: 1
});

// إنشاء بيانات
const createCustomer = trpc.customers.create.useMutation();
await createCustomer.mutateAsync({
  businessId: 1,
  accountNumber: "ACC001",
  nameAr: "عميل جديد"
});
```

---

## الإصدار

**الإصدار الحالي:** 1.0.0

**آخر تحديث:** ديسمبر 2024
