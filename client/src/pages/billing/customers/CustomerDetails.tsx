import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  CreditCard,
  Activity,
  ArrowRight,
  Wallet,
  Plus,
  Eye,
  Loader2
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDetails() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const customerId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");

  // ✅ جلب بيانات العميل من API
  const customerQuery = trpc.billing.getCustomerById.useQuery(
    { id: customerId! },
    { enabled: !!customerId }
  );

  // ✅ جلب حسابات المشترك للعميل
  const subscriptionAccountsQuery = trpc.subscriptionAccounts.getByCustomer.useQuery(
    { customerId: customerId! },
    { enabled: !!customerId }
  );

  const customer = customerQuery.data;
  const subscriptionAccounts = subscriptionAccountsQuery.data || [];

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

  if (!customerId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground">يجب تحديد عميل أولاً</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (customerQuery.isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground">العميل غير موجود</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تفاصيل العميل</h1>
          <p className="text-muted-foreground">عرض معلومات العميل الكاملة</p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/dashboard/billing/customers")}>
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
              {getStatusBadge(customer.status || "active")}
              {getTypeBadge(customer.category || "residential")}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">الاسم</p>
                <p className="font-medium">{customer.fullName || customer.fullNameEn || "غير محدد"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                <p className="font-medium" dir="ltr">{customer.mobileNo || customer.phone || "غير محدد"}</p>
              </div>
            </div>
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">العنوان</p>
                  <p className="font-medium">{customer.address}</p>
                </div>
              </div>
            )}
            {customer.accountNumber && (
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">رقم الحساب</p>
                  <p className="font-medium">{customer.accountNumber}</p>
                </div>
              </div>
            )}
            {customer.createdAt && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الانضمام</p>
                  <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">المعلومات</TabsTrigger>
          <TabsTrigger value="subscription-accounts">
            حسابات المشترك ({subscriptionAccounts.length})
          </TabsTrigger>
          <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          {/* Additional Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {customer.nationalId && (
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهوية</p>
                    <p className="font-medium">{customer.nationalId}</p>
                  </div>
                )}
                {customer.customerType && (
                  <div>
                    <p className="text-sm text-muted-foreground">نوع العميل</p>
                    <p className="font-medium">{customer.customerType}</p>
                  </div>
                )}
                {customer.category && (
                  <div>
                    <p className="text-sm text-muted-foreground">الفئة</p>
                    <p className="font-medium">{getCategoryLabel(customer.category)}</p>
                  </div>
                )}
                {customer.serviceTier && (
                  <div>
                    <p className="text-sm text-muted-foreground">مستوى الخدمة</p>
                    <p className="font-medium">{customer.serviceTier}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription-accounts" className="space-y-4">
          {/* ✅ حسابات المشترك */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  حسابات المشترك
                </CardTitle>
                <Button
                  onClick={() => setLocation(`/dashboard/billing/subscription-accounts/${customerId}`)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة حساب مشترك
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {subscriptionAccountsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : subscriptionAccounts.length > 0 ? (
                <div className="space-y-4">
                  {subscriptionAccounts.map((account) => (
                    <Card key={account.id} className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setLocation(`/dashboard/billing/subscription-accounts/${customerId}?accountId=${account.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{account.accountNumber}</h3>
                              {(() => {
                                const colors = {
                                  'sts': 'bg-blue-500',
                                  'iot': 'bg-purple-500',
                                  'regular': 'bg-gray-500',
                                  'government_support': 'bg-green-500',
                                };
                                return (
                                  <Badge className={colors[account.accountType as keyof typeof colors] || 'bg-gray-500'}>
                                    {account.accountType === 'sts' ? 'STS' : 
                                     account.accountType === 'iot' ? 'IoT' : 
                                     account.accountType === 'regular' ? 'عادي' : 
                                     'دعم حكومي'}
                                  </Badge>
                                );
                              })()}
                              {account.status === 'active' ? (
                                <Badge className="bg-green-500">نشط</Badge>
                              ) : account.status === 'suspended' ? (
                                <Badge className="bg-yellow-500">موقوف</Badge>
                              ) : (
                                <Badge className="bg-gray-500">{account.status}</Badge>
                              )}
                            </div>
                            {account.accountName && (
                              <p className="text-sm text-muted-foreground mb-2">{account.accountName}</p>
                            )}
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">الرصيد</p>
                                <p className={`font-semibold ${parseFloat(account.balance || "0") >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {parseFloat(account.balance || "0").toLocaleString()} ر.س
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">المستحقات</p>
                                <p className={`font-semibold ${parseFloat(account.balanceDue || "0") > 0 ? "text-red-600" : "text-green-600"}`}>
                                  {parseFloat(account.balanceDue || "0").toLocaleString()} ر.س
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">العدادات</p>
                                <p className="font-semibold">{account.metersCount || 0}</p>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد حسابات مشترك لهذا العميل</p>
                  <Button
                    className="mt-4"
                    onClick={() => setLocation(`/dashboard/billing/subscription-accounts/${customerId}`)}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة حساب مشترك
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setLocation("/dashboard/billing/meters")}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">العدادات</p>
                    <p className="text-2xl font-bold">{subscriptionAccounts.reduce((sum, acc) => sum + (acc.metersCount || 0), 0)}</p>
                  </div>
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-primary">
                  <span>عرض التفاصيل</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setLocation("/dashboard/billing/invoices")}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">الفواتير</p>
                    <p className="text-2xl font-bold">{subscriptionAccounts.reduce((sum, acc) => sum + (acc.invoicesCount || 0), 0)}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-primary">
                  <span>عرض التفاصيل</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setLocation("/dashboard/billing/payments")}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">المدفوعات</p>
                    <p className="text-2xl font-bold">-</p>
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
                    <p className="text-sm text-muted-foreground">إجمالي المستحقات</p>
                    <p className={`text-2xl font-bold ${
                      subscriptionAccounts.reduce((sum, acc) => sum + parseFloat(acc.balanceDue || "0"), 0) > 0 
                        ? 'text-red-500' 
                        : 'text-green-500'
                    }`}>
                      {subscriptionAccounts.reduce((sum, acc) => sum + parseFloat(acc.balanceDue || "0"), 0).toLocaleString()} ر.س
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      من جميع حسابات المشترك
                    </p>
                  </div>
                  <Wallet className={`w-8 h-8 ${
                    subscriptionAccounts.reduce((sum, acc) => sum + parseFloat(acc.balanceDue || "0"), 0) > 0 
                      ? 'text-red-500' 
                      : 'text-green-500'
                  }`} />
                </div>
                {subscriptionAccounts.reduce((sum, acc) => sum + parseFloat(acc.balanceDue || "0"), 0) > 0 && (
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => setLocation(`/dashboard/billing/payments?customerId=${customerId}`)}
                  >
                    تسوية الدين
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions
function getCategoryLabel(category: string) {
  switch (category) {
    case "residential":
      return "سكني";
    case "commercial":
      return "تجاري";
    case "industrial":
      return "صناعي";
    case "government":
      return "حكومي";
    case "agricultural":
      return "زراعي";
    default:
      return category;
  }
}
