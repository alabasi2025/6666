# تحليل إعادة هيكلة نظام الديزل

## الهيكل الحالي

### 1. إدارة الأصول (assets)
| العنصر | المسار |
|--------|--------|
| قائمة الأصول | /dashboard/assets |
| فئات الأصول | /dashboard/assets/categories |
| حركات الأصول | /dashboard/assets/movements |
| الإهلاك | /dashboard/assets/depreciation |

### 2. المخزون والمشتريات (inventory)
| العنصر | المسار |
|--------|--------|
| المستودعات | /dashboard/inventory/warehouses |
| الأصناف | /dashboard/inventory/items |
| الحركات | /dashboard/inventory/movements |
| أرصدة المخزون | /dashboard/inventory/stock-balance |
| الموردين | /dashboard/inventory/suppliers |
| أوامر الشراء | /dashboard/inventory/purchase-orders |

### 3. العمليات الميدانية (fieldops)
| العنصر | المسار |
|--------|--------|
| لوحة التحكم | /dashboard/fieldops/dashboard |
| العمليات | /dashboard/fieldops/operations |
| الفرق | /dashboard/fieldops/teams |
| العمال | /dashboard/fieldops/workers |
| المعدات | /dashboard/fieldops/equipment |

### 4. إدارة الديزل (diesel) - سيتم حذفه
| العنصر | المسار |
|--------|--------|
| الوايتات | /dashboard/diesel/tankers |
| الخزانات | /dashboard/diesel/tanks |
| مهام الاستلام | /dashboard/diesel/receiving |

---

## خطة إعادة الهيكلة المقترحة

### 1. نقل الخزانات إلى إدارة الأصول
- **من:** /dashboard/diesel/tanks
- **إلى:** /dashboard/assets/tanks
- **الاسم:** خزانات الديزل

### 2. نقل الوايتات إلى المخزون والمشتريات
- **من:** /dashboard/diesel/tankers
- **إلى:** /dashboard/inventory/transport أو /dashboard/inventory/tankers
- **الاسم:** النقل (أو الوايتات)

### 3. نقل مهام الاستلام إلى العمليات الميدانية
- **من:** /dashboard/diesel/receiving
- **إلى:** /dashboard/fieldops/diesel-receiving
- **الاسم:** مهام استلام الديزل

### 4. حذف قسم إدارة الديزل بالكامل

---

## الملفات المتأثرة
1. `client/src/pages/Dashboard.tsx` - القائمة الجانبية والـ routes
2. `client/src/pages/diesel/DieselTankers.tsx` - صفحة الوايتات
3. `client/src/pages/diesel/DieselTanks.tsx` - صفحة الخزانات
4. `client/src/pages/diesel/DieselReceivingTasks.tsx` - صفحة مهام الاستلام
