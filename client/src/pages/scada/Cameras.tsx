import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Camera, Search, Plus, Edit, Trash2, Loader2,
  CheckCircle, XCircle, Video, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    active: { label: "نشط", color: "bg-success/20 text-success", icon: CheckCircle },
    online: { label: "متصل", color: "bg-success/20 text-success", icon: CheckCircle },
    inactive: { label: "غير نشط", color: "bg-destructive/20 text-destructive", icon: XCircle },
    offline: { label: "غير متصل", color: "bg-destructive/20 text-destructive", icon: XCircle },
  };

  const config = statusConfig[status] || { label: status, color: "bg-gray-500/20 text-gray-500", icon: Camera };
  const Icon = config.icon;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Sample cameras data
const camerasData = [
  { id: 1, code: "CAM-001", nameAr: "كاميرا المدخل الرئيسي", location: "المدخل", status: "active" },
  { id: 2, code: "CAM-002", nameAr: "كاميرا غرفة التحكم", location: "غرفة التحكم", status: "active" },
  { id: 3, code: "CAM-003", nameAr: "كاميرا المستودع", location: "المستودع", status: "inactive" },
  { id: 4, code: "CAM-004", nameAr: "كاميرا الساحة الخارجية", location: "الساحة", status: "active" },
];

export default function Cameras() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [cameras] = useState(camerasData);

  const filteredCameras = cameras.filter((camera) => {
    if (searchQuery && !camera.nameAr.includes(searchQuery) && !camera.code.includes(searchQuery)) {
      return false;
    }
    if (statusFilter !== "all" && camera.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const statCards = [
    { label: "إجمالي الكاميرات", value: cameras.length, icon: Camera, color: "primary" },
    { label: "نشطة", value: cameras.filter(c => c.status === "active").length, icon: CheckCircle, color: "success" },
    { label: "غير نشطة", value: cameras.filter(c => c.status === "inactive").length, icon: XCircle, color: "destructive" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Camera className="w-7 h-7 text-primary" />
            إدارة الكاميرات
          </h1>
          <p className="text-muted-foreground">مراقبة وإدارة كاميرات المراقبة</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 ml-2" />
          كاميرا جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold ltr-nums">{stat.value}</p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl",
                  stat.color === "primary" && "bg-primary/20 text-primary",
                  stat.color === "success" && "bg-success/20 text-success",
                  stat.color === "destructive" && "bg-destructive/20 text-destructive"
                )}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في الكاميرات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cameras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCameras.map((camera) => (
          <Card key={camera.id} className="overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <Video className="w-12 h-12 text-muted-foreground" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{camera.nameAr}</h3>
                <StatusBadge status={camera.status} />
              </div>
              <p className="text-sm text-muted-foreground mb-2">{camera.code}</p>
              <p className="text-sm text-muted-foreground">{camera.location}</p>
              <div className="flex items-center gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 ml-2" />
                  مشاهدة
                </Button>
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCameras.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          لا توجد كاميرات
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة كاميرا جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الكود</Label>
              <Input placeholder="CAM-001" />
            </div>
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input placeholder="اسم الكاميرا" />
            </div>
            <div className="space-y-2">
              <Label>الموقع</Label>
              <Input placeholder="موقع الكاميرا" />
            </div>
            <div className="space-y-2">
              <Label>رابط البث</Label>
              <Input placeholder="rtsp://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={() => { toast.success("تم إضافة الكاميرا"); setShowAddDialog(false); }}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
