# 📚 API السندات (Custom Vouchers)

## نظرة عامة

إدارة سندات القبض والصرف.

---

## سندات القبض (Receipt Vouchers)

### 1. قائمة سندات القبض

```
GET /api/trpc/customSystem.receiptVouchers.list
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| businessId | number | ✅ | معرف الشركة |
| subSystemId | number | ❌ | معرف النظام الفرعي |
| status | string | ❌ | الحالة (draft, confirmed, cancelled) |

### 2. إنشاء سند قبض

```
POST /api/trpc/customSystem.receiptVouchers.create
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| businessId | number | ✅ | معرف الشركة |
| subSystemId | number | ❌ | معرف النظام الفرعي |
| voucherDate | string | ✅ | تاريخ السند |
| amount | string | ✅ | المبلغ |
| currency | string | ❌ | العملة |
| sourceType | string | ✅ | نوع المصدر (person, entity, intermediary, other) |
| sourceName | string | ❌ | اسم المصدر |
| sourceIntermediaryId | number | ❌ | معرف الحساب الوسيط المصدر |
| treasuryId | number | ✅ | معرف الخزينة |
| description | string | ❌ | الوصف |

### 3. تحديث سند قبض

```
POST /api/trpc/customSystem.receiptVouchers.update
```

**المعاملات:**
نفس معاملات الإنشاء + `id` (معرف السند)

### 4. تأكيد سند قبض

```
POST /api/trpc/customSystem.receiptVouchers.confirm
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| id | number | ✅ | معرف السند |

### 5. حذف سند قبض

```
POST /api/trpc/customSystem.receiptVouchers.delete
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| id | number | ✅ | معرف السند |

---

## سندات الصرف (Payment Vouchers)

### 1. قائمة سندات الصرف

```
GET /api/trpc/customSystem.paymentVouchers.list
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| businessId | number | ✅ | معرف الشركة |
| subSystemId | number | ❌ | معرف النظام الفرعي |
| status | string | ❌ | الحالة (draft, confirmed, cancelled) |

### 2. إنشاء سند صرف

```
POST /api/trpc/customSystem.paymentVouchers.create
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| businessId | number | ✅ | معرف الشركة |
| subSystemId | number | ❌ | معرف النظام الفرعي |
| voucherDate | string | ✅ | تاريخ السند |
| amount | string | ✅ | المبلغ |
| currency | string | ❌ | العملة |
| destinationType | string | ✅ | نوع الوجهة (person, entity, intermediary, other) |
| destinationName | string | ❌ | اسم الوجهة |
| destinationIntermediaryId | number | ❌ | معرف الحساب الوسيط للوجهة |
| treasuryId | number | ✅ | معرف الخزينة |
| description | string | ❌ | الوصف |

### 3. تحديث سند صرف

```
POST /api/trpc/customSystem.paymentVouchers.update
```

**المعاملات:**
نفس معاملات الإنشاء + `id` (معرف السند)

### 4. تأكيد سند صرف

```
POST /api/trpc/customSystem.paymentVouchers.confirm
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| id | number | ✅ | معرف السند |

### 5. حذف سند صرف

```
POST /api/trpc/customSystem.paymentVouchers.delete
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| id | number | ✅ | معرف السند |
