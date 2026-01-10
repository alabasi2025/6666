/**
 * Customer App Screens Management
 * إدارة شاشات تطبيق العميل
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  UserCircle, Home, FileText, CreditCard, Gauge, Activity, 
  Wallet, AlertCircle, Bell, Settings, Plus, Edit, Trash2, Eye
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const customerScreens = [
  {
    id: 1,
    code: "dashboard",
    nameAr: "لوحة التحكم",
    nameEn: "Dashboard",
    type: "dashboard",
    icon: Home,
    route: "/customer/dashboard",
    order: 1,
    isActive: true,
    permissions: ["customer:view_dashboard"],
    features: ["view_balance", "view_last_invoice", "view_last_reading", "view_notifications"],
  },
  {
    id: 2,
    code: "invoices",
    nameAr: "الفواتير",
    nameEn: "Invoices",
    type: "list",
    icon: FileText,
    route: "/customer/invoices",
    order: 2,
    isActive: true,
    permissions: ["customer:view_invoices"],
    features: ["view_list", "view_details", "download_pdf", "share", "pay"],
  },
  {
    id: 3,
    code: "payments",
    nameAr: "المدفوعات",
    nameEn: "Payments",
    type: "list",
    icon: CreditCard,
    route: "/customer/payments",
    order: 3,
    isActive: true,
    permissions: ["customer:view_payments"],
    features: ["view_list", "view_details", "download_receipt", "pay_invoice"],
  },
  {
    id: 4,
    code: "meters",
    nameAr: "العدادات",
    nameEn: "Meters",
    type: "list",
    icon: Gauge,
    route: "/customer/meters",
    order: 4,
    isActive: true,
    permissions: ["customer:view_meters"],
    features: ["view_list", "view_details", "view_readings", "view_notifications"],
  },
  {
    id: 5,
    code: "readings",
    nameAr: "القراءات",
    nameEn: "Readings",
    type: "list",
    icon: Activity,
    route: "/customer/readings",
    order: 5,
    isActive: true,
    permissions: ["customer:view_readings"],
    features: ["view_list", "view_history", "enter_reading", "compare_consumption"],
  },
  {
    id: 6,
    code: "wallet",
    nameAr: "المحفظة",
    nameEn: "Wallet",
    type: "detail",
    icon: Wallet,
    route: "/customer/wallet",
    order: 6,
    isActive: true,
    permissions: ["customer:view_wallet", "customer:charge_wallet"],
    features: ["view_balance", "charge", "view_transactions", "use_for_payment"],
  },
  {
    id: 7,
    code: "complaints",
    nameAr: "الشكاوى",
    nameEn: "Complaints",
    type: "form",
    icon: AlertCircle,
    route: "/customer/complaints",
    order: 7,
    isActive: true,
    permissions: ["customer:create_complaint", "customer:view_complaints"],
    features: ["create", "view_list", "view_details", "track_status", "attach_files"],
  },
  {
    id: 8,
    code: "profile",
    nameAr: "الملف الشخصي",
    nameEn: "Profile",
    type: "profile",
    icon: UserCircle,
    route: "/customer/profile",
    order: 8,
    isActive: true,
    permissions: ["customer:update_profile"],
    features: ["view", "edit", "change_password", "notifications_settings"],
  },
  {
    id: 9,
    code: "notifications",
    nameAr: "الإشعارات",
    nameEn: "Notifications",
    type: "list",
    icon: Bell,
    route: "/customer/notifications",
    order: 9,
    isActive: true,
    permissions: ["customer:view_notifications"],
    features: ["view_list", "mark_read", "delete", "settings"],
  },
];

export default function CustomerAppScreens() {
  const [selectedScreen, setSelectedScreen] = useState<number | null>(null);
  
  // Get customer app ID (assuming businessId = 1 for now)
  const { data: apps } = trpc.mobileApps.getApps.useQuery({
    businessId: 1,
    appType: "customer",
  });
  
  const customerAppId = apps?.[0]?.id;
  
  const { data: screens, isLoading } = trpc.mobileApps.getScreens.useQuery(
    { appId: customerAppId || 0 },
    { enabled: !!customerAppId }
  );

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      dashboard: { label: "لوحة تحكم", variant: "default" },
      list: { label: "قائمة", variant: "secondary" },
      detail: { label: "تفاصيل", variant: "outline" },
      form: { label: "نموذج", variant: "outline" },
      profile: { label: "ملف شخصي", variant: "secondary" },
    };
    return badges[type] || { label: type, variant: "default" };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">شاشات تطبيق العميل</h1>
          <p className="text-muted-foreground mt-2">
            إدارة الشاشات والوظائف المتاحة في تطبيق العميل
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
            {customerScreens.length} شاشة متاحة في تطبيق العميل
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
              }) : customerScreens.map((screen) => {
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

