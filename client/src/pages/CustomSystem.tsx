import { useAuth } from "@/_core/hooks/useAuth";
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
  ChevronLeft, Home, Settings, Bell, Search, HelpCircle,
  LayoutDashboard, Wallet, ClipboardList, Loader2, Zap, ChevronDown,
  FolderKanban, Receipt, GitBranch, Landmark, Building2, Sparkles,
  ArrowRight, MoreHorizontal, Plus, Filter, RefreshCw
} from "lucide-react";
import { useState } from "react";
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

// Navigation Items for Custom System - Horizontal Layout
const customNavigationItems = [
  {
    id: "custom-dashboard",
    title: "الرئيسية",
    icon: LayoutDashboard,
    path: "/custom",
  },
  {
    id: "custom-sub-systems",
    title: "الأنظمة الفرعية",
    icon: FolderKanban,
    path: "/custom/sub-systems",
  },
  {
    id: "custom-treasuries",
    title: "الخزائن",
    icon: Building2,
    path: "/custom/treasuries",
  },
  {
    id: "custom-vouchers",
    title: "السندات",
    icon: Receipt,
    path: "/custom/vouchers",
  },
  {
    id: "custom-reconciliation",
    title: "التسويات",
    icon: GitBranch,
    path: "/custom/reconciliation",
  },
  {
    id: "custom-accounts",
    title: "الحسابات",
    icon: Landmark,
    path: "/custom/accounts",
  },
  {
    id: "custom-notes",
    title: "الملاحظات",
    icon: FileText,
    path: "/custom/notes",
  },
  {
    id: "custom-memos",
    title: "المذكرات",
    icon: Mail,
    path: "/custom/memos",
  },
];

// Main Custom System Component with New Design
export default function CustomSystem() {
  const { user, logout, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  // Fetch notifications count from API
  const { data: notesData } = trpc.customSystem.notes.list.useQuery(
    { businessId: 1 },
    { enabled: !!user }
  );
  
  const unreadNotifications = notesData?.filter((n: any) => !n.isRead)?.length || 0;

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-8 max-w-md w-full">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-3">النظام المخصص</h1>
            <p className="text-amber-200/60">يرجى تسجيل الدخول للمتابعة</p>
          </div>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            size="lg"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  // Get current page title
  const currentItem = customNavigationItems.find(item => 
    location === item.path || (item.path !== "/custom" && location.startsWith(item.path))
  );

  // Render content based on route
  const renderContent = () => {
    if (matchCustom) return <CustomDashboard />;
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

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1 mr-4">
                {customNavigationItems.map((item) => {
                  const isActive = location === item.path || 
                    (item.path !== "/custom" && location.startsWith(item.path));
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setLocation(item.path)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                        isActive 
                          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30" 
                          : "text-zinc-400 hover:text-amber-300 hover:bg-amber-500/10"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", isActive ? "text-amber-400" : "")} />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </nav>
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

      {/* Page Content */}
      <main className="max-w-[1800px] mx-auto">
        {renderContent()}
      </main>

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
