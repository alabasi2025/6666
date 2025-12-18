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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Star,
  Package,
  DollarSign,
  FileText,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Status mapping
const supplierStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  active: { label: "نشط", variant: "success" },
  inactive: { label: "غير نشط", variant: "secondary" },
  blocked: { label: "محظور", variant: "destructive" },
  pending: { label: "قيد المراجعة", variant: "warning" },
};

// Category mapping
const supplierCategoryMap: Record<string, string> = {
  electrical: "معدات كهربائية",
  mechanical: "معدات ميكانيكية",
  cables: "كابلات وأسلاك",
  transformers: "محولات",
  safety: "معدات سلامة",
  consumables: "مستهلكات",
  tools: "أدوات",
  services: "خدمات",
};

// Mock suppliers data
const mockSuppliers = [
  {
    id: 1,
    code: "SUP-001",
    name: "شركة الكابلات السعودية",
    nameEn: "Saudi Cables Company",
    category: "cables",
    status: "active",
    rating: 4.5,
    contactPerson: "محمد أحمد",
    phone: "0112345678",
    mobile: "0501234567",
    email: "info@saudicables.com",
    website: "www.saudicables.com",
    address: "الرياض - المنطقة الصناعية",
    taxNumber: "300123456789012",
    crNumber: "1010123456",
    totalOrders: 45,
    totalValue: 1250000,
    avgDeliveryDays: 5,
    lastOrder: "2024-06-10",
  },
  {
    id: 2,
    code: "SUP-002",
    name: "شركة المعدات الكهربائية",
    nameEn: "Electrical Equipment Co.",
    category: "electrical",
    status: "active",
    rating: 4.2,
    contactPerson: "خالد عمر",
    phone: "0112345679",
    mobile: "0507654321",
    email: "sales@elecequip.com",
    website: "www.elecequip.com",
    address: "جدة - المنطقة الصناعية",
    taxNumber: "300123456789013",
    crNumber: "4030123456",
    totalOrders: 32,
    totalValue: 890000,
    avgDeliveryDays: 7,
    lastOrder: "2024-06-08",
  },
  {
    id: 3,
    code: "SUP-003",
    name: "شركة الأدوات الصناعية",
    nameEn: "Industrial Tools Co.",
    category: "tools",
    status: "active",
    rating: 3.8,
    contactPerson: "سالم محمد",
    phone: "0112345680",
    mobile: "0509876543",
    email: "info@indtools.com",
    website: "www.indtools.com",
    address: "الدمام - الحي الصناعي",
    taxNumber: "300123456789014",
    crNumber: "2050123456",
    totalOrders: 28,
    totalValue: 450000,
    avgDeliveryDays: 4,
    lastOrder: "2024-06-05",
  },
  {
    id: 4,
    code: "SUP-004",
    name: "شركة المحولات العربية",
    nameEn: "Arab Transformers Co.",
    category: "transformers",
    status: "active",
    rating: 4.8,
    contactPerson: "فهد سعد",
    phone: "0112345681",
    mobile: "0502345678",
    email: "sales@arabtrans.com",
    website: "www.arabtrans.com",
    address: "الرياض - المدينة الصناعية الثانية",
    taxNumber: "300123456789015",
    crNumber: "1010234567",
    totalOrders: 15,
    totalValue: 2500000,
    avgDeliveryDays: 14,
    lastOrder: "2024-05-28",
  },
  {
    id: 5,
    code: "SUP-005",
    name: "شركة مواد السلامة",
    nameEn: "Safety Materials Co.",
    category: "safety",
    status: "pending",
    rating: 0,
    contactPerson: "عبدالله علي",
    phone: "0112345682",
    mobile: "0503456789",
    email: "info@safetymaterials.com",
    website: "www.safetymaterials.com",
    address: "الرياض - حي العليا",
    taxNumber: "300123456789016",
    crNumber: "1010345678",
    totalOrders: 0,
    totalValue: 0,
    avgDeliveryDays: 0,
    lastOrder: null,
  },
];

// Stats
const stats = [
  { title: "إجمالي الموردين", value: "48", icon: Building2, color: "primary" },
  { title: "موردين نشطين", value: "42", icon: Users, color: "success" },
  { title: "إجمالي المشتريات", value: "8.5M", icon: DollarSign, color: "warning" },
  { title: "أوامر الشراء", value: "156", icon: FileText, color: "secondary" },
];

export default function Suppliers() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const columns: Column<typeof mockSuppliers[0]>[] = [
    {
      key: "code",
      title: "الرمز",
      render: (value) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "name",
      title: "اسم المورد",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.nameEn}</p>
        </div>
      ),
    },
    {
      key: "category",
      title: "التصنيف",
      render: (value) => (
        <Badge variant="outline">
          {supplierCategoryMap[value] || value}
        </Badge>
      ),
    },
    {
      key: "rating",
      title: "التقييم",
      render: (value) => (
        <div className="flex items-center gap-1">
          {value > 0 ? (
            <>
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="font-medium ltr-nums">{value.toFixed(1)}</span>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">غير مقيم</span>
          )}
        </div>
      ),
    },
    {
      key: "contactPerson",
      title: "جهة الاتصال",
      render: (value, row) => (
        <div>
          <p className="text-sm">{value}</p>
          <p className="text-xs text-muted-foreground ltr-nums">{row.mobile}</p>
        </div>
      ),
    },
    {
      key: "totalOrders",
      title: "الطلبات",
      render: (value, row) => (
        <div className="text-center">
          <p className="font-bold ltr-nums">{value}</p>
          <p className="text-xs text-muted-foreground ltr-nums">{row.totalValue.toLocaleString()} ر.س</p>
        </div>
      ),
    },
    {
      key: "avgDeliveryDays",
      title: "متوسط التسليم",
      render: (value) => (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="ltr-nums">{value > 0 ? `${value} أيام` : "-"}</span>
        </div>
      ),
    },
    {
      key: "status",
      title: "الحالة",
      render: (value) => <StatusBadge status={value} statusMap={supplierStatusMap} />,
    },
  ];

  const handleAdd = () => {
    setSelectedSupplier(null);
    setShowDialog(true);
  };

  const handleView = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowDetailsDialog(true);
  };

  const handleEdit = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowDialog(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSupplier) {
      toast.success("تم تحديث بيانات المورد بنجاح");
    } else {
      toast.success("تم إضافة المورد بنجاح");
    }
    setShowDialog(false);
    setSelectedSupplier(null);
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
        data={mockSuppliers}
        columns={columns}
        title="الموردين"
        description="إدارة جميع الموردين والمقاولين"
        searchPlaceholder="بحث بالاسم أو الرمز..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onRefresh={() => toast.info("جاري تحديث البيانات...")}
        emptyMessage="لا يوجد موردين"
      />

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSupplier ? "تعديل بيانات المورد" : "إضافة مورد جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedSupplier
                ? "قم بتعديل بيانات المورد"
                : "أدخل بيانات المورد الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
                <TabsTrigger value="contact">بيانات الاتصال</TabsTrigger>
                <TabsTrigger value="legal">البيانات القانونية</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">رمز المورد *</Label>
                    <Input
                      id="code"
                      placeholder="SUP-XXX"
                      defaultValue={selectedSupplier?.code}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">التصنيف *</Label>
                    <Select defaultValue={selectedSupplier?.category || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(supplierCategoryMap).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم المورد (عربي) *</Label>
                    <Input
                      id="name"
                      placeholder="أدخل اسم المورد"
                      defaultValue={selectedSupplier?.name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">اسم المورد (إنجليزي)</Label>
                    <Input
                      id="nameEn"
                      placeholder="Enter supplier name"
                      defaultValue={selectedSupplier?.nameEn}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">الحالة *</Label>
                    <Select defaultValue={selectedSupplier?.status || "active"}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(supplierStatusMap).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">جهة الاتصال</Label>
                    <Input
                      id="contactPerson"
                      placeholder="اسم المسؤول"
                      defaultValue={selectedSupplier?.contactPerson}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">الهاتف</Label>
                    <Input
                      id="phone"
                      placeholder="01XXXXXXXX"
                      defaultValue={selectedSupplier?.phone}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">الجوال</Label>
                    <Input
                      id="mobile"
                      placeholder="05XXXXXXXX"
                      defaultValue={selectedSupplier?.mobile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      defaultValue={selectedSupplier?.email}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">الموقع الإلكتروني</Label>
                    <Input
                      id="website"
                      placeholder="www.example.com"
                      defaultValue={selectedSupplier?.website}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">العنوان</Label>
                    <Textarea
                      id="address"
                      placeholder="أدخل العنوان التفصيلي"
                      defaultValue={selectedSupplier?.address}
                      rows={2}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="legal" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                    <Input
                      id="taxNumber"
                      placeholder="3XXXXXXXXXXXXXX"
                      defaultValue={selectedSupplier?.taxNumber}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crNumber">رقم السجل التجاري</Label>
                    <Input
                      id="crNumber"
                      placeholder="XXXXXXXXXX"
                      defaultValue={selectedSupplier?.crNumber}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="gradient-energy">
                {selectedSupplier ? "حفظ التغييرات" : "إضافة المورد"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Supplier Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المورد</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-6 py-4">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-primary/10">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedSupplier.name}</h3>
                  <p className="text-muted-foreground">{selectedSupplier.nameEn}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-primary">{selectedSupplier.code}</span>
                    <StatusBadge status={selectedSupplier.status} statusMap={supplierStatusMap} />
                    {selectedSupplier.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="font-medium ltr-nums">{selectedSupplier.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold ltr-nums">{selectedSupplier.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">أمر شراء</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-6 h-6 mx-auto text-success mb-2" />
                    <p className="text-2xl font-bold ltr-nums">{selectedSupplier.totalValue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">ر.س إجمالي</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="w-6 h-6 mx-auto text-warning mb-2" />
                    <p className="text-2xl font-bold ltr-nums">{selectedSupplier.avgDeliveryDays || "-"}</p>
                    <p className="text-xs text-muted-foreground">أيام متوسط التسليم</p>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground">الهاتف</Label>
                    <p className="font-medium ltr-nums">{selectedSupplier.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground">الجوال</Label>
                    <p className="font-medium ltr-nums">{selectedSupplier.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                    <p className="font-medium">{selectedSupplier.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground">العنوان</Label>
                    <p className="font-medium">{selectedSupplier.address}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              إغلاق
            </Button>
            <Button className="gradient-energy" onClick={() => { setShowDetailsDialog(false); handleEdit(selectedSupplier); }}>
              تعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
