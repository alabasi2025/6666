# دليل إضافة زر المعلومات للشاشات
# Engine Info Dialog Guide

## نظرة عامة

تم إضافة نظام موحد لعرض معلومات تفصيلية عن كل شاشة من شاشات المحركات. هذا النظام يتضمن:
- زر معلومات في كل شاشة
- نافذة منبثقة تعرض معلومات شاملة
- معلومات عن: العملية، الآلية، الشاشات المرتبطة، Business Logic

---

## المكون الأساسي

**الموقع:** `client/src/components/engines/EngineInfoDialog.tsx`

هذا المكون قابل لإعادة الاستخدام ويمكن استخدامه في أي شاشة.

---

## كيفية الاستخدام

### 1. استيراد المكون

```typescript
import EngineInfoDialog, { EngineInfo } from "@/components/engines/EngineInfoDialog";
```

### 2. تعريف معلومات الشاشة

```typescript
const MY_SCREEN_INFO: EngineInfo = {
  title: "عنوان الشاشة",
  description: "وصف مختصر للشاشة",
  process: `وصف تفصيلي لعملية الشاشة:
- ما يمكن للمستخدم فعله
- الوظائف المتاحة
- الإجراءات الممكنة`,
  mechanism: `آلية عمل الشاشة خطوة بخطوة:
1. الخطوة الأولى
2. الخطوة الثانية
3. ...`,
  relatedScreens: [
    {
      name: "اسم الشاشة المرتبطة",
      path: "/dashboard/path/to/screen",
      description: "وصف العلاقة"
    },
    // المزيد من الشاشات...
  ],
  businessLogic: `وصف Business Logic:
- كيف يعمل النظام في الخلفية
- القواعد والأولويات
- الفوائد والنتائج`
};
```

### 3. إضافة الزر في الشاشة

```typescript
<div className="flex items-center justify-between">
  <div>
    <h1>عنوان الشاشة</h1>
    <p>وصف الشاشة</p>
  </div>
  <EngineInfoDialog info={MY_SCREEN_INFO} />
</div>
```

---

## مثال كامل

```typescript
import EngineInfoDialog, { EngineInfo } from "@/components/engines/EngineInfoDialog";

const EXAMPLE_SCREEN_INFO: EngineInfo = {
  title: "شاشة المثال",
  description: "وصف مختصر للشاشة",
  process: `هذه الشاشة تتيح للمستخدم:
- عرض البيانات
- إضافة سجلات جديدة
- تعديل السجلات الموجودة
- حذف السجلات`,
  mechanism: `1. عند تحميل الصفحة، يتم جلب البيانات من API
2. يتم عرض البيانات في جدول
3. يمكن للمستخدم استخدام الفلاتر للبحث
4. عند النقر على "إضافة"، يتم فتح نموذج
5. يتم حفظ البيانات عبر API`,
  relatedScreens: [
    {
      name: "الشاشة المرتبطة 1",
      path: "/dashboard/related/screen1",
      description: "عرض البيانات المرتبطة"
    },
    {
      name: "الشاشة المرتبطة 2",
      path: "/dashboard/related/screen2",
      description: "إدارة الإعدادات"
    }
  ],
  businessLogic: `Business Logic يعمل كالتالي:

1. القاعدة الأولى:
   - الشرح التفصيلي
   - الأمثلة

2. القاعدة الثانية:
   - الشرح التفصيلي
   - الأمثلة

3. الفوائد:
   - الفائدة الأولى
   - الفائدة الثانية`
};

export default function ExampleScreen() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">شاشة المثال</h1>
          <p className="text-muted-foreground mt-2">وصف الشاشة</p>
        </div>
        <EngineInfoDialog info={EXAMPLE_SCREEN_INFO} />
      </div>
      {/* باقي محتوى الشاشة */}
    </div>
  );
}
```

---

## الشاشات المكتملة

تم إضافة زر المعلومات للشاشات التالية:

1. ✅ **محرك القيود المحاسبية** (`AutoJournalEngine.tsx`)
2. ✅ **محرك التسعير** (`PricingEngine.tsx`)
3. ✅ **محرك التسوية** (`ReconciliationEngine.tsx`)
4. ✅ **محرك الجدولة** (`SchedulingEngine.tsx`)
5. ✅ **محرك الإسناد** (`AssignmentEngine.tsx`)
6. ✅ **فحص الصحة** (`HealthCheck.tsx`)

---

## معايير كتابة المعلومات

### 1. العنوان (Title)
- يجب أن يكون واضحاً ومختصراً
- يطابق عنوان الشاشة

### 2. الوصف (Description)
- وصف مختصر في سطر أو سطرين
- يوضح الغرض الرئيسي من الشاشة

### 3. العملية (Process)
- قائمة بما يمكن للمستخدم فعله
- استخدام نقاط واضحة
- التركيز على الوظائف الرئيسية

### 4. الآلية (Mechanism)
- خطوات واضحة ومرقمة
- شرح تفصيلي لكيفية عمل الشاشة
- من البداية حتى النهاية

### 5. الشاشات المرتبطة (Related Screens)
- جميع الشاشات التي لها علاقة
- المسار الصحيح لكل شاشة
- وصف العلاقة

### 6. Business Logic
- شرح كيف يعمل النظام في الخلفية
- القواعد والأولويات
- الفوائد والنتائج
- استخدام نقاط مرقمة للوضوح

---

## أفضل الممارسات

1. **الوضوح**: استخدم لغة واضحة ومباشرة
2. **التفصيل**: قدم معلومات كافية لكن دون إفراط
3. **التنظيم**: استخدم نقاط مرقمة للقوائم
4. **الدقة**: تأكد من صحة المسارات والأسماء
5. **التحديث**: قم بتحديث المعلومات عند تغيير الشاشة

---

## ملاحظات مهمة

- زر المعلومات يجب أن يكون في نفس السطر مع عنوان الشاشة
- استخدم `flex items-center justify-between` للتخطيط
- يمكن إضافة أزرار أخرى بجانب زر المعلومات
- المكون يدعم RTL (من اليمين لليسار) تلقائياً

---

## الدعم

لأي استفسارات أو مشاكل، راجع:
- ملف المكون: `client/src/components/engines/EngineInfoDialog.tsx`
- أمثلة الاستخدام في شاشات المحركات


