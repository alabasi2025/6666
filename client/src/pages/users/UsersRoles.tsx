import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  Users,
  Key,
  Loader2,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const PAGE_INFO = {
  title: "الأدوار والصلاحيات",
  description: "إدارة الأدوار والصلاحيات في النظام.",
  process: `1) عرض الأدوار:
   - قائمة الأدوار الموجودة
   - الصلاحيات المرتبطة بكل دور
   - عدد المستخدمين لكل دور

2) إدارة الأدوار:
   - عرض تفاصيل الأدوار
   - عرض الصلاحيات`,
  mechanism: `- عرض الأدوار الافتراضية في النظام
- عرض الصلاحيات المرتبطة بكل دور`,
  relatedScreens: [
    { name: "المستخدمين", path: "/dashboard/users", description: "إدارة المستخدمين" },
  ],
  businessLogic: "عرض شامل للأدوار والصلاحيات في النظام.",
};

// الأدوار الافتراضية في النظام
const SYSTEM_ROLES = [
  {
    id: "super_admin",
    nameAr: "مدير النظام",
    nameEn: "Super Admin",
    description: "صلاحيات كاملة لجميع ميزات النظام",
    level: 1,
    isSystem: true,
    permissionsCount: "جميع الصلاحيات",
  },
  {
    id: "admin",
    nameAr: "مدير",
    nameEn: "Administrator",
    description: "صلاحيات إدارية مع بعض القيود",
    level: 2,
    isSystem: true,
    permissionsCount: "معظم الصلاحيات",
  },
  {
    id: "accountant",
    nameAr: "محاسب",
    nameEn: "Accountant",
    description: "صلاحيات العمليات المالية",
    level: 3,
    isSystem: true,
    permissionsCount: "الصلاحيات المالية",
  },
  {
    id: "cashier",
    nameAr: "أمين صندوق",
    nameEn: "Cashier",
    description: "صلاحيات عمليات الصندوق",
    level: 4,
    isSystem: true,
    permissionsCount: "صلاحيات الصندوق",
  },
  {
    id: "viewer",
    nameAr: "مشاهد",
    nameEn: "Viewer",
    description: "صلاحيات القراءة فقط",
    level: 5,
    isSystem: true,
    permissionsCount: "صلاحيات القراءة",
  },
];

export default function UsersRoles() {
  const [location] = useLocation();
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: users, isLoading } = trpc.users.list.useQuery({});

  const pageInfo = resolvePageInfo(location);

  const getUsersCountByRole = (roleId: string) => {
    if (!users) return 0;
    return users.filter((u: any) => u.role === roleId).length;
  };

  const handleViewDetails = (role: any) => {
    setSelectedRole(role);
    setShowDetailsDialog(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-500" />
            الأدوار والصلاحيات
          </h1>
          <p className="text-muted-foreground mt-2">
            عرض وإدارة الأدوار والصلاحيات في النظام
          </p>
        </div>
        <EngineInfoDialog info={pageInfo} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الأدوار</CardTitle>
          <CardDescription>الأدوار الافتراضية في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الدور</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>المستوى</TableHead>
                  <TableHead>عدد المستخدمين</TableHead>
                  <TableHead>الصلاحيات</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SYSTEM_ROLES.map((role) => {
                  const usersCount = getUsersCountByRole(role.id);
                  return (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{role.nameAr}</div>
                          <div className="text-sm text-muted-foreground">{role.nameEn}</div>
                        </div>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <Badge variant={role.level <= 2 ? "default" : "secondary"}>
                          المستوى {role.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {usersCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.permissionsCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(role)}
                        >
                          <Key className="w-4 h-4 ml-2" />
                          التفاصيل
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              تفاصيل الدور: {selectedRole?.nameAr}
            </DialogTitle>
            <DialogDescription>
              {selectedRole?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">معلومات الدور</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">الاسم بالعربي:</span>
                    <div className="font-medium">{selectedRole?.nameAr}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الاسم بالإنجليزي:</span>
                    <div className="font-medium">{selectedRole?.nameEn}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">المستوى:</span>
                    <div className="font-medium">المستوى {selectedRole?.level}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">نوع الدور:</span>
                    <div className="font-medium">
                      {selectedRole?.isSystem ? "دور نظام" : "دور مخصص"}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">الصلاحيات</div>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    {selectedRole?.permissionsCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    ملاحظة: إدارة الصلاحيات التفصيلية قيد التطوير
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

