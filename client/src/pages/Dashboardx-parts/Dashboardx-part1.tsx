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
const DieselDashboard = lazy(() => import("./diesel/DieselDashboard"));

// Diesel Transport Pages - Lazy Loaded
const BarrelTransport = lazy(() => import("./inventory/transport/diesel/BarrelTransport"));
const StationTransfer = lazy(() => import("./inventory/transport/diesel/StationTransfer"));

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
