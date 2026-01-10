/**
 * Employee App Screens Management
 * إدارة شاشات تطبيق الموظف
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, Home, ClipboardList, Gauge, Wrench, MapPin, 
  Package, CreditCard, Camera, Settings, Plus, Edit, Trash2, Eye
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const employeeScreens = [
  {
    id: 1,
    code: "dashboard",
    nameAr: "لوحة التحكم",
    nameEn: "Dashboard",
    type: "dashboard",
    icon: Home,
    route: "/employee/dashboard",
    order: 1,
    isActive: true,
    permissions: ["worker:view_dashboard"],
    features: ["view_tasks", "view_stats", "view_map"],
  },
  {
    id: 2,
    code: "tasks",
    nameAr: "المهام",
    nameEn: "Tasks",
    type: "list",
    icon: ClipboardList,
    route: "/employee/tasks",
    order: 2,
    isActive: true,
    permissions: ["worker:view_tasks", "worker:start_task", "worker:complete_task"],
    features: ["view_list", "view_details", "start", "complete", "update_status", "add_notes", "upload_photos"],
  },
  {
    id: 3,
    code: "readings",
    nameAr: "القراءات",
    nameEn: "Meter Readings",
    type: "form",
    icon: Gauge,
    route: "/employee/readings",
    order: 3,
    isActive: true,
    permissions: ["worker:read_meter"],
    features: ["view_list", "enter_reading", "scan_qr", "upload_photo", "add_notes", "gps_location"],
  },
  {
    id: 4,
    code: "installations",
    nameAr: "التركيبات",
    nameEn: "Installations",
    type: "form",
    icon: Wrench,
    route: "/employee/installations",
    order: 4,
    isActive: true,
    permissions: ["worker:install_meter"],
    features: ["view_list", "view_details", "record_meter_data", "record_seals", "record_breakers", "record_initial_reading", "upload_photos", "gps_location"],
  },
  {
    id: 5,
    code: "replacements",
    nameAr: "الاستبدالات",
    nameEn: "Replacements",
    type: "form",
    icon: Wrench,
    route: "/employee/replacements",
    order: 5,
    isActive: true,
    permissions: ["worker:replace_meter"],
    features: ["view_list", "view_details", "record_old_meter", "record_new_meter", "record_reason", "upload_photos"],
  },
  {
    id: 6,
    code: "disconnections",
    nameAr: "الفصل/الربط",
    nameEn: "Disconnections",
    type: "form",
    icon: Wrench,
    route: "/employee/disconnections",
    order: 6,
    isActive: true,
    permissions: ["worker:disconnect_meter", "worker:reconnect_meter"],
    features: ["view_list", "view_details", "record_reason", "record_meter_status", "upload_photos"],
  },
  {
    id: 7,
    code: "maintenance",
    nameAr: "الصيانة",
    nameEn: "Maintenance",
    type: "form",
    icon: Wrench,
    route: "/employee/maintenance",
    order: 7,
    isActive: true,
    permissions: ["worker:maintain_meter"],
    features: ["view_list", "view_details", "record_type", "record_parts", "record_time", "upload_photos"],
  },
  {
    id: 8,
    code: "inspection",
    nameAr: "الفحص الميداني",
    nameEn: "Field Inspection",
    type: "form",
    icon: Camera,
    route: "/employee/inspection",
    order: 8,
    isActive: true,
    permissions: ["worker:inspect_meter"],
    features: ["view_list", "view_details", "fill_form", "upload_photos", "add_notes"],
  },
  {
    id: 9,
    code: "collection",
    nameAr: "التحصيل",
    nameEn: "Collection",
    type: "form",
    icon: CreditCard,
    route: "/employee/collection",
    order: 9,
    isActive: true,
    permissions: ["worker:collect_payment"],
    features: ["view_list", "view_invoices", "collect_payment", "issue_receipt", "update_status"],
  },
  {
    id: 10,
    code: "materials",
    nameAr: "المواد",
    nameEn: "Materials",
    type: "list",
    icon: Package,
    route: "/employee/materials",
    order: 10,
    isActive: true,
    permissions: ["worker:request_materials", "worker:receive_materials"],
    features: ["view_list", "request_materials", "receive_materials", "return_materials"],
  },
  {
    id: 11,
    code: "location",
    nameAr: "الموقع",
    nameEn: "Location/GPS",
    type: "map",
    icon: MapPin,
    route: "/employee/location",
    order: 11,
    isActive: true,
    permissions: ["worker:update_location"],
    features: ["track_location", "view_tasks_on_map", "navigate_to_task", "record_location"],
  },
  {
    id: 12,
    code: "profile",
    nameAr: "الملف الشخصي",
    nameEn: "Profile",
    type: "profile",
    icon: Users,
    route: "/employee/profile",
    order: 12,
    isActive: true,
    permissions: ["worker:update_profile"],
    features: ["view", "edit", "change_password", "notifications_settings"],
  },
  {
    id: 13,
    code: "notifications",
    nameAr: "الإشعارات",
    nameEn: "Notifications",
    type: "list",
    icon: Settings,
    route: "/employee/notifications",
    order: 13,
    isActive: true,
    permissions: ["worker:view_notifications"],
    features: ["view_list", "view_new_tasks", "view_updates", "settings"],
  },
];

export default function EmployeeAppScreens() {
  const [selectedScreen, setSelectedScreen] = useState<number | null>(null);
  
  // Get employee app ID (assuming businessId = 1 for now)
  const { data: apps } = trpc.mobileApps.getApps.useQuery({
    businessId: 1,
    appType: "employee",
  });
  
  const employeeAppId = apps?.[0]?.id;
  
  const { data: screens, isLoading } = trpc.mobileApps.getScreens.useQuery(
    { appId: employeeAppId || 0 },
    { enabled: !!employeeAppId }
  );

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      dashboard: { label: "لوحة تحكم", variant: "default" },
      list: { label: "قائمة", variant: "secondary" },
      form: { label: "نموذج", variant: "outline" },
      map: { label: "خريطة", variant: "outline" },
      profile: { label: "ملف شخصي", variant: "secondary" },
    };
    return badges[type] || { label: type, variant: "default" };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">شاشات تطبيق الموظف</h1>
          <p className="text-muted-foreground mt-2">
            إدارة الشاشات والوظائف المتاحة في تطبيق الموظف الميداني
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          إضافة شاشة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الشاشات</CardTitle>
          <CardDescription>
            {employeeScreens.length} شاشة متاحة في تطبيق الموظف
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الترتيب</TableHead>
                <TableHead>اسم الشاشة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المسار</TableHead>
                <TableHead>الصلاحيات</TableHead>
                <TableHead>الوظائف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : (screens && screens.length > 0 ? screens.map((screen: any) => {
                const Icon = screen.icon;
                const typeBadge = getTypeBadge(screen.type);
                return (
                  <TableRow key={screen.id}>
                    <TableCell>{screen.order}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{screen.nameAr}</div>
                          <div className="text-sm text-muted-foreground">{screen.nameEn}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{screen.route}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {screen.permissions.slice(0, 2).map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm.split(":")[1]}
                          </Badge>
                        ))}
                        {screen.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{screen.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {screen.features.length} وظيفة
                      </div>
                    </TableCell>
                    <TableCell>
                      {screen.isActive ? (
                        <Badge variant="default" className="bg-green-500">نشط</Badge>
                      ) : (
                        <Badge variant="secondary">غير نشط</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }) : employeeScreens.map((screen) => {
                const Icon = screen.icon;
                const typeBadge = getTypeBadge(screen.type);
                return (
                  <TableRow key={screen.id}>
                    <TableCell>{screen.order}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{screen.nameAr}</div>
                          <div className="text-sm text-muted-foreground">{screen.nameEn}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{screen.route}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {screen.permissions.slice(0, 2).map((perm: string) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm.split(":")[1]}
                          </Badge>
                        ))}
                        {screen.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{screen.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {screen.features.length} وظيفة
                      </div>
                    </TableCell>
                    <TableCell>
                      {screen.isActive ? (
                        <Badge variant="default" className="bg-green-500">نشط</Badge>
                      ) : (
                        <Badge variant="secondary">غير نشط</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

