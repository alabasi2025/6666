import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  FileText, 
  Mail, 
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Wallet,
  Receipt,
  Building2,
  FolderKanban,
  GitBranch,
  Landmark,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Zap,
  ArrowLeftRight
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function CustomDashboard() {
  const [, setLocation] = useLocation();
  
  // Business ID - يتم تعيينه افتراضياً للشركة الأولى
  const businessId = 1;
  
  const { data: accounts = [] } = trpc.customSystem.accounts.list.useQuery({ businessId });
  const { data: notes = [] } = trpc.customSystem.notes.list.useQuery({ businessId, isArchived: false });
  const { data: memos = [] } = trpc.customSystem.memos.list.useQuery({ businessId });

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || "0"), 0);
  const pinnedNotes = notes.filter(n => n.isPinned);
  const urgentMemos = memos.filter(m => m.priority === "urgent" && m.status !== "archived");

  // Quick stats data
  const quickStats = [
    {
      title: "إجمالي الحسابات",
      value: accounts.length,
      subtitle: "حساب مسجل",
      icon: Landmark,
      trend: "+12%",
      trendUp: true,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-500/10 to-orange-500/10",
    },
    {
      title: "إجمالي الرصيد",
      value: `${totalBalance.toLocaleString()} ر.س`,
      subtitle: "الرصيد الإجمالي",
      icon: Wallet,
      trend: totalBalance >= 0 ? "+8%" : "-5%",
      trendUp: totalBalance >= 0,
      gradient: totalBalance >= 0 ? "from-emerald-500 to-green-500" : "from-red-500 to-rose-500",
      bgGradient: totalBalance >= 0 ? "from-emerald-500/10 to-green-500/10" : "from-red-500/10 to-rose-500/10",
    },
    {
      title: "الملاحظات",
      value: notes.length,
      subtitle: `${pinnedNotes.length} مثبتة`,
      icon: FileText,
      trend: "+5",
      trendUp: true,
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-500/10 to-blue-500/10",
    },
    {
      title: "المذكرات",
      value: memos.length,
      subtitle: `${urgentMemos.length} عاجلة`,
      icon: Mail,
      trend: urgentMemos.length > 0 ? `${urgentMemos.length} عاجلة` : "0 عاجلة",
      trendUp: urgentMemos.length === 0,
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-500/10 to-purple-500/10",
    },
  ];

  // Quick actions
  const quickActions = [
    {
      title: "الأنظمة الفرعية",
      description: "إدارة الأنظمة الفرعية المرتبطة",
      icon: FolderKanban,
      path: "/custom/sub-systems",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      title: "الخزائن",
      description: "إدارة الخزائن والصناديق",
      icon: Building2,
      path: "/custom/treasuries",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "السندات",
      description: "سندات القبض والصرف",
      icon: Receipt,
      path: "/custom/vouchers",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      title: "نظام الوسيط",
      description: "إدارة الحسابات الوسيطة بين الأنظمة",
      icon: ArrowLeftRight,
      path: "/custom/intermediary",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      title: "التسويات",
      description: "الحسابات الوسيطة والتسويات",
      icon: GitBranch,
      path: "/custom/reconciliation",
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
    {
      title: "الحسابات",
      description: "إدارة الحسابات القديمة",
      icon: Landmark,
      path: "/custom/accounts",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "الملاحظات",
      description: "تدوين وإدارة الملاحظات",
      icon: FileText,
      path: "/custom/notes",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/20 p-6 lg:p-8">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">مرحباً بك في النظام المخصص</h1>
              <p className="text-amber-200/60">إدارة شاملة للحسابات والعمليات المالية</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-4 py-2 border border-amber-500/10">
              <Activity className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-zinc-300">النظام يعمل بشكل طبيعي</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-4 py-2 border border-amber-500/10">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-zinc-300">آخر تحديث: الآن</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-amber-500/10 bg-zinc-900/50 p-5 transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5",
            )}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", stat.bgGradient)} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", stat.gradient)}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                  stat.trendUp ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                )}>
                  {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-sm text-zinc-400 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500 mt-1">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            الوصول السريع
          </h2>
          <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10">
            عرض الكل
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setLocation(action.path)}
              className={cn(
                "group relative overflow-hidden rounded-xl border p-4 transition-all hover:scale-105 hover:shadow-lg text-right",
                action.bgColor,
                action.borderColor,
                "hover:border-amber-500/30"
              )}
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", action.bgColor)}>
                <action.icon className={cn("h-5 w-5", action.color)} />
              </div>
              <h3 className="font-medium text-white text-sm mb-1">{action.title}</h3>
              <p className="text-xs text-zinc-500 line-clamp-2">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <div className="rounded-2xl border border-amber-500/10 bg-zinc-900/50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-amber-500/10">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-400" />
              آخر الملاحظات
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              onClick={() => setLocation("/custom/notes")}
            >
              عرض الكل
            </Button>
          </div>
          <div className="p-4">
            {notes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">لا توجد ملاحظات</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  onClick={() => setLocation("/custom/notes")}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة ملاحظة
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.slice(0, 5).map((note) => (
                  <div 
                    key={note.id} 
                    className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer transition-colors border border-transparent hover:border-amber-500/20"
                    onClick={() => setLocation("/custom/notes")}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mt-1.5 ring-2 ring-offset-2 ring-offset-zinc-900" 
                      style={{ backgroundColor: note.color || '#f59e0b' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{note.title}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(note.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    {note.isPinned && (
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">مثبتة</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Urgent Memos */}
        <div className="rounded-2xl border border-amber-500/10 bg-zinc-900/50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-amber-500/10">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              المذكرات العاجلة
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              onClick={() => setLocation("/custom/memos")}
            >
              عرض الكل
            </Button>
          </div>
          <div className="p-4">
            {urgentMemos.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">لا توجد مذكرات عاجلة</p>
                <p className="text-xs text-emerald-500 mt-2">✓ جميع المذكرات تحت السيطرة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentMemos.slice(0, 5).map((memo) => (
                  <div 
                    key={memo.id} 
                    className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 cursor-pointer transition-colors"
                    onClick={() => setLocation("/custom/memos")}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{memo.subject}</p>
                      <p className="text-xs text-zinc-500">
                        {memo.memoNumber} - {new Date(memo.memoDate).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <span className="text-xs bg-red-500/30 text-red-300 px-2 py-0.5 rounded-full font-medium">عاجل</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="rounded-2xl border border-amber-500/10 bg-zinc-900/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-zinc-400">متصل</span>
            </div>
            <div className="text-sm text-zinc-500">
              الإصدار 2.0 | النظام المخصص
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Sparkles className="h-4 w-4 text-amber-500" />
            تم التحديث منذ لحظات
          </div>
        </div>
      </div>
    </div>
  );
}
