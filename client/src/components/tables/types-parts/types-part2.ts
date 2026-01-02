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
