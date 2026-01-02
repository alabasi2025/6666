import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  Plug, Key, Bell, Brain, Activity, Webhook,
  CheckCircle, XCircle, Clock, AlertTriangle,
  ArrowUpRight, RefreshCw, Settings
} from "lucide-react";
import { Link } from "wouter";

export default function DeveloperDashboard() {
  const { data: stats, isLoading, refetch } = trpc.developer.dashboardStats.useQuery({ businessId: 1 } as any);

  const statCards = [
    {
      title: "التكاملات",
      value: stats?.activeIntegrations || 0,
      total: stats?.totalIntegrations || 0,
      icon: Plug,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      link: "/dashboard/developer/integrations",
    },
    {
      title: "مفاتيح API",
      value: stats?.activeApiKeys || 0,
      total: stats?.totalApiKeys || 0,
      icon: Key,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      link: "/dashboard/developer/api-keys",
    },
    {
      title: "الأحداث",
      value: stats?.pendingEvents || 0,
      total: stats?.totalEvents || 0,
      icon: Bell,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      link: "/dashboard/developer/events",
      badge: stats?.pendingEvents ? "قيد الانتظار" : undefined,
    },
    {
      title: "التنبيهات التقنية",
      value: stats?.activeAlerts || 0,
      total: stats?.totalAlerts || 0,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      link: "/dashboard/developer/alerts",
      badge: stats?.activeAlerts ? "نشطة" : undefined,
    },
    {
      title: "نماذج الذكاء الاصطناعي",
      value: stats?.aiModels || 0,
      icon: Brain,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      link: "/dashboard/developer/ai",
    },
    {
      title: "التنبؤات",
      value: stats?.totalPredictions || 0,
      icon: Activity,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      link: "/dashboard/developer/ai/predictions",
    },
  ];

  const quickActions = [
    { title: "إضافة تكامل جديد", icon: Plug, link: "/dashboard/developer/integrations/new" },
    { title: "إنشاء مفتاح API", icon: Key, link: "/dashboard/developer/api-keys/new" },
    { title: "إضافة اشتراك حدث", icon: Webhook, link: "/dashboard/developer/events/subscriptions" },
    { title: "إعداد قاعدة تنبيه", icon: Bell, link: "/dashboard/developer/alerts/rules" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">نظام المطور</h1>
          <p className="text-muted-foreground">إدارة التكاملات والواجهات البرمجية والذكاء الاصطناعي</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  {stat.total !== undefined && stat.total !== stat.value && (
                    <span className="text-sm text-muted-foreground">/ {stat.total}</span>
                  )}
                  {stat.badge && (
                    <Badge variant="secondary" className="mr-auto">
                      {stat.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
          <CardDescription>الوصول السريع للمهام الشائعة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.link}>
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <action.icon className="h-5 w-5 ml-3 text-muted-foreground" />
                  <span>{action.title}</span>
                  <ArrowUpRight className="h-4 w-4 mr-auto text-muted-foreground" />
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              صحة النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>قاعدة البيانات</span>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 ml-1" />
                متصل
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>خدمة API</span>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 ml-1" />
                نشط
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>معالج الأحداث</span>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 ml-1" />
                يعمل
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>التكاملات الخارجية</span>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 ml-1" />
                {stats?.activeIntegrations || 0} نشط
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              إعدادات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/developer/integrations">
              <Button variant="ghost" className="w-full justify-start">
                <Plug className="h-4 w-4 ml-2" />
                إدارة التكاملات
              </Button>
            </Link>
            <Link href="/dashboard/developer/api-keys">
              <Button variant="ghost" className="w-full justify-start">
                <Key className="h-4 w-4 ml-2" />
                مفاتيح API
              </Button>
            </Link>
            <Link href="/dashboard/developer/events">
              <Button variant="ghost" className="w-full justify-start">
                <Webhook className="h-4 w-4 ml-2" />
                نظام الأحداث
              </Button>
            </Link>
            <Link href="/dashboard/developer/ai">
              <Button variant="ghost" className="w-full justify-start">
                <Brain className="h-4 w-4 ml-2" />
                الذكاء الاصطناعي
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
