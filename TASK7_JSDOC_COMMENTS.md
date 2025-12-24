# 📋 المهمة 7: إضافة تعليقات JSDoc للـ Routers

## 🎯 الهدف
إضافة تعليقات JSDoc احترافية لجميع ملفات Router في مجلد `server/` لتحسين التوثيق وتسهيل الصيانة.

---

## 📁 الفرع
```
feature/task7-jsdoc-comments
```

---

## ✅ الملفات المسموح تعديلها (فقط)
```
server/accountingRouter.ts
server/assetsRouter.ts
server/billingRouter.ts
server/customSystemRouter.ts
server/dieselRouter.ts
server/fieldOperationsRouter.ts
server/hrRouter.ts
server/inventoryRouter.ts
server/maintenanceRouter.ts
server/projectsRouter.ts
server/scadaRouter.ts
```

---

## 🚫 الملفات الممنوع تعديلها
```
❌ drizzle/schema.ts
❌ server/db.ts
❌ server/routers.ts
❌ client/**/*
❌ docs/**/*
❌ server/__tests__/**/*
```

---

## 📝 الخطوات التفصيلية

### الخطوة 1: استنساخ المستودع والانتقال للفرع
```bash
gh repo clone alabasi2025/6666
cd 6666
git checkout feature/task7-jsdoc-comments
git pull origin feature/task7-jsdoc-comments
```

### الخطوة 2: فهم بنية JSDoc المطلوبة

#### مثال لتعليق Router:
```typescript
/**
 * @fileoverview Router للنظام المحاسبي
 * @module accountingRouter
 * @description يوفر هذا الـ Router جميع العمليات المتعلقة بالنظام المحاسبي
 * بما في ذلك إدارة الحسابات، القيود اليومية، الموازنات، والتقارير المالية.
 * 
 * @requires drizzle-orm
 * @requires @trpc/server
 * @requires zod
 * 
 * @author فريق التطوير
 * @version 1.0.0
 * @since 2024-01-01
 */
```

#### مثال لتعليق Procedure:
```typescript
/**
 * إنشاء حساب جديد في شجرة الحسابات
 * 
 * @procedure create
 * @description ينشئ حساب جديد في شجرة الحسابات مع التحقق من صحة البيانات
 * والتأكد من عدم تكرار رقم الحساب.
 * 
 * @param {object} input - بيانات الحساب الجديد
 * @param {number} input.businessId - معرف الشركة
 * @param {string} input.accountCode - رقم الحساب (فريد)
 * @param {string} input.accountNameAr - اسم الحساب بالعربية
 * @param {string} [input.accountNameEn] - اسم الحساب بالإنجليزية (اختياري)
 * @param {string} input.accountType - نوع الحساب (asset|liability|equity|revenue|expense)
 * @param {number} [input.parentId] - معرف الحساب الأب (اختياري)
 * 
 * @returns {Promise<Account>} الحساب المنشأ
 * 
 * @throws {TRPCError} CONFLICT - إذا كان رقم الحساب موجود مسبقاً
 * @throws {TRPCError} NOT_FOUND - إذا كان الحساب الأب غير موجود
 * 
 * @example
 * // إنشاء حساب أصول
 * const account = await trpc.accounting.create({
 *   businessId: 1,
 *   accountCode: "1101",
 *   accountNameAr: "النقدية",
 *   accountType: "asset"
 * });
 */
```

### الخطوة 3: تعديل كل ملف Router

لكل ملف Router، أضف:

1. **تعليق الملف** في البداية (fileoverview)
2. **تعليق لكل Procedure** يشمل:
   - وصف الوظيفة
   - المعاملات (@param)
   - القيمة المرجعة (@returns)
   - الأخطاء المحتملة (@throws)
   - مثال استخدام (@example)

### الخطوة 4: قائمة الـ Routers والوظائف

#### 1. accountingRouter.ts
| الوظيفة | الوصف |
|:---|:---|
| accounts.list | قائمة الحسابات |
| accounts.create | إنشاء حساب |
| accounts.update | تعديل حساب |
| accounts.delete | حذف حساب |
| entries.list | قائمة القيود |
| entries.create | إنشاء قيد |
| budgets.list | قائمة الموازنات |
| budgets.create | إنشاء موازنة |

#### 2. assetsRouter.ts
| الوظيفة | الوصف |
|:---|:---|
| list | قائمة الأصول |
| create | إنشاء أصل |
| update | تعديل أصل |
| delete | حذف أصل |
| depreciate | حساب الإهلاك |
| transfer | نقل أصل |

#### 3. billingRouter.ts
| الوظيفة | الوصف |
|:---|:---|
| invoices.list | قائمة الفواتير |
| invoices.create | إنشاء فاتورة |
| payments.list | قائمة المدفوعات |
| payments.create | تسجيل دفعة |

#### 4. customSystemRouter.ts
| الوظيفة | الوصف |
|:---|:---|
| parties.list | قائمة الأطراف |
| parties.create | إنشاء طرف |
| categories.list | قائمة التصنيفات |
| treasuries.list | قائمة الخزائن |
| vouchers.list | قائمة السندات |

#### 5-11. باقي الـ Routers
(نفس النمط لكل Router)

### الخطوة 5: التحقق من الصحة
```bash
# التحقق من عدم وجود أخطاء TypeScript
npx tsc --noEmit

# التحقق من التنسيق
npx prettier --check "server/**/*.ts"
```

### الخطوة 6: Commit والرفع
```bash
git add server/*.ts
git commit -m "docs(routers): إضافة تعليقات JSDoc شاملة لجميع الـ Routers"
git push origin feature/task7-jsdoc-comments
```

---

## 📊 معايير القبول

| المعيار | الحالة |
|:---|:---:|
| تعليق fileoverview لكل ملف | ⬜ |
| تعليق لكل procedure | ⬜ |
| @param لكل معامل | ⬜ |
| @returns للقيمة المرجعة | ⬜ |
| @throws للأخطاء | ⬜ |
| @example لكل وظيفة رئيسية | ⬜ |
| لا أخطاء TypeScript | ⬜ |
| Commit message صحيح | ⬜ |

---

## ⏱️ الوقت المتوقع
3-4 ساعات

---

## 📞 عند الانتهاء
أخبر المنسق بأن المهمة 7 جاهزة للدمج.
