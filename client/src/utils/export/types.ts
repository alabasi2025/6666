/**
 * @fileoverview أنواع TypeScript لأدوات التصدير
 * @description يحتوي هذا الملف على جميع الأنواع والواجهات المستخدمة في أدوات التصدير
 */

/**
 * تنسيقات التصدير المدعومة
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json' | 'clipboard';

/**
 * حالة عملية التصدير
 */
export type ExportStatus = 'idle' | 'preparing' | 'exporting' | 'success' | 'error';

/**
 * اتجاه النص في التصدير
 */
export type TextDirection = 'ltr' | 'rtl';

/**
 * محاذاة النص في الأعمدة
 */
export type TextAlignment = 'left' | 'center' | 'right';

/**
 * نوع بيانات العمود
 */
export type ColumnDataType = 'string' | 'number' | 'date' | 'boolean' | 'currency';

/**
 * تعريف العمود للتصدير
 */
export interface ExportColumn {
  /** معرف العمود الفريد */
  key: string;
  /** عنوان العمود للعرض */
  header: string;
  /** عرض العمود (بالبكسل أو النسبة المئوية) */
  width?: number | string;
  /** نوع بيانات العمود */
  dataType?: ColumnDataType;
  /** محاذاة النص */
  alignment?: TextAlignment;
  /** دالة تنسيق القيمة */
  formatter?: (value: unknown, row: Record<string, unknown>) => string;
  /** إخفاء العمود في التصدير */
  hidden?: boolean;
}

/**
 * خيارات التصدير الأساسية
 */
export interface BaseExportOptions {
  /** اسم الملف (بدون الامتداد) */
  filename: string;
  /** عنوان التقرير */
  title?: string;
  /** وصف التقرير */
  description?: string;
  /** اتجاه النص */
  direction?: TextDirection;
  /** تضمين التاريخ والوقت في اسم الملف */
  includeTimestamp?: boolean;
  /** تضمين رأس الصفحة */
  includeHeader?: boolean;
  /** تضمين تذييل الصفحة */
  includeFooter?: boolean;
  /** نص التذييل المخصص */
  footerText?: string;
}

/**
 * خيارات تصدير CSV
 */
export interface CSVExportOptions extends BaseExportOptions {
  /** الفاصل بين الأعمدة */
  delimiter?: ',' | ';' | '\t' | '|';
  /** تضمين BOM للتوافق مع Excel */
  includeBOM?: boolean;
  /** ترميز الملف */
  encoding?: 'utf-8' | 'utf-16';
  /** حرف الاقتباس للنصوص */
  quoteChar?: '"' | "'";
  /** تضمين صف الرؤوس */
  includeHeaders?: boolean;
  /** نهاية السطر */
  lineEnding?: '\n' | '\r\n';
}

/**
 * خيارات تصدير Excel
 */
export interface ExcelExportOptions extends BaseExportOptions {
  /** اسم ورقة العمل */
  sheetName?: string;
  /** تجميد الصف الأول (الرؤوس) */
  freezeHeader?: boolean;
  /** تطبيق التصفية التلقائية */
  autoFilter?: boolean;
  /** ضبط عرض الأعمدة تلقائياً */
  autoWidth?: boolean;
  /** لون خلفية الرؤوس */
  headerBackgroundColor?: string;
  /** لون نص الرؤوس */
  headerTextColor?: string;
  /** تطبيق حدود الخلايا */
  borders?: boolean;
  /** تطبيق ألوان متناوبة للصفوف */
  alternateRowColors?: boolean;
}

/**
 * خيارات تصدير PDF
 */
export interface PDFExportOptions extends BaseExportOptions {
  /** اتجاه الصفحة */
  orientation?: 'portrait' | 'landscape';
  /** حجم الصفحة */
  pageSize?: 'A4' | 'A3' | 'Letter' | 'Legal';
  /** هوامش الصفحة (بالمليمتر) */
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  /** حجم الخط */
  fontSize?: number;
  /** نوع الخط */
  fontFamily?: string;
  /** تضمين أرقام الصفحات */
  pageNumbers?: boolean;
  /** تضمين شعار الشركة */
  logo?: string;
  /** لون الرؤوس */
  headerColor?: string;
  /** تضمين خطوط الجدول */
  tableLines?: boolean;
}

/**
 * خيارات تصدير JSON
 */
export interface JSONExportOptions extends BaseExportOptions {
  /** تنسيق JSON بمسافات بادئة */
  pretty?: boolean;
  /** عدد المسافات للمسافة البادئة */
  indentSpaces?: number;
  /** تضمين البيانات الوصفية */
  includeMetadata?: boolean;
  /** تضمين الطابع الزمني للتصدير */
  includeExportTimestamp?: boolean;
}

/**
 * خيارات النسخ للحافظة
 */
export interface ClipboardExportOptions extends BaseExportOptions {
  /** تنسيق النسخ */
  format?: 'text' | 'html' | 'json';
  /** الفاصل بين الأعمدة (للنص) */
  columnSeparator?: '\t' | ',' | '|';
  /** الفاصل بين الصفوف */
  rowSeparator?: '\n' | '\r\n';
  /** تضمين الرؤوس */
  includeHeaders?: boolean;
}

/**
 * نتيجة عملية التصدير
 */
export interface ExportResult {
  /** نجاح العملية */
  success: boolean;
  /** رسالة النتيجة */
  message: string;
  /** اسم الملف المُصدَّر */
  filename?: string;
  /** حجم الملف بالبايت */
  fileSize?: number;
  /** عدد الصفوف المُصدَّرة */
  rowCount?: number;
  /** مدة التصدير بالمللي ثانية */
  duration?: number;
  /** رسالة الخطأ (في حالة الفشل) */
  error?: string;
}

/**
 * بيانات التصدير
 */
export interface ExportData<T = Record<string, unknown>> {
  /** الأعمدة */
  columns: ExportColumn[];
  /** الصفوف */
  rows: T[];
  /** البيانات الوصفية */
  metadata?: {
    /** عنوان التقرير */
    title?: string;
    /** وصف التقرير */
    description?: string;
    /** تاريخ الإنشاء */
    createdAt?: Date;
    /** اسم المستخدم */
    createdBy?: string;
    /** بيانات إضافية */
    extra?: Record<string, unknown>;
  };
}

/**
 * إعدادات التصدير الافتراضية
 */
export interface ExportDefaults {
  /** الخيارات الافتراضية لـ CSV */
  csv: Partial<CSVExportOptions>;
  /** الخيارات الافتراضية لـ Excel */
  excel: Partial<ExcelExportOptions>;
  /** الخيارات الافتراضية لـ PDF */
  pdf: Partial<PDFExportOptions>;
  /** الخيارات الافتراضية لـ JSON */
  json: Partial<JSONExportOptions>;
  /** الخيارات الافتراضية للحافظة */
  clipboard: Partial<ClipboardExportOptions>;
}

/**
 * معالج أحداث التصدير
 */
export interface ExportEventHandlers {
  /** عند بدء التصدير */
  onStart?: () => void;
  /** عند تقدم التصدير */
  onProgress?: (progress: number) => void;
  /** عند نجاح التصدير */
  onSuccess?: (result: ExportResult) => void;
  /** عند فشل التصدير */
  onError?: (error: Error) => void;
  /** عند اكتمال التصدير (نجاح أو فشل) */
  onComplete?: () => void;
}

/**
 * خيارات المُصدِّر العامة
 */
export type ExporterOptions<T extends BaseExportOptions = BaseExportOptions> = T & ExportEventHandlers;

/**
 * واجهة المُصدِّر الأساسية
 */
export interface Exporter<T extends BaseExportOptions = BaseExportOptions> {
  /** تصدير البيانات */
  export(data: ExportData, options: ExporterOptions<T>): Promise<ExportResult>;
  /** التحقق من صحة البيانات */
  validate(data: ExportData): boolean;
  /** الحصول على التنسيق المدعوم */
  getFormat(): ExportFormat;
}
