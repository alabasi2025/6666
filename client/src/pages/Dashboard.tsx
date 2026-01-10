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
  Activity, AlertTriangle, AlertCircle, Camera, ClipboardList,
  FolderKanban, Calendar, BarChart3, PieChart, BookOpen,
  Settings, LogOut, Menu, X, ChevronLeft, Bell,
  TrendingUp, TrendingDown, DollarSign, Wrench,
  Home, Search, HelpCircle, Moon, Sun, Truck, Users2, Clock, CalendarDays, Wallet,
  Loader2, Navigation, Smartphone, Plus, ClipboardCheck, MessageSquare, Phone,
  ArrowRightLeft, Link, MapPin, RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

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

// Customer Pages - removed (now in billing)

// SCADA Pages - Lazy Loaded
const MonitoringDashboard = lazy(() => import("./scada/MonitoringDashboard"));
const Alerts = lazy(() => import("./scada/Alerts"));
const Sensors = lazy(() => import("./scada/Sensors"));
const Cameras = lazy(() => import("./scada/Cameras"));
const Equipment = lazy(() => import("./scada/Equipment"));

// Projects Pages - Lazy Loaded
const ProjectsList = lazy(() => import("./projects/ProjectsList"));
const ProjectDetails = lazy(() => import("./projects/ProjectDetails"));
const GanttChart = lazy(() => import("./projects/GanttChart"));

// Accounting Pages - Lazy Loaded
const ChartOfAccounts = lazy(() => import("./accounting/ChartOfAccounts"));
const JournalEntries = lazy(() => import("./accounting/JournalEntries"));
const GeneralLedger = lazy(() => import("./accounting/GeneralLedger"));
const TrialBalance = lazy(() => import("./accounting/TrialBalance"));

// Reports Pages - Lazy Loaded
const ReportsLedger = lazy(() => import("./reports/ReportsLedger"));
const ReportsFinancial = lazy(() => import("./reports/ReportsFinancial"));
const ReportsOperational = lazy(() => import("./reports/ReportsOperational"));
const ReportsAnalytics = lazy(() => import("./reports/ReportsAnalytics"));

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
const FieldTasks = lazy(() => import("./fieldops/FieldTasks"));

// Diesel System Pages - Lazy Loaded
const DieselTankers = lazy(() => import("./diesel/DieselTankers"));
const DieselTanks = lazy(() => import("./diesel/DieselTanks"));
const DieselReceivingTasks = lazy(() => import("./diesel/DieselReceivingTasks"));
const DieselConfiguration = lazy(() => import("./diesel/DieselConfiguration"));
const DieselReceiving = lazy(() => import("./diesel/DieselReceiving"));
const DieselDashboard = lazy(() => import("./diesel/DieselDashboard"));
const DieselSuppliers = lazy(() => import("./diesel/DieselSuppliers"));

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

// STS Pages - Lazy Loaded
const STSManagement = lazy(() => import("./sts/STSManagement"));
const STSCharging = lazy(() => import("./sts/STSCharging"));
const STSPaymentSettings = lazy(() => import("./sts/STSPaymentSettings"));
const STSMultiTariffSchedule = lazy(() => import("./sts/STSMultiTariffSchedule"));

// ACREL Pages - Lazy Loaded
const AcrelMeters = lazy(() => import("./acrel/AcrelMeters"));
const AcrelMeterDetails = lazy(() => import("./acrel/AcrelMeterDetails"));
const AcrelCTConfiguration = lazy(() => import("./acrel/AcrelCTConfiguration"));
const AcrelInfrastructureMonitoring = lazy(() => import("./acrel/AcrelInfrastructureMonitoring"));
const AcrelPaymentSettings = lazy(() => import("./acrel/AcrelPaymentSettings"));
const AcrelMultiTariffSchedule = lazy(() => import("./acrel/AcrelMultiTariffSchedule"));
const AcrelDashboard = lazy(() => import("./acrel/AcrelDashboard"));
const AcrelCommands = lazy(() => import("./acrel/AcrelCommands"));

// Government Support Pages - Lazy Loaded
const GovernmentSupportDashboard = lazy(() => import("./government-support/GovernmentSupportDashboard"));
const GovernmentSupportCustomers = lazy(() => import("./government-support/GovernmentSupportCustomers"));
const GovernmentSupportQuotas = lazy(() => import("./government-support/GovernmentSupportQuotas"));
const GovernmentSupportConsumption = lazy(() => import("./government-support/GovernmentSupportConsumption"));
const GovernmentSupportReports = lazy(() => import("./government-support/GovernmentSupportReports"));

// Transition Support Pages - Lazy Loaded
const TransitionDashboard = lazy(() => import("./transition-support/TransitionDashboard"));
const TransitionSupportNotifications = lazy(() => import("./transition-support/TransitionSupportNotifications"));
const TransitionSupportBilling = lazy(() => import("./transition-support/TransitionSupportBilling"));
const TransitionSupportAlerts = lazy(() => import("./transition-support/TransitionSupportAlerts"));

// Wizards - Lazy Loaded
const MeterReplacementWizard = lazy(() => import("./wizards/MeterReplacementWizard"));
const SubscriptionUpgradeWizard = lazy(() => import("./wizards/SubscriptionUpgradeWizard"));
const NewInstallationWizard = lazy(() => import("./wizards/NewInstallationWizard"));
const IoTMigrationWizard = lazy(() => import("./wizards/IoTMigrationWizard"));
const InspectionWizard = lazy(() => import("./wizards/InspectionWizard"));
const GoodsReceiptWizard = lazy(() => import("./wizards/GoodsReceiptWizard"));
const ProjectClosureWizard = lazy(() => import("./wizards/ProjectClosureWizard"));
const FieldSettlementWizard = lazy(() => import("./wizards/FieldSettlementWizard"));
const ComponentRepairWizard = lazy(() => import("./wizards/ComponentRepairWizard"));
const ComponentAssemblyWizard = lazy(() => import("./wizards/ComponentAssemblyWizard"));

// Advanced Reports - Lazy Loaded
const DailyPerformanceReport = lazy(() => import("./reports/DailyPerformanceReport"));
const MonthlyPerformanceReport = lazy(() => import("./reports/MonthlyPerformanceReport"));
const RevenueReport = lazy(() => import("./reports/RevenueReport"));

// Settings Pages - Lazy Loaded
const PricingRulesManagement = lazy(() => import("./billing/main-data/PricingRulesManagement"));
const PaymentGatewaysSettings = lazy(() => import("./settings/PaymentGatewaysSettings"));
const SMSSettings = lazy(() => import("./settings/SMSSettings"));

// Mobile Apps Pages - Lazy Loaded
const MobileAppsManagement = lazy(() => import("./mobile-apps/MobileAppsManagement"));
const CustomerAppScreens = lazy(() => import("./mobile-apps/CustomerAppScreens"));
const EmployeeAppScreens = lazy(() => import("./mobile-apps/EmployeeAppScreens"));
const MobileAppPermissions = lazy(() => import("./mobile-apps/MobileAppPermissions"));
const UserMobileAccess = lazy(() => import("./mobile-apps/UserMobileAccess"));

// Inventory Advanced - Lazy Loaded
const SerialNumbersTracking = lazy(() => import("./inventory/SerialNumbersTracking"));
const AdvancedGoodsReceipt = lazy(() => import("./inventory/AdvancedGoodsReceipt"));
const AdvancedGoodsIssue = lazy(() => import("./inventory/AdvancedGoodsIssue"));
const InventoryAudit = lazy(() => import("./inventory/InventoryAudit"));

// Maintenance Advanced - Lazy Loaded
const DefectiveComponentsManagement = lazy(() => import("./maintenance/DefectiveComponentsManagement"));

// Approvals - Lazy Loaded
const ApprovalsManagement = lazy(() => import("./approvals/ApprovalsManagement"));

// Organization Pages - Lazy Loaded
const Businesses = lazy(() => import("./organization/Businesses"));
const Branches = lazy(() => import("./organization/Branches"));
const Stations = lazy(() => import("./organization/Stations"));
const StationSettings = lazy(() => import("./organization/StationSettings"));

// Operations Pages - Lazy Loaded
const OperationalStructure = lazy(() => import("./operations/OperationalStructure"));
const DistributionNetwork = lazy(() => import("./operations/DistributionNetwork"));
const MiscAssets = lazy(() => import("./operations/MiscAssets"));

// Users Management Pages - Lazy Loaded
const UsersManagement = lazy(() => import("./users/UsersManagement"));
const UsersRoles = lazy(() => import("./users/UsersRoles"));

// Custom System Pages - Lazy Loaded
const CustomDashboard = lazy(() => import("./custom/CustomDashboard"));
const CustomAccounts = lazy(() => import("./custom/CustomAccounts"));
const CustomNotes = lazy(() => import("./custom/CustomNotes"));
const CustomMemos = lazy(() => import("./custom/CustomMemos"));
const CustomSubSystems = lazy(() => import("./custom/CustomSubSystems"));
const CustomTreasuries = lazy(() => import("./custom/CustomTreasuries"));

const CustomReconciliation = lazy(() => import("./custom/CustomReconciliation"));

// Engines Pages - Lazy Loaded
const AutoJournalEngine = lazy(() => import("./engines/AutoJournalEngine"));
const PricingEngine = lazy(() => import("./engines/PricingEngine"));
const ReconciliationEngine = lazy(() => import("./engines/ReconciliationEngine"));
const SchedulingEngine = lazy(() => import("./engines/SchedulingEngine"));
const AssignmentEngine = lazy(() => import("./engines/AssignmentEngine"));
const HealthCheck = lazy(() => import("./engines/HealthCheck"));

// Customer System Pages - Lazy Loaded (الآن من billing/)
const CustomerDashboard = lazy(() => import("./billing/customers/CustomerDashboard"));
const CustomerWallets = lazy(() => import("./billing/customers/CustomerWallets"));
const FinancialTransfers = lazy(() => import("./billing/customers/FinancialTransfers"));
const ComplaintsManagement = lazy(() => import("./billing/customers/ComplaintsManagement"));
const SubscriptionRequestsManagement = lazy(() => import("./billing/customers/SubscriptionRequestsManagement"));
const ReceiptsManagement = lazy(() => import("./billing/customers/ReceiptsManagement"));
const PrepaidCodesManagement = lazy(() => import("./billing/customers/PrepaidCodesManagement"));
const MeterDetailsExtended = lazy(() => import("./billing/meters/MeterDetailsExtended"));
const CustomerDetails = lazy(() => import("./billing/customers/CustomerDetails"));
const SubscriptionAccountsManagement = lazy(() => import("./billing/subscription-accounts/SubscriptionAccountsManagement"));

// Billing System Pages - Lazy Loaded (موحد)
const BillingDashboard = lazy(() => import("./billing/BillingDashboard"));
const AreasManagement = lazy(() => import("./billing/main-data/AreasManagement"));
const SquaresManagement = lazy(() => import("./billing/main-data/SquaresManagement"));
const CabinetsManagement = lazy(() => import("./billing/main-data/CabinetsManagement"));
const TariffsManagement = lazy(() => import("./billing/main-data/TariffsManagement"));
const FeeTypesManagement = lazy(() => import("./billing/main-data/FeeTypesManagement"));
const PaymentMethodsManagement = lazy(() => import("./billing/main-data/PaymentMethodsManagement"));
const CashboxesManagement = lazy(() => import("./billing/main-data/CashboxesManagement"));
const MetersManagement = lazy(() => import("./billing/meters/MetersManagement"));
const MeterCustomerLink = lazy(() => import("./billing/meters/MeterCustomerLink"));
const MetersMap = lazy(() => import("./billing/maps/MetersMap"));
const CustomersManagement = lazy(() => import("./billing/customers/CustomersManagement"));
const BillingPeriodsManagement = lazy(() => import("./billing/invoicing/BillingPeriodsManagement"));
const MeterReadingsManagement = lazy(() => import("./billing/invoicing/MeterReadingsManagement"));
const InvoicesManagement = lazy(() => import("./billing/invoicing/InvoicesManagement"));
const PaymentsManagement = lazy(() => import("./billing/payments/PaymentsManagement"));
const CollectionsAndOverdue = lazy(() => import("./billing/collections/CollectionsAndOverdue"));

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
    id: "reports",
    title: "التقارير",
    icon: FileText,
    color: "text-sky-500",
    children: [
      { id: "ledger-report", title: "كشف حساب", icon: BookOpen, path: "/dashboard/reports/ledger" },
      { id: "trial-balance-report", title: "ميزان المراجعة", icon: BarChart3, path: "/dashboard/reports/trial-balance" },
      { id: "financial", title: "التقارير المالية", icon: DollarSign, path: "/dashboard/reports/financial" },
      { id: "operational", title: "التقارير التشغيلية", icon: Activity, path: "/dashboard/reports/operational" },
      { id: "analytics", title: "التحليلات", icon: PieChart, path: "/dashboard/reports/analytics" },
      { id: "daily-performance", title: "تقرير الأداء اليومي", icon: Calendar, path: "/dashboard/reports/daily-performance" },
      { id: "monthly-performance", title: "تقرير الأداء الشهري", icon: BarChart3, path: "/dashboard/reports/monthly-performance" },
      { id: "revenue", title: "تقرير الإيرادات", icon: DollarSign, path: "/dashboard/reports/revenue" },
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
      { id: "defective-components", title: "المكونات التالفة", icon: AlertTriangle, path: "/dashboard/maintenance/defective-components" },
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
          { id: "serial-numbers", title: "الأرقام التسلسلية", icon: Package, path: "/dashboard/inventory/serial-numbers" },
          { id: "advanced-receipt", title: "استلام متقدم", icon: Package, path: "/dashboard/inventory/advanced-receipt" },
          { id: "advanced-issue", title: "صرف متقدم", icon: Package, path: "/dashboard/inventory/advanced-issue" },
          { id: "inventory-audit", title: "الجرد الدوري", icon: ClipboardCheck, path: "/dashboard/inventory/audit" },
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
    id: "billing",
    title: "العملاء والفوترة",
    icon: Receipt,
    color: "text-cyan-500",
    children: [
      { id: "billing-dashboard", title: "لوحة التحكم", icon: Gauge, path: "/dashboard/billing" },
      {
        id: "customers-management",
        title: "إدارة العملاء",
        icon: Users,
        children: [
          { id: "customers-list", title: "قائمة العملاء", icon: Users, path: "/dashboard/billing/customers" },
          { id: "customers-dashboard", title: "لوحة العميل", icon: Gauge, path: "/dashboard/billing/customers/dashboard" },
          { id: "subscription-accounts", title: "حسابات المشترك", icon: CreditCard, path: "/dashboard/billing/subscription-accounts" },
          { id: "customers-wallets", title: "المحافظ", icon: Wallet, path: "/dashboard/billing/wallets" },
          { id: "customers-complaints", title: "الشكاوى", icon: AlertCircle, path: "/dashboard/billing/complaints" },
          { id: "customers-subscription", title: "طلبات الاشتراك", icon: ClipboardCheck, path: "/dashboard/billing/subscription-requests" },
          { id: "customers-receipts", title: "الإيصالات", icon: Receipt, path: "/dashboard/billing/receipts" },
          { id: "customers-prepaid", title: "أكواد الشحن", icon: CreditCard, path: "/dashboard/billing/prepaid-codes" },
          { id: "customers-transfers", title: "الترحيل المالي", icon: ArrowRightLeft, path: "/dashboard/billing/financial-transfers" },
        ],
      },
      {
        id: "meters-management",
        title: "إدارة العدادات",
        icon: Gauge,
        children: [
          { id: "meters-list", title: "قائمة العدادات", icon: Gauge, path: "/dashboard/billing/meters" },
          { id: "meters-link", title: "ربط العدادات", icon: Link, path: "/dashboard/billing/meters/link" },
          { id: "meters-map", title: "خريطة العدادات", icon: MapPin, path: "/dashboard/billing/meters/map" },
        ],
      },
      {
        id: "billing-cycle",
        title: "دورة الفوترة",
        icon: Activity,
        children: [
          { id: "readings", title: "القراءات", icon: Activity, path: "/dashboard/billing/readings" },
          { id: "periods", title: "فترات الفوترة", icon: Calendar, path: "/dashboard/billing/periods" },
          { id: "invoices", title: "الفواتير", icon: Receipt, path: "/dashboard/billing/invoices" },
          { id: "collections", title: "التحصيل", icon: AlertCircle, path: "/dashboard/billing/collections" },
        ],
      },
      {
        id: "payments-management",
        title: "المدفوعات",
        icon: CreditCard,
        children: [
          { id: "payments", title: "المدفوعات", icon: CreditCard, path: "/dashboard/billing/payments" },
        ],
      },
      {
        id: "billing-settings",
        title: "البيانات الأساسية",
        icon: Settings,
        children: [
          { id: "areas", title: "المناطق", icon: Building2, path: "/dashboard/billing/areas" },
          { id: "squares", title: "المربعات", icon: Building2, path: "/dashboard/billing/squares" },
          { id: "cabinets", title: "الكبائن", icon: Package, path: "/dashboard/billing/cabinets" },
          { id: "tariffs", title: "التعريفات", icon: DollarSign, path: "/dashboard/billing/tariffs" },
          { id: "fee-types", title: "أنواع الرسوم", icon: Receipt, path: "/dashboard/billing/fee-types" },
          { id: "payment-methods", title: "طرق الدفع", icon: CreditCard, path: "/dashboard/billing/payment-methods" },
          { id: "cashboxes", title: "الصناديق", icon: Wallet, path: "/dashboard/billing/cashboxes" },
        ],
      },
      {
        id: "sts",
        title: "عدادات STS",
        icon: Smartphone,
        children: [
          { id: "sts-meters", title: "إدارة عدادات STS", icon: Gauge, path: "/dashboard/sts/meters" },
          { id: "sts-charging", title: "شحن الرصيد", icon: CreditCard, path: "/dashboard/sts/charging" },
          { id: "sts-payment-settings", title: "إعدادات الدفع", icon: Settings, path: "/dashboard/sts/payment-settings" },
          { id: "sts-multi-tariff", title: "التعرفات المتعددة", icon: Calendar, path: "/dashboard/sts/multi-tariff" },
        ],
      },
      {
        id: "acrel",
        title: "عدادات ACREL",
        icon: Zap,
        children: [
          { id: "acrel-dashboard", title: "لوحة التحكم", icon: Gauge, path: "/dashboard/acrel/dashboard" },
          { id: "acrel-meters", title: "إدارة عدادات ACREL", icon: Gauge, path: "/dashboard/acrel/meters" },
          { id: "acrel-commands", title: "الأوامر", icon: Zap, path: "/dashboard/acrel/commands" },
          { id: "acrel-monitoring", title: "مراقبة البنية التحتية", icon: Activity, path: "/dashboard/acrel/monitoring" },
          { id: "acrel-ct-config", title: "محولات التيار", icon: Settings, path: "/dashboard/acrel/ct-configuration" },
          { id: "acrel-payment-settings", title: "إعدادات الدفع", icon: CreditCard, path: "/dashboard/acrel/payment-settings" },
          { id: "acrel-multi-tariff", title: "التعرفات المتعددة", icon: Calendar, path: "/dashboard/acrel/multi-tariff" },
          { id: "acrel-iot-migration", title: "الهجرة إلى IoT", icon: Radio, path: "/dashboard/wizards/iot-migration" },
        ],
      },
      {
        id: "government-support",
        title: "الدعم الحكومي",
        icon: Shield,
        children: [
          { id: "gov-support-dashboard", title: "لوحة التحكم", icon: Gauge, path: "/dashboard/government-support/dashboard" },
          { id: "gov-support-customers", title: "بيانات الدعم", icon: Users, path: "/dashboard/government-support/customers" },
          { id: "gov-support-quotas", title: "الحصص", icon: Calendar, path: "/dashboard/government-support/quotas" },
          { id: "gov-support-consumption", title: "تتبع الاستهلاك", icon: TrendingUp, path: "/dashboard/government-support/consumption" },
          { id: "gov-support-reports", title: "التقارير", icon: Shield, path: "/dashboard/government-support/reports" },
        ],
      },
      {
        id: "transition-support",
        title: "المرحلة الانتقالية",
        icon: TrendingUp,
        children: [
          { id: "transition-dashboard", title: "لوحة المراقبة", icon: Gauge, path: "/dashboard/transition-support/dashboard" },
          { id: "transition-notifications", title: "الإشعارات", icon: Bell, path: "/dashboard/transition-support/notifications" },
          { id: "transition-billing", title: "تعديلات الفوترة", icon: FileText, path: "/dashboard/transition-support/billing" },
          { id: "transition-alerts", title: "التنبيهات", icon: AlertTriangle, path: "/dashboard/transition-support/alerts" },
        ],
      },
    ],
  },
  {
    id: "scada",
    title: "المراقبة والتحكم",
    icon: Activity,
    color: "text-red-500",
    children: [
      { id: "monitoring", title: "لوحة المراقبة", icon: Gauge, path: "/dashboard/scada/monitoring" },
      { id: "equipment", title: "المعدات", icon: Package, path: "/dashboard/scada/equipment" },
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
    id: "engines",
    title: "المحركات الأساسية",
    icon: Activity,
    color: "text-indigo-500",
    children: [
      { id: "auto-journal-engine", title: "محرك القيود المحاسبية", icon: BookOpen, path: "/dashboard/engines/auto-journal" },
      { id: "pricing-engine", title: "محرك التسعير", icon: DollarSign, path: "/dashboard/engines/pricing" },
      { id: "reconciliation-engine", title: "محرك التسوية", icon: GitBranch, path: "/dashboard/engines/reconciliation" },
      { id: "scheduling-engine", title: "محرك الجدولة", icon: Calendar, path: "/dashboard/engines/scheduling" },
      { id: "assignment-engine", title: "محرك الإسناد", icon: Navigation, path: "/dashboard/engines/assignment" },
      { id: "health-check", title: "فحص الصحة", icon: Activity, path: "/dashboard/engines/health" },
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
      { id: "diesel-suppliers", title: "موردي الديزل", icon: Users, path: "/dashboard/diesel/suppliers" },
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
        color: "text-gray-500",
        children: [
          { id: "settings-main", title: "الإعدادات العامة", icon: Settings, path: "/dashboard/settings" },
          { id: "pricing-rules", title: "قواعد التسعير", icon: Calculator, path: "/dashboard/billing/pricing-rules" },
          { id: "payment-gateways", title: "بوابات الدفع", icon: CreditCard, path: "/dashboard/settings/payment-gateways" },
          { id: "sms-settings", title: "خدمة SMS", icon: MessageSquare, path: "/dashboard/settings/sms" },
        ],
      },
      {
        id: "mobile-apps",
        title: "تطبيقات الجوال",
        icon: Phone,
        color: "text-indigo-500",
        children: [
          { id: "mobile-apps-management", title: "إدارة التطبيقات", icon: Smartphone, path: "/dashboard/mobile-apps" },
          { id: "customer-app-screens", title: "شاشات تطبيق العميل", icon: UserCircle, path: "/dashboard/mobile-apps/customer-screens" },
          { id: "employee-app-screens", title: "شاشات تطبيق الموظف", icon: Users, path: "/dashboard/mobile-apps/employee-screens" },
          { id: "mobile-app-permissions", title: "صلاحيات التطبيقات", icon: Shield, path: "/dashboard/mobile-apps/permissions" },
          { id: "user-mobile-access", title: "وصول المستخدمين", icon: Users2, path: "/dashboard/mobile-apps/user-access" },
        ],
      },
  {
    id: "approvals",
    title: "الموافقات",
    icon: FileText,
    path: "/dashboard/approvals",
    color: "text-blue-500",
  },
  {
    id: "wizards",
    title: "المساعدات الذكية",
    icon: Zap,
    color: "text-purple-500",
    children: [
      { id: "inspection", title: "الفحص الميداني", icon: ClipboardCheck, path: "/dashboard/wizards/inspection" },
      { id: "goods-receipt", title: "استلام البضائع", icon: Package, path: "/dashboard/wizards/goods-receipt" },
      { id: "project-closure", title: "إغلاق المشروع", icon: FolderKanban, path: "/dashboard/wizards/project-closure" },
      { id: "field-settlement", title: "التسوية الميدانية", icon: Calculator, path: "/dashboard/wizards/field-settlement" },
      { id: "component-repair", title: "إصلاح المكونات", icon: Wrench, path: "/dashboard/wizards/component-repair" },
      { id: "component-assembly", title: "تجميع المكونات", icon: Package, path: "/dashboard/wizards/component-assembly" },
    ],
  },
];

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const pageInfo = resolvePageInfo(location);
  
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();

  useEffect(() => {
    // Auto-expand parent menu based on current path
    const currentPath = location;
    
    // دالة مساعدة للتحقق من تطابق المسار
    const isPathMatch = (menuPath: string, currentPath: string) => {
      if (menuPath === "/dashboard") {
        return currentPath === "/dashboard";
      }
      
      // مسارات خاصة
      if (menuPath === "/dashboard/billing/subscription-accounts") {
        return /^\/dashboard\/billing\/subscription-accounts(?:\/(\d+))?$/.test(currentPath);
      }
      if (menuPath === "/dashboard/acrel/payment-settings") {
        return /^\/dashboard\/acrel\/payment-settings(?:\/\d+)?$/.test(currentPath);
      }
      if (menuPath === "/dashboard/acrel/multi-tariff") {
        return /^\/dashboard\/acrel\/multi-tariff(?:\/\d+)?$/.test(currentPath);
      }
      
      return currentPath.startsWith(menuPath);
    };
    
    navigationItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some((child: any) => {
          if (child.path) {
            return isPathMatch(child.path, currentPath);
          }
          // للعناصر التي لها children متداخلة
          if (child.children) {
            return child.children.some((deepChild: any) => 
              deepChild.path && isPathMatch(deepChild.path, currentPath)
            );
          }
          return false;
        });
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
    // معالجة خاصة لمسارات subscription-accounts
    if (path === "/dashboard/billing/subscription-accounts") {
      return location.match(/^\/dashboard\/billing\/subscription-accounts(?:\/(\d+))?$/) !== null;
    }
    // معالجة خاصة لمسارات acrel-payment-settings
    if (path === "/dashboard/acrel/payment-settings") {
      return location.match(/^\/dashboard\/acrel\/payment-settings(?:\/\d+)?$/) !== null;
    }
    // معالجة خاصة لمسارات acrel-multi-tariff
    if (path === "/dashboard/acrel/multi-tariff") {
      return location.match(/^\/dashboard\/acrel\/multi-tariff(?:\/\d+)?$/) !== null;
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
        {path?.match(/^\/dashboard\/organization\/stations\/(\d+)\/settings$/) && <StationSettings />}
        
        {/* Operations */}
        {path === "/dashboard/operations/structure" && <OperationalStructure />}
        {path === "/dashboard/operations/network" && <DistributionNetwork />}
        {path === "/dashboard/operations/misc-assets" && <MiscAssets />}
        
        {/* Users */}
        {path === "/dashboard/users" && <UsersManagement />}
        {path === "/dashboard/users/roles" && <UsersRoles />}
        
        {/* Accounting */}
        {path === "/dashboard/accounting/chart-of-accounts" && <ChartOfAccounts />}
        {path === "/dashboard/accounting/journal-entries" && <JournalEntries />}
        {path === "/dashboard/accounting/general-ledger" && <GeneralLedger />}
        {path === "/dashboard/accounting/trial-balance" && <TrialBalance />}
        
        {/* Reports */}
        {path === "/dashboard/reports/ledger" && <ReportsLedger />}
        {path === "/dashboard/reports/trial-balance" && <TrialBalance />}
        {path === "/dashboard/reports/financial" && <ReportsFinancial />}
        {path === "/dashboard/reports/operational" && <ReportsOperational />}
        {path === "/dashboard/reports/analytics" && <ReportsAnalytics />}
        {path === "/dashboard/reports/daily-performance" && <DailyPerformanceReport />}
        {path === "/dashboard/reports/monthly-performance" && <MonthlyPerformanceReport />}
        {path === "/dashboard/reports/revenue" && <RevenueReport />}
        
        {/* Wizards */}
        {path === "/dashboard/wizards/meter-replacement" && <MeterReplacementWizard />}
        {path === "/dashboard/wizards/subscription-upgrade" && <SubscriptionUpgradeWizard />}
        {path === "/dashboard/wizards/new-installation" && <NewInstallationWizard />}
        {path === "/dashboard/wizards/iot-migration" && <IoTMigrationWizard />}
        {path === "/dashboard/wizards/inspection" && <InspectionWizard />}
        {path === "/dashboard/wizards/goods-receipt" && <GoodsReceiptWizard />}
        {path === "/dashboard/wizards/project-closure" && <ProjectClosureWizard />}
        {path === "/dashboard/wizards/field-settlement" && <FieldSettlementWizard />}
        {path === "/dashboard/wizards/component-repair" && <ComponentRepairWizard />}
        {path === "/dashboard/wizards/component-assembly" && <ComponentAssemblyWizard />}
        
        {/* Settings */}
        {path === "/dashboard/settings" && (
          <Suspense fallback={<PageLoader />}>
            <div className="container mx-auto p-6">
              <Card>
                <CardHeader>
                  <CardTitle>الإعدادات</CardTitle>
                  <CardDescription>إعدادات النظام العامة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setLocation("/dashboard/settings/pricing-rules")}>
                      <DollarSign className="w-4 h-4 ml-2" />
                      قواعد التسعير
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Suspense>
        )}
        {path === "/dashboard/settings/payment-gateways" && (
          <Suspense fallback={<PageLoader />}>
            <PaymentGatewaysSettings />
          </Suspense>
        )}
        {path === "/dashboard/settings/sms" && (
          <Suspense fallback={<PageLoader />}>
            <SMSSettings />
          </Suspense>
        )}
        
        {/* Mobile Apps Routes */}
        {path === "/dashboard/mobile-apps" && (
          <Suspense fallback={<PageLoader />}>
            <MobileAppsManagement />
          </Suspense>
        )}
        {path === "/dashboard/mobile-apps/customer-screens" && (
          <Suspense fallback={<PageLoader />}>
            <CustomerAppScreens />
          </Suspense>
        )}
        {path === "/dashboard/mobile-apps/employee-screens" && (
          <Suspense fallback={<PageLoader />}>
            <EmployeeAppScreens />
          </Suspense>
        )}
        {path === "/dashboard/mobile-apps/permissions" && (
          <Suspense fallback={<PageLoader />}>
            <MobileAppPermissions />
          </Suspense>
        )}
        {path === "/dashboard/mobile-apps/user-access" && (
          <Suspense fallback={<PageLoader />}>
            <UserMobileAccess />
          </Suspense>
        )}
        
        {/* Approvals */}
        {path === "/dashboard/approvals" && (
          <Suspense fallback={<PageLoader />}>
            <ApprovalsManagement />
          </Suspense>
        )}
        
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
        {path === "/dashboard/maintenance/defective-components" && <DefectiveComponentsManagement />}
        
        {/* Inventory */}
        {path === "/dashboard/inventory/warehouses" && <Warehouses />}
        {path === "/dashboard/inventory/items" && <Items />}
        {path === "/dashboard/inventory/movements" && <Movements />}
        {path === "/dashboard/inventory/stock-balance" && <StockBalance />}
        {path === "/dashboard/inventory/serial-numbers" && <SerialNumbersTracking />}
        {path === "/dashboard/inventory/advanced-receipt" && <AdvancedGoodsReceipt />}
        {path === "/dashboard/inventory/advanced-issue" && <AdvancedGoodsIssue />}
        {path === "/dashboard/inventory/audit" && <InventoryAudit />}
        {path === "/dashboard/inventory/suppliers" && <Suppliers />}
        {path === "/dashboard/inventory/purchase-orders" && <PurchaseOrders />}
        
        {/* Customers - redirected to billing */}
        
        {/* SCADA */}
        {path === "/dashboard/scada/monitoring" && <MonitoringDashboard />}
        {path === "/dashboard/scada/equipment" && <Equipment />}
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
        {path === "/dashboard/fieldops/tasks/collectors" && <FieldTasks taskType="collectors" />}
        {path === "/dashboard/fieldops/tasks/electricians" && <FieldTasks taskType="electricians" />}
        {path === "/dashboard/fieldops/tasks/station-manager" && <FieldTasks taskType="station-manager" />}
        
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
        {path === "/dashboard/diesel/dashboard" && <DieselDashboard />}
        {path === "/dashboard/diesel/suppliers" && <DieselSuppliers />}
        {/* Diesel Transport */}
        {path === "/dashboard/inventory/transport/diesel/barrels" && <BarrelTransport />}
        {path === "/dashboard/inventory/transport/diesel/station-transfer" && <StationTransfer />}
        {/* Diesel Receiving moved to Field Operations */}
        {path === "/dashboard/fieldops/tasks/generator-tech/diesel-receiving" && <DieselReceivingTasks />}
        
        {/* HR */}
        {path === "/dashboard/hr/dashboard" && <HRDashboard />}
        {path === "/dashboard/hr/employees" && <Employees />}
        {path === "/dashboard/hr/departments" && <Departments />}
        {path === "/dashboard/hr/attendance" && <Attendance />}
        {path === "/dashboard/hr/leaves" && <Leaves />}
        {path === "/dashboard/hr/payroll" && <Payroll />}
        
        {/* STS System */}
        {path === "/dashboard/sts/meters" && <STSManagement />}
        {path === "/dashboard/sts/charging" && <STSCharging />}
        {path === "/dashboard/sts/payment-settings" && <STSPaymentSettings />}
        {path === "/dashboard/sts/multi-tariff" && <STSMultiTariffSchedule />}
        {path?.match(/^\/dashboard\/sts\/meters\/(\d+)\/payment-settings$/) && <STSPaymentSettings />}
        {path?.match(/^\/dashboard\/sts\/meters\/(\d+)\/tariff-schedule$/) && <STSMultiTariffSchedule />}
        
        {/* ACREL System */}
        {path === "/dashboard/acrel/dashboard" && <AcrelDashboard />}
        {path === "/dashboard/acrel/meters" && <AcrelMeters />}
        {path === "/dashboard/acrel/commands" && <AcrelCommands />}
        {path.match(/^\/dashboard\/acrel\/meters\/\d+$/) && <AcrelMeterDetails />}
        {path === "/dashboard/acrel/ct-configuration" && <AcrelCTConfiguration />}
        {path === "/dashboard/acrel/monitoring" && <AcrelInfrastructureMonitoring />}
        {(path === "/dashboard/acrel/payment-settings" || path.match(/^\/dashboard\/acrel\/payment-settings\/\d+$/)) && <AcrelPaymentSettings />}
        {(path === "/dashboard/acrel/multi-tariff" || path.match(/^\/dashboard\/acrel\/multi-tariff\/\d+$/)) && <AcrelMultiTariffSchedule />}
        
        {/* Government Support System */}
        {path === "/dashboard/government-support" && <GovernmentSupportDashboard />}
        {path === "/dashboard/government-support/dashboard" && <GovernmentSupportDashboard />}
        {path === "/dashboard/government-support/customers" && <GovernmentSupportCustomers />}
        {path === "/dashboard/government-support/quotas" && <GovernmentSupportQuotas />}
        {path === "/dashboard/government-support/consumption" && <GovernmentSupportConsumption />}
        {path === "/dashboard/government-support/reports" && <GovernmentSupportReports />}
        
        {/* Transition Support System */}
        {path === "/dashboard/transition-support" && <TransitionDashboard />}
        {path === "/dashboard/transition-support/dashboard" && <TransitionDashboard />}
        {path === "/dashboard/transition-support/notifications" && <TransitionSupportNotifications />}
        {path === "/dashboard/transition-support/billing" && <TransitionSupportBilling />}
        {path === "/dashboard/transition-support/alerts" && <TransitionSupportAlerts />}
        
        {/* Billing System - موحد */}
        {path === "/dashboard/billing" && <BillingDashboard />}
        
        {/* Customers */}
        {path === "/dashboard/billing/customers" && <CustomersManagement />}
        {path === "/dashboard/billing/customers/dashboard" && <CustomerDashboard />}
        {path.match(/^\/dashboard\/billing\/customers\/\d+$/) && <CustomerDetails />}
        {(path === "/dashboard/billing/subscription-accounts" || path.match(/^\/dashboard\/billing\/subscription-accounts\/\d+$/)) && <SubscriptionAccountsManagement />}
        {path === "/dashboard/billing/wallets" && <CustomerWallets />}
        {path === "/dashboard/billing/complaints" && <ComplaintsManagement />}
        {path === "/dashboard/billing/subscription-requests" && <SubscriptionRequestsManagement />}
        {path === "/dashboard/billing/receipts" && <ReceiptsManagement />}
        {path === "/dashboard/billing/prepaid-codes" && <PrepaidCodesManagement />}
        {path === "/dashboard/billing/financial-transfers" && <FinancialTransfers />}
        
        {/* Meters */}
        {path === "/dashboard/billing/meters" && <MetersManagement />}
        {path === "/dashboard/billing/meters/link" && <MeterCustomerLink />}
        {path === "/dashboard/billing/meters/map" && <MetersMap />}
        {path.match(/^\/dashboard\/billing\/meters\/\d+$/) && <MeterDetailsExtended />}
        
        {/* Billing Cycle */}
        {path === "/dashboard/billing/readings" && <MeterReadingsManagement />}
        {path === "/dashboard/billing/periods" && <BillingPeriodsManagement />}
        {path === "/dashboard/billing/invoices" && <InvoicesManagement />}
        {path === "/dashboard/billing/collections" && <CollectionsAndOverdue />}
        
        {/* Payments */}
        {path === "/dashboard/billing/payments" && <PaymentsManagement />}
        
        {/* Settings & Master Data */}
        {path === "/dashboard/billing/areas" && <AreasManagement />}
        {path === "/dashboard/billing/squares" && <SquaresManagement />}
        {path === "/dashboard/billing/cabinets" && <CabinetsManagement />}
        {path === "/dashboard/billing/tariffs" && <TariffsManagement />}
        {path === "/dashboard/billing/pricing-rules" && <PricingRulesManagement />}
        {path === "/dashboard/billing/fee-types" && <FeeTypesManagement />}
        {path === "/dashboard/billing/payment-methods" && <PaymentMethodsManagement />}
        {path === "/dashboard/billing/cashboxes" && <CashboxesManagement />}
        
        {/* Custom System */}
        {path === "/dashboard/custom" && <CustomDashboard />}
        {path === "/dashboard/custom/sub-systems" && <CustomSubSystems />}
        {path === "/dashboard/custom/treasuries" && <CustomTreasuries />}

        {path === "/dashboard/custom/reconciliation" && <CustomReconciliation />}
        {path === "/dashboard/custom/accounts" && <CustomAccounts />}
        {path === "/dashboard/custom/notes" && <CustomNotes />}
        {path === "/dashboard/custom/memos" && <CustomMemos />}
        
        {/* Engines */}
        {path === "/dashboard/engines/auto-journal" && <AutoJournalEngine />}
        {path === "/dashboard/engines/pricing" && <PricingEngine />}
        {path === "/dashboard/engines/reconciliation" && <ReconciliationEngine />}
        {path === "/dashboard/engines/scheduling" && <SchedulingEngine />}
        {path === "/dashboard/engines/assignment" && <AssignmentEngine />}
        {path === "/dashboard/engines/health" && <HealthCheck />}
        
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
        {/* Logo with System Switcher */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {sidebarOpen ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent/50 px-2">
                  <Zap className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg">نظام الطاقة</span>
                  <ChevronLeft className="h-4 w-4 rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" sideOffset={5} className="w-56 z-[9999]">
                <DropdownMenuLabel>تبديل النظام</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 bg-accent/50">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>نظام الطاقة</span>
                  <span className="mr-auto text-xs text-muted-foreground">الحالي</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => setLocation('/custom')}>
                  <Settings className="h-4 w-4 text-fuchsia-500" />
                  <span>النظام المخصص</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="mx-auto">
                  <Zap className="h-6 w-6 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" sideOffset={5} className="w-56 z-[9999]">
                <DropdownMenuLabel>تبديل النظام</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 bg-accent/50">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>نظام الطاقة</span>
                  <span className="mr-auto text-xs text-muted-foreground">الحالي</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => setLocation('/custom')}>
                  <Settings className="h-4 w-4 text-fuchsia-500" />
                  <span>النظام المخصص</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
                                  {((child as any).children || []).map((subChild: any) => (
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
                                            {((subChild as any).children || []).map((deepChild: any) => (
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
            <EngineInfoDialog info={pageInfo} />
            {/* System Switcher Icon */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation('/custom')}
              className="relative group"
              title="الانتقال للنظام المخصص"
            >
              <Settings className="h-5 w-5 text-fuchsia-500 group-hover:rotate-90 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse" />
            </Button>
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
