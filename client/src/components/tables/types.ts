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
export interface CustomAction<T = any> {
  /** معرف الإجراء */
  id: string;
  /** عنوان الإجراء */
  title: string;
  /** أيقونة الإجراء */
  icon?: ReactNode;
  /** دالة التنفيذ */
  onClick: (row: T) => void;
  /** دالة للتحقق من إمكانية التنفيذ */
  isEnabled?: (row: T) => boolean;
  /** دالة للتحقق من الظهور */
  isVisible?: (row: T) => boolean;
  /** نوع الزر */
  variant?: "default" | "destructive" | "outline" | "ghost";
  /** لون الأيقونة */
  iconColor?: string;
}

/**
 * خصائص شريط الأدوات
 */
export interface ToolbarProps {
  /** عنوان الجدول */
  title?: string;
  /** وصف الجدول */
  description?: string;
  /** نص زر الإضافة */
  addButtonText?: string;
  /** دالة عند الإضافة */
  onAdd?: () => void;
  /** دالة عند التحديث */
  onRefresh?: () => void;
  /** أزرار إضافية */
  extraButtons?: ReactNode;
  /** هل يظهر شريط الأدوات */
  showToolbar?: boolean;
}

/**
 * خصائص التصدير
 */
export interface ExportProps {
  /** هل التصدير مفعل */
  exportable?: boolean;
  /** اسم الملف */
  exportFileName?: string;
  /** الأعمدة المراد تصديرها */
  exportColumns?: string[];
  /** صيغ التصدير المتاحة */
  exportFormats?: ExportFormat[];
  /** دالة التصدير المخصصة */
  onExport?: (format: ExportFormat, data: any[]) => void;
}

/**
 * صيغة التصدير
 */
export type ExportFormat = "csv" | "excel" | "json" | "pdf";

/**
 * خصائص جدول البيانات الكاملة
 */
export interface DataTableProps<T = any>
  extends DataTableBaseProps<T>,
    SearchProps,
    SortingProps,
    FilteringProps,
    PaginationProps,
    SelectionProps<T>,
    ActionsProps<T>,
    ToolbarProps,
    ExportProps {
  /** فئات CSS إضافية للجدول */
  className?: string;
  /** فئات CSS إضافية للحاوية */
  containerClassName?: string;
  /** هل يظهر حدود الجدول */
  bordered?: boolean;
  /** هل يظهر خطوط بين الصفوف */
  striped?: boolean;
  /** هل الجدول مضغوط */
  compact?: boolean;
  /** هل يظهر ظل عند التمرير */
  stickyHeader?: boolean;
  /** ارتفاع الجدول */
  height?: string | number;
  /** الحد الأقصى للارتفاع */
  maxHeight?: string | number;
  /** دالة عند النقر على الصف */
  onRowClick?: (row: T) => void;
  /** دالة عند النقر المزدوج على الصف */
  onRowDoubleClick?: (row: T) => void;
  /** دالة للحصول على فئات CSS للصف */
  getRowClassName?: (row: T, index: number) => string;
  /** دالة للتحقق من إمكانية توسيع الصف */
  isRowExpandable?: (row: T) => boolean;
  /** محتوى الصف الموسع */
  renderExpandedRow?: (row: T) => ReactNode;
}

/**
 * خصائص رأس الجدول
 */
export interface TableHeaderProps<T = any> {
  /** تعريفات الأعمدة */
  columns: ColumnDefinition<any>[];
  /** حالة الترتيب */
  sortState?: SortState;
  /** دالة عند تغيير الترتيب */
  onSort?: (columnKey: string) => void;
  /** هل التحديد مفعل */
  selectable?: boolean;
  /** هل كل الصفوف محددة */
  isAllSelected?: boolean;
  /** هل بعض الصفوف محددة */
  isPartiallySelected?: boolean;
  /** دالة عند تحديد الكل */
  onSelectAll?: () => void;
  /** هل عمود الإجراءات مفعل */
  hasActions?: boolean;
  /** عنوان عمود الإجراءات */
  actionsTitle?: string;
  /** فئات CSS إضافية */
  className?: string;
}

/**
 * خصائص جسم الجدول
 */
export interface TableBodyProps<T = any> {
  /** البيانات */
  data: T[];
  /** تعريفات الأعمدة */
  columns: ColumnDefinition<any>[];
  /** دالة للحصول على معرف الصف */
  getRowId: (row: T) => string | number;
  /** هل الجدول في حالة تحميل */
  loading?: boolean;
  /** رسالة عند عدم وجود بيانات */
  emptyMessage?: string;
  /** أيقونة عند عدم وجود بيانات */
  emptyIcon?: ReactNode;
  /** هل التحديد مفعل */
  selectable?: boolean;
  /** مفاتيح الصفوف المحددة */
  selectedKeys?: Set<string | number>;
  /** دالة عند تحديد صف */
  onSelectRow?: (row: T) => void;
  /** هل عمود الإجراءات مفعل */
  hasActions?: boolean;
  /** دالة عند عرض الصف */
  onView?: (row: T) => void;
  /** دالة عند تعديل الصف */
  onEdit?: (row: T) => void;
  /** دالة عند حذف الصف */
  onDelete?: (row: T) => void;
  /** إجراءات مخصصة */
  customActions?: CustomAction<T>[];
  /** دالة عند النقر على الصف */
  onRowClick?: (row: T) => void;
  /** دالة للحصول على فئات CSS للصف */
  getRowClassName?: (row: T, index: number) => string;
  /** فئات CSS إضافية */
  className?: string;
}

/**
 * خصائص صف الجدول
 */
export interface TableRowProps<T = any> {
  /** بيانات الصف */
  row: T;
  /** فهرس الصف */
  index: number;
  /** تعريفات الأعمدة */
  columns: ColumnDefinition<any>[];
  /** معرف الصف */
  rowId: string | number;
  /** هل التحديد مفعل */
  selectable?: boolean;
  /** هل الصف محدد */
  isSelected?: boolean;
  /** دالة عند تحديد الصف */
  onSelect?: () => void;
  /** هل عمود الإجراءات مفعل */
  hasActions?: boolean;
  /** دالة عند عرض الصف */
  onView?: () => void;
  /** دالة عند تعديل الصف */
  onEdit?: () => void;
  /** دالة عند حذف الصف */
  onDelete?: () => void;
  /** إجراءات مخصصة */
  customActions?: CustomAction<T>[];
  /** دالة عند النقر */
  onClick?: () => void;
  /** فئات CSS إضافية */
  className?: string;
}

/**
 * خصائص خلية الجدول
 */
export interface TableCellProps {
  /** القيمة */
  value: any;
  /** تعريف العمود */
  column: ColumnDefinition;
  /** بيانات الصف */
  row: any;
  /** فهرس الصف */
  rowIndex: number;
  /** فئات CSS إضافية */
  className?: string;
}

/**
 * خصائص تصفح الجدول
 */
export interface TablePaginationProps {
  /** الصفحة الحالية */
  currentPage: number;
  /** إجمالي عدد الصفحات */
  totalPages: number;
  /** إجمالي عدد العناصر */
  totalItems: number;
  /** حجم الصفحة */
  pageSize: number;
  /** خيارات حجم الصفحة */
  pageSizeOptions?: number[];
  /** دالة عند تغيير الصفحة */
  onPageChange: (page: number) => void;
  /** دالة عند تغيير حجم الصفحة */
  onPageSizeChange?: (size: number) => void;
  /** هل يظهر معلومات العناصر */
  showItemsInfo?: boolean;
  /** هل يظهر خيارات حجم الصفحة */
  showPageSizeOptions?: boolean;
  /** هل يظهر إدخال رقم الصفحة */
  showPageInput?: boolean;
  /** فئات CSS إضافية */
  className?: string;
}

/**
 * خصائص شريط أدوات الجدول
 */
export interface TableToolbarProps {
  /** عنوان الجدول */
  title?: string;
  /** وصف الجدول */
  description?: string;
  /** هل البحث مفعل */
  searchable?: boolean;
  /** قيمة البحث */
  searchValue?: string;
  /** نص placeholder للبحث */
  searchPlaceholder?: string;
  /** دالة عند تغيير البحث */
  onSearchChange?: (value: string) => void;
  /** هل الفلترة مفعلة */
  filterable?: boolean;
  /** عدد الفلاتر النشطة */
  activeFiltersCount?: number;
  /** دالة عند فتح الفلاتر */
  onFilterClick?: () => void;
  /** دالة عند الإضافة */
  onAdd?: () => void;
  /** نص زر الإضافة */
  addButtonText?: string;
  /** دالة عند التحديث */
  onRefresh?: () => void;
  /** هل في حالة تحميل */
  loading?: boolean;
  /** دالة عند التصدير */
  onExport?: () => void;
  /** أزرار إضافية */
  extraButtons?: ReactNode;
  /** عدد الصفوف المحددة */
  selectedCount?: number;
  /** إجراءات الصفوف المحددة */
  bulkActions?: ReactNode;
  /** فئات CSS إضافية */
  className?: string;
}

/**
 * خصائص فلتر الجدول
 */
export interface TableFilterProps {
  /** تعريفات الأعمدة القابلة للفلترة */
  columns: ColumnDefinition[];
  /** حالات الفلاتر الحالية */
  filterStates: FilterState[];
  /** دالة عند تغيير الفلاتر */
  onFilterChange: (states: FilterState[]) => void;
  /** دالة عند إغلاق الفلتر */
  onClose?: () => void;
  /** هل الفلتر مفتوح */
  isOpen?: boolean;
  /** فئات CSS إضافية */
  className?: string;
}

/**
 * خصائص تصدير الجدول
 */
export interface TableExportProps<T = any> {
  /** البيانات */
  data: T[];
  /** تعريفات الأعمدة */
  columns: ColumnDefinition<any>[];
  /** اسم الملف */
  fileName?: string;
  /** الصيغ المتاحة */
  formats?: ExportFormat[];
  /** دالة التصدير المخصصة */
  onExport?: (format: ExportFormat, data: any[]) => void;
  /** هل مفتوح */
  isOpen?: boolean;
  /** دالة عند الإغلاق */
  onClose?: () => void;
  /** فئات CSS إضافية */
  className?: string;
}

/**
 * دالة مساعدة للحصول على قيمة متداخلة
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

/**
 * دالة مساعدة لتطبيق الفلتر
 */
export function applyFilter(value: any, filter: FilterState): boolean {
  const { operator, value: filterValue, value2 } = filter;

  switch (operator) {
    case "equals":
      return value === filterValue;
    case "notEquals":
      return value !== filterValue;
    case "contains":
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case "startsWith":
      return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
    case "endsWith":
      return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
    case "greaterThan":
      return Number(value) > Number(filterValue);
    case "lessThan":
      return Number(value) < Number(filterValue);
    case "greaterThanOrEqual":
      return Number(value) >= Number(filterValue);
    case "lessThanOrEqual":
      return Number(value) <= Number(filterValue);
    case "between":
      return Number(value) >= Number(filterValue) && Number(value) <= Number(value2);
    case "isEmpty":
      return value === null || value === undefined || value === "";
    case "isNotEmpty":
      return value !== null && value !== undefined && value !== "";
    default:
      return true;
  }
}
