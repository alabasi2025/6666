# 📋 المهمة 9: إنشاء Validation Schemas موحدة

## 🎯 الهدف
إنشاء ملفات Zod Schemas موحدة ومركزية للتحقق من صحة البيانات في جميع أنحاء التطبيق.

---

## 📁 الفرع
```
feature/task9-validation-schemas
```

---

## ✅ الملفات المسموح إنشاؤها (فقط)
```
shared/schemas/common.ts (جديد)
shared/schemas/parties.ts (جديد)
shared/schemas/categories.ts (جديد)
shared/schemas/treasuries.ts (جديد)
shared/schemas/vouchers.ts (جديد)
shared/schemas/index.ts (جديد)
```

---

## 🚫 الملفات الممنوع تعديلها
```
❌ drizzle/schema.ts
❌ server/**/*
❌ client/**/*
❌ docs/**/*
```

---

## 📝 الخطوات التفصيلية

### الخطوة 1: استنساخ المستودع والانتقال للفرع
```bash
gh repo clone alabasi2025/6666
cd 6666
git checkout feature/task9-validation-schemas
git pull origin feature/task9-validation-schemas
mkdir -p shared/schemas
```

### الخطوة 2: إنشاء Schemas المشتركة

**الملف:** `shared/schemas/common.ts`

```typescript
/**
 * @fileoverview Schemas مشتركة للتحقق من صحة البيانات
 * @module schemas/common
 */

import { z } from "zod";

// ==================== الأنماط الأساسية ====================

/**
 * معرف رقمي موجب
 */
export const idSchema = z.number().int().positive({
  message: "المعرف يجب أن يكون رقماً صحيحاً موجباً"
});

/**
 * معرف الشركة
 */
export const businessIdSchema = z.number().int().positive({
  message: "معرف الشركة مطلوب"
});

/**
 * كود فريد (حروف وأرقام)
 */
export const codeSchema = z.string()
  .min(1, "الكود مطلوب")
  .max(50, "الكود يجب ألا يتجاوز 50 حرفاً")
  .regex(/^[a-zA-Z0-9_-]+$/, "الكود يجب أن يحتوي على حروف وأرقام فقط");

/**
 * اسم بالعربية
 */
export const nameArSchema = z.string()
  .min(2, "الاسم بالعربية يجب أن يكون حرفين على الأقل")
  .max(255, "الاسم بالعربية يجب ألا يتجاوز 255 حرفاً");

/**
 * اسم بالإنجليزية (اختياري)
 */
export const nameEnSchema = z.string()
  .max(255, "الاسم بالإنجليزية يجب ألا يتجاوز 255 حرفاً")
  .optional()
  .nullable();

/**
 * رقم هاتف
 */
export const phoneSchema = z.string()
  .regex(/^[+]?[0-9]{9,15}$/, "رقم الهاتف غير صحيح")
  .optional()
  .nullable();

/**
 * بريد إلكتروني
 */
export const emailSchema = z.string()
  .email("البريد الإلكتروني غير صحيح")
  .optional()
  .nullable();

/**
 * مبلغ مالي
 */
export const amountSchema = z.number()
  .min(0, "المبلغ يجب أن يكون صفراً أو أكثر");

/**
 * مبلغ مالي موجب (للسندات)
 */
export const positiveAmountSchema = z.number()
  .positive("المبلغ يجب أن يكون أكبر من صفر");

/**
 * نسبة مئوية
 */
export const percentageSchema = z.number()
  .min(0, "النسبة يجب أن تكون صفراً أو أكثر")
  .max(100, "النسبة يجب ألا تتجاوز 100%");

/**
 * تاريخ
 */
export const dateSchema = z.coerce.date({
  errorMap: () => ({ message: "التاريخ غير صحيح" })
});

/**
 * تاريخ اختياري
 */
export const optionalDateSchema = dateSchema.optional().nullable();

/**
 * ملاحظات
 */
export const notesSchema = z.string()
  .max(1000, "الملاحظات يجب ألا تتجاوز 1000 حرف")
  .optional()
  .nullable();

/**
 * وصف
 */
export const descriptionSchema = z.string()
  .max(500, "الوصف يجب ألا يتجاوز 500 حرف")
  .optional()
  .nullable();

/**
 * حالة نشط/غير نشط
 */
export const isActiveSchema = z.boolean().default(true);

/**
 * عملة
 */
export const currencySchema = z.enum(["SAR", "USD", "EUR", "AED", "KWD", "BHD", "OMR", "QAR"], {
  errorMap: () => ({ message: "العملة غير مدعومة" })
}).default("SAR");

// ==================== Schemas للترقيم ====================

/**
 * معاملات الترقيم (Pagination)
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * معاملات الفرز
 */
export const sortingSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * معاملات البحث
 */
export const searchSchema = z.object({
  search: z.string().optional(),
});

/**
 * معاملات القائمة الكاملة
 */
export const listParamsSchema = paginationSchema
  .merge(sortingSchema)
  .merge(searchSchema);

// ==================== Schemas للفلترة بالتاريخ ====================

/**
 * فلترة بنطاق تاريخ
 */
export const dateRangeSchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية" }
);

// ==================== أنواع TypeScript ====================

export type Id = z.infer<typeof idSchema>;
export type BusinessId = z.infer<typeof businessIdSchema>;
export type Code = z.infer<typeof codeSchema>;
export type NameAr = z.infer<typeof nameArSchema>;
export type NameEn = z.infer<typeof nameEnSchema>;
export type Phone = z.infer<typeof phoneSchema>;
export type Email = z.infer<typeof emailSchema>;
export type Amount = z.infer<typeof amountSchema>;
export type Percentage = z.infer<typeof percentageSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type ListParams = z.infer<typeof listParamsSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
```

### الخطوة 3: إنشاء Schema للأطراف

**الملف:** `shared/schemas/parties.ts`

```typescript
/**
 * @fileoverview Schemas للأطراف (العملاء، الموردين، إلخ)
 * @module schemas/parties
 */

import { z } from "zod";
import {
  idSchema,
  businessIdSchema,
  codeSchema,
  nameArSchema,
  nameEnSchema,
  phoneSchema,
  emailSchema,
  amountSchema,
  currencySchema,
  notesSchema,
  isActiveSchema,
  listParamsSchema,
} from "./common";

// ==================== الثوابت ====================

export const partyTypes = [
  "customer",
  "supplier",
  "employee",
  "partner",
  "government",
  "other",
] as const;

export const partyTypeLabels: Record<typeof partyTypes[number], string> = {
  customer: "عميل",
  supplier: "مورد",
  employee: "موظف",
  partner: "شريك",
  government: "جهة حكومية",
  other: "أخرى",
};

// ==================== Schemas ====================

/**
 * نوع الطرف
 */
export const partyTypeSchema = z.enum(partyTypes, {
  errorMap: () => ({ message: "نوع الطرف غير صحيح" })
});

/**
 * إنشاء طرف جديد
 */
export const createPartySchema = z.object({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional().nullable(),
  code: codeSchema,
  partyType: partyTypeSchema,
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  phone: phoneSchema,
  mobile: phoneSchema,
  email: emailSchema,
  contactPerson: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).default("المملكة العربية السعودية"),
  address: z.string().max(500).optional().nullable(),
  taxNumber: z.string().max(50).optional().nullable(),
  commercialRegister: z.string().max(50).optional().nullable(),
  creditLimit: amountSchema.default(0),
  currency: currencySchema,
  notes: notesSchema,
  isActive: isActiveSchema,
});

/**
 * تعديل طرف
 */
export const updatePartySchema = createPartySchema.partial().extend({
  id: idSchema,
});

/**
 * فلترة الأطراف
 */
export const filterPartiesSchema = listParamsSchema.extend({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional(),
  partyType: partyTypeSchema.optional(),
  isActive: z.boolean().optional(),
  city: z.string().optional(),
});

/**
 * الحصول على كشف حساب طرف
 */
export const partyStatementSchema = z.object({
  partyId: idSchema,
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// ==================== أنواع TypeScript ====================

export type PartyType = z.infer<typeof partyTypeSchema>;
export type CreateParty = z.infer<typeof createPartySchema>;
export type UpdateParty = z.infer<typeof updatePartySchema>;
export type FilterParties = z.infer<typeof filterPartiesSchema>;
export type PartyStatement = z.infer<typeof partyStatementSchema>;
```

### الخطوة 4: إنشاء Schema للتصنيفات

**الملف:** `shared/schemas/categories.ts`

```typescript
/**
 * @fileoverview Schemas للتصنيفات
 * @module schemas/categories
 */

import { z } from "zod";
import {
  idSchema,
  businessIdSchema,
  codeSchema,
  nameArSchema,
  nameEnSchema,
  descriptionSchema,
  isActiveSchema,
  listParamsSchema,
} from "./common";

// ==================== الثوابت ====================

export const categoryTypes = ["income", "expense", "both"] as const;

export const categoryTypeLabels: Record<typeof categoryTypes[number], string> = {
  income: "إيرادات",
  expense: "مصروفات",
  both: "مشترك",
};

// ==================== Schemas ====================

/**
 * نوع التصنيف
 */
export const categoryTypeSchema = z.enum(categoryTypes, {
  errorMap: () => ({ message: "نوع التصنيف غير صحيح" })
});

/**
 * إنشاء تصنيف جديد
 */
export const createCategorySchema = z.object({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional().nullable(),
  parentId: idSchema.optional().nullable(),
  code: codeSchema,
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  categoryType: categoryTypeSchema,
  description: descriptionSchema,
  isActive: isActiveSchema,
});

/**
 * تعديل تصنيف
 */
export const updateCategorySchema = createCategorySchema.partial().extend({
  id: idSchema,
});

/**
 * فلترة التصنيفات
 */
export const filterCategoriesSchema = listParamsSchema.extend({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional(),
  parentId: idSchema.optional().nullable(),
  categoryType: categoryTypeSchema.optional(),
  isActive: z.boolean().optional(),
});

// ==================== أنواع TypeScript ====================

export type CategoryType = z.infer<typeof categoryTypeSchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type FilterCategories = z.infer<typeof filterCategoriesSchema>;
```

### الخطوة 5: إنشاء Schema للخزائن

**الملف:** `shared/schemas/treasuries.ts`

```typescript
/**
 * @fileoverview Schemas للخزائن
 * @module schemas/treasuries
 */

import { z } from "zod";
import {
  idSchema,
  businessIdSchema,
  codeSchema,
  nameArSchema,
  nameEnSchema,
  amountSchema,
  currencySchema,
  notesSchema,
  isActiveSchema,
  listParamsSchema,
} from "./common";

// ==================== الثوابت ====================

export const treasuryTypes = ["cash", "bank", "wallet", "cashier"] as const;

export const treasuryTypeLabels: Record<typeof treasuryTypes[number], string> = {
  cash: "صندوق نقدي",
  bank: "حساب بنكي",
  wallet: "محفظة إلكترونية",
  cashier: "صراف",
};

// ==================== Schemas ====================

/**
 * نوع الخزينة
 */
export const treasuryTypeSchema = z.enum(treasuryTypes, {
  errorMap: () => ({ message: "نوع الخزينة غير صحيح" })
});

/**
 * إنشاء خزينة جديدة
 */
export const createTreasurySchema = z.object({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional().nullable(),
  code: codeSchema,
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  treasuryType: treasuryTypeSchema,
  currency: currencySchema,
  openingBalance: amountSchema.default(0),
  bankName: z.string().max(100).optional().nullable(),
  accountNumber: z.string().max(50).optional().nullable(),
  iban: z.string().max(50).optional().nullable(),
  notes: notesSchema,
  isActive: isActiveSchema,
});

/**
 * تعديل خزينة
 */
export const updateTreasurySchema = createTreasurySchema.partial().extend({
  id: idSchema,
});

/**
 * فلترة الخزائن
 */
export const filterTreasuriesSchema = listParamsSchema.extend({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional(),
  treasuryType: treasuryTypeSchema.optional(),
  isActive: z.boolean().optional(),
});

/**
 * تحويل بين الخزائن
 */
export const transferBetweenTreasuriesSchema = z.object({
  fromTreasuryId: idSchema,
  toTreasuryId: idSchema,
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  description: z.string().max(500).optional(),
  date: z.coerce.date().default(() => new Date()),
}).refine(
  (data) => data.fromTreasuryId !== data.toTreasuryId,
  { message: "لا يمكن التحويل لنفس الخزينة" }
);

// ==================== أنواع TypeScript ====================

export type TreasuryType = z.infer<typeof treasuryTypeSchema>;
export type CreateTreasury = z.infer<typeof createTreasurySchema>;
export type UpdateTreasury = z.infer<typeof updateTreasurySchema>;
export type FilterTreasuries = z.infer<typeof filterTreasuriesSchema>;
export type TransferBetweenTreasuries = z.infer<typeof transferBetweenTreasuriesSchema>;
```

### الخطوة 6: إنشاء Schema للسندات

**الملف:** `shared/schemas/vouchers.ts`

```typescript
/**
 * @fileoverview Schemas للسندات (قبض وصرف)
 * @module schemas/vouchers
 */

import { z } from "zod";
import {
  idSchema,
  businessIdSchema,
  positiveAmountSchema,
  notesSchema,
  dateSchema,
  listParamsSchema,
  dateRangeSchema,
} from "./common";

// ==================== الثوابت ====================

export const voucherTypes = ["receipt", "payment"] as const;
export const paymentMethods = ["cash", "check", "transfer", "card"] as const;

export const voucherTypeLabels: Record<typeof voucherTypes[number], string> = {
  receipt: "سند قبض",
  payment: "سند صرف",
};

export const paymentMethodLabels: Record<typeof paymentMethods[number], string> = {
  cash: "نقدي",
  check: "شيك",
  transfer: "تحويل بنكي",
  card: "بطاقة",
};

// ==================== Schemas ====================

/**
 * نوع السند
 */
export const voucherTypeSchema = z.enum(voucherTypes, {
  errorMap: () => ({ message: "نوع السند غير صحيح" })
});

/**
 * طريقة الدفع
 */
export const paymentMethodSchema = z.enum(paymentMethods, {
  errorMap: () => ({ message: "طريقة الدفع غير صحيحة" })
});

/**
 * إنشاء سند قبض
 */
export const createReceiptVoucherSchema = z.object({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional().nullable(),
  treasuryId: idSchema,
  partyId: idSchema.optional().nullable(),
  categoryId: idSchema.optional().nullable(),
  amount: positiveAmountSchema,
  paymentMethod: paymentMethodSchema.default("cash"),
  checkNumber: z.string().max(50).optional().nullable(),
  checkDate: z.coerce.date().optional().nullable(),
  checkBank: z.string().max(100).optional().nullable(),
  bankReference: z.string().max(100).optional().nullable(),
  date: dateSchema.default(() => new Date()),
  description: z.string().max(500).optional().nullable(),
  notes: notesSchema,
});

/**
 * إنشاء سند صرف
 */
export const createPaymentVoucherSchema = createReceiptVoucherSchema;

/**
 * تعديل سند
 */
export const updateVoucherSchema = createReceiptVoucherSchema.partial().extend({
  id: idSchema,
});

/**
 * فلترة السندات
 */
export const filterVouchersSchema = listParamsSchema
  .merge(dateRangeSchema)
  .extend({
    businessId: businessIdSchema,
    subSystemId: idSchema.optional(),
    treasuryId: idSchema.optional(),
    partyId: idSchema.optional(),
    categoryId: idSchema.optional(),
    paymentMethod: paymentMethodSchema.optional(),
    voucherType: voucherTypeSchema.optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
  });

// ==================== أنواع TypeScript ====================

export type VoucherType = z.infer<typeof voucherTypeSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type CreateReceiptVoucher = z.infer<typeof createReceiptVoucherSchema>;
export type CreatePaymentVoucher = z.infer<typeof createPaymentVoucherSchema>;
export type UpdateVoucher = z.infer<typeof updateVoucherSchema>;
export type FilterVouchers = z.infer<typeof filterVouchersSchema>;
```

### الخطوة 7: إنشاء ملف التصدير

**الملف:** `shared/schemas/index.ts`

```typescript
/**
 * @fileoverview تصدير جميع Schemas
 * @module schemas
 */

export * from "./common";
export * from "./parties";
export * from "./categories";
export * from "./treasuries";
export * from "./vouchers";
```

### الخطوة 8: التحقق والرفع
```bash
npx tsc --noEmit
git add shared/
git commit -m "feat(schemas): إضافة Zod Schemas موحدة للتحقق من صحة البيانات"
git push origin feature/task9-validation-schemas
```

---

## 📊 معايير القبول

| المعيار | الحالة |
|:---|:---:|
| common.ts مكتمل | ⬜ |
| parties.ts مكتمل | ⬜ |
| categories.ts مكتمل | ⬜ |
| treasuries.ts مكتمل | ⬜ |
| vouchers.ts مكتمل | ⬜ |
| index.ts للتصدير | ⬜ |
| رسائل خطأ عربية | ⬜ |
| أنواع TypeScript مصدّرة | ⬜ |
| لا أخطاء TypeScript | ⬜ |

---

## ⏱️ الوقت المتوقع
3-4 ساعات

---

## 📞 عند الانتهاء
أخبر المنسق بأن المهمة 9 جاهزة للدمج.
