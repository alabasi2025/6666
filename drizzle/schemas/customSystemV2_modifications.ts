/**
 * التعديلات على الجداول الموجودة في النظام المخصص v2.2.0
 * 
 * هذا الملف يوثق التعديلات المطلوبة على الجداول الموجودة
 * سيتم تطبيقها عبر migration script
 */

/**
 * التعديلات على جدول customAccounts:
 * 
 * 1. إضافة حقل accountSubTypeId (النوع الفرعي للحساب)
 * 2. إضافة حقل allowMultipleCurrencies (السماح بعملات متعددة)
 * 3. إضافة حقل defaultCurrencyId (العملة الافتراضية)
 * 4. إضافة حقل requiresParty (يتطلب طرف)
 * 5. إضافة حقل partyId (الطرف المرتبط)
 * 6. إزالة حقل balance (سيتم حسابه من customAccountBalances)
 * 7. إزالة حقل currency (سيتم استخدام customAccountCurrencies)
 * 8. إضافة indexes جديدة
 * 
 * الحقول الجديدة:
 * - accountSubTypeId: int (nullable) - النوع الفرعي
 * - allowMultipleCurrencies: boolean (default false) - السماح بعملات متعددة
 * - defaultCurrencyId: int (nullable) - العملة الافتراضية
 * - requiresParty: boolean (default false) - يتطلب طرف
 * - partyId: int (nullable) - الطرف المرتبط
 * 
 * Indexes الجديدة:
 * - ca_account_sub_type_idx on accountSubTypeId
 * - ca_default_currency_idx on defaultCurrencyId
 * - ca_party_idx on partyId
 */

/**
 * التعديلات على جدول customSubSystems:
 * 
 * 1. إضافة حقل defaultCurrencyId (العملة الافتراضية للنظام الفرعي)
 * 2. إضافة حقل allowMultipleCurrencies (السماح بعملات متعددة)
 * 3. إضافة حقل fiscalYearStart (بداية السنة المالية)
 * 4. إضافة حقل fiscalYearEnd (نهاية السنة المالية)
 * 
 * الحقول الجديدة:
 * - defaultCurrencyId: int (nullable) - العملة الافتراضية
 * - allowMultipleCurrencies: boolean (default false) - السماح بعملات متعددة
 * - fiscalYearStart: date (nullable) - بداية السنة المالية
 * - fiscalYearEnd: date (nullable) - نهاية السنة المالية
 * 
 * Indexes الجديدة:
 * - css_default_currency_idx on defaultCurrencyId
 */

/**
 * التعديلات على جدول customReceipts (سندات القبض):
 * 
 * 1. إضافة حقل currencyId (العملة)
 * 2. إضافة حقل exchangeRate (سعر الصرف)
 * 3. إضافة حقل amountInBaseCurrency (المبلغ بالعملة الأساسية)
 * 4. إضافة حقل journalEntryId (معرف القيد اليومي المرتبط)
 * 5. إزالة حقل currency (سيتم استخدام currencyId)
 * 
 * الحقول الجديدة:
 * - currencyId: int (not null) - العملة
 * - exchangeRate: decimal(18,6) (default 1.000000) - سعر الصرف
 * - amountInBaseCurrency: decimal(18,2) (not null) - المبلغ بالعملة الأساسية
 * - journalEntryId: int (nullable) - معرف القيد اليومي
 * 
 * Indexes الجديدة:
 * - cr_currency_idx on currencyId
 * - cr_journal_entry_idx on journalEntryId
 */

/**
 * التعديلات على جدول customPayments (سندات الصرف):
 * 
 * نفس التعديلات على customReceipts:
 * 1. إضافة حقل currencyId
 * 2. إضافة حقل exchangeRate
 * 3. إضافة حقل amountInBaseCurrency
 * 4. إضافة حقل journalEntryId
 * 5. إزالة حقل currency
 * 
 * الحقول الجديدة:
 * - currencyId: int (not null)
 * - exchangeRate: decimal(18,6) (default 1.000000)
 * - amountInBaseCurrency: decimal(18,2) (not null)
 * - journalEntryId: int (nullable)
 * 
 * Indexes الجديدة:
 * - cp_currency_idx on currencyId
 * - cp_journal_entry_idx on journalEntryId
 */

/**
 * الجداول المطلوب حذفها:
 * 
 * 1. customTransactions - سيتم استبدالها بـ customJournalEntries و customJournalEntryLines
 * 2. customTreasuries - سيتم استبدالها بحسابات تفصيلية في customAccounts
 * 3. customTreasuryMovements - سيتم استبدالها بـ customJournalEntries
 * 
 * ملاحظة: يجب التأكد من عدم وجود بيانات في هذه الجداول قبل الحذف
 */

export const modificationsDocumentation = {
  version: "2.2.0",
  date: "2025-12-28",
  description: "التعديلات الجذرية على النظام المخصص لدعم القيد المزدوج والعملات المتعددة",
  
  modifiedTables: [
    "customAccounts",
    "customSubSystems",
    "customReceipts",
    "customPayments",
  ],
  
  deletedTables: [
    "customTransactions",
    "customTreasuries",
    "customTreasuryMovements",
  ],
  
  newTables: [
    "customCurrencies",
    "customExchangeRates",
    "customAccountSubTypes",
    "customAccountCurrencies",
    "customAccountBalances",
    "customJournalEntries",
    "customJournalEntryLines",
  ],
};
