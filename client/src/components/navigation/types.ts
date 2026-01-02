import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

// ==================== Navbar Types ====================

export interface NavbarProps {
  /** عنوان التطبيق أو الشعار */
  title?: string;
  /** شعار التطبيق */
  logo?: ReactNode;
  /** عناصر التنقل */
  items?: NavbarItem[];
  /** عناصر على اليمين */
  rightContent?: ReactNode;
  /** عناصر على اليسار */
  leftContent?: ReactNode;
  /** ثابت في الأعلى */
  sticky?: boolean;
  /** شفاف */
  transparent?: boolean;
  /** فئة CSS إضافية */
  className?: string;
}

export interface NavbarItem {
  /** معرف فريد */
  id: string;
  /** النص المعروض */
  label: string;
  /** الرابط */
  href?: string;
  /** أيقونة */
  icon?: LucideIcon;
  /** عناصر فرعية */
  children?: NavbarItem[];
  /** معطل */
  disabled?: boolean;
  /** نشط */
  active?: boolean;
  /** دالة عند النقر */
  onClick?: () => void;
}

// ==================== Sidebar Types ====================

export interface SidebarProps {
  /** عناصر القائمة الجانبية */
  items: SidebarItemType[];
  /** مطوي */
  collapsed?: boolean;
  /** دالة تغيير حالة الطي */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** قابل للطي */
  collapsible?: boolean;
  /** عرض الشريط الجانبي */
  width?: number;
  /** عرض الشريط عند الطي */
  collapsedWidth?: number;
  /** محتوى الرأس */
  header?: ReactNode;
  /** محتوى التذييل */
  footer?: ReactNode;
  /** فئة CSS إضافية */
  className?: string;
}

export interface SidebarItemType {
  /** معرف فريد */
  id: string;
  /** النص المعروض */
  label: string;
  /** الرابط */
  href?: string;
  /** أيقونة */
  icon?: LucideIcon;
  /** عناصر فرعية */
  children?: SidebarItemType[];
  /** معطل */
  disabled?: boolean;
  /** نشط */
  active?: boolean;
  /** شارة */
  badge?: string | number;
  /** لون الشارة */
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  /** دالة عند النقر */
  onClick?: () => void;
}

export interface SidebarItemProps {
  /** بيانات العنصر */
  item: SidebarItemType;
  /** مطوي */
  collapsed?: boolean;
  /** مستوى التداخل */
  level?: number;
  /** فئة CSS إضافية */
  className?: string;
}

// ==================== Breadcrumb Types ====================

export interface BreadcrumbNavProps {
  /** عناصر مسار التنقل */
  items: BreadcrumbItemType[];
  /** فاصل مخصص */
  separator?: ReactNode;
  /** الحد الأقصى للعناصر المعروضة */
  maxItems?: number;
  /** فئة CSS إضافية */
  className?: string;
}

export interface BreadcrumbItemType {
  /** معرف فريد */
  id: string;
  /** النص المعروض */
  label: string;
  /** الرابط */
  href?: string;
  /** أيقونة */
  icon?: LucideIcon;
  /** دالة عند النقر */
  onClick?: () => void;
}

// ==================== Tabs Types ====================

export interface TabsNavProps {
  /** علامات التبويب */
  tabs: TabItemType[];
  /** القيمة النشطة */
  value?: string;
  /** القيمة الافتراضية */
  defaultValue?: string;
  /** دالة تغيير القيمة */
  onValueChange?: (value: string) => void;
  /** اتجاه التبويب */
  orientation?: "horizontal" | "vertical";
  /** نمط التبويب */
  variant?: "default" | "outline" | "pills";
  /** فئة CSS إضافية */
  className?: string;
}

export interface TabItemType {
  /** القيمة الفريدة */
  value: string;
  /** النص المعروض */
  label: string;
  /** أيقونة */
  icon?: LucideIcon;
  /** معطل */
  disabled?: boolean;
  /** محتوى التبويب */
  content?: ReactNode;
}

export interface TabPanelProps {
  /** القيمة الفريدة */
  value: string;
  /** المحتوى */
  children: ReactNode;
  /** فئة CSS إضافية */
  className?: string;
}

// ==================== Pagination Types ====================

export interface PaginationNavProps {
  /** الصفحة الحالية */
  currentPage: number;
  /** إجمالي الصفحات */
  totalPages: number;
  /** دالة تغيير الصفحة */
  onPageChange: (page: number) => void;
  /** عدد الصفحات المعروضة */
  siblingCount?: number;
  /** إظهار أزرار الأول والأخير */
  showFirstLast?: boolean;
  /** إظهار أزرار السابق والتالي */
  showPrevNext?: boolean;
  /** حجم الأزرار */
  size?: "sm" | "default" | "lg";
  /** فئة CSS إضافية */
  className?: string;
}

// ==================== Steps Types ====================

export interface StepsProps {
  /** الخطوات */
  steps: StepItemType[];
  /** الخطوة الحالية */
  currentStep: number;
  /** اتجاه الخطوات */
  orientation?: "horizontal" | "vertical";
  /** نمط الخطوات */
  variant?: "default" | "simple" | "circles";
  /** حجم الخطوات */
  size?: "sm" | "default" | "lg";
  /** قابلة للنقر */
  clickable?: boolean;
  /** دالة تغيير الخطوة */
  onStepChange?: (step: number) => void;
  /** فئة CSS إضافية */
  className?: string;
}

export interface StepItemType {
  /** معرف فريد */
  id: string;
  /** العنوان */
  title: string;
  /** الوصف */
  description?: string;
  /** أيقونة */
  icon?: LucideIcon;
  /** حالة الخطوة */
  status?: "pending" | "current" | "completed" | "error";
  /** معطل */
  disabled?: boolean;
}
