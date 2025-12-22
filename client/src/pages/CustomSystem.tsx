import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  LayoutDashboard, Wallet, ClipboardList, Loader2, Zap, ChevronDown
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

// Navigation Items for Custom System Only
const customNavigationItems = [
  {
    id: "custom-dashboard",
    title: "لوحة التحكم",
    icon: LayoutDashboard,
    path: "/custom",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "custom-accounts",
    title: "الحسابات",
    icon: Wallet,
    path: "/custom/accounts",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "custom-notes",
    title: "الملاحظات",
    icon: FileText,
    path: "/custom/notes",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    id: "custom-memos",
    title: "المذكرات",
    icon: Mail,
    path: "/custom/memos",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "settings",
    title: "الإعدادات",
    icon: Settings,
    path: "/custom/settings",
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
  },
];

// Custom Sidebar Component
function CustomSidebar({ 
  isOpen, 
  onClose,
  currentPath 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  currentPath: string;
}) {
  const [, setLocation] = useLocation();

  const handleNavigation = (path: string) => {
    setLocation(path);
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-slate-900 to-slate-950 border-l border-slate-800 z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        {/* Header with System Switcher */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 hover:bg-slate-800/50 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div className="text-right">
                  <h1 className="font-bold text-white">النظام المخصص</h1>
                  <p className="text-xs text-slate-400">Custom System</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-slate-900 border-slate-800">
              <DropdownMenuLabel className="text-slate-400">تبديل النظام</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem 
                className="gap-2 cursor-pointer hover:bg-slate-800" 
                onClick={() => window.location.href = '/dashboard'}
              >
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-white">نظام الطاقة</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 bg-slate-800/50 cursor-default">
                <Calculator className="h-4 w-4 text-fuchsia-500" />
                <span className="text-white">النظام المخصص</span>
                <span className="mr-auto text-xs text-slate-500">الحالي</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-4 space-y-2">
            {customNavigationItems.map((item) => {
              const isActive = currentPath === item.path || 
                (item.path !== "/custom" && currentPath.startsWith(item.path));
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive 
                      ? `${item.bgColor} ${item.color} font-medium shadow-lg` 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                    isActive ? item.bgColor : "bg-slate-800"
                  )}>
                    <item.icon className={cn("h-5 w-5", isActive ? item.color : "text-slate-400")} />
                  </div>
                  <span>{item.title}</span>
                  {isActive && (
                    <div className={cn("mr-auto w-1.5 h-1.5 rounded-full", item.color.replace("text-", "bg-"))} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Back to Main System */}
          <div className="p-4 border-t border-slate-800 mt-4">
            <button
              onClick={() => setLocation("/dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                <ChevronLeft className="h-5 w-5" />
              </div>
              <span>العودة للنظام الرئيسي</span>
            </button>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Calculator className="h-4 w-4" />
            <span>النظام المخصص v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

// Main Custom System Component
export default function CustomSystem() {
  const { user, logout, loading } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Route matching
  const [matchCustom] = useRoute("/custom");
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <p className="text-slate-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-8 max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">النظام المخصص</h1>
            <p className="text-slate-400">يرجى تسجيل الدخول للمتابعة</p>
          </div>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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
    if (matchAccounts) return <CustomAccounts />;
    if (matchNotes) return <CustomNotes />;
    if (matchMemos) return <CustomMemos />;
    if (matchSettings) return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">الإعدادات</h1>
        <p className="text-slate-400">صفحة الإعدادات قيد التطوير</p>
      </div>
    );
    return <CustomDashboard />;
  };

  return (
    <div className="min-h-screen bg-slate-950" dir="rtl">
      {/* Sidebar */}
      <CustomSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentPath={location}
      />

      {/* Main Content */}
      <div className="lg:mr-72">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30">
          <div className="h-full flex items-center justify-between px-4">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-400 hover:text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2 w-64">
                <Search className="h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="بحث..." 
                  className="border-0 bg-transparent h-6 text-sm focus-visible:ring-0 placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </Button>

              {/* Help */}
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hidden sm:flex">
                <HelpCircle className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-3 hover:bg-slate-800">
                    <Avatar className="h-8 w-8 border border-slate-700">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                        {user?.name?.charAt(0).toUpperCase() || "م"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium text-white">{user?.name || "مستخدم"}</p>
                      <p className="text-xs text-slate-400">{user?.role || "مستخدم"}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800">
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
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
