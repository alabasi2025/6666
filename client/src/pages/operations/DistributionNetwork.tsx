import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  GitBranch, Plus, Search, Cable, Columns, Gauge,
  MapPin, Activity, Settings, Edit, Trash2, Network
} from "lucide-react";

// أنواع عناصر شبكة التوزيع
const networkElementTypes = [
  { value: "line", label: "خط نقل", icon: Cable },
  { value: "pole", label: "عمود", icon: Columns },
  { value: "cable", label: "كابل", icon: Cable },
  { value: "meter", label: "عداد", icon: Gauge },
  { value: "junction", label: "نقطة توصيل", icon: GitBranch },
];

// بيانات تجريبية
const networkElements = [
  { id: 1, code: "LN-001", name: "خط النقل الرئيسي", type: "line", status: "active", length: "15 كم", voltage: "33 KV" },
  { id: 2, code: "PL-001", name: "عمود الدهمية 1", type: "pole", status: "active", location: "الدهمية", height: "12 م" },
  { id: 3, code: "CB-001", name: "كابل التوزيع الرئيسي", type: "cable", status: "active", length: "5 كم", voltage: "11 KV" },
  { id: 4, code: "MT-001", name: "عداد المنطقة الصناعية", type: "meter", status: "active", location: "المنطقة الصناعية", capacity: "500 A" },
];

export default function DistributionNetwork() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredElements = networkElements.filter(element => {
    const matchesSearch = element.name.includes(searchTerm) || element.code.includes(searchTerm);
    const matchesType = selectedType === "all" || element.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeInfo = (type: string) => {
    return networkElementTypes.find(t => t.value === type) || { label: type, icon: Cable };
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">شبكة التوزيع</h1>
          <p className="text-muted-foreground">إدارة عناصر شبكة التوزيع (خطوط، أعمدة، كابلات، عدادات)</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة عنصر جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة عنصر شبكة جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>نوع العنصر</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع العنصر" />
                  </SelectTrigger>
                  <SelectContent>
                    {networkElementTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الكود</Label>
                <Input placeholder="أدخل كود العنصر" />
              </div>
              <div className="space-y-2">
                <Label>الاسم</Label>
                <Input placeholder="أدخل اسم العنصر" />
              </div>
              <div className="space-y-2">
                <Label>الموقع</Label>
                <Input placeholder="أدخل الموقع" />
              </div>
              <Button className="w-full" onClick={() => setIsAddDialogOpen(false)}>
                إضافة العنصر
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Cable className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">خطوط النقل</p>
                <p className="text-xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Columns className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الأعمدة</p>
                <p className="text-xl font-bold">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Cable className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الكابلات</p>
                <p className="text-xl font-bold">45</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Gauge className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">العدادات</p>
                <p className="text-xl font-bold">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو الكود..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="نوع العنصر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {networkElementTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            عناصر الشبكة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الكود</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التفاصيل</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredElements.map((element) => {
                const typeInfo = getTypeInfo(element.type);
                const TypeIcon = typeInfo.icon;
                return (
                  <TableRow key={element.id}>
                    <TableCell className="font-mono">{element.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        {element.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{typeInfo.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={element.status === "active" ? "default" : "secondary"}>
                        {element.status === "active" ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {element.length || element.location || element.capacity || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
