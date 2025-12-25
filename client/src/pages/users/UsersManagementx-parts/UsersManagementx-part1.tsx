import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Key,
  UserCheck,
  UserX,
  Shield,
  Phone,
  Mail,
  Building2,
  RefreshCw,
} from "lucide-react";

type User = {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: "user" | "admin" | "super_admin";
  isActive: boolean | number;
  jobTitle: string | null;
  businessId: number | null;
  branchId: number | null;
  lastSignedIn: Date | null;
  createdAt: Date;
};

const roleLabels: Record<string, { label: string; color: string }> = {
  user: { label: "مستخدم", color: "bg-gray-500" },
  admin: { label: "مدير", color: "bg-blue-500" },
  super_admin: { label: "مدير عام", color: "bg-purple-500" },
};

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin" | "super_admin",
    jobTitle: "",
  });

  const utils = trpc.useUtils();

  // Queries
  const { data: users = [], isLoading, refetch } = trpc.user.list.useQuery({});

  // Mutations
  const createMutation = trpc.user.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء المستخدم بنجاح");
      setIsCreateDialogOpen(false);
      resetForm();
      utils.user.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "فشل إنشاء المستخدم");
    },
  });

  const updateMutation = trpc.user.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المستخدم بنجاح");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      utils.user.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "فشل تحديث المستخدم");
    },
  });

  const deleteMutation = trpc.user.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المستخدم بنجاح");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      utils.user.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "فشل حذف المستخدم");
    },
  });

  const toggleActiveMutation = trpc.user.toggleActive.useMutation({
    onSuccess: (_: any, variables: any) => {
      toast.success(variables.isActive ? "تم تفعيل الحساب" : "تم تعطيل الحساب");
      utils.user.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "فشل تغيير حالة الحساب");
    },
  });

  const resetPasswordMutation = trpc.user.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("تم إعادة تعيين كلمة المرور بنجاح");
      setIsResetPasswordDialogOpen(false);
      setSelectedUser(null);
      setNewPassword("");
    },
    onError: (error) => {
      toast.error(error.message || "فشل إعادة تعيين كلمة المرور");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      password: "",
      role: "user",
      jobTitle: "",
    });
  };

  const handleCreate = () => {
    if (!(formData as any).name || !(formData as any).phone || !(formData as any).password) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    createMutation.mutate({
      name: (formData as any).name,
      phone: (formData as any).phone,
      email: (formData as any).email || null,
      password: (formData as any).password,
      role: (formData as any).role,
      jobTitle: (formData as any).jobTitle || null,
    } as any);
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    updateMutation.mutate({
      id: selectedUser.id,
      name: (formData as any).name,
      phone: (formData as any).phone,
      email: (formData as any).email || null,
      role: (formData as any).role,
      jobTitle: (formData as any).jobTitle || null,
    } as any);
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    deleteMutation.mutate({ id: selectedUser.id } as any);
  };

  const handleResetPassword = () => {
    if (!selectedUser || !newPassword) {
      toast.error("يرجى إدخال كلمة المرور الجديدة");
      return;
    }
    resetPasswordMutation.mutate({
      id: selectedUser.id,
      newPassword,
    } as any);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      password: "",
      role: user.role,
      jobTitle: user.jobTitle || "",
    });
    setIsEditDialogOpen(true);
  };

  const filteredUsers = (users as any[]).filter((user: any) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.phone?.includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
            <p className="text-sm text-muted-foreground">
              إدارة حسابات المستخدمين والصلاحيات
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة مستخدم
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الحسابات النشطة</p>
                <p className="text-2xl font-bold text-green-500">
                  {(users as any[]).filter((u: any) => u.isActive).length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المديرين</p>
                <p className="text-2xl font-bold text-blue-500">
                  {(users as any[]).filter((u: any) => u.role === "admin" || u.role === "super_admin").length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الحسابات المعطلة</p>
                <p className="text-2xl font-bold text-red-500">
                  {(users as any[]).filter((u: any) => !u.isActive).length}
                </p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة المستخدمين</CardTitle>
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
