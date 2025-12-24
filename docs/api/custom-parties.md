# 📚 API الأطراف (Custom Parties)

## نظرة عامة

إدارة الأطراف (العملاء، الموردين، الموظفين، الشركاء، الجهات الحكومية).

## Endpoints

### 1. قائمة الأطراف

```
GET /api/trpc/customSystem.parties.list
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| businessId | number | ✅ | معرف الشركة |
| subSystemId | number | ❌ | معرف النظام الفرعي |
| partyType | string | ❌ | نوع الطرف (customer, supplier, employee, partner, government, other) |
| search | string | ❌ | نص البحث |
| isActive | boolean | ❌ | حالة النشاط |

**مثال الاستجابة:**
```json
{
  "result": {
    "data": [
      {
        "id": 1,
        "code": "C001",
        "nameAr": "شركة الأمل",
        "nameEn": "Al-Amal Company",
        "partyType": "customer",
        "phone": "0501234567",
        "currentBalance": "5000.00",
        "isActive": true
      }
    ]
  }
}
```

---

### 2. إنشاء طرف جديد

```
POST /api/trpc/customSystem.parties.create
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| businessId | number | ✅ | معرف الشركة |
| subSystemId | number | ❌ | معرف النظام الفرعي |
| code | string | ✅ | كود الطرف |
| nameAr | string | ✅ | الاسم بالعربية |
| nameEn | string | ❌ | الاسم بالإنجليزية |
| partyType | string | ✅ | نوع الطرف |
| phone | string | ❌ | رقم الهاتف |
| mobile | string | ❌ | رقم الجوال |
| email | string | ❌ | البريد الإلكتروني |
| city | string | ❌ | المدينة |
| country | string | ❌ | الدولة |
| address | string | ❌ | العنوان |
| taxNumber | string | ❌ | الرقم الضريبي |
| commercialRegister | string | ❌ | السجل التجاري |
| creditLimit | string | ❌ | حد الائتمان |
| currency | string | ❌ | العملة |
| contactPerson | string | ❌ | شخص الاتصال |
| notes | string | ❌ | ملاحظات |

**مثال الطلب:**
```json
{
  "businessId": 1,
  "code": "C002",
  "nameAr": "مؤسسة النور",
  "partyType": "customer",
  "phone": "0509876543"
}
```

---

### 3. تحديث طرف

```
POST /api/trpc/customSystem.parties.update
```

**المعاملات:**
نفس معاملات الإنشاء + `id` (معرف الطرف)

---

### 4. حذف طرف

```
POST /api/trpc/customSystem.parties.delete
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| id | number | ✅ | معرف الطرف |

---

### 5. الحصول على رصيد طرف

```
GET /api/trpc/customSystem.parties.getBalance
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| id | number | ✅ | معرف الطرف |

**مثال الاستجابة:**
```json
{
  "result": {
    "data": {
      "partyId": 1,
      "partyName": "شركة الأمل",
      "currentBalance": "5000.00",
      "creditLimit": "10000.00",
      "currency": "SAR"
    }
  }
}
```

---

### 6. كشف حساب طرف

```
GET /api/trpc/customSystem.parties.getStatement
```

**المعاملات:**
| المعامل | النوع | مطلوب | الوصف |
|:---|:---|:---:|:---|
| partyId | number | ✅ | معرف الطرف |
| fromDate | string | ❌ | من تاريخ |
| toDate | string | ❌ | إلى تاريخ |

**مثال الاستجابة:**
```json
{
  "result": {
    "data": [
      {
        "id": 1,
        "transactionDate": "2024-01-15",
        "transactionType": "invoice",
        "reference": "INV-001",
        "debit": "5000.00",
        "credit": "0.00",
        "balance": "5000.00"
      }
    ]
  }
}
```
