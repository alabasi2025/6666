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
        {path === "/dashboard/diesel/dashboard" && <DieselDashboard />}
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
