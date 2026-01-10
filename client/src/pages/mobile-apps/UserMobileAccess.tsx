/**
 * User Mobile App Access Management
 * إدارة وصول المستخدمين لتطبيقات الجوال
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCircle, Users, Search, Plus, Edit, Trash2, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Mock data - سيتم استبداله بـ tRPC queries
const userAccess = [
  {
    id: 1,
    userId: 1,
    userName: "أحمد محمد",
    userEmail: "ahmed@example.com",
    appType: "customer",
    appName: "تطبيق العميل",
    isActive: true,
    grantedPermissions: ["customer:view_dashboard", "customer:view_invoices", "customer:view_payments"],
    lastAccessAt: "2024-01-15 10:30:00",
  },
  {
    id: 2,
    userId: 2,
    userName: "محمد علي",
    userEmail: "mohammed@example.com",
    appType: "employee",
    appName: "تطبيق الموظف",
    isActive: true,
    grantedPermissions: ["worker:view_dashboard", "worker:view_tasks", "worker:read_meter", "worker:install_meter"],
    lastAccessAt: "2024-01-15 09:15:00",
  },
];

export default function UserMobileAccess() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = userAccess.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">وصول المستخدمين</h1>
          <p className="text-muted-foreground mt-2">
            إدارة وصول المستخدمين لتطبيقات الجوال والصلاحيات الممنوحة
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          منح وصول
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>قائمة الوصول</CardTitle>
              <CardDescription>
                {filteredUsers.length} مستخدم لديه وصول للتطبيقات
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>التطبيق</TableHead>
                <TableHead>الصلاحيات الممنوحة</TableHead>
                <TableHead>آخر وصول</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.userName}</div>
                      <div className="text-sm text-muted-foreground">{user.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.appType === "customer" ? "default" : "secondary"}>
                      {user.appType === "customer" ? (
                        <UserCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Users className="w-3 h-3 mr-1" />
                      )}
                      {user.appName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.grantedPermissions.slice(0, 3).map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm.split(":")[1]}
                        </Badge>
                      ))}
                      {user.grantedPermissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.grantedPermissions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.lastAccessAt).toLocaleDateString("ar-SA")}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="default" className="bg-green-500">نشط</Badge>
                    ) : (
                      <Badge variant="secondary">غير نشط</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Shield className="w-4 h-4" />
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

