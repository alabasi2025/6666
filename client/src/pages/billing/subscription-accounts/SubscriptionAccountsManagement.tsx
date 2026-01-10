import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Link as LinkIcon, 
  Unlink, 
  Eye, 
  RefreshCw,
  CreditCard,
  Activity,
  FileText,
  Wallet,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useBusinessId } from "@/contexts/BusinessContext";
import { useLocation } from "wouter";

interface SubscriptionAccount {
  id: number;
  accountNumber: string;
  accountType: 'sts' | 'iot' | 'regular' | 'government_support';
  accountName?: string;
  serviceType: string;
  balance: string;
  balanceDue: string;
  status: string;
  activationDate?: string;
  metersCount?: number;
  invoicesCount?: number;
  unpaidInvoicesCount?: number;
}

export default function SubscriptionAccountsManagement() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // استخراج customerId من المسار: /dashboard/billing/subscription-accounts/6
  // استخدام regex match مباشرة (تماماً كما في Dashboard.tsx)
  const match = location.match(/^\/dashboard\/billing\/subscription-accounts(?:\/(\d+))?$/);
  const customerId = match && match[1] ? parseInt(match[1]) : null;
  
  const businessId = useBusinessId();
  
  // جلب قائمة العملاء (للعرض عند عدم وجود customerId)
  const customersQuery = trpc.billing.getCustomers.useQuery(
    undefined,
    { enabled: !customerId }
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLinkMeterDialogOpen, setIsLinkMeterDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SubscriptionAccount | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    accountType: 'regular' as 'sts' | 'iot' | 'regular' | 'government_support',
    accountName: '',
    serviceType: 'electricity' as 'electricity' | 'water' | 'gas',
    paymentMode: 'prepaid' as 'prepaid' | 'postpaid' | 'hybrid',
    billingCycle: 'monthly' as 'monthly' | 'quarterly' | 'annual',
    creditLimit: '',
    depositAmount: '',
    // بيانات خاصة بالدعم الحكومي
    supportType: '',
    supportPercentage: '',
    maxSupportAmount: '',
    monthlyQuota: '',
    // ربط مع STS/IoT
    stsMeterId: '',
    iotDeviceId: '',
    notes: '',
  });

  // Queries
  const accountsQuery = trpc.subscriptionAccounts.getByCustomer.useQuery(
    { customerId: customerId! },
    { enabled: !!customerId }
  );

  const accountDetailsQuery = trpc.subscriptionAccounts.get.useQuery(
    { id: selectedAccountId! },
    { enabled: !!selectedAccountId }
  );

  const metersQuery = trpc.subscriptionAccounts.getMeters.useQuery(
    { subscriptionAccountId: selectedAccountId! },
    { enabled: !!selectedAccountId }
  );

  const invoicesQuery = trpc.subscriptionAccounts.getInvoices.useQuery(
    { subscriptionAccountId: selectedAccountId! },
    { enabled: !!selectedAccountId }
  );

  const paymentsQuery = trpc.subscriptionAccounts.getPayments.useQuery(
    { subscriptionAccountId: selectedAccountId! },
    { enabled: !!selectedAccountId }
  );

  // جميع العدادات (لربطها بحساب مشترك)
  const allMetersQuery = trpc.billing.getMeters.useQuery(
    { customerId: customerId! },
    { enabled: !!customerId }
  );

  // Mutations
  const createMutation = trpc.subscriptionAccounts.create.useMutation({
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء حساب المشترك بنجاح",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      accountsQuery.refetch();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = trpc.subscriptionAccounts.update.useMutation({
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم تحديث حساب المشترك بنجاح",
      });
      setSelectedAccount(null);
      accountsQuery.refetch();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const linkMeterMutation = trpc.subscriptionAccounts.linkMeter.useMutation({
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم ربط العداد بحساب المشترك بنجاح",
      });
      setIsLinkMeterDialogOpen(false);
      setSelectedAccount(null);
      metersQuery.refetch();
      accountsQuery.refetch();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unlinkMeterMutation = trpc.subscriptionAccounts.unlinkMeter.useMutation({
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم فك ربط العداد بنجاح",
      });
      metersQuery.refetch();
      accountsQuery.refetch();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBalanceMutation = trpc.subscriptionAccounts.updateBalance.useMutation({
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم تحديث رصيد حساب المشترك بنجاح",
      });
      accountsQuery.refetch();
      accountDetailsQuery.refetch();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = trpc.subscriptionAccounts.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إغلاق حساب المشترك بنجاح",
      });
      setSelectedAccount(null);
      setSelectedAccountId(null);
      accountsQuery.refetch();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      accountType: 'regular',
      accountName: '',
      serviceType: 'electricity',
      paymentMode: 'prepaid',
      billingCycle: 'monthly',
      creditLimit: '',
      depositAmount: '',
      supportType: '',
      supportPercentage: '',
      maxSupportAmount: '',
      monthlyQuota: '',
      stsMeterId: '',
      iotDeviceId: '',
      notes: '',
    });
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'sts':
        return 'STS';
      case 'iot':
        return 'IoT';
      case 'regular':
        return 'عادي';
      case 'government_support':
        return 'دعم حكومي';
      default:
        return type;
    }
  };

  const getAccountTypeBadge = (type: string) => {
    const colors = {
      'sts': 'bg-blue-500',
      'iot': 'bg-purple-500',
      'regular': 'bg-gray-500',
      'government_support': 'bg-green-500',
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-500'}>
        {getAccountTypeLabel(type)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">نشط</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500">موقوف</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500">مغلق</Badge>;
      case 'pending':
        return <Badge className="bg-blue-500">قيد الانتظار</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleCreate = () => {
    if (!customerId) {
      toast({
        title: "خطأ",
        description: "يجب تحديد عميل أولاً",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      businessId: businessId || 1,
      customerId: customerId,
      accountType: formData.accountType,
      accountName: formData.accountName || undefined,
      serviceType: formData.serviceType,
      paymentMode: formData.paymentMode,
      billingCycle: formData.billingCycle,
      creditLimit: formData.creditLimit || undefined,
      depositAmount: formData.depositAmount || undefined,
      supportType: formData.supportType || undefined,
      supportPercentage: formData.supportPercentage || undefined,
      maxSupportAmount: formData.maxSupportAmount || undefined,
      monthlyQuota: formData.monthlyQuota || undefined,
      stsMeterId: formData.stsMeterId ? parseInt(formData.stsMeterId) : undefined,
      iotDeviceId: formData.iotDeviceId || undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleLinkMeter = (meterId: number) => {
    if (!selectedAccount) return;

    linkMeterMutation.mutate({
      subscriptionAccountId: selectedAccount.id,
      meterId: meterId,
    });
  };

  const handleUnlinkMeter = (meterId: number) => {
    unlinkMeterMutation.mutate({ meterId });
  };

  const handleUpdateBalance = (accountId: number) => {
    updateBalanceMutation.mutate({ subscriptionAccountId: accountId });
  };

  const handleDelete = (accountId: number) => {
    if (confirm("هل أنت متأكد من إغلاق حساب المشترك؟ هذا الإجراء غير قابل للتراجع.")) {
      deleteMutation.mutate({ id: accountId });
    }
  };

  // Debug: عرض معلومات المسار (يمكن إزالته لاحقاً)
  // console.log("Location:", location);
  // console.log("Params:", params);
  // console.log("CustomerId:", customerId);

  if (!customerId) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">حسابات المشترك</h1>
          <p className="text-muted-foreground">اختر عميلاً لعرض حسابات المشترك الخاصة به</p>
        </div>

        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              قائمة العملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customersQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="mr-2 text-muted-foreground">جاري التحميل...</span>
              </div>
            ) : customersQuery.error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive font-semibold mb-2">حدث خطأ أثناء جلب البيانات</p>
                <p className="text-muted-foreground text-sm">{customersQuery.error.message}</p>
              </div>
            ) : customersQuery.data && customersQuery.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الحساب</TableHead>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>نوع العميل</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersQuery.data.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.accountNumber || `#${customer.id}`}</TableCell>
                      <TableCell>{customer.fullName}</TableCell>
                      <TableCell>{customer.customerType || '-'}</TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell>
                        {customer.status === 'active' ? (
                          <Badge className="bg-green-500">نشط</Badge>
                        ) : customer.status === 'inactive' ? (
                          <Badge className="bg-gray-500">غير نشط</Badge>
                        ) : (
                          <Badge>{customer.status || '-'}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/dashboard/billing/subscription-accounts/${customer.id}`)}
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          عرض حسابات المشترك
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-semibold mb-2">لا توجد عملاء</p>
                <p className="text-sm">يمكنك إضافة عميل جديد من صفحة إدارة العملاء</p>
              </div>
            )}
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
          <h1 className="text-2xl font-bold">حسابات المشترك</h1>
          <p className="text-muted-foreground">إدارة حسابات المشترك للعميل</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة حساب مشترك
        </Button>
      </div>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            حسابات المشترك ({accountsQuery.data?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accountsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="mr-2 text-muted-foreground">جاري التحميل...</span>
            </div>
          ) : accountsQuery.error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-semibold mb-2">حدث خطأ أثناء جلب البيانات</p>
              <p className="text-muted-foreground text-sm">{accountsQuery.error.message}</p>
            </div>
          ) : accountsQuery.data && accountsQuery.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الحساب</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الرصيد</TableHead>
                  <TableHead>المستحقات</TableHead>
                  <TableHead>العدادات</TableHead>
                  <TableHead>الفواتير</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountsQuery.data.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.accountNumber}</TableCell>
                    <TableCell>{getAccountTypeBadge(account.accountType)}</TableCell>
                    <TableCell>{account.accountName || '-'}</TableCell>
                    <TableCell className={parseFloat(account.balance || "0") >= 0 ? "text-green-600" : "text-red-600"}>
                      {parseFloat(account.balance || "0").toLocaleString()} ر.س
                    </TableCell>
                    <TableCell className={parseFloat(account.balanceDue || "0") > 0 ? "text-red-600" : "text-green-600"}>
                      {parseFloat(account.balanceDue || "0").toLocaleString()} ر.س
                    </TableCell>
                    <TableCell>{account.metersCount || 0}</TableCell>
                    <TableCell>
                      {account.unpaidInvoicesCount ? (
                        <Badge variant="destructive">{account.unpaidInvoicesCount} غير مدفوعة</Badge>
                      ) : (
                        `${account.invoicesCount || 0}`
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(account.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAccountId(account.id);
                            setSelectedAccount(account);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account);
                            setIsLinkMeterDialogOpen(true);
                          }}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateBalance(account.id)}
                          disabled={updateBalanceMutation.isPending}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-semibold mb-2">لا توجد حسابات مشترك لهذا العميل</p>
              <p className="text-sm">يمكنك إضافة حساب مشترك جديد باستخدام الزر أعلاه</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Details */}
      {selectedAccountId && accountDetailsQuery.data && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                تفاصيل حساب المشترك: {accountDetailsQuery.data.accountNumber}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedAccountId(null);
                  setSelectedAccount(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">المعلومات</TabsTrigger>
                <TabsTrigger value="meters">العدادات ({metersQuery.data?.length || 0})</TabsTrigger>
                <TabsTrigger value="invoices">الفواتير ({invoicesQuery.data?.length || 0})</TabsTrigger>
                <TabsTrigger value="payments">المدفوعات ({paymentsQuery.data?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">رقم الحساب</Label>
                    <p className="font-semibold">{accountDetailsQuery.data.accountNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">النوع</Label>
                    <p>{getAccountTypeBadge(accountDetailsQuery.data.accountType)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">الاسم</Label>
                    <p>{accountDetailsQuery.data.accountName || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">نوع الخدمة</Label>
                    <p>{accountDetailsQuery.data.serviceType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">الرصيد</Label>
                    <p className={`font-semibold ${parseFloat(accountDetailsQuery.data.balance || "0") >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {parseFloat(accountDetailsQuery.data.balance || "0").toLocaleString()} ر.س
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">المستحقات</Label>
                    <p className={`font-semibold ${parseFloat(accountDetailsQuery.data.balanceDue || "0") > 0 ? "text-red-600" : "text-green-600"}`}>
                      {parseFloat(accountDetailsQuery.data.balanceDue || "0").toLocaleString()} ر.س
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">الحالة</Label>
                    <p>{getStatusBadge(accountDetailsQuery.data.status)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">تاريخ التفعيل</Label>
                    <p>{accountDetailsQuery.data.activationDate ? new Date(accountDetailsQuery.data.activationDate).toLocaleDateString('ar-SA') : '-'}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateBalance(selectedAccountId)}
                    disabled={updateBalanceMutation.isPending}
                  >
                    <RefreshCw className={`w-4 h-4 ml-2 ${updateBalanceMutation.isPending ? 'animate-spin' : ''}`} />
                    تحديث الرصيد
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedAccountId)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 ml-2" />
                    إغلاق الحساب
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="meters" className="space-y-4">
                {metersQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : metersQuery.data && metersQuery.data.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم العداد</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الرصيد</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metersQuery.data.map((meter) => (
                        <TableRow key={meter.id}>
                          <TableCell>{meter.meterNumber}</TableCell>
                          <TableCell>{meter.meterType}</TableCell>
                          <TableCell>{getStatusBadge(meter.status || 'active')}</TableCell>
                          <TableCell>{parseFloat(meter.balance?.toString() || "0").toLocaleString()} ر.س</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnlinkMeter(meter.id)}
                              disabled={unlinkMeterMutation.isPending}
                            >
                              <Unlink className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد عدادات مرتبطة بهذا الحساب
                  </div>
                )}
              </TabsContent>

              <TabsContent value="invoices" className="space-y-4">
                {invoicesQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : invoicesQuery.data && invoicesQuery.data.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الفاتورة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>المبلغ الإجمالي</TableHead>
                        <TableHead>المدفوع</TableHead>
                        <TableHead>المتبقي</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoicesQuery.data.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                          <TableCell>{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('ar-SA') : '-'}</TableCell>
                          <TableCell>{parseFloat(invoice.totalAmount?.toString() || "0").toLocaleString()} ر.س</TableCell>
                          <TableCell>{parseFloat(invoice.paidAmount?.toString() || "0").toLocaleString()} ر.س</TableCell>
                          <TableCell className={parseFloat(invoice.balanceDue?.toString() || "0") > 0 ? "text-red-600" : "text-green-600"}>
                            {parseFloat(invoice.balanceDue?.toString() || "0").toLocaleString()} ر.س
                          </TableCell>
                          <TableCell>{getStatusBadge(invoice.status || 'generated')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد فواتير لهذا الحساب
                  </div>
                )}
              </TabsContent>

              <TabsContent value="payments" className="space-y-4">
                {paymentsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : paymentsQuery.data && paymentsQuery.data.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الدفعة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentsQuery.data.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                          <TableCell>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('ar-SA') : '-'}</TableCell>
                          <TableCell className="text-green-600">
                            {parseFloat(payment.amount?.toString() || "0").toLocaleString()} ر.س
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status || 'completed')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد مدفوعات لهذا الحساب
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Create Account Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة حساب مشترك جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>نوع الحساب *</Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(value: any) => setFormData({ ...formData, accountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sts">STS</SelectItem>
                    <SelectItem value="iot">IoT</SelectItem>
                    <SelectItem value="regular">عادي</SelectItem>
                    <SelectItem value="government_support">دعم حكومي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>اسم الحساب</Label>
                <Input
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="مثال: حساب المنزل الرئيسي"
                />
              </div>

              <div>
                <Label>نوع الخدمة *</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value: any) => setFormData({ ...formData, serviceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electricity">كهرباء</SelectItem>
                    <SelectItem value="water">ماء</SelectItem>
                    <SelectItem value="gas">غاز</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>نوع الدفع *</Label>
                <Select
                  value={formData.paymentMode}
                  onValueChange={(value: any) => setFormData({ ...formData, paymentMode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepaid">دفع مسبق</SelectItem>
                    <SelectItem value="postpaid">دفع لاحق</SelectItem>
                    <SelectItem value="hybrid">مختلط</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>دورة الفوترة *</Label>
                <Select
                  value={formData.billingCycle}
                  onValueChange={(value: any) => setFormData({ ...formData, billingCycle: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">شهري</SelectItem>
                    <SelectItem value="quarterly">ربع سنوي</SelectItem>
                    <SelectItem value="annual">سنوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.accountType === 'government_support' && (
                <>
                  <div>
                    <Label>نوع الدعم</Label>
                    <Input
                      value={formData.supportType}
                      onChange={(e) => setFormData({ ...formData, supportType: e.target.value })}
                      placeholder="مثال: low_income"
                    />
                  </div>
                  <div>
                    <Label>نسبة الدعم (%)</Label>
                    <Input
                      type="number"
                      value={formData.supportPercentage}
                      onChange={(e) => setFormData({ ...formData, supportPercentage: e.target.value })}
                      placeholder="مثال: 50"
                    />
                  </div>
                  <div>
                    <Label>أقصى مبلغ دعم</Label>
                    <Input
                      type="number"
                      value={formData.maxSupportAmount}
                      onChange={(e) => setFormData({ ...formData, maxSupportAmount: e.target.value })}
                      placeholder="مثال: 500.00"
                    />
                  </div>
                  <div>
                    <Label>الحصة الشهرية</Label>
                    <Input
                      type="number"
                      value={formData.monthlyQuota}
                      onChange={(e) => setFormData({ ...formData, monthlyQuota: e.target.value })}
                      placeholder="مثال: 500.00"
                    />
                  </div>
                </>
              )}

              {formData.accountType === 'sts' && (
                <div>
                  <Label>معرف عداد STS</Label>
                  <Input
                    type="number"
                    value={formData.stsMeterId}
                    onChange={(e) => setFormData({ ...formData, stsMeterId: e.target.value })}
                    placeholder="معرف عداد STS"
                  />
                </div>
              )}

              {formData.accountType === 'iot' && (
                <div>
                  <Label>معرف جهاز IoT</Label>
                  <Input
                    value={formData.iotDeviceId}
                    onChange={(e) => setFormData({ ...formData, iotDeviceId: e.target.value })}
                    placeholder="DEV-001"
                  />
                </div>
              )}

              <div>
                <Label>حد الائتمان</Label>
                <Input
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>مبلغ التأمين</Label>
                <Input
                  type="number"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label>ملاحظات</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات إضافية..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 ml-2" />
                  إنشاء
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Meter Dialog */}
      <Dialog open={isLinkMeterDialogOpen} onOpenChange={setIsLinkMeterDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ربط عداد بحساب المشترك</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div>
                <Label>الحساب المختار</Label>
                <p className="font-semibold">{selectedAccount.accountNumber} - {selectedAccount.accountName || getAccountTypeLabel(selectedAccount.accountType)}</p>
              </div>
              {allMetersQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : allMetersQuery.data && allMetersQuery.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم العداد</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allMetersQuery.data && Array.isArray(allMetersQuery.data)
                      ? allMetersQuery.data
                          .filter((meter: any) => !meter.subscriptionAccountId || meter.subscriptionAccountId === selectedAccount.id)
                          .map((meter: any) => (
                            <TableRow key={meter.id}>
                              <TableCell>{meter.meterNumber}</TableCell>
                              <TableCell>{meter.meterType || 'electricity'}</TableCell>
                              <TableCell>{getStatusBadge(meter.status || 'active')}</TableCell>
                              <TableCell>
                                {meter.subscriptionAccountId === selectedAccount.id ? (
                                  <Badge className="bg-green-500">مرتبط</Badge>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleLinkMeter(meter.id)}
                                    disabled={linkMeterMutation.isPending}
                                  >
                                    <LinkIcon className="w-4 h-4 ml-2" />
                                    ربط
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                      : null}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد عدادات متاحة للربط
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkMeterDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
