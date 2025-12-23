// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  CreditCard,
  Activity,
  ArrowRight
} from "lucide-react";
import { useLocation, useParams } from "wouter";

export default function CustomerDetails() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const customerId = params.id;

  // بيانات تجريبية للعميل
  const customer = {
    id: customerId || "1",
    name: "أحمد محمد العلي",
    phone: "0501234567",
    email: "ahmed@example.com",
    address: "الرياض، حي النخيل، شارع الملك فهد",
    accountNumber: "ACC-2024-001",
    status: "active",
    type: "residential",
    joinDate: "2024-01-15",
    totalMeters: 2,
    totalInvoices: 12,
    totalPayments: 10,
    balance: 1500,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">نشط</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">غير نشط</Badge>;
      case "suspended":
        return <Badge className="bg-red-500">موقوف</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "residential":
        return <Badge variant="outline">سكني</Badge>;
      case "commercial":
        return <Badge variant="outline">تجاري</Badge>;
      case "industrial":
        return <Badge variant="outline">صناعي</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تفاصيل العميل</h1>
          <p className="text-muted-foreground">عرض معلومات العميل الكاملة</p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/customers")}>
          العودة للقائمة
        </Button>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              معلومات العميل
            </CardTitle>
            <div className="flex gap-2">
              {getStatusBadge(customer.status)}
              {getTypeBadge(customer.type)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">الاسم</p>
                <p className="font-medium">{customer.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                <p className="font-medium" dir="ltr">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">العنوان</p>
                <p className="font-medium">{customer.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">رقم الحساب</p>
                <p className="font-medium">{customer.accountNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الانضمام</p>
                <p className="font-medium">{customer.joinDate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setLocation("/meters")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">العدادات</p>
                <p className="text-2xl font-bold">{customer.totalMeters}</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-primary">
              <span>عرض التفاصيل</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setLocation("/invoices")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الفواتير</p>
                <p className="text-2xl font-bold">{customer.totalInvoices}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-primary">
              <span>عرض التفاصيل</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setLocation("/payments")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المدفوعات</p>
                <p className="text-2xl font-bold">{customer.totalPayments}</p>
              </div>
              <CreditCard className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-primary">
              <span>عرض التفاصيل</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الرصيد المستحق</p>
                <p className="text-2xl font-bold text-orange-500">{customer.balance} ر.س</p>
              </div>
              <CreditCard className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
