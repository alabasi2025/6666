import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Wrench, Users, Truck, ClipboardCheck, Clock, 
  CheckCircle, AlertTriangle, MapPin, Plus
} from "lucide-react";

interface FieldOpsDashboardProps {
  businessId: number;
  onNavigate: (screen: string) => void;
}

export default function FieldOpsDashboard({ businessId, onNavigate }: FieldOpsDashboardProps) {
  const { data: stats, isLoading } = trpc.fieldOps.dashboardStats.useQuery({ businessId });
  const { data: operations } = trpc.fieldOps.operations.list.useQuery({ 
    businessId, 
    status: "in_progress" 
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "إجمالي العمليات",
      value: stats?.totalOperations || 0,
      icon: Wrench,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "العمليات المجدولة",
      value: stats?.scheduledOperations || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "قيد التنفيذ",
      value: stats?.inProgressOperations || 0,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "المكتملة",
      value: stats?.completedOperations || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  const resourceCards = [
    {
      title: "الفرق الميدانية",
      total: stats?.totalTeams || 0,
      active: stats?.activeTeams || 0,
      icon: Users,
      screen: "field-teams",
    },
    {
      title: "العاملين",
      total: stats?.totalWorkers || 0,
      active: stats?.availableWorkers || 0,
      activeLabel: "متاح",
      icon: Users,
      screen: "field-workers",
    },
    {
      title: "المعدات",
      total: stats?.totalEquipment || 0,
      active: stats?.availableEquipment || 0,
      activeLabel: "متاحة",
      icon: Truck,
      screen: "field-equipment",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "مسودة", variant: "outline" },
      scheduled: { label: "مجدولة", variant: "secondary" },
      assigned: { label: "معينة", variant: "secondary" },
      in_progress: { label: "قيد التنفيذ", variant: "default" },
      waiting_customer: { label: "بانتظار العميل", variant: "outline" },
      on_hold: { label: "معلقة", variant: "destructive" },
      completed: { label: "مكتملة", variant: "default" },
      cancelled: { label: "ملغاة", variant: "destructive" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; className: string }> = {
      low: { label: "منخفضة", className: "bg-gray-100 text-gray-800" },
      medium: { label: "متوسطة", className: "bg-blue-100 text-blue-800" },
      high: { label: "عالية", className: "bg-orange-100 text-orange-800" },
      urgent: { label: "عاجلة", className: "bg-red-100 text-red-800" },
    };
    const config = priorityMap[priority] || { label: priority, className: "" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">العمليات الميدانية</h1>
          <p className="text-muted-foreground">إدارة ومتابعة العمليات الميدانية</p>
        </div>
        <Button onClick={() => onNavigate("field-operations")}>
          <Plus className="h-4 w-4 ml-2" />
          عملية جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onNavigate("field-operations")}>
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

      {/* Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resourceCards.map((resource) => (
          <Card key={resource.title} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onNavigate(resource.screen)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <resource.icon className="h-5 w-5" />
                {resource.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{resource.total}</p>
                  <p className="text-sm text-muted-foreground">إجمالي</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-green-600">{resource.active}</p>
                  <p className="text-sm text-muted-foreground">{resource.activeLabel || "نشط"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Operations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              العمليات الجارية
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => onNavigate("field-operations")}>
              عرض الكل
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {operations && operations.length > 0 ? (
            <div className="space-y-4">
              {operations.slice(0, 5).map((op) => (
                <div key={op.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{op.operationNumber}</span>
                      {getStatusBadge(op.status || "scheduled")}
                      {getPriorityBadge(op.priority || "medium")}
                    </div>
                    <p className="text-sm text-muted-foreground">{op.title}</p>
                    {op.address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {op.address}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate("field-operations")}>
                    التفاصيل
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد عمليات جارية حالياً</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
