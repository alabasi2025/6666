import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLoginUrl } from "@/const";
import {
  Zap, Building2, GitBranch, Radio, Users, Shield,
  Calculator, Landmark, FileText, Package, Warehouse,
  ShoppingCart, UserCircle, Gauge, Receipt, CreditCard,
  Activity, AlertTriangle, Camera, ClipboardList,
  FolderKanban, Calendar, BarChart3, PieChart,
  Settings, LogOut, Menu, X, ChevronLeft, Bell,
  TrendingUp, TrendingDown, DollarSign, Wrench,
  Home, Search, HelpCircle, Moon, Sun, Truck, Users2, Clock, CalendarDays, Wallet,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">جاري التحميل...</p>
    </div>
  </div>
);

// Lazy Load Dashboard Home
const DashboardHomeNew = lazy(() => import("./DashboardHome"));

// Asset Pages - Lazy Loaded
const AssetsList = lazy(() => import("./assets/AssetsList"));
const AssetDetails = lazy(() => import("./assets/AssetDetails"));
const AssetEdit = lazy(() => import("./assets/AssetEdit"));
const AssetCategories = lazy(() => import("./assets/AssetCategories"));
const AssetMovements = lazy(() => import("./assets/AssetMovements"));
const Depreciation = lazy(() => import("./assets/Depreciation"));

// Maintenance Pages - Lazy Loaded
const WorkOrdersList = lazy(() => import("./maintenance/WorkOrdersList"));
const WorkOrderDetails = lazy(() => import("./maintenance/WorkOrderDetails"));
const MaintenancePlans = lazy(() => import("./maintenance/MaintenancePlans"));
const Technicians = lazy(() => import("./maintenance/Technicians"));

// Inventory Pages - Lazy Loaded
const Warehouses = lazy(() => import("./inventory/Warehouses"));
const Items = lazy(() => import("./inventory/Items"));
const Movements = lazy(() => import("./inventory/Movements"));
const StockBalance = lazy(() => import("./inventory/StockBalance"));
const Suppliers = lazy(() => import("./inventory/Suppliers"));
const PurchaseOrders = lazy(() => import("./inventory/PurchaseOrders"));

// Customer Pages - Lazy Loaded
const CustomerDetails = lazy(() => import("./customers/CustomerDetails"));
const Meters = lazy(() => import("./customers/Meters"));

// SCADA Pages - Lazy Loaded
const MonitoringDashboard = lazy(() => import("./scada/MonitoringDashboard"));
const Alerts = lazy(() => import("./scada/Alerts"));
const Sensors = lazy(() => import("./scada/Sensors"));
const Cameras = lazy(() => import("./scada/Cameras"));

// Projects Pages - Lazy Loaded
const ProjectsList = lazy(() => import("./projects/ProjectsList"));
const ProjectDetails = lazy(() => import("./projects/ProjectDetails"));
const GanttChart = lazy(() => import("./projects/GanttChart"));

// Accounting Pages - Lazy Loaded
const ChartOfAccounts = lazy(() => import("./accounting/ChartOfAccounts"));
const JournalEntries = lazy(() => import("./accounting/JournalEntries"));
const GeneralLedger = lazy(() => import("./accounting/GeneralLedger"));
const TrialBalance = lazy(() => import("./accounting/TrialBalance"));

// Developer System Pages - Lazy Loaded
const DeveloperDashboard = lazy(() => import("./developer/DeveloperDashboard"));
const Integrations = lazy(() => import("./developer/Integrations"));
const ApiKeys = lazy(() => import("./developer/ApiKeys"));
const Events = lazy(() => import("./developer/Events"));
const AiModels = lazy(() => import("./developer/AiModels"));
const TechnicalAlerts = lazy(() => import("./developer/TechnicalAlerts"));

// Field Operations Pages - Lazy Loaded
const FieldOpsDashboard = lazy(() => import("./fieldops/FieldOpsDashboard"));
const FieldOperations = lazy(() => import("./fieldops/FieldOperations"));
const FieldTeams = lazy(() => import("./fieldops/FieldTeams"));
const FieldWorkers = lazy(() => import("./fieldops/FieldWorkers"));
const FieldEquipment = lazy(() => import("./fieldops/FieldEquipment"));

// Diesel System Pages - Lazy Loaded
const DieselTankers = lazy(() => import("./diesel/DieselTankers"));
const DieselTanks = lazy(() => import("./diesel/DieselTanks"));
const DieselReceivingTasks = lazy(() => import("./diesel/DieselReceivingTasks"));
const DieselConfiguration = lazy(() => import("./diesel/DieselConfiguration"));
const DieselReceiving = lazy(() => import("./diesel/DieselReceiving"));

// Diesel Assets Pages - Lazy Loaded
const DieselTanksAssets = lazy(() => import("./assets/diesel/DieselTanksAssets"));
const DieselPumpsAssets = lazy(() => import("./assets/diesel/DieselPumpsAssets"));
const DieselPipesAssets = lazy(() => import("./assets/diesel/DieselPipesAssets"));

// HR Pages - Lazy Loaded
const HRDashboard = lazy(() => import("./hr/HRDashboard"));
const Employees = lazy(() => import("./hr/Employees"));
const Departments = lazy(() => import("./hr/Departments"));
const Attendance = lazy(() => import("./hr/Attendance"));
const Leaves = lazy(() => import("./hr/Leaves"));
const Payroll = lazy(() => import("./hr/Payroll"));

// Organization Pages - Lazy Loaded
const Businesses = lazy(() => import("./organization/Businesses"));
const Branches = lazy(() => import("./organization/Branches"));
const Stations = lazy(() => import("./organization/Stations"));

// Operations Pages - Lazy Loaded
const OperationalStructure = lazy(() => import("./operations/OperationalStructure"));
const DistributionNetwork = lazy(() => import("./operations/DistributionNetwork"));
const MiscAssets = lazy(() => import("./operations/MiscAssets"));

// Users Management Pages - Lazy Loaded
const UsersManagement = lazy(() => import("./users/UsersManagement"));

// Custom System Pages - Lazy Loaded
const CustomDashboard = lazy(() => import("./custom/CustomDashboard"));
const CustomAccounts = lazy(() => import("./custom/CustomAccounts"));
const CustomNotes = lazy(() => import("./custom/CustomNotes"));
const CustomMemos = lazy(() => import("./custom/CustomMemos"));
const CustomSubSystems = lazy(() => import("./custom/CustomSubSystems"));
const CustomTreasuries = lazy(() => import("./custom/CustomTreasuries"));
const CustomVouchers = lazy(() => import("./custom/CustomVouchers"));
const CustomReconciliation = lazy(() => import("./custom/CustomReconciliation"));

// Customer System Pages - Lazy Loaded
const CustomerDashboard = lazy(() => import("./customers/CustomerDashboard"));
const CustomersManagement = lazy(() => import("./customers/CustomersManagement"));
const MetersManagement = lazy(() => import("./customers/MetersManagement"));
const BillingPeriods = lazy(() => import("./customers/BillingPeriods"));
const MeterReadings = lazy(() => import("./customers/MeterReadings"));
const InvoicesManagement = lazy(() => import("./customers/InvoicesManagement"));
const PaymentsManagement = lazy(() => import("./customers/PaymentsManagement"));
const TariffsManagement = lazy(() => import("./customers/TariffsManagement"));

// Billing System Pages - Lazy Loaded
const BillingDashboard = lazy(() => import("./billing/BillingDashboard"));
const AreasManagement = lazy(() => import("./billing/main-data/AreasManagement"));
const SquaresManagement = lazy(() => import("./billing/main-data/SquaresManagement"));
const CabinetsManagement = lazy(() => import("./billing/main-data/CabinetsManagement"));
const BillingTariffsManagement = lazy(() => import("./billing/main-data/TariffsManagement"));
const FeeTypesManagement = lazy(() => import("./billing/main-data/FeeTypesManagement"));
const PaymentMethodsManagement = lazy(() => import("./billing/main-data/PaymentMethodsManagement"));
const CashboxesManagement = lazy(() => import("./billing/main-data/CashboxesManagement"));
const BillingMetersManagement = lazy(() => import("./billing/meters/MetersManagement"));
const BillingCustomersManagement = lazy(() => import("./billing/customers/CustomersManagement"));
const BillingPeriodsManagement = lazy(() => import("./billing/invoicing/BillingPeriodsManagement"));
const BillingMeterReadings = lazy(() => import("./billing/invoicing/MeterReadingsManagement"));
const BillingInvoicesManagement = lazy(() => import("./billing/invoicing/InvoicesManagement"));
const BillingPaymentsManagement = lazy(() => import("./billing/payments/PaymentsManagement"));

// Navigation Groups for visual separation
type NavGroup = {
  id: string;
  label: string;
  color: string;
  items: typeof navigationItems;
};

// Navigation Structure
const navigationItems = [
  {
    id: "home",
    title: "الرئيسية",
    icon: Home,
    path: "/dashboard",
    color: "text-blue-500",
  },
  {
    id: "organization",
    title: "الهيكل التنظيمي",
    icon: Building2,
    color: "text-purple-500",
    children: [
      { id: "businesses", title: "الشركات", icon: Building2, path: "/dashboard/organization/businesses" },
      { id: "branches", title: "الفروع", icon: GitBranch, path: "/dashboard/organization/branches" },
      { id: "stations", title: "المحطات", icon: Radio, path: "/dashboard/organization/stations" },
    ],
  },
  {
    id: "operations",
    title: "المخطط التشغيلي",
    icon: Activity,
    color: "text-green-500",
    children: [
      { id: "structure", title: "هيكل المحطات", icon: Building2, path: "/dashboard/operations/structure" },
      { id: "network", title: "شبكة التوزيع", icon: GitBranch, path: "/dashboard/operations/network" },
      { id: "misc-assets", title: "الأصول المتنوعة", icon: Package, path: "/dashboard/operations/misc-assets" },
    ],
  },
  {
    id: "users",
    title: "المستخدمين والصلاحيات",
    icon: Users,
    color: "text-indigo-500",
    children: [
      { id: "users-list", title: "المستخدمين", icon: Users, path: "/dashboard/users" },
      { id: "roles", title: "الأدوار والصلاحيات", icon: Shield, path: "/dashboard/users/roles" },
    ],
  },
  {
    id: "accounting",
    title: "النظام المحاسبي",
    icon: Calculator,
    color: "text-emerald-500",
    children: [
      { id: "chart-of-accounts", title: "شجرة الحسابات", icon: Landmark, path: "/dashboard/accounting/chart-of-accounts" },
      { id: "journal-entries", title: "القيود اليومية", icon: FileText, path: "/dashboard/accounting/journal-entries" },
      { id: "general-ledger", title: "دفتر الأستاذ", icon: FileText, path: "/dashboard/accounting/general-ledger" },
      { id: "trial-balance", title: "ميزان المراجعة", icon: BarChart3, path: "/dashboard/accounting/trial-balance" },
    ],
  },
  {
    id: "assets",
    title: "إدارة الأصول",
    icon: Package,
    color: "text-amber-500",
    children: [
      { id: "assets-list", title: "قائمة الأصول", icon: Package, path: "/dashboard/assets" },
      { id: "categories", title: "فئات الأصول", icon: FolderKanban, path: "/dashboard/assets/categories" },
      { id: "movements", title: "حركات الأصول", icon: Activity, path: "/dashboard/assets/movements" },
      { id: "depreciation", title: "الإهلاك", icon: TrendingDown, path: "/dashboard/assets/depreciation" },
      {
        id: "diesel-assets",
        title: "أصول إدارة الديزل",
        icon: Truck,
        children: [
          { id: "diesel-tanks", title: "الخزانات", icon: Package, path: "/dashboard/assets/diesel/tanks" },
          { id: "diesel-pumps", title: "الطرمبات", icon: Activity, path: "/dashboard/assets/diesel/pumps" },
          { id: "diesel-pipes", title: "المواصير", icon: GitBranch, path: "/dashboard/assets/diesel/pipes" },
        ]
      },
    ],
  },
  {
    id: "maintenance",
    title: "الصيانة",
    icon: Wrench,
    color: "text-orange-500",
    children: [
      { id: "work-orders", title: "أوامر العمل", icon: ClipboardList, path: "/dashboard/maintenance/work-orders" },
      { id: "plans", title: "خطط الصيانة", icon: Calendar, path: "/dashboard/maintenance/plans" },
      { id: "technicians", title: "الفنيين", icon: Users, path: "/dashboard/maintenance/technicians" },
    ],
  },
  {
    id: "inventory",
    title: "المخزون والمشتريات",
    icon: Warehouse,
    color: "text-teal-500",
    children: [
      { id: "warehouses", title: "المستودعات", icon: Warehouse, path: "/dashboard/inventory/warehouses" },
      { id: "items", title: "الأصناف", icon: Package, path: "/dashboard/inventory/items" },
      { id: "movements", title: "الحركات", icon: Activity, path: "/dashboard/inventory/movements" },
      { id: "stock-balance", title: "أرصدة المخزون", icon: BarChart3, path: "/dashboard/inventory/stock-balance" },
      { id: "suppliers", title: "الموردين", icon: Truck, path: "/dashboard/inventory/suppliers" },
      { id: "purchase-orders", title: "أوامر الشراء", icon: ShoppingCart, path: "/dashboard/inventory/purchase-orders" },
      { 
        id: "transport", 
        title: "النقل", 
        icon: Truck, 
        children: [
          { 
            id: "diesel-transport", 
            title: "نقل الديزل", 
            icon: Truck,
            children: [
              { id: "tankers", title: "الوايتات", icon: Truck, path: "/dashboard/inventory/transport/diesel/tankers" },
              { id: "barrels", title: "نقل بالبراميل", icon: Package, path: "/dashboard/inventory/transport/diesel/barrels" },
              { id: "station-transfer", title: "نقل من محطة لمحطة", icon: Activity, path: "/dashboard/inventory/transport/diesel/station-transfer" },
            ]
          },
        ]
      },
    ],
  },
  {
    id: "customers",
    title: "العملاء والفوترة",
    icon: UserCircle,
    color: "text-cyan-500",
    children: [
      { id: "dashboard", title: "لوحة التحكم", icon: Gauge, path: "/dashboard/customers/dashboard" },
      { id: "customers-list", title: "العملاء", icon: Users, path: "/dashboard/customers" },
      { id: "meters", title: "العدادات", icon: Gauge, path: "/dashboard/customers/meters" },
      { id: "readings", title: "القراءات", icon: Activity, path: "/dashboard/customers/readings" },
      { id: "tariffs", title: "التعريفات", icon: DollarSign, path: "/dashboard/customers/tariffs" },
      { id: "billing-periods", title: "فترات الفوترة", icon: Calendar, path: "/dashboard/customers/billing-periods" },
      { id: "invoices", title: "الفواتير", icon: Receipt, path: "/dashboard/customers/invoices" },
      { id: "payments", title: "المدفوعات", icon: CreditCard, path: "/dashboard/customers/payments" },
    ],
  },
  {
    id: "scada",
    title: "المراقبة والتحكم",
    icon: Activity,
    color: "text-red-500",
    children: [
      { id: "monitoring", title: "لوحة المراقبة", icon: Gauge, path: "/dashboard/scada/monitoring" },
      { id: "alerts", title: "التنبيهات", icon: AlertTriangle, path: "/dashboard/scada/alerts" },
      { id: "sensors", title: "الحساسات", icon: Radio, path: "/dashboard/scada/sensors" },
      { id: "cameras", title: "الكاميرات", icon: Camera, path: "/dashboard/scada/cameras" },
    ],
  },
  {
    id: "projects",
    title: "إدارة المشاريع",
    icon: FolderKanban,
    color: "text-violet-500",
    children: [
      { id: "projects-list", title: "المشاريع", icon: FolderKanban, path: "/dashboard/projects" },
      { id: "gantt", title: "مخطط جانت", icon: BarChart3, path: "/dashboard/projects/gantt" },
    ],
  },
  {
    id: "fieldops",
    title: "العمليات الميدانية",
    icon: Truck,
    color: "text-lime-500",
    children: [
      { id: "fieldops-dashboard", title: "لوحة التحكم", icon: Gauge, path: "/dashboard/fieldops/dashboard" },
      { id: "operations", title: "العمليات", icon: Activity, path: "/dashboard/fieldops/operations" },
      { id: "teams", title: "الفرق", icon: Users2, path: "/dashboard/fieldops/teams" },
      { id: "workers", title: "العمال", icon: Users, path: "/dashboard/fieldops/workers" },
      { id: "equipment", title: "المعدات", icon: Wrench, path: "/dashboard/fieldops/equipment" },
      {
        id: "field-tasks",
        title: "المهام الميدانية",
        icon: ClipboardList,
        children: [
          {
            id: "generator-tech-tasks",
            title: "مهام فني المولدات",
            icon: Wrench,
            children: [
              { id: "diesel-receiving", title: "مهام استلام الديزل", icon: Truck, path: "/dashboard/fieldops/tasks/generator-tech/diesel-receiving" },
            ]
          },
          { id: "collector-tasks", title: "مهام المتحصلين", icon: Wallet, path: "/dashboard/fieldops/tasks/collectors" },
          { id: "electrician-tasks", title: "مهام الكهربائيين", icon: Zap, path: "/dashboard/fieldops/tasks/electricians" },
          { id: "station-manager-tasks", title: "مهام مدير المحطة", icon: Users, path: "/dashboard/fieldops/tasks/station-manager" },
        ]
      },
    ],
  },
  {
    id: "hr",
    title: "الموارد البشرية",
    icon: Users,
    color: "text-pink-500",
    children: [
      { id: "hr-dashboard", title: "لوحة التحكم", icon: Gauge, path: "/dashboard/hr/dashboard" },
      { id: "employees", title: "الموظفين", icon: Users, path: "/dashboard/hr/employees" },
      { id: "departments", title: "الأقسام", icon: Building2, path: "/dashboard/hr/departments" },
      { id: "attendance", title: "الحضور والانصراف", icon: Clock, path: "/dashboard/hr/attendance" },
      { id: "leaves", title: "الإجازات", icon: CalendarDays, path: "/dashboard/hr/leaves" },
      { id: "payroll", title: "الرواتب", icon: Wallet, path: "/dashboard/hr/payroll" },
    ],
  },
  {
    id: "reports",
    title: "التقارير",
    icon: BarChart3,
    color: "text-sky-500",
    children: [
      { id: "financial", title: "التقارير المالية", icon: DollarSign, path: "/dashboard/reports/financial" },
      { id: "operational", title: "التقارير التشغيلية", icon: Activity, path: "/dashboard/reports/operational" },
      { id: "analytics", title: "التحليلات", icon: PieChart, path: "/dashboard/reports/analytics" },
    ],
  },
  {
    id: "diesel-management",
    title: "إدارة الديزل",
    icon: Truck,
    color: "text-yellow-600",
    children: [
      { id: "diesel-config", title: "تهيئة مخطط الديزل", icon: Settings, path: "/dashboard/diesel/configuration" },
      { id: "diesel-receiving", title: "عمليات الاستلام", icon: Truck, path: "/dashboard/diesel/receiving" },
      { id: "diesel-dashboard", title: "لوحة التحكم", icon: Gauge, path: "/dashboard/diesel/dashboard" },
    ],
  },
  {
    id: "billing",
    title: "نظام الفوترة",
    icon: Receipt,
    color: "text-rose-500",
    children: [
      { id: "billing-dashboard", title: "لوحة التحكم", icon: Gauge, path: "/dashboard/billing" },
      { id: "areas", title: "المناطق", icon: Building2, path: "/dashboard/billing/areas" },
      { id: "squares", title: "المربعات", icon: Building2, path: "/dashboard/billing/squares" },
      { id: "cabinets", title: "الكبائن", icon: Package, path: "/dashboard/billing/cabinets" },
      { id: "billing-tariffs", title: "التعريفات", icon: DollarSign, path: "/dashboard/billing/tariffs" },
      { id: "fee-types", title: "أنواع الرسوم", icon: Receipt, path: "/dashboard/billing/fee-types" },
      { id: "payment-methods", title: "طرق الدفع", icon: CreditCard, path: "/dashboard/billing/payment-methods" },
      { id: "cashboxes", title: "الصناديق", icon: Wallet, path: "/dashboard/billing/cashboxes" },
      { id: "billing-meters", title: "العدادات", icon: Gauge, path: "/dashboard/billing/meters" },
      { id: "billing-customers", title: "المشتركين", icon: Users, path: "/dashboard/billing/customers" },
      { id: "billing-periods", title: "فترات الفوترة", icon: Calendar, path: "/dashboard/billing/periods" },
      { id: "billing-readings", title: "القراءات", icon: Activity, path: "/dashboard/billing/readings" },
      { id: "billing-invoices", title: "الفواتير", icon: Receipt, path: "/dashboard/billing/invoices" },
      { id: "billing-payments", title: "التحصيل", icon: CreditCard, path: "/dashboard/billing/payments" },
    ],
  },
  {
    id: "custom",
    title: "النظام المخصص",
    icon: Settings,
    color: "text-fuchsia-500",
    children: [
      { id: "custom-dashboard", title: "لوحة التحكم", icon: Gauge, path: "/dashboard/custom" },
      { id: "custom-sub-systems", title: "الأنظمة الفرعية", icon: FolderKanban, path: "/dashboard/custom/sub-systems" },
      { id: "custom-treasuries", title: "الخزائن", icon: Wallet, path: "/dashboard/custom/treasuries" },
      { id: "custom-vouchers", title: "سندات القبض والصرف", icon: Receipt, path: "/dashboard/custom/vouchers" },
      { id: "custom-reconciliation", title: "الحسابات الوسيطة", icon: GitBranch, path: "/dashboard/custom/reconciliation" },
      { id: "custom-accounts", title: "الحسابات القديمة", icon: Landmark, path: "/dashboard/custom/accounts" },
      { id: "custom-notes", title: "الملاحظات", icon: FileText, path: "/dashboard/custom/notes" },
      { id: "custom-memos", title: "المذكرات", icon: FileText, path: "/dashboard/custom/memos" },
    ],
  },
  {
    id: "developer",
    title: "نظام المطور",
    icon: Settings,
    color: "text-slate-500",
    children: [
      { id: "dev-dashboard", title: "لوحة التحكم", icon: Gauge, path: "/dashboard/developer" },
      { id: "integrations", title: "التكاملات", icon: GitBranch, path: "/dashboard/developer/integrations" },
      { id: "api-keys", title: "مفاتيح API", icon: Shield, path: "/dashboard/developer/api-keys" },
      { id: "events", title: "الأحداث", icon: Activity, path: "/dashboard/developer/events" },
      { id: "ai-models", title: "نماذج الذكاء", icon: Zap, path: "/dashboard/developer/ai-models" },
      { id: "technical-alerts", title: "التنبيهات الفنية", icon: AlertTriangle, path: "/dashboard/developer/technical-alerts" },
    ],
  },
  {
    id: "settings",
    title: "الإعدادات",
    icon: Settings,
    path: "/dashboard/settings",
    color: "text-gray-500",
  },
];

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();

  useEffect(() => {
    // Auto-expand parent menu based on current path
    const currentPath = location;
    navigationItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => currentPath.startsWith(child.path));
        if (hasActiveChild && !expandedItems.includes(item.id)) {
          setExpandedItems(prev => [...prev, item.id]);
        }
      }
    });
  }, [location]);

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  const handleLogout = () => {
    window.location.href = getLoginUrl();
  };

  const isActivePath = (path: string) => {
    if (path === "/dashboard") {
      return location === "/dashboard";
    }
    return location.startsWith(path);
  };

  // Render page content based on current path with Suspense
  const renderContent = () => {
    const path = location;
    
    return (
      <Suspense fallback={<PageLoader />}>
        {/* Home */}
        {path === "/dashboard" && <DashboardHomeNew />}
        
        {/* Organization */}
        {path === "/dashboard/organization/businesses" && <Businesses />}
        {path === "/dashboard/organization/branches" && <Branches />}
        {path === "/dashboard/organization/stations" && <Stations />}
        
        {/* Operations */}
        {path === "/dashboard/operations/structure" && <OperationalStructure />}
        {path === "/dashboard/operations/network" && <DistributionNetwork />}
        {path === "/dashboard/operations/misc-assets" && <MiscAssets />}
        
        {/* Users */}
        {path === "/dashboard/users" && <UsersManagement />}
        
        {/* Accounting */}
        {path === "/dashboard/accounting/chart-of-accounts" && <ChartOfAccounts />}
        {path === "/dashboard/accounting/journal-entries" && <JournalEntries />}
        {path === "/dashboard/accounting/general-ledger" && <GeneralLedger />}
        {path === "/dashboard/accounting/trial-balance" && <TrialBalance />}
        
        {/* Assets */}
        {path === "/dashboard/assets" && <AssetsList />}
        {path.match(/^\/dashboard\/assets\/view\/\d+$/) && <AssetDetails />}
        {path.match(/^\/dashboard\/assets\/edit\/\d+$/) && <AssetEdit />}
        {path === "/dashboard/assets/categories" && <AssetCategories />}
        {path === "/dashboard/assets/movements" && <AssetMovements />}
        {path === "/dashboard/assets/depreciation" && <Depreciation />}
        
        {/* Maintenance */}
        {path === "/dashboard/maintenance/work-orders" && <WorkOrdersList />}
        {path.match(/^\/dashboard\/maintenance\/work-orders\/\d+$/) && <WorkOrderDetails />}
        {path === "/dashboard/maintenance/plans" && <MaintenancePlans />}
        {path === "/dashboard/maintenance/technicians" && <Technicians />}
        
        {/* Inventory */}
        {path === "/dashboard/inventory/warehouses" && <Warehouses />}
        {path === "/dashboard/inventory/items" && <Items />}
        {path === "/dashboard/inventory/movements" && <Movements />}
        {path === "/dashboard/inventory/stock-balance" && <StockBalance />}
        {path === "/dashboard/inventory/suppliers" && <Suppliers />}
        {path === "/dashboard/inventory/purchase-orders" && <PurchaseOrders />}
        
        {/* Customers */}
        {path === "/dashboard/customers/dashboard" && <CustomerDashboard />}
        {path === "/dashboard/customers" && <CustomersManagement />}
        {path.match(/^\/dashboard\/customers\/\d+$/) && <CustomerDetails />}
        {path === "/dashboard/customers/meters" && <MetersManagement />}
        {path === "/dashboard/customers/readings" && <MeterReadings />}
        {path === "/dashboard/customers/tariffs" && <TariffsManagement />}
        {path === "/dashboard/customers/billing-periods" && <BillingPeriods />}
        {path === "/dashboard/customers/invoices" && <InvoicesManagement />}
        {path === "/dashboard/customers/payments" && <PaymentsManagement />}
        
        {/* SCADA */}
        {path === "/dashboard/scada/monitoring" && <MonitoringDashboard />}
        {path === "/dashboard/scada/alerts" && <Alerts />}
        {path === "/dashboard/scada/sensors" && <Sensors />}
        {path === "/dashboard/scada/cameras" && <Cameras />}
        
        {/* Projects */}
        {path === "/dashboard/projects" && <ProjectsList />}
        {path.match(/^\/dashboard\/projects\/\d+$/) && <ProjectDetails />}
        {path === "/dashboard/projects/gantt" && <GanttChart />}
        
        {/* Field Operations */}
        {path === "/dashboard/fieldops/dashboard" && <FieldOpsDashboard />}
        {path === "/dashboard/fieldops/operations" && <FieldOperations />}
        {path === "/dashboard/fieldops/teams" && <FieldTeams />}
        {path === "/dashboard/fieldops/workers" && <FieldWorkers />}
        {path === "/dashboard/fieldops/equipment" && <FieldEquipment />}
        
        {/* Diesel System - Restructured */}
        {/* Diesel Assets */}
        {path === "/dashboard/assets/diesel/tanks" && <DieselTanksAssets />}
        {path === "/dashboard/assets/diesel/pumps" && <DieselPumpsAssets />}
        {path === "/dashboard/assets/diesel/pipes" && <DieselPipesAssets />}
        {/* Legacy route */}
        {path === "/dashboard/assets/diesel-tanks" && <DieselTanks />}
        {/* Tankers moved to Inventory/Transport */}
        {path === "/dashboard/inventory/transport/diesel/tankers" && <DieselTankers />}
        {/* Diesel Management */}
        {path === "/dashboard/diesel/configuration" && <DieselConfiguration />}
        {path === "/dashboard/diesel/receiving" && <DieselReceiving />}
        {/* Diesel Receiving moved to Field Operations */}
        {path === "/dashboard/fieldops/tasks/generator-tech/diesel-receiving" && <DieselReceivingTasks />}
        
        {/* HR */}
        {path === "/dashboard/hr/dashboard" && <HRDashboard />}
        {path === "/dashboard/hr/employees" && <Employees />}
        {path === "/dashboard/hr/departments" && <Departments />}
        {path === "/dashboard/hr/attendance" && <Attendance />}
        {path === "/dashboard/hr/leaves" && <Leaves />}
        {path === "/dashboard/hr/payroll" && <Payroll />}
        
        {/* Billing System */}
        {path === "/dashboard/billing" && <BillingDashboard />}
        {path === "/dashboard/billing/areas" && <AreasManagement />}
        {path === "/dashboard/billing/squares" && <SquaresManagement />}
        {path === "/dashboard/billing/cabinets" && <CabinetsManagement />}
        {path === "/dashboard/billing/tariffs" && <BillingTariffsManagement />}
        {path === "/dashboard/billing/fee-types" && <FeeTypesManagement />}
        {path === "/dashboard/billing/payment-methods" && <PaymentMethodsManagement />}
        {path === "/dashboard/billing/cashboxes" && <CashboxesManagement />}
        {path === "/dashboard/billing/meters" && <BillingMetersManagement />}
        {path === "/dashboard/billing/customers" && <BillingCustomersManagement />}
        {path === "/dashboard/billing/periods" && <BillingPeriodsManagement />}
        {path === "/dashboard/billing/readings" && <BillingMeterReadings />}
        {path === "/dashboard/billing/invoices" && <BillingInvoicesManagement />}
        {path === "/dashboard/billing/payments" && <BillingPaymentsManagement />}
        
        {/* Custom System */}
        {path === "/dashboard/custom" && <CustomDashboard />}
        {path === "/dashboard/custom/sub-systems" && <CustomSubSystems />}
        {path === "/dashboard/custom/treasuries" && <CustomTreasuries />}
        {path === "/dashboard/custom/vouchers" && <CustomVouchers />}
        {path === "/dashboard/custom/reconciliation" && <CustomReconciliation />}
        {path === "/dashboard/custom/accounts" && <CustomAccounts />}
        {path === "/dashboard/custom/notes" && <CustomNotes />}
        {path === "/dashboard/custom/memos" && <CustomMemos />}
        
        {/* Developer */}
        {path === "/dashboard/developer" && <DeveloperDashboard />}
        {path === "/dashboard/developer/integrations" && <Integrations />}
        {path === "/dashboard/developer/api-keys" && <ApiKeys />}
        {path === "/dashboard/developer/events" && <Events />}
        {path === "/dashboard/developer/ai-models" && <AiModels />}
        {path === "/dashboard/developer/technical-alerts" && <TechnicalAlerts />}
        
        {/* Default - Page Under Development */}
        {!path.match(/^\/dashboard(\/|$)/) && (
          <div className="flex items-center justify-center h-full">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>هذه الصفحة قيد التطوير</CardTitle>
                <CardDescription>سيتم إضافة المحتوى قريباً</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </Suspense>
    );
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen bg-background text-foreground", isDarkMode ? "dark" : "")}>
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 flex flex-col bg-card border-l transition-all duration-300 h-screen",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">نظام الطاقة</span>
            </div>
          )}
          {!sidebarOpen && <Zap className="h-6 w-6 text-primary mx-auto" />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(!sidebarOpen && "mx-auto")}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2 overflow-y-auto">
          <nav className="px-2 space-y-0.5">
            {navigationItems.map((item, index) => (
              <div key={item.id}>
                {/* Add separator after specific sections */}
                {(index === 1 || index === 4 || index === 8 || index === 11 || index === 14) && sidebarOpen && (
                  <div className="my-3 mx-2 border-t border-border/50" />
                )}
                {item.children ? (
                  <>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 mb-0.5 h-10 transition-all duration-200",
                        "hover:bg-accent/80 hover:translate-x-[-2px]",
                        !sidebarOpen && "justify-center px-2",
                        expandedItems.includes(item.id) && "bg-accent/50"
                      )}
                      onClick={() => toggleExpand(item.id)}
                    >
                      <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", (item as any).color)} />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-right font-medium">{item.title}</span>
                          <ChevronLeft className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            expandedItems.includes(item.id) && "-rotate-90"
                          )} />
                        </>
                      )}
                    </Button>
                    {sidebarOpen && expandedItems.includes(item.id) && (
                      <div className="mr-3 pr-3 space-y-0.5 border-r-2 border-border/30 animate-in slide-in-from-top-2 duration-200">
                        {item.children.map((child) => (
                          child.children ? (
                            // المستوى الثاني - عنصر له أبناء
                            <div key={child.id}>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start gap-3 text-sm h-9 transition-all duration-150",
                                  "hover:translate-x-[-2px]",
                                  expandedItems.includes(child.id) && "bg-accent/30"
                                )}
                                onClick={() => toggleExpand(child.id)}
                              >
                                <child.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="flex-1 text-right">{child.title}</span>
                                <ChevronLeft className={cn(
                                  "h-3 w-3 transition-transform duration-200",
                                  expandedItems.includes(child.id) && "-rotate-90"
                                )} />
                              </Button>
                              {expandedItems.includes(child.id) && (
                                <div className="mr-3 pr-3 space-y-0.5 border-r border-border/20">
                                  {child.children.map((subChild: any) => (
                                    subChild.children ? (
                                      // المستوى الثالث - عنصر له أبناء
                                      <div key={subChild.id}>
                                        <Button
                                          variant="ghost"
                                          className={cn(
                                            "w-full justify-start gap-3 text-xs h-8 transition-all duration-150",
                                            "hover:translate-x-[-2px]",
                                            expandedItems.includes(subChild.id) && "bg-accent/20"
                                          )}
                                          onClick={() => toggleExpand(subChild.id)}
                                        >
                                          <subChild.icon className="h-3 w-3 shrink-0 text-muted-foreground" />
                                          <span className="flex-1 text-right">{subChild.title}</span>
                                          <ChevronLeft className={cn(
                                            "h-3 w-3 transition-transform duration-200",
                                            expandedItems.includes(subChild.id) && "-rotate-90"
                                          )} />
                                        </Button>
                                        {expandedItems.includes(subChild.id) && (
                                          <div className="mr-3 pr-3 space-y-0.5 border-r border-border/10">
                                            {subChild.children.map((deepChild: any) => (
                                              <Button
                                                key={deepChild.id}
                                                variant={isActivePath(deepChild.path) ? "secondary" : "ghost"}
                                                className={cn(
                                                  "w-full justify-start gap-3 text-xs h-7 transition-all duration-150",
                                                  "hover:translate-x-[-2px]",
                                                  isActivePath(deepChild.path) && "bg-primary/10 text-primary border-r-2 border-primary"
                                                )}
                                                onClick={() => handleNavigation(deepChild.path)}
                                              >
                                                <deepChild.icon className={cn(
                                                  "h-3 w-3 shrink-0",
                                                  isActivePath(deepChild.path) ? "text-primary" : "text-muted-foreground"
                                                )} />
                                                <span>{deepChild.title}</span>
                                              </Button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      // المستوى الثالث - عنصر نهائي
                                      <Button
                                        key={subChild.id}
                                        variant={isActivePath(subChild.path) ? "secondary" : "ghost"}
                                        className={cn(
                                          "w-full justify-start gap-3 text-xs h-8 transition-all duration-150",
                                          "hover:translate-x-[-2px]",
                                          isActivePath(subChild.path) && "bg-primary/10 text-primary border-r-2 border-primary"
                                        )}
                                        onClick={() => handleNavigation(subChild.path)}
                                      >
                                        <subChild.icon className={cn(
                                          "h-3 w-3 shrink-0",
                                          isActivePath(subChild.path) ? "text-primary" : "text-muted-foreground"
                                        )} />
                                        <span>{subChild.title}</span>
                                      </Button>
                                    )
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            // المستوى الثاني - عنصر نهائي
                            <Button
                              key={child.id}
                              variant={isActivePath(child.path) ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start gap-3 text-sm h-9 transition-all duration-150",
                                "hover:translate-x-[-2px]",
                                isActivePath(child.path) && "bg-primary/10 text-primary border-r-2 border-primary"
                              )}
                              onClick={() => handleNavigation(child.path)}
                            >
                              <child.icon className={cn(
                                "h-4 w-4 shrink-0",
                                isActivePath(child.path) ? "text-primary" : "text-muted-foreground"
                              )} />
                              <span>{child.title}</span>
                            </Button>
                          )
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    variant={isActivePath(item.path!) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10 transition-all duration-200",
                      "hover:bg-accent/80 hover:translate-x-[-2px]",
                      !sidebarOpen && "justify-center px-2",
                      isActivePath(item.path!) && "bg-primary/10 text-primary border-r-2 border-primary"
                    )}
                    onClick={() => handleNavigation(item.path!)}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", (item as any).color)} />
                    {sidebarOpen && <span className="font-medium">{item.title}</span>}
                  </Button>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* User Menu */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(
                "w-full justify-start gap-3",
                !sidebarOpen && "justify-center px-2"
              )}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name?.charAt(0) || "م"}
                  </AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{user?.name || "مستخدم تجريبي"}</span>
                    <span className="text-muted-foreground text-xs">{user?.role || "مستخدم"}</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="h-4 w-4 ml-2" /> : <Moon className="h-4 w-4 ml-2" />}
                {isDarkMode ? "الوضع الفاتح" : "الوضع الداكن"}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 ml-2" />
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="h-4 w-4 ml-2" />
                المساعدة
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "mr-64" : "mr-16"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-card border-b">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث..."
                className="w-64 h-9 pr-10 pl-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
