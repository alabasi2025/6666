// استخدام trpc.auth.me مثل Dashboard للحفاظ على الجلسة
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Calculator, FileText, Mail, Activity, LogOut, Menu, X, 
  ChevronLeft, ChevronRight, Home, Settings, Bell, Search, HelpCircle,
  LayoutDashboard, Wallet, ClipboardList, Loader2, Zap, ChevronDown,
  FolderKanban, Receipt, GitBranch, Landmark, Building2, Sparkles,
  ArrowRight, MoreHorizontal, Plus, Filter, RefreshCw, ChevronUp, ChevronDown as ChevronDownIcon,
  ArrowLeft, ArrowLeftRight, FileCheck, BookOpen, Package, Users, ShoppingCart
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Custom System Pages
import CustomDashboard from "./custom/CustomDashboard";
import CustomAccounts from "./custom/CustomAccounts";
import CustomNotes from "./custom/CustomNotes";
import CustomMemos from "./custom/CustomMemos";
import CustomSubSystems from "./custom/CustomSubSystems";
import CustomTreasuries from "./custom/CustomTreasuries";
import CustomVouchers from "./custom/CustomVouchers";
import CustomReconciliation from "./custom/CustomReconciliation";
import SubSystemDetails from "./custom/SubSystemDetails";

// Custom System v2.2.0 Pages
import {
  OperationsPage,
  JournalEntriesPage,
  AccountsPage as AccountsPageV2,
  CurrenciesPage,
} from "./CustomSystem/v2";

// Navigation Items for Custom System - Horizontal Layout with Colors
const customNavigationItems = [
  {
    id: "custom-dashboard",
    title: "الرئيسية",
    icon: LayoutDashboard,
    path: "/custom",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
    description: "لوحة التحكم الرئيسية",
  },
  {
    id: "custom-sub-systems",
    title: "الأنظمة الفرعية",
    icon: FolderKanban,
    path: "/custom/sub-systems",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    textColor: "text-violet-400",
    description: "إدارة الأنظمة الفرعية",
  },
  {
    id: "custom-treasuries",
    title: "الخزائن",
    icon: Building2,
    path: "/custom/treasuries",
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
    description: "الصناديق والبنوك",
  },
  {
    id: "custom-vouchers",
    title: "السندات",
    icon: Receipt,
    path: "/custom/vouchers",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-400",
    description: "سندات القبض والصرف",
  },
  {
    id: "custom-reconciliation",
    title: "التسويات",
    icon: GitBranch,
    path: "/custom/reconciliation",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-400",
    description: "التسويات المالية",
  },
  {
    id: "custom-accounts",
    title: "الحسابات",
    icon: Landmark,
    path: "/custom/accounts",
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-500/10",
    textColor: "text-teal-400",
    description: "إدارة الحسابات",
  },
  {
    id: "custom-notes",
    title: "الملاحظات",
    icon: FileText,
    path: "/custom/notes",
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-400",
    description: "تدوين الملاحظات",
  },
  {
    id: "custom-memos",
    title: "المذكرات",
    icon: Mail,
    path: "/custom/memos",
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-400",
    description: "المذكرات والتنبيهات",
  },
  // Custom System v2.2.0 Pages
  {
    id: "custom-v2-operations",
    title: "شاشة العمليات",
    icon: Activity,
    path: "/custom/v2/operations",
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-500/10",
    textColor: "text-indigo-400",
    description: "سندات القبض والصرف والتحويلات",
  },
  {
    id: "custom-v2-journal-entries",
    title: "القيود اليومية",
    icon: FileText,
    path: "/custom/v2/journal-entries",
    color: "from-cyan-500 to-teal-500",
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-400",
    description: "إدارة القيود اليومية",
  },
  {
    id: "custom-v2-accounts",
    title: "الحسابات v2",
    icon: Landmark,
    path: "/custom/v2/accounts",
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
    description: "إدارة الحسابات المحاسبية",
  },
  {
    id: "custom-v2-currencies",
    title: "العملات وأسعار الصرف",
    icon: Wallet,
    path: "/custom/v2/currencies",
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-400",
    description: "إدارة العملات وأسعار الصرف",
  },
  {
    id: "custom-inventory",
    title: "نظام المخزون",
    icon: Package,
    path: "/custom/inventory",
    color: "from-slate-500 to-gray-500",
    bgColor: "bg-slate-500/10",
    textColor: "text-slate-400",
    description: "إدارة المخزون والمنتجات",
  },
  {
    id: "custom-suppliers",
    title: "نظام الموردين",
    icon: Users,
    path: "/custom/suppliers",
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-500/10",
    textColor: "text-rose-400",
    description: "إدارة الموردين والشركات",
  },
  {
    id: "custom-purchases",
    title: "نظام المشتريات",
    icon: ShoppingCart,
    path: "/custom/purchases",
    color: "from-lime-500 to-green-500",
    bgColor: "bg-lime-500/10",
    textColor: "text-lime-400",
    description: "إدارة المشتريات والطلبات",
  },
];

// Sub System Navigation Items
const subSystemNavigationItems = [
  {
    id: "overview",
    title: "نظرة عامة",
    icon: LayoutDashboard,
    description: "نظرة شاملة على النظام",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "treasuries",
    title: "الخزائن",
    icon: Wallet,
    description: "إدارة الخزائن والصناديق",
    color: "from-emerald-500 to-green-500",
  },
  {
    id: "vouchers",
    title: "السندات",
    icon: Receipt,
    description: "سندات القبض والصرف",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "transfers",
    title: "التحويلات",
    icon: ArrowLeftRight,
    description: "التحويلات بين الأنظمة",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "reconciliation",
    title: "التسويات",
    icon: FileCheck,
    description: "مطابقة التحويلات",
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: "accounts",
    title: "دليل الحسابات",
    icon: BookOpen,
    description: "الدليل المحاسبي للحسابات",
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: "inventory",
    title: "نظام المخزون",
    icon: Package,
    description: "إدارة المخزون والمنتجات",
    color: "from-slate-500 to-gray-500",
  },
  {
    id: "suppliers",
    title: "نظام الموردين",
    icon: Users,
    description: "إدارة الموردين والشركات",
    color: "from-rose-500 to-pink-500",
  },
  {
    id: "purchases",
    title: "نظام المشتريات",
    icon: ShoppingCart,
    description: "إدارة المشتريات والطلبات",
    color: "from-lime-500 to-green-500",
  },
];

// Main Custom System Component with New Design
export default function CustomSystem() {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading: loading } = trpc.auth.me.useQuery();
  
  const logout = () => {
    window.location.href = '/login';
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [subSystemActiveTab, setSubSystemActiveTab] = useState("overview");

  useEffect(() => {
    // Find the scroll container after render
    const findScrollContainer = () => {
      const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        scrollContainerRef.current = viewport as HTMLDivElement;
      }
    };
    findScrollContainer();
    // Retry after a short delay to ensure DOM is ready
    const timeout = setTimeout(findScrollContainer, 100);
    return () => clearTimeout(timeout);
  }, [sidebarOpen]);
  
  // Route matching
  const [matchCustom] = useRoute("/custom");
  const [matchSubSystems] = useRoute("/custom/sub-systems");
  const [matchTreasuries] = useRoute("/custom/treasuries");
  const [matchVouchers] = useRoute("/custom/vouchers");
  const [matchReconciliation] = useRoute("/custom/reconciliation");
  const [matchAccounts] = useRoute("/custom/accounts");
  const [matchNotes] = useRoute("/custom/notes");
  const [matchMemos] = useRoute("/custom/memos");
  const [matchSettings] = useRoute("/custom/settings");
  const [matchSubSystemDetails] = useRoute("/custom/sub-systems/:id");
  
  // Custom System v2.2.0 Routes
  const [matchV2Operations] = useRoute("/custom/v2/operations");
  const [matchV2JournalEntries] = useRoute("/custom/v2/journal-entries");
  const [matchV2Accounts] = useRoute("/custom/v2/accounts");
  const [matchV2Currencies] = useRoute("/custom/v2/currencies");
  const [matchV2ExchangeRates] = useRoute("/custom/v2/exchange-rates"); // إعادة توجيه إلى العملات
  
  // New Systems Routes
  const [matchInventory] = useRoute("/custom/inventory");
  const [matchSuppliers] = useRoute("/custom/suppliers");
  const [matchPurchases] = useRoute("/custom/purchases");

  // Fetch notifications count from API
  const { data: notesData } = trpc.customSystem.notes.list.useQuery(
    { businessId: 1 },
    { enabled: !!user }
  );
  
  const unreadNotifications = notesData?.filter((n: any) => !n.isRead)?.length || 0;

  // عرض شاشة التحميل أثناء التحقق من الجلسة
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center animate-pulse shadow-lg shadow-amber-500/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <p className="text-amber-200/70 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // النظام المخصص جزء من النظام الرئيسي - لا يحتاج تسجيل دخول منفصل
  // إذا لم يكن المستخدم مسجل دخوله، سيتم التعامل معه كزائر عادي
  // وسيرى النظام بدون بيانات شخصية

  // Get current page title
  const currentItem = customNavigationItems.find(item => 
    location === item.path || (item.path !== "/custom" && location.startsWith(item.path))
  );

  // Render content based on route
  const renderContent = () => {
    // Custom System v2.2.0 Routes
    if (matchV2Operations) return <OperationsPage />;
    if (matchV2JournalEntries) return <JournalEntriesPage />;
    if (matchV2Accounts) return <AccountsPageV2 />;
    if (matchV2Currencies) return <CurrenciesPage />;
    if (matchV2ExchangeRates) {
      // إعادة توجيه إلى صفحة العملات (تم دمجها)
      setLocation("/custom/v2/currencies");
      return null;
    }
    
    // Original Custom System Routes
    if (matchCustom) return <CustomDashboard />;
    if (matchSubSystemDetails) return <SubSystemDetails activeTab={subSystemActiveTab} onTabChange={setSubSystemActiveTab} />;
    if (matchSubSystems) return <CustomSubSystems />;
    if (matchTreasuries) return <CustomTreasuries />;
    if (matchVouchers) return <CustomVouchers />;
    if (matchReconciliation) return <CustomReconciliation />;
    if (matchAccounts) return <CustomAccounts />;
    if (matchNotes) return <CustomNotes />;
    if (matchMemos) return <CustomMemos />;
    if (matchSettings) return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">الإعدادات</h1>
        <p className="text-amber-200/60">صفحة الإعدادات قيد التطوير</p>
      </div>
    );
    
    // New Systems Pages
    if (matchInventory) return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Package className="h-8 w-8 text-slate-400" />
              نظام المخزون
            </h1>
            <p className="text-amber-200/60">إدارة المخزون والمنتجات</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-8 border border-slate-500/20">
            <p className="text-slate-400 text-center">صفحة نظام المخزون قيد التطوير</p>
          </div>
        </div>
      </div>
    );
    
    if (matchSuppliers) return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="h-8 w-8 text-rose-400" />
              نظام الموردين
            </h1>
            <p className="text-amber-200/60">إدارة الموردين والشركات</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-8 border border-rose-500/20">
            <p className="text-slate-400 text-center">صفحة نظام الموردين قيد التطوير</p>
          </div>
        </div>
      </div>
    );
    
    if (matchPurchases) return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-lime-400" />
              نظام المشتريات
            </h1>
            <p className="text-amber-200/60">إدارة المشتريات والطلبات</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-8 border border-lime-500/20">
            <p className="text-slate-400 text-center">صفحة نظام المشتريات قيد التطوير</p>
          </div>
        </div>
      </div>
    );
    
    return <CustomDashboard />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-900" dir="rtl">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-amber-500/10">
        <div className="max-w-[1800px] mx-auto">
          {/* Main Header */}
          <div className="h-16 flex items-center justify-between px-4 lg:px-6">
            {/* Logo & System Switcher */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 hover:bg-amber-500/10 px-3 py-2 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="hidden sm:block text-right">
                      <h1 className="font-bold text-white text-lg">النظام المخصص</h1>
                    </div>
                    <ChevronDown className="h-4 w-4 text-amber-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="start" sideOffset={8} className="w-56 bg-zinc-900 border-amber-500/20">
                  <DropdownMenuLabel className="text-amber-400">تبديل النظام</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-amber-500/20" />
                  <DropdownMenuItem 
                    className="gap-2 cursor-pointer hover:bg-amber-500/10 focus:bg-amber-500/10" 
                    onClick={() => setLocation('/dashboard')}
                  >
                    <Zap className="h-4 w-4 text-blue-400" />
                    <span className="text-white">نظام الطاقة</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 bg-amber-500/10 cursor-default">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-amber-300">النظام المخصص</span>
                    <span className="mr-auto text-xs text-amber-500/70">الحالي</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 bg-zinc-800/50 border border-amber-500/10 rounded-xl px-3 py-2 w-64 focus-within:border-amber-500/30 transition-colors">
                <Search className="h-4 w-4 text-amber-400/50" />
                <Input 
                  placeholder="بحث..." 
                  className="border-0 bg-transparent h-6 text-sm focus-visible:ring-0 placeholder:text-zinc-500 text-white"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </Button>

              {/* Settings */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-zinc-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl hidden sm:flex"
                onClick={() => setLocation("/custom/settings")}
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* Back to Energy System - Icon Button */}
              <Button 
                variant="ghost" 
                size="icon"
                className="relative group text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl"
                onClick={() => setLocation('/dashboard')}
                title="الانتقال لنظام الطاقة"
              >
                <Zap className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              </Button>

              {/* Sidebar Toggle Button - Desktop */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex text-zinc-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-zinc-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-3 hover:bg-amber-500/10 rounded-xl">
                    <Avatar className="h-9 w-9 border-2 border-amber-500/30">
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase() || "م"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium text-white">{user?.name || "مستخدم"}</p>
                      <p className="text-xs text-amber-400/60">{user?.role || "مستخدم"}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-amber-500/20">
                  <DropdownMenuItem 
                    onClick={logout}
                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                  >
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-amber-500/10 bg-zinc-900/95 backdrop-blur-xl">
              <nav className="p-4 grid grid-cols-2 gap-2">
                {customNavigationItems.map((item) => {
                  const isActive = location === item.path || 
                    (item.path !== "/custom" && location.startsWith(item.path));
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setLocation(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30" 
                          : "text-zinc-400 hover:text-amber-300 bg-zinc-800/50 hover:bg-amber-500/10"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", isActive ? "text-amber-400" : "")} />
                      <span className="text-sm font-medium">{item.title}</span>
                    </button>
                  );
                })}
                {/* Back to Energy System - Mobile */}
                <button
                  onClick={() => setLocation("/dashboard")}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-amber-300 bg-zinc-800/50 hover:bg-amber-500/10 col-span-2"
                >
                  <ArrowRight className="h-5 w-5" />
                  <span className="text-sm font-medium">العودة لنظام الطاقة</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conditional Sidebar - Main or Sub System */}
        {matchSubSystemDetails ? (
          /* Sub System Sidebar */
          <aside className={cn(
            "hidden lg:flex flex-col w-72 bg-gradient-to-b from-violet-900/95 to-purple-900/80 backdrop-blur-xl border-r border-violet-500/20 shadow-2xl transition-all duration-300 relative",
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          )}>
            {/* Sub System Sidebar Header */}
            <div className="p-4 border-b border-violet-500/10 bg-gradient-to-l from-violet-500/10 to-transparent">
              <div className="flex items-center gap-3 mb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation("/custom/sub-systems")}
                  className="w-8 h-8 rounded-lg hover:bg-violet-500/20 text-violet-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <FolderKanban className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-white">النظام الفرعي</h2>
                  <p className="text-xs text-violet-400/60">إدارة النظام</p>
                </div>
              </div>
            </div>

            {/* Sub System Navigation */}
            <div className="flex-1 relative overflow-hidden">
              <ScrollArea className="h-full">
                <nav className="p-4 space-y-2">
                  {subSystemNavigationItems.map((item) => {
                    const isActive = subSystemActiveTab === item.id;
                    
                    // Define color classes based on item id
                    const getSubSystemColorClasses = () => {
                      switch(item.id) {
                        case 'overview':
                          return { 
                            activeBg: 'bg-gradient-to-l from-blue-500 to-cyan-500', 
                            iconBg: 'bg-blue-500/20',
                            text: 'text-blue-400',
                            hoverBg: 'hover:bg-blue-500/10',
                            border: 'border-blue-500/30',
                            glow: 'shadow-blue-500/20'
                          };
                        case 'treasuries':
                          return { 
                            activeBg: 'bg-gradient-to-l from-emerald-500 to-green-500', 
                            iconBg: 'bg-emerald-500/20',
                            text: 'text-emerald-400',
                            hoverBg: 'hover:bg-emerald-500/10',
                            border: 'border-emerald-500/30',
                            glow: 'shadow-emerald-500/20'
                          };
                        case 'vouchers':
                          return { 
                            activeBg: 'bg-gradient-to-l from-purple-500 to-pink-500', 
                            iconBg: 'bg-purple-500/20',
                            text: 'text-purple-400',
                            hoverBg: 'hover:bg-purple-500/10',
                            border: 'border-purple-500/30',
                            glow: 'shadow-purple-500/20'
                          };
                        case 'transfers':
                          return { 
                            activeBg: 'bg-gradient-to-l from-orange-500 to-red-500', 
                            iconBg: 'bg-orange-500/20',
                            text: 'text-orange-400',
                            hoverBg: 'hover:bg-orange-500/10',
                            border: 'border-orange-500/30',
                            glow: 'shadow-orange-500/20'
                          };
                        case 'reconciliation':
                          return { 
                            activeBg: 'bg-gradient-to-l from-indigo-500 to-blue-500', 
                            iconBg: 'bg-indigo-500/20',
                            text: 'text-indigo-400',
                            hoverBg: 'hover:bg-indigo-500/10',
                            border: 'border-indigo-500/30',
                            glow: 'shadow-indigo-500/20'
                          };
                        case 'accounts':
                          return { 
                            activeBg: 'bg-gradient-to-l from-teal-500 to-cyan-500', 
                            iconBg: 'bg-teal-500/20',
                            text: 'text-teal-400',
                            hoverBg: 'hover:bg-teal-500/10',
                            border: 'border-teal-500/30',
                            glow: 'shadow-teal-500/20'
                          };
                        case 'inventory':
                          return { 
                            activeBg: 'bg-gradient-to-l from-slate-500 to-gray-500', 
                            iconBg: 'bg-slate-500/20',
                            text: 'text-slate-400',
                            hoverBg: 'hover:bg-slate-500/10',
                            border: 'border-slate-500/30',
                            glow: 'shadow-slate-500/20'
                          };
                        case 'suppliers':
                          return { 
                            activeBg: 'bg-gradient-to-l from-rose-500 to-pink-500', 
                            iconBg: 'bg-rose-500/20',
                            text: 'text-rose-400',
                            hoverBg: 'hover:bg-rose-500/10',
                            border: 'border-rose-500/30',
                            glow: 'shadow-rose-500/20'
                          };
                        case 'purchases':
                          return { 
                            activeBg: 'bg-gradient-to-l from-lime-500 to-green-500', 
                            iconBg: 'bg-lime-500/20',
                            text: 'text-lime-400',
                            hoverBg: 'hover:bg-lime-500/10',
                            border: 'border-lime-500/30',
                            glow: 'shadow-lime-500/20'
                          };
                        default:
                          return { 
                            activeBg: 'bg-gradient-to-l from-violet-500 to-purple-500', 
                            iconBg: 'bg-violet-500/20',
                            text: 'text-violet-400',
                            hoverBg: 'hover:bg-violet-500/10',
                            border: 'border-violet-500/30',
                            glow: 'shadow-violet-500/20'
                          };
                      }
                    };
                    
                    const colors = getSubSystemColorClasses();
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSubSystemActiveTab(item.id)}
                        className={cn(
                          "group relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-medium border-l-4",
                          "hover:scale-[1.02] hover:translate-x-[-2px]",
                          isActive 
                            ? `${colors.activeBg} text-white shadow-xl ${colors.border} border-l-4 ${colors.glow}` 
                            : "text-zinc-400 hover:bg-violet-500/10 border-transparent hover:border-zinc-700/50 hover:text-white bg-zinc-800/30"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300",
                          isActive ? "bg-white/25 shadow-lg scale-110" : `${colors.iconBg} group-hover:scale-105`
                        )}>
                          <item.icon className={cn(
                            "h-5 w-5 transition-all duration-300",
                            isActive ? "text-white" : colors.text
                          )} />
                        </div>
                        <div className="flex-1 text-right min-w-0">
                          <span className={cn(
                            "block transition-colors font-semibold truncate",
                            isActive ? "text-white" : `${colors.text} group-hover:text-white`
                          )}>{item.title}</span>
                          <span className={cn(
                            "block text-xs mt-0.5 transition-colors truncate",
                            isActive ? "text-white/80" : "text-zinc-500 group-hover:text-zinc-400"
                          )}>{item.description}</span>
                        </div>
                        {isActive && (
                          <>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white rounded-l-full shadow-lg" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-white to-white/50 rounded-l-full animate-pulse" />
                          </>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </ScrollArea>
            </div>

            {/* Sub System Sidebar Footer */}
            <div className="p-4 border-t border-violet-500/10 bg-zinc-900/50">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all duration-200 hover:scale-105"
              >
                <ChevronRight className={cn("h-4 w-4 transition-transform duration-300", !sidebarOpen && "rotate-180")} />
                <span className="text-xs font-medium">{sidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}</span>
              </button>
            </div>
          </aside>
        ) : (
          /* Main System Sidebar */
          <aside className={cn(
            "hidden lg:flex flex-col w-72 bg-gradient-to-b from-zinc-900/95 to-zinc-900/80 backdrop-blur-xl border-r border-amber-500/20 shadow-2xl transition-all duration-300 relative",
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          )}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-amber-500/10 bg-gradient-to-l from-amber-500/10 to-transparent">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-white">القائمة الرئيسية</h2>
                  <p className="text-xs text-amber-400/60">اختر القسم المطلوب</p>
                </div>
              </div>
            </div>

          {/* Scrollable Navigation Area */}
          <div className="flex-1 relative overflow-hidden">
            <ScrollArea className="h-full">
              <nav className="p-4 space-y-2">
                {customNavigationItems.map((item) => {
                  const isActive = location === item.path || 
                    (item.path !== "/custom" && location.startsWith(item.path));
                  
                  // Define color classes based on item id
                  const getColorClasses = () => {
                    switch(item.id) {
                      case 'custom-dashboard':
                        return { 
                          activeBg: 'bg-gradient-to-l from-amber-500 to-orange-500', 
                          iconBg: 'bg-amber-500/20',
                          text: 'text-amber-400',
                          hoverBg: 'hover:bg-amber-500/10',
                          border: 'border-amber-500/30',
                          glow: 'shadow-amber-500/20'
                        };
                      case 'custom-sub-systems':
                        return { 
                          activeBg: 'bg-gradient-to-l from-violet-500 to-purple-500', 
                          iconBg: 'bg-violet-500/20',
                          text: 'text-violet-400',
                          hoverBg: 'hover:bg-violet-500/10',
                          border: 'border-violet-500/30',
                          glow: 'shadow-violet-500/20'
                        };
                      case 'custom-treasuries':
                        return { 
                          activeBg: 'bg-gradient-to-l from-emerald-500 to-green-500', 
                          iconBg: 'bg-emerald-500/20',
                          text: 'text-emerald-400',
                          hoverBg: 'hover:bg-emerald-500/10',
                          border: 'border-emerald-500/30',
                          glow: 'shadow-emerald-500/20'
                        };
                      case 'custom-vouchers':
                        return { 
                          activeBg: 'bg-gradient-to-l from-blue-500 to-cyan-500', 
                          iconBg: 'bg-blue-500/20',
                          text: 'text-blue-400',
                          hoverBg: 'hover:bg-blue-500/10',
                          border: 'border-blue-500/30',
                          glow: 'shadow-blue-500/20'
                        };
                      case 'custom-reconciliation':
                        return { 
                          activeBg: 'bg-gradient-to-l from-pink-500 to-rose-500', 
                          iconBg: 'bg-pink-500/20',
                          text: 'text-pink-400',
                          hoverBg: 'hover:bg-pink-500/10',
                          border: 'border-pink-500/30',
                          glow: 'shadow-pink-500/20'
                        };
                      case 'custom-accounts':
                        return { 
                          activeBg: 'bg-gradient-to-l from-teal-500 to-cyan-500', 
                          iconBg: 'bg-teal-500/20',
                          text: 'text-teal-400',
                          hoverBg: 'hover:bg-teal-500/10',
                          border: 'border-teal-500/30',
                          glow: 'shadow-teal-500/20'
                        };
                      case 'custom-notes':
                        return { 
                          activeBg: 'bg-gradient-to-l from-yellow-500 to-amber-500', 
                          iconBg: 'bg-yellow-500/20',
                          text: 'text-yellow-400',
                          hoverBg: 'hover:bg-yellow-500/10',
                          border: 'border-yellow-500/30',
                          glow: 'shadow-yellow-500/20'
                        };
                      case 'custom-memos':
                        return { 
                          activeBg: 'bg-gradient-to-l from-red-500 to-orange-500', 
                          iconBg: 'bg-red-500/20',
                          text: 'text-red-400',
                          hoverBg: 'hover:bg-red-500/10',
                          border: 'border-red-500/30',
                          glow: 'shadow-red-500/20'
                        };
                      default:
                        return { 
                          activeBg: 'bg-gradient-to-l from-indigo-500 to-blue-500', 
                          iconBg: 'bg-indigo-500/20',
                          text: 'text-indigo-400',
                          hoverBg: 'hover:bg-indigo-500/10',
                          border: 'border-indigo-500/30',
                          glow: 'shadow-indigo-500/20'
                        };
                    }
                  };
                  
                  const colors = getColorClasses();
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setLocation(item.path)}
                      title={item.description}
                      className={cn(
                        "group relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-medium border-l-4",
                        "hover:scale-[1.02] hover:translate-x-[-2px]",
                        isActive 
                          ? `${colors.activeBg} text-white shadow-xl ${colors.border} border-l-4 ${colors.glow}` 
                          : `text-zinc-400 ${colors.hoverBg} border-transparent hover:border-zinc-700/50 hover:text-white bg-zinc-800/30`
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300",
                        isActive ? "bg-white/25 shadow-lg scale-110" : `${colors.iconBg} group-hover:scale-105`
                      )}>
                        <item.icon className={cn(
                          "h-5 w-5 transition-all duration-300",
                          isActive ? "text-white" : colors.text
                        )} />
                      </div>
                      <div className="flex-1 text-right min-w-0">
                        <span className={cn(
                          "block transition-colors font-semibold truncate",
                          isActive ? "text-white" : `${colors.text} group-hover:text-white`
                        )}>{item.title}</span>
                        {item.description && (
                          <span className={cn(
                            "block text-xs mt-0.5 transition-colors truncate",
                            isActive ? "text-white/80" : "text-zinc-500 group-hover:text-zinc-400"
                          )}>{item.description}</span>
                        )}
                      </div>
                      {isActive && (
                        <>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white rounded-l-full shadow-lg" />
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-white to-white/50 rounded-l-full animate-pulse" />
                        </>
                      )}
                    </button>
                  );
                })}
              </nav>
            </ScrollArea>

            {/* Scroll Buttons */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 pointer-events-none z-10">
              <button
                onClick={() => {
                  const container = scrollContainerRef.current || document.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
                  if (container) {
                    container.scrollBy({ top: -200, behavior: 'smooth' });
                  }
                }}
                className="pointer-events-auto w-9 h-9 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 backdrop-blur-sm border border-amber-500/30 flex items-center justify-center text-amber-400 hover:text-white hover:bg-gradient-to-br hover:from-amber-500/30 hover:to-orange-500/30 hover:border-amber-500/50 transition-all duration-200 shadow-lg hover:shadow-amber-500/20 hover:scale-110"
                title="التمرير للأعلى"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const container = scrollContainerRef.current || document.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
                  if (container) {
                    container.scrollBy({ top: 200, behavior: 'smooth' });
                  }
                }}
                className="pointer-events-auto w-9 h-9 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 backdrop-blur-sm border border-amber-500/30 flex items-center justify-center text-amber-400 hover:text-white hover:bg-gradient-to-br hover:from-amber-500/30 hover:to-orange-500/30 hover:border-amber-500/50 transition-all duration-200 shadow-lg hover:shadow-amber-500/20 hover:scale-110"
                title="التمرير للأسفل"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-amber-500/10 bg-zinc-900/50">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-200 hover:scale-105"
            >
              <ChevronRight className={cn("h-4 w-4 transition-transform duration-300", !sidebarOpen && "rotate-180")} />
              <span className="text-xs font-medium">{sidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}</span>
            </button>
          </div>
        </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1800px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-amber-500/10 bg-zinc-900/50 mt-8">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>النظام المخصص v2.0</span>
            </div>
            <span>جميع الحقوق محفوظة © 2024</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
