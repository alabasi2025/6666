import { useState } from "react";
import { DataTable, Column, StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  User,
  Users,
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Award,
  Calendar,
  Star,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Status mapping
const technicianStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  available: { label: "متاح", variant: "success" },
  busy: { label: "مشغول", variant: "warning" },
  on_leave: { label: "إجازة", variant: "secondary" },
  off_duty: { label: "خارج الدوام", variant: "default" },
};

// Skill level mapping
const skillLevelMap: Record<string, { label: string; color: string; stars: number }> = {
  junior: { label: "مبتدئ", color: "bg-muted text-muted-foreground", stars: 1 },
  intermediate: { label: "متوسط", color: "bg-primary/20 text-primary", stars: 2 },
  senior: { label: "متقدم", color: "bg-success/20 text-success", stars: 3 },
  expert: { label: "خبير", color: "bg-warning/20 text-warning", stars: 4 },
};

// Specialization mapping
const specializationMap: Record<string, string> = {
  electrical: "كهرباء",
  mechanical: "ميكانيكا",
  hvac: "تكييف وتبريد",
  plumbing: "سباكة",
  instrumentation: "أجهزة قياس",
  general: "صيانة عامة",
};

// Mock technicians data
const mockTechnicians = [
  {
    id: 1,
    employeeId: "EMP-001",
    name: "أحمد محمد العلي",
    email: "ahmed@company.com",
    phone: "0501234567",
    specialization: "electrical",
    skillLevel: "senior",
    status: "busy",
    team: "فريق الصيانة الكهربائية",
    station: "محطة التوليد الرئيسية",
    currentWorkOrder: "WO-2024-001",
    completedOrders: 156,
    avgCompletionTime: 3.5,
    rating: 4.8,
    joinDate: "2020-03-15",
  },
  {
    id: 2,
    employeeId: "EMP-002",
    name: "خالد عمر السعيد",
    email: "khaled@company.com",
    phone: "0507654321",
    specialization: "mechanical",
    skillLevel: "expert",
    status: "available",
    team: "فريق الصيانة الميكانيكية",
    station: "محطة التوليد الرئيسية",
    currentWorkOrder: null,
    completedOrders: 234,
    avgCompletionTime: 2.8,
    rating: 4.9,
    joinDate: "2018-06-01",
  },
  {
    id: 3,
    employeeId: "EMP-003",
    name: "سالم أحمد الحربي",
    email: "salem@company.com",
    phone: "0509876543",
    specialization: "electrical",
    skillLevel: "intermediate",
    status: "available",
    team: "فريق الطوارئ",
    station: "محطة التوزيع الشمالية",
    currentWorkOrder: null,
    completedOrders: 89,
    avgCompletionTime: 4.2,
    rating: 4.5,
    joinDate: "2022-01-10",
  },
  {
    id: 4,
    employeeId: "EMP-004",
    name: "محمد علي الشهري",
    email: "mohammed@company.com",
    phone: "0503456789",
    specialization: "instrumentation",
    skillLevel: "senior",
    status: "on_leave",
    team: "فريق الفحص والاختبار",
    station: "محطة التوزيع الشمالية",
    currentWorkOrder: null,
    completedOrders: 178,
    avgCompletionTime: 3.0,
    rating: 4.7,
    joinDate: "2019-09-20",
  },
  {
    id: 5,
    employeeId: "EMP-005",
    name: "فهد سعد القحطاني",
    email: "fahad@company.com",
    phone: "0502345678",
    specialization: "hvac",
    skillLevel: "junior",
    status: "busy",
    team: "فريق الصيانة الميكانيكية",
    station: "محطة التوليد الرئيسية",
    currentWorkOrder: "WO-2024-005",
    completedOrders: 45,
    avgCompletionTime: 5.0,
    rating: 4.2,
    joinDate: "2023-06-15",
  },
];

// Stats
const stats = [
  { title: "إجمالي الفنيين", value: "25", icon: Users, color: "primary" },
  { title: "متاحون الآن", value: "12", icon: CheckCircle, color: "success" },
  { title: "مشغولون", value: "10", icon: Wrench, color: "warning" },
  { title: "في إجازة", value: "3", icon: Calendar, color: "secondary" },
];

export default function Technicians() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const columns: Column<typeof mockTechnicians[0]>[] = [
    {
      key: "employeeId",
      title: "رقم الموظف",
      render: (value) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "name",
      title: "الاسم",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {value.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "specialization",
      title: "التخصص",
      render: (value) => (
        <Badge variant="outline">
          {specializationMap[value] || value}
        </Badge>
      ),
    },
    {
      key: "skillLevel",
      title: "مستوى المهارة",
      render: (value) => {
        const level = skillLevelMap[value];
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={level?.color}>
              {level?.label}
            </Badge>
            <div className="flex">
              {[...Array(4)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < (level?.stars || 0) ? "text-warning fill-warning" : "text-muted"
                  )}
                />
              ))}
            </div>
          </div>
        );
      },
    },
    {
      key: "team",
      title: "الفريق",
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: "completedOrders",
      title: "الأوامر المكتملة",
      render: (value, row) => (
        <div className="text-center">
          <p className="font-bold ltr-nums">{value}</p>
          <p className="text-xs text-muted-foreground">
            <span className="text-success">★ {row.rating}</span>
          </p>
        </div>
      ),
    },
    {
      key: "currentWorkOrder",
      title: "أمر العمل الحالي",
      render: (value) => (
        value ? (
          <span className="font-mono text-sm text-primary">{value}</span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      ),
    },
    {
      key: "status",
      title: "الحالة",
      render: (value) => <StatusBadge status={value} statusMap={technicianStatusMap} />,
    },
  ];

  const handleAdd = () => {
    setSelectedTechnician(null);
    setShowDialog(true);
  };

  const handleView = (technician: any) => {
    setSelectedTechnician(technician);
    setShowDetailsDialog(true);
  };

  const handleEdit = (technician: any) => {
    setSelectedTechnician(technician);
    setShowDialog(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTechnician) {
      toast.success("تم تحديث بيانات الفني بنجاح");
    } else {
      toast.success("تم إضافة الفني بنجاح");
    }
    setShowDialog(false);
    setSelectedTechnician(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const colorClasses = {
            primary: "text-primary bg-primary/10",
            success: "text-success bg-success/10",
            warning: "text-warning bg-warning/10",
            secondary: "text-muted-foreground bg-muted",
          };

          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl", colorClasses[stat.color as keyof typeof colorClasses])}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold ltr-nums">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Table */}
      <DataTable
        data={mockTechnicians}
        columns={columns}
        title="إدارة الفنيين"
        description="عرض وإدارة فريق الصيانة والفنيين"
        searchPlaceholder="بحث بالاسم أو رقم الموظف..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onRefresh={() => toast.info("جاري تحديث البيانات...")}
        emptyMessage="لا يوجد فنيون"
      />

      {/* Add/Edit Technician Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTechnician ? "تعديل بيانات الفني" : "إضافة فني جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedTechnician
                ? "قم بتعديل بيانات الفني"
                : "أدخل بيانات الفني الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">رقم الموظف *</Label>
                <Input
                  id="employeeId"
                  placeholder="EMP-XXX"
                  defaultValue={selectedTechnician?.employeeId}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل *</Label>
                <Input
                  id="name"
                  placeholder="أدخل الاسم الكامل"
                  defaultValue={selectedTechnician?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@company.com"
                  defaultValue={selectedTechnician?.email}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <Input
                  id="phone"
                  placeholder="05XXXXXXXX"
                  defaultValue={selectedTechnician?.phone}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">التخصص *</Label>
                <Select defaultValue={selectedTechnician?.specialization || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التخصص" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(specializationMap).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skillLevel">مستوى المهارة *</Label>
                <Select defaultValue={selectedTechnician?.skillLevel || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(skillLevelMap).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team">الفريق *</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفريق" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">فريق الصيانة الكهربائية</SelectItem>
                    <SelectItem value="2">فريق الصيانة الميكانيكية</SelectItem>
                    <SelectItem value="3">فريق الطوارئ</SelectItem>
                    <SelectItem value="4">فريق الفحص والاختبار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="station">المحطة</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحطة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">محطة التوليد الرئيسية</SelectItem>
                    <SelectItem value="2">محطة التوزيع الشمالية</SelectItem>
                    <SelectItem value="3">محطة التوزيع الجنوبية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="gradient-energy">
                {selectedTechnician ? "حفظ التغييرات" : "إضافة الفني"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Technician Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الفني</DialogTitle>
          </DialogHeader>
          {selectedTechnician && (
            <div className="space-y-6 py-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">
                    {selectedTechnician.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedTechnician.name}</h3>
                  <p className="text-muted-foreground">{selectedTechnician.employeeId}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedTechnician.status} statusMap={technicianStatusMap} />
                    <Badge variant="outline" className={skillLevelMap[selectedTechnician.skillLevel]?.color}>
                      {skillLevelMap[selectedTechnician.skillLevel]?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">معلومات الاتصال</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedTechnician.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="ltr-nums">{selectedTechnician.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedTechnician.station}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">إحصائيات الأداء</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary ltr-nums">{selectedTechnician.completedOrders}</p>
                      <p className="text-xs text-muted-foreground">أوامر مكتملة</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success ltr-nums">{selectedTechnician.avgCompletionTime}h</p>
                      <p className="text-xs text-muted-foreground">متوسط الإنجاز</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-5 h-5 text-warning fill-warning" />
                        <span className="text-2xl font-bold ltr-nums">{selectedTechnician.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">التقييم</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Work Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">التخصص</Label>
                  <p className="font-medium">{specializationMap[selectedTechnician.specialization]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الفريق</Label>
                  <p className="font-medium">{selectedTechnician.team}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">تاريخ الانضمام</Label>
                  <p className="font-medium">{new Date(selectedTechnician.joinDate).toLocaleDateString("ar-SA")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">أمر العمل الحالي</Label>
                  <p className="font-medium font-mono text-primary">
                    {selectedTechnician.currentWorkOrder || "لا يوجد"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              إغلاق
            </Button>
            <Button className="gradient-energy" onClick={() => { setShowDetailsDialog(false); handleEdit(selectedTechnician); }}>
              تعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
