/**
 * Mobile App Permissions Management
 * إدارة صلاحيات تطبيقات الجوال
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCircle, Users, Shield, CheckCircle2, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

const customerPermissions = [
  { code: "customer:view_dashboard", nameAr: "عرض لوحة التحكم", nameEn: "View Dashboard", isActive: true },
  { code: "customer:view_invoices", nameAr: "عرض الفواتير", nameEn: "View Invoices", isActive: true },
  { code: "customer:view_payments", nameAr: "عرض المدفوعات", nameEn: "View Payments", isActive: true },
  { code: "customer:view_meters", nameAr: "عرض العدادات", nameEn: "View Meters", isActive: true },
  { code: "customer:view_readings", nameAr: "عرض القراءات", nameEn: "View Readings", isActive: true },
  { code: "customer:view_wallet", nameAr: "عرض المحفظة", nameEn: "View Wallet", isActive: true },
  { code: "customer:charge_wallet", nameAr: "شحن المحفظة", nameEn: "Charge Wallet", isActive: true },
  { code: "customer:pay_invoice", nameAr: "دفع الفاتورة", nameEn: "Pay Invoice", isActive: true },
  { code: "customer:create_complaint", nameAr: "تقديم شكوى", nameEn: "Create Complaint", isActive: true },
  { code: "customer:view_complaints", nameAr: "عرض الشكاوى", nameEn: "View Complaints", isActive: true },
  { code: "customer:update_profile", nameAr: "تحديث الملف الشخصي", nameEn: "Update Profile", isActive: true },
];

const employeePermissions = [
  { code: "worker:view_dashboard", nameAr: "عرض لوحة التحكم", nameEn: "View Dashboard", isActive: true },
  { code: "worker:view_tasks", nameAr: "عرض المهام", nameEn: "View Tasks", isActive: true },
  { code: "worker:start_task", nameAr: "بدء مهمة", nameEn: "Start Task", isActive: true },
  { code: "worker:complete_task", nameAr: "إتمام مهمة", nameEn: "Complete Task", isActive: true },
  { code: "worker:read_meter", nameAr: "قراءة عداد", nameEn: "Read Meter", isActive: true },
  { code: "worker:install_meter", nameAr: "تركيب عداد", nameEn: "Install Meter", isActive: true },
  { code: "worker:replace_meter", nameAr: "استبدال عداد", nameEn: "Replace Meter", isActive: true },
  { code: "worker:disconnect_meter", nameAr: "فصل عداد", nameEn: "Disconnect Meter", isActive: true },
  { code: "worker:reconnect_meter", nameAr: "ربط عداد", nameEn: "Reconnect Meter", isActive: true },
  { code: "worker:maintain_meter", nameAr: "صيانة عداد", nameEn: "Maintain Meter", isActive: true },
  { code: "worker:inspect_meter", nameAr: "فحص عداد", nameEn: "Inspect Meter", isActive: true },
  { code: "worker:collect_payment", nameAr: "تحصيل دفعة", nameEn: "Collect Payment", isActive: true },
  { code: "worker:request_materials", nameAr: "طلب مواد", nameEn: "Request Materials", isActive: true },
  { code: "worker:receive_materials", nameAr: "استلام مواد", nameEn: "Receive Materials", isActive: true },
  { code: "worker:update_location", nameAr: "تحديث الموقع", nameEn: "Update Location", isActive: true },
  { code: "worker:upload_photos", nameAr: "رفع صور", nameEn: "Upload Photos", isActive: true },
  { code: "worker:update_profile", nameAr: "تحديث الملف الشخصي", nameEn: "Update Profile", isActive: true },
];

export default function MobileAppPermissions() {
  const [selectedApp, setSelectedApp] = useState<"customer" | "employee">("customer");
  
  // Get apps
  const { data: customerApps } = trpc.mobileApps.getApps.useQuery({
    businessId: 1,
    appType: "customer",
  });
  
  const { data: employeeApps } = trpc.mobileApps.getApps.useQuery({
    businessId: 1,
    appType: "employee",
  });
  
  const customerAppId = customerApps?.[0]?.id;
  const employeeAppId = employeeApps?.[0]?.id;
  
  const { data: customerPerms, isLoading: loadingCustomer } = trpc.mobileApps.getPermissions.useQuery(
    { appId: customerAppId || 0 },
    { enabled: !!customerAppId && selectedApp === "customer" }
  );
  
  const { data: employeePerms, isLoading: loadingEmployee } = trpc.mobileApps.getPermissions.useQuery(
    { appId: employeeAppId || 0 },
    { enabled: !!employeeAppId && selectedApp === "employee" }
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">صلاحيات تطبيقات الجوال</h1>
          <p className="text-muted-foreground mt-2">
            إدارة الصلاحيات المتاحة في تطبيقات الجوال
          </p>
        </div>
      </div>

      <Tabs value={selectedApp} onValueChange={(v) => setSelectedApp(v as "customer" | "employee")}>
        <TabsList>
          <TabsTrigger value="customer">
            <UserCircle className="w-4 h-4 mr-2" />
            تطبيق العميل
          </TabsTrigger>
          <TabsTrigger value="employee">
            <Users className="w-4 h-4 mr-2" />
            تطبيق الموظف
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle>صلاحيات تطبيق العميل</CardTitle>
              <CardDescription>
                {customerPermissions.length} صلاحية متاحة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رمز الصلاحية</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCustomer ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : (customerPerms && customerPerms.length > 0 ? customerPerms.map((perm: any) => (
                    <TableRow key={perm.code}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{perm.code}</code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{perm.nameAr}</div>
                          <div className="text-sm text-muted-foreground">{perm.nameEn}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {perm.isActive ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            نشط
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="w-3 h-3 mr-1" />
                            غير نشط
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">تعديل</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employee">
          <Card>
            <CardHeader>
              <CardTitle>صلاحيات تطبيق الموظف</CardTitle>
              <CardDescription>
                {employeePermissions.length} صلاحية متاحة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رمز الصلاحية</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingEmployee ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : (employeePerms && employeePerms.length > 0 ? employeePerms.map((perm: any) => (
                    <TableRow key={perm.code}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{perm.code}</code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{perm.nameAr}</div>
                          <div className="text-sm text-muted-foreground">{perm.nameEn}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {perm.isActive ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            نشط
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="w-3 h-3 mr-1" />
                            غير نشط
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">تعديل</Button>
                      </TableCell>
                    </TableRow>
                  )) : employeePermissions.map((perm) => (
                    <TableRow key={perm.code}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{perm.code}</code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{perm.nameAr}</div>
                          <div className="text-sm text-muted-foreground">{perm.nameEn}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {perm.isActive ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            نشط
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="w-3 h-3 mr-1" />
                            غير نشط
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">تعديل</Button>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

