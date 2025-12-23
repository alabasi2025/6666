import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Users, Building2, Calendar, Clock, TrendingUp, UserCheck, UserX, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface HRDashboardProps {
  businessId?: number;
}

export default function HRDashboard({ businessId }: HRDashboardProps) {
  const { data: stats, isLoading } = trpc.hr.stats.dashboard.useQuery({ businessId });

  const statCards = [
    {
      title: "إجمالي الموظفين",
      value: stats?.totalEmployees || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "الموظفين النشطين",
      value: stats?.activeEmployees || 0,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "طلبات الإجازات المعلقة",
      value: stats?.pendingLeaves || 0,
      icon: Calendar,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      title: "الأقسام",
      value: stats?.totalDepartments || 0,
      icon: Building2,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">لوحة تحكم الموارد البشرية</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">لوحة تحكم الموارد البشرية</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              إدارة الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              إضافة وتعديل بيانات الموظفين والعقود
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {stats?.totalEmployees || 0} موظف
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                {stats?.activeEmployees || 0} نشط
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              الحضور والانصراف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              تسجيل ومتابعة حضور وانصراف الموظفين
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                تسجيل الحضور
              </span>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                تقارير الحضور
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              الإجازات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              إدارة طلبات الإجازات والموافقات
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                {stats?.pendingLeaves || 0} طلب معلق
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              الرواتب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              إعداد وصرف مسيرات الرواتب الشهرية
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                مسير الرواتب
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              تقييم الأداء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              تقييم أداء الموظفين وتحديد الأهداف
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                التقييمات
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              الهيكل التنظيمي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              إدارة الأقسام والمسميات الوظيفية
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {stats?.totalDepartments || 0} قسم
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
