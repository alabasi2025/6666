/**
 * أنواع TypeScript لمكونات الجداول المتقدمة
 * @module tables/types
 */

import { ReactNode } from "react";

/**
 * اتجاه الترتيب
 */
export type SortDirection = "asc" | "desc" | null;

/**
 * محاذاة النص في الخلية
 */
export type CellAlignment = "left" | "center" | "right";

/**
 * نوع الفلتر
 */
export type FilterType = "text" | "select" | "date" | "number" | "boolean";

/**
 * عامل المقارنة للفلترة
 */
export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "between"
  | "isEmpty"
  | "isNotEmpty";

/**
 * تعريف عمود الجدول
 */
export interface ColumnDefinition<T = any> {
  /** مفتاح العمود - يمكن أن يكون مسار متداخل مثل "user.name" */
  key: keyof T | string;
  /** عنوان العمود المعروض */
  title: string;
  /** هل يمكن ترتيب العمود */
  sortable?: boolean;
  /** هل يمكن فلترة العمود */
  filterable?: boolean;
  /** نوع الفلتر */
  filterType?: FilterType;
  /** خيارات الفلتر (للنوع select) */
  filterOptions?: FilterOption[];
  /** دالة عرض مخصصة */
  render?: (value: any, row: T, rowIndex: number) => ReactNode;
  /** عرض العمود */
  width?: string | number;
  /** الحد الأدنى للعرض */
  minWidth?: string | number;
  /** الحد الأقصى للعرض */
  maxWidth?: string | number;
  /** محاذاة المحتوى */
  align?: CellAlignment;
  /** هل العمود مخفي */
  hidden?: boolean;
  /** هل العمود ثابت */
  sticky?: "left" | "right";
  /** فئات CSS إضافية للرأس */
  headerClassName?: string;
  /** فئات CSS إضافية للخلية */
  cellClassName?: string;
  /** تلميح للعمود */
  tooltip?: string;
  /** هل يمكن تغيير حجم العمود */
  resizable?: boolean;
  /** دالة للحصول على قيمة الترتيب */
  getSortValue?: (row: T) => any;
  /** دالة للحصول على قيمة الفلترة */
  getFilterValue?: (row: T) => any;
  /** دالة للحصول على قيمة التصدير */
  getExportValue?: (row: T) => string | number;
}

/**
 * خيار الفلتر
 */
export interface FilterOption {
  /** القيمة */
  value: string | number | boolean;
  /** النص المعروض */
  label: string;
  /** أيقونة اختيارية */
  icon?: ReactNode;
}

/**
 * حالة الفلتر
 */
export interface FilterState {
  /** مفتاح العمود */
  columnKey: string;
  /** عامل المقارنة */
  operator: FilterOperator;
  /** القيمة */
  value: any;
  /** القيمة الثانية (للنطاقات) */
  value2?: any;
}

/**
 * حالة الترتيب
 */
export interface SortState {
  /** مفتاح العمود */
  columnKey: string;
  /** اتجاه الترتيب */
  direction: SortDirection;
}

/**
 * حالة التصفح
 */
export interface PaginationState {
  /** الصفحة الحالية (تبدأ من 1) */
  currentPage: number;
  /** عدد العناصر في الصفحة */
  pageSize: number;
  /** إجمالي عدد العناصر */
  totalItems: number;
  /** إجمالي عدد الصفحات */
  totalPages: number;
}

/**
 * حالة التحديد
 */
export interface SelectionState<T = any> {
  /** الصفوف المحددة */
  selectedRows: T[];
  /** مفاتيح الصفوف المحددة */
  selectedKeys: Set<string | number>;
  /** هل كل الصفوف محددة */
  isAllSelected: boolean;
  /** هل بعض الصفوف محددة */
  isPartiallySelected: boolean;
}

/**
 * خصائص جدول البيانات الأساسية
 */
export interface DataTableBaseProps<T = any> {
  /** البيانات */
  data: T[];
  /** تعريفات الأعمدة */
  columns: ColumnDefinition<T>[];
  /** دالة للحصول على معرف الصف */
  getRowId?: (row: T) => string | number;
  /** هل الجدول في حالة تحميل */
  loading?: boolean;
  /** رسالة عند عدم وجود بيانات */
  emptyMessage?: string;
  /** أيقونة عند عدم وجود بيانات */
  emptyIcon?: ReactNode;
}

/**
 * خصائص البحث
 */
export interface SearchProps {
  /** هل البحث مفعل */
  searchable?: boolean;
  /** نص placeholder للبحث */
  searchPlaceholder?: string;
  /** مفاتيح الأعمدة للبحث فيها */
  searchKeys?: string[];
  /** قيمة البحث الحالية */
  searchValue?: string;
  /** دالة عند تغيير البحث */
  onSearchChange?: (value: string) => void;
  /** تأخير البحث بالمللي ثانية */
  searchDebounce?: number;
}

/**
 * خصائص الترتيب
 */
export interface SortingProps {
  /** هل الترتيب مفعل */
  sortable?: boolean;
  /** حالة الترتيب الحالية */
  sortState?: SortState;
  /** دالة عند تغيير الترتيب */
  onSortChange?: (state: SortState | null) => void;
  /** هل يدعم الترتيب المتعدد */
  multiSort?: boolean;
}

/**
 * خصائص الفلترة
 */
export interface FilteringProps {
  /** هل الفلترة مفعلة */
  filterable?: boolean;
  /** حالات الفلاتر الحالية */
  filterStates?: FilterState[];
  /** دالة عند تغيير الفلاتر */
  onFilterChange?: (states: FilterState[]) => void;
}

/**
 * خصائص التصفح
 */
export interface PaginationProps {
  /** هل التصفح مفعل */
  paginated?: boolean;
  /** حجم الصفحة الافتراضي */
  defaultPageSize?: number;
  /** خيارات حجم الصفحة */
  pageSizeOptions?: number[];
  /** حالة التصفح الحالية */
  paginationState?: PaginationState;
  /** دالة عند تغيير الصفحة */
  onPageChange?: (page: number) => void;
  /** دالة عند تغيير حجم الصفحة */
  onPageSizeChange?: (size: number) => void;
}

/**
 * خصائص التحديد
 */
export interface SelectionProps<T = any> {
  /** هل التحديد مفعل */
  selectable?: boolean;
  /** نوع التحديد */
  selectionMode?: "single" | "multiple";
  /** الصفوف المحددة */
  selectedRows?: T[];
  /** دالة عند تغيير التحديد */
  onSelectionChange?: (rows: T[]) => void;
  /** دالة للتحقق من إمكانية تحديد الصف */
  isRowSelectable?: (row: T) => boolean;
}

/**
 * خصائص الإجراءات
 */
export interface ActionsProps<T = any> {
  /** هل عمود الإجراءات مفعل */
  actions?: boolean;
  /** عنوان عمود الإجراءات */
  actionsTitle?: string;
  /** عرض عمود الإجراءات */
  actionsWidth?: string | number;
  /** دالة عند عرض الصف */
  onView?: (row: T) => void;
  /** دالة عند تعديل الصف */
  onEdit?: (row: T) => void;
  /** دالة عند حذف الصف */
  onDelete?: (row: T) => void;
  /** إجراءات مخصصة */
  customActions?: CustomAction<T>[];
}

/**
 * إجراء مخصص
 */
