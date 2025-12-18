import { useAuth } from "@/_core/hooks/useAuth";
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
  Home, Search, HelpCircle, Moon, Sun
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// Asset Pages
import AssetsList from "./assets/AssetsList";
import AssetDetails from "./assets/AssetDetails";
import AssetCategories from "./assets/AssetCategories";
import AssetMovements from "./assets/AssetMovements";
import Depreciation from "./assets/Depreciation";

// Maintenance Pages
import WorkOrdersList from "./maintenance/WorkOrdersList";
import WorkOrderDetails from "./maintenance/WorkOrderDetails";
import MaintenancePlans from "./maintenance/MaintenancePlans";
import Technicians from "./maintenance/Technicians";

// Inventory Pages
import Warehouses from "./inventory/Warehouses";
import Items from "./inventory/Items";
import Movements from "./inventory/Movements";
import StockBalance from "./inventory/StockBalance";
import Suppliers from "./inventory/Suppliers";
import PurchaseOrders from "./inventory/PurchaseOrders";

// Navigation Structure
const navigationItems = [
  {
    id: "home",
    title: "الرئيسية",
    icon: Home,
    path: "/dashboard",
  },
  {
    id: "organization",
    title: "الهيكل التنظيمي",
    icon: Building2,
    children: [
      { id: "businesses", title: "الشركات", icon: Building2, path: "/dashboard/organization/businesses" },
      { id: "branches", title: "الفروع", icon: GitBranch, path: "/dashboard/organization/branches" },
      { id: "stations", title: "المحطات", icon: Radio, path: "/dashboard/organization/stations" },
    ],
  },
  {
    id: "users",
    title: "المستخدمين والصلاحيات",
    icon: Users,
    children: [
      { id: "users-list", title: "المستخدمين", icon: Users, path: "/dashboard/users/list" },
      { id: "roles", title: "الأدوار", icon: Shield, path: "/dashboard/users/roles" },
      { id: "permissions", title: "الصلاحيات", icon: Shield, path: "/dashboard/users/permissions" },
    ],
  },
  {
    id: "accounting",
    title: "النظام المحاسبي",
    icon: Calculator,
    children: [
      { id: "chart-of-accounts", title: "شجرة الحسابات", icon: Landmark, path: "/dashboard/accounting/accounts" },
      { id: "journal-entries", title: "القيود اليومية", icon: FileText, path: "/dashboard/accounting/journal" },
      { id: "cost-centers", title: "مراكز التكلفة", icon: PieChart, path: "/dashboard/accounting/cost-centers" },
      { id: "fiscal-periods", title: "الفترات المحاسبية", icon: Calendar, path: "/dashboard/accounting/periods" },
    ],
  },
  {
    id: "assets",
    title: "إدارة الأصول",
    icon: Package,
    children: [
      { id: "assets-list", title: "الأصول الثابتة", icon: Package, path: "/dashboard/assets/list" },
      { id: "asset-categories", title: "فئات الأصول", icon: FolderKanban, path: "/dashboard/assets/categories" },
      { id: "asset-movements", title: "حركات الأصول", icon: TrendingUp, path: "/dashboard/assets/movements" },
      { id: "depreciation", title: "الإهلاك", icon: TrendingDown, path: "/dashboard/assets/depreciation" },
    ],
  },
  {
    id: "maintenance",
    title: "الصيانة",
    icon: Wrench,
    children: [
      { id: "work-orders", title: "أوامر العمل", icon: ClipboardList, path: "/dashboard/maintenance/work-orders" },
      { id: "maintenance-plans", title: "خطط الصيانة", icon: Calendar, path: "/dashboard/maintenance/plans" },
      { id: "technicians", title: "الفنيين", icon: Users, path: "/dashboard/maintenance/technicians" },
    ],
  },
  {
    id: "inventory",
    title: "المخزون والمشتريات",
    icon: Warehouse,
    children: [
      { id: "warehouses", title: "المستودعات", icon: Warehouse, path: "/dashboard/inventory/warehouses" },
      { id: "items", title: "الأصناف", icon: Package, path: "/dashboard/inventory/items" },
      { id: "movements", title: "حركات المخزون", icon: TrendingUp, path: "/dashboard/inventory/movements" },
      { id: "stock", title: "أرصدة المخزون", icon: BarChart3, path: "/dashboard/inventory/stock" },
      { id: "suppliers", title: "الموردين", icon: UserCircle, path: "/dashboard/inventory/suppliers" },
      { id: "purchase-orders", title: "أوامر الشراء", icon: ShoppingCart, path: "/dashboard/inventory/purchase-orders" },
    ],
  },
  {
    id: "customers",
    title: "العملاء والفوترة",
    icon: UserCircle,
    children: [
      { id: "customers-list", title: "العملاء", icon: UserCircle, path: "/dashboard/customers/list" },
      { id: "meters", title: "العدادات", icon: Gauge, path: "/dashboard/customers/meters" },
      { id: "readings", title: "القراءات", icon: Activity, path: "/dashboard/customers/readings" },
      { id: "invoices", title: "الفواتير", icon: Receipt, path: "/dashboard/customers/invoices" },
      { id: "payments", title: "المدفوعات", icon: CreditCard, path: "/dashboard/customers/payments" },
    ],
  },
  {
    id: "scada",
    title: "المراقبة والتحكم",
    icon: Activity,
    children: [
      { id: "equipment", title: "المعدات", icon: Radio, path: "/dashboard/scada/equipment" },
      { id: "sensors", title: "أجهزة الاستشعار", icon: Activity, path: "/dashboard/scada/sensors" },
      { id: "alerts", title: "التنبيهات", icon: AlertTriangle, path: "/dashboard/scada/alerts" },
      { id: "cameras", title: "الكاميرات", icon: Camera, path: "/dashboard/scada/cameras" },
    ],
  },
  {
    id: "projects",
    title: "إدارة المشاريع",
    icon: FolderKanban,
    children: [
      { id: "projects-list", title: "المشاريع", icon: FolderKanban, path: "/dashboard/projects/list" },
      { id: "tasks", title: "المهام", icon: ClipboardList, path: "/dashboard/projects/tasks" },
      { id: "gantt", title: "مخطط جانت", icon: BarChart3, path: "/dashboard/projects/gantt" },
    ],
  },
  {
    id: "reports",
    title: "التقارير",
    icon: BarChart3,
    children: [
      { id: "financial-reports", title: "التقارير المالية", icon: DollarSign, path: "/dashboard/reports/financial" },
      { id: "operational-reports", title: "التقارير التشغيلية", icon: Activity, path: "/dashboard/reports/operational" },
      { id: "maintenance-reports", title: "تقارير الصيانة", icon: Wrench, path: "/dashboard/reports/maintenance" },
      { id: "customer-reports", title: "تقارير العملاء", icon: UserCircle, path: "/dashboard/reports/customers" },
    ],
  },
  {
    id: "settings",
    title: "الإعدادات",
    icon: Settings,
    path: "/dashboard/settings",
  },
];

// Stats Cards Data
const statsData = [
  {
    title: "إجمالي الأصول",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: Package,
    color: "primary",
  },
  {
    title: "أوامر العمل النشطة",
    value: "56",
    change: "-8%",
    trend: "down",
    icon: Wrench,
    color: "warning",
  },
  {
    title: "العملاء",
    value: "8,492",
    change: "+23%",
    trend: "up",
    icon: UserCircle,
    color: "success",
  },
  {
    title: "الإيرادات الشهرية",
    value: "2.4M",
    change: "+18%",
    trend: "up",
    icon: DollarSign,
    color: "accent",
  },
];

// Recent Activities
const recentActivities = [
  { id: 1, type: "work_order", title: "أمر عمل جديد #WO-2024-001", time: "منذ 5 دقائق", status: "pending" },
  { id: 2, type: "payment", title: "دفعة مستلمة من عميل #C-1234", time: "منذ 15 دقيقة", status: "completed" },
  { id: 3, type: "alert", title: "تنبيه: ارتفاع درجة حرارة المحول T-05", time: "منذ 30 دقيقة", status: "warning" },
  { id: 4, type: "asset", title: "تسجيل أصل جديد #A-2024-089", time: "منذ ساعة", status: "completed" },
  { id: 5, type: "invoice", title: "فاتورة جديدة #INV-2024-567", time: "منذ ساعتين", status: "pending" },
];

// Sidebar Component
function Sidebar({ 
  isOpen, 
  onClose,
  currentPath 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  currentPath: string;
}) {
  const [expandedItems, setExpandedItems] = useState<string[]>(["home"]);
  const [, setLocation] = useLocation();

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 right-0 h-full w-72 bg-sidebar border-l border-sidebar-border z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-energy flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground">نظام الطاقة</h1>
              <p className="text-xs text-muted-foreground">EMS Pro</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="p-3 space-y-1">
            {navigationItems.map((item) => (
              <div key={item.id}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
                        expandedItems.includes(item.id) && "bg-sidebar-accent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                      <ChevronLeft className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        expandedItems.includes(item.id) && "-rotate-90"
                      )} />
                    </button>
                    {expandedItems.includes(item.id) && (
                      <div className="mt-1 mr-4 pr-4 border-r border-sidebar-border space-y-1">
                        {item.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => handleNavigation(child.path)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                              currentPath === child.path
                                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                            )}
                          >
                            <child.icon className="w-4 h-4" />
                            <span>{child.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleNavigation(item.path!)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      currentPath === item.path
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </button>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}

// Header Component
function Header({ 
  onMenuClick,
  user 
}: { 
  onMenuClick: () => void;
  user: any;
}) {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="بحث..."
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <HelpCircle className="w-5 h-5" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user?.name || "مستخدم"}</p>
                <p className="text-xs text-muted-foreground">{user?.role === "admin" ? "مدير" : "مستخدم"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCircle className="w-4 h-4 ml-2" />
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 ml-2" />
              الإعدادات
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// Stats Card Component
function StatsCard({ stat }: { stat: typeof statsData[0] }) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    warning: "text-warning bg-warning/10",
    success: "text-success bg-success/10",
    accent: "text-accent bg-accent/10",
  };

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-foreground ltr-nums">{stat.value}</p>
            <div className="flex items-center gap-1 mt-2">
              {stat.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className={cn(
                "text-sm font-medium",
                stat.trend === "up" ? "text-success" : "text-destructive"
              )}>
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground">من الشهر الماضي</span>
            </div>
          </div>
          <div className={cn("p-3 rounded-xl", colorClasses[stat.color as keyof typeof colorClasses])}>
            <stat.icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Home Content
function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مرحباً بك في لوحة التحكم</h1>
          <p className="text-muted-foreground">إليك نظرة عامة على أداء النظام اليوم</p>
        </div>
        <Button className="gradient-energy">
          <BarChart3 className="w-4 h-4 ml-2" />
          تقرير شامل
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              النشاطات الأخيرة
            </CardTitle>
            <CardDescription>آخر التحديثات والإجراءات في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    activity.status === "completed" && "bg-success/20 text-success",
                    activity.status === "pending" && "bg-warning/20 text-warning",
                    activity.status === "warning" && "bg-destructive/20 text-destructive"
                  )}>
                    {activity.type === "work_order" && <Wrench className="w-5 h-5" />}
                    {activity.type === "payment" && <CreditCard className="w-5 h-5" />}
                    {activity.type === "alert" && <AlertTriangle className="w-5 h-5" />}
                    {activity.type === "asset" && <Package className="w-5 h-5" />}
                    {activity.type === "invoice" && <Receipt className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    activity.status === "completed" && "badge-success",
                    activity.status === "pending" && "badge-warning",
                    activity.status === "warning" && "badge-danger"
                  )}>
                    {activity.status === "completed" && "مكتمل"}
                    {activity.status === "pending" && "قيد الانتظار"}
                    {activity.status === "warning" && "تحذير"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              إجراءات سريعة
            </CardTitle>
            <CardDescription>الوصول السريع للمهام الشائعة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: ClipboardList, label: "أمر عمل جديد", color: "primary" },
                { icon: UserCircle, label: "عميل جديد", color: "success" },
                { icon: Receipt, label: "فاتورة جديدة", color: "warning" },
                { icon: Package, label: "تسجيل أصل", color: "accent" },
                { icon: ShoppingCart, label: "طلب شراء", color: "primary" },
                { icon: BarChart3, label: "تقرير مالي", color: "success" },
              ].map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary/50 transition-colors"
                >
                  <action.icon className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            حالة النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "المحطات النشطة", value: "45/48", status: "good" },
              { label: "التنبيهات الحرجة", value: "2", status: "warning" },
              { label: "أوامر العمل المفتوحة", value: "23", status: "normal" },
              { label: "نسبة التشغيل", value: "98.5%", status: "good" },
            ].map((item, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-foreground ltr-nums">{item.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
                <div className={cn(
                  "w-2 h-2 rounded-full mx-auto mt-2",
                  item.status === "good" && "bg-success",
                  item.status === "warning" && "bg-warning",
                  item.status === "normal" && "bg-primary"
                )} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder Content for other pages
function PlaceholderContent({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <Settings className="w-10 h-10 text-muted-foreground animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md">
        هذه الصفحة قيد التطوير. سيتم إضافة المحتوى قريباً.
      </p>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Determine current page title
  const getPageTitle = () => {
    const path = location;
    for (const item of navigationItems) {
      if (item.path === path) return item.title;
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) return child.title;
        }
      }
    }
    return "لوحة التحكم";
  };

  const renderContent = () => {
    if (location === "/dashboard") {
      return <DashboardHome />;
    }
    // Assets Module
    if (location === "/dashboard/assets/list" || location === "/dashboard/assets") {
      return <AssetsList />;
    }
    if (location === "/dashboard/assets/categories") {
      return <AssetCategories />;
    }
    if (location.startsWith("/dashboard/assets/view/")) {
      return <AssetDetails />;
    }
    if (location === "/dashboard/assets/movements") {
      return <AssetMovements />;
    }
    if (location === "/dashboard/assets/depreciation") {
      return <Depreciation />;
    }
    // Maintenance Module
    if (location === "/dashboard/maintenance/work-orders") {
      return <WorkOrdersList />;
    }
    if (location.startsWith("/dashboard/maintenance/work-orders/view/")) {
      return <WorkOrderDetails />;
    }
    if (location === "/dashboard/maintenance/plans") {
      return <MaintenancePlans />;
    }
    if (location === "/dashboard/maintenance/technicians") {
      return <Technicians />;
    }
    // Inventory Module
    if (location === "/dashboard/inventory/warehouses") {
      return <Warehouses />;
    }
    if (location === "/dashboard/inventory/items") {
      return <Items />;
    }
    if (location === "/dashboard/inventory/movements") {
      return <Movements />;
    }
    if (location === "/dashboard/inventory/stock") {
      return <StockBalance />;
    }
    if (location === "/dashboard/inventory/suppliers") {
      return <Suppliers />;
    }
    if (location === "/dashboard/inventory/purchase-orders") {
      return <PurchaseOrders />;
    }
    return <PlaceholderContent title={getPageTitle()} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentPath={location}
      />
      
      <div className="lg:mr-72">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />
        
        <main className="p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
