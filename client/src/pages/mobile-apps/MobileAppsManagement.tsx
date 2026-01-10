/**
 * Mobile Apps Management
 * إدارة تطبيقات الجوال
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, UserCircle, Users, Settings, CheckCircle2, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useBusinessId } from "@/contexts/BusinessContext";

export default function MobileAppsManagement() {
  const [, setLocation] = useLocation();
  const [selectedApp, setSelectedApp] = useState<"customer" | "employee" | null>(null);
  const businessId = useBusinessId();
  
  const { data: appsData, isLoading } = trpc.mobileApps.getApps.useQuery({
    businessId,
  });

  const apps = [
    {
      id: "customer",
      name: "تطبيق العميل",
      nameEn: "Customer App",
      icon: UserCircle,
      description: "تطبيق للعملاء لعرض الفواتير والمدفوعات والعدادات",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      screens: 9,
      features: 25,
      isActive: true,
    },
    {
      id: "employee",
      name: "تطبيق الموظف",
      nameEn: "Employee App",
      icon: Users,
      description: "تطبيق للموظفين الميدانيين لإدارة المهام والقراءات والتركيبات",
      color: "text-green-500",
      bgColor: "bg-green-50",
      screens: 13,
      features: 35,
      isActive: true,
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تطبيقات الجوال</h1>
          <p className="text-muted-foreground mt-2">
            إدارة تطبيقات الجوال وتحديد الشاشات والوظائف لكل تطبيق
          </p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          الإعدادات العامة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <Card
              key={app.id}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${app.bgColor}`}
              onClick={() => setSelectedApp(app.id as "customer" | "employee")}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${app.bgColor}`}>
                      <Icon className={`w-8 h-8 ${app.color}`} />
                    </div>
                    <div>
                      <CardTitle>{app.name}</CardTitle>
                      <CardDescription>{app.nameEn}</CardDescription>
                    </div>
                  </div>
                  {app.isActive ? (
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
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{app.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span>{app.screens} شاشة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span>{app.features} وظيفة</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/dashboard/mobile-apps/${app.id === "customer" ? "customer-screens" : "employee-screens"}`);
                    }}
                  >
                    إدارة الشاشات
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/dashboard/mobile-apps/permissions?app=${app.id}`);
                    }}
                  >
                    الصلاحيات
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات عامة</CardTitle>
          <CardDescription>
            نظام تطبيقات الجوال يسمح لك بإدارة الشاشات والوظائف والصلاحيات لكل تطبيق بشكل مركزي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">تطبيق العميل</h3>
              <p className="text-sm text-muted-foreground">
                يتيح للعملاء عرض الفواتير والمدفوعات والعدادات والقراءات والمحفظة والشكاوى
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">تطبيق الموظف</h3>
              <p className="text-sm text-muted-foreground">
                يتيح للموظفين الميدانيين إدارة المهام والقراءات والتركيبات والاستبدالات والصيانة
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

