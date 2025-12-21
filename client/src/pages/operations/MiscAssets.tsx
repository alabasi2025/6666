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
  Package, Plus, Search, Wrench, Car, Computer, 
  Warehouse, Edit, Trash2, Filter, Box
} from "lucide-react";

// أنواع الأصول المتنوعة (غير المرتبطة بالمحطات)
const miscAssetCategories = [
  { value: "vehicles", label: "المركبات", icon: Car },
  { value: "equipment", label: "المعدات", icon: Wrench },
  { value: "computers", label: "الحواسيب", icon: Computer },
  { value: "furniture", label: "الأثاث", icon: Package },
  { value: "warehouse", label: "المخازن", icon: Warehouse },
];

// بيانات تجريبية
const miscAssets = [
  { id: 1, code: "VH-001", name: "سيارة نقل كبيرة", category: "vehicles", status: "active", location: "الفرع الرئيسي", value: "150,000" },
  { id: 2, code: "VH-002", name: "سيارة صيانة", category: "vehicles", status: "active", location: "الدهمية", value: "80,000" },
  { id: 3, code: "EQ-001", name: "رافعة شوكية", category: "equipment", status: "active", location: "المخزن الرئيسي", value: "45,000" },
  { id: 4, code: "PC-001", name: "خادم البيانات الرئيسي", category: "computers", status: "active", location: "غرفة السيرفرات", value: "25,000" },
  { id: 5, code: "WH-001", name: "مخزن قطع الغيار", category: "warehouse", status: "active", location: "الفرع الرئيسي", value: "-" },
];

export default function MiscAssets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredAssets = miscAssets.filter(asset => {
    const matchesSearch = asset.name.includes(searchTerm) || asset.code.includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (category: string) => {
    return miscAssetCategories.find(c => c.value === category) || { label: category, icon: Package };
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الأصول المتنوعة</h1>
          <p className="text-muted-foreground">إدارة الأصول غير المرتبطة بالمحطات (مركبات، معدات، حواسيب)</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة أصل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة أصل متنوع جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    {miscAssetCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الكود</Label>
                <Input placeholder="أدخل كود الأصل" />
              </div>
              <div className="space-y-2">
                <Label>الاسم</Label>
                <Input placeholder="أدخل اسم الأصل" />
              </div>
              <div className="space-y-2">
                <Label>الموقع</Label>
                <Input placeholder="أدخل الموقع" />
              </div>
              <div className="space-y-2">
                <Label>القيمة</Label>
                <Input placeholder="أدخل القيمة" type="number" />
              </div>
              <Button className="w-full" onClick={() => setIsAddDialogOpen(false)}>
                إضافة الأصل
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {miscAssetCategories.map(cat => {
          const CategoryIcon = cat.icon;
          const count = miscAssets.filter(a => a.category === cat.value).length;
          return (
            <Card key={cat.value}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <CategoryIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{cat.label}</p>
                    <p className="text-xl font-bold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                {miscAssetCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
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
            <Box className="h-5 w-5" />
            قائمة الأصول المتنوعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الكود</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">التصنيف</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الموقع</TableHead>
                <TableHead className="text-right">القيمة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => {
                const catInfo = getCategoryInfo(asset.category);
                const CategoryIcon = catInfo.icon;
                return (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono">{asset.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        {asset.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{catInfo.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={asset.status === "active" ? "default" : "secondary"}>
                        {asset.status === "active" ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{asset.location}</TableCell>
                    <TableCell>{asset.value}</TableCell>
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
