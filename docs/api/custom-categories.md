# 📚 API التصنيفات (Custom Categories)

## نظرة عامة

إدارة تصنيفات الإيرادات والمصروفات.

## Endpoints

### 1. قائمة التصنيفات

```
GET /api/trpc/customSystem.expenseCategories.list
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| businessId | number | ✅ | معرف الشركة |
| subSystemId | number | ❌ | معرف النظام الفرعي |
| categoryType | string | ❌ | نوع التصنيف (income, expense, both) |
| parentId | number | ❌ | معرف التصنيف الأب |
| isActive | boolean | ❌ | حالة النشاط |

### 2. إنشاء تصنيف جديد

```
POST /api/trpc/customSystem.expenseCategories.create
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| businessId | number | ✅ | معرف الشركة |
| subSystemId | number | ❌ | معرف النظام الفرعي |
| code | string | ✅ | كود التصنيف |
| nameAr | string | ✅ | الاسم بالعربية |
| nameEn | string | ❌ | الاسم بالإنجليزية |
| categoryType | string | ✅ | نوع التصنيف (income, expense, both) |
| parentId | number | ❌ | معرف التصنيف الأب |
| level | number | ❌ | المستوى في الشجرة |
| color | string | ❌ | اللون |
| icon | string | ❌ | الأيقونة |
| description | string | ❌ | الوصف |
| linkedAccountId | number | ❌ | الحساب المرتبط |

### 3. تحديث تصنيف

```
POST /api/trpc/customSystem.expenseCategories.update
```

**المعاملات:**
نفس معاملات الإنشاء + `id` (معرف التصنيف)

### 4. حذف تصنيف

```
POST /api/trpc/customSystem.expenseCategories.delete
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| id | number | ✅ | معرف التصنيف |

### 5. الحصول على شجرة التصنيفات

```
GET /api/trpc/customSystem.expenseCategories.getTree
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| businessId | number | ✅ | معرف الشركة |
| categoryType | string | ❌ | نوع التصنيف (income, expense, both) |
