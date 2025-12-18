import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Plus, Search, Plug, Settings, Trash2, Eye, RefreshCw,
  CheckCircle, XCircle, AlertTriangle, Clock, ExternalLink
} from "lucide-react";

const integrationTypes = [
  { value: "payment_gateway", label: "بوابة دفع" },
  { value: "sms", label: "رسائل SMS" },
  { value: "whatsapp", label: "واتساب" },
  { value: "email", label: "بريد إلكتروني" },
  { value: "iot", label: "إنترنت الأشياء (IoT)" },
  { value: "erp", label: "نظام ERP" },
  { value: "crm", label: "نظام CRM" },
  { value: "scada", label: "SCADA" },
  { value: "gis", label: "نظام GIS" },
  { value: "weather", label: "بيانات الطقس" },
  { value: "maps", label: "خرائط" },
  { value: "other", label: "أخرى" },
];

const authTypes = [
  { value: "api_key", label: "مفتاح API" },
  { value: "oauth2", label: "OAuth 2.0" },
  { value: "basic", label: "Basic Auth" },
  { value: "hmac", label: "HMAC" },
  { value: "jwt", label: "JWT" },
  { value: "none", label: "بدون" },
];

const healthStatusColors: Record<string, string> = {
  healthy: "bg-green-500",
  degraded: "bg-yellow-500",
  down: "bg-red-500",
  unknown: "bg-gray-500",
};

const healthStatusLabels: Record<string, string> = {
  healthy: "سليم",
  degraded: "متدهور",
  down: "متوقف",
  unknown: "غير معروف",
};

export default function Integrations() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);

  const { data: integrations, isLoading, refetch } = trpc.developer.integrations.list.useQuery({
    businessId: 1,
    type: typeFilter !== "all" ? typeFilter : undefined,
  });

  const createMutation = trpc.developer.integrations.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء التكامل بنجاح");
      setIsAddDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.developer.integrations.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث التكامل بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.developer.integrations.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف التكامل بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredIntegrations = integrations?.filter((integration: any) =>
    integration.nameAr.includes(search) || 
    integration.code.includes(search) ||
    integration.provider?.includes(search)
  );

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      businessId: 1,
      code: formData.get("code") as string,
      nameAr: formData.get("nameAr") as string,
      nameEn: formData.get("nameEn") as string || undefined,
      description: formData.get("description") as string || undefined,
      integrationType: formData.get("integrationType") as any,
      category: formData.get("category") as any || "local",
      provider: formData.get("provider") as string || undefined,
      baseUrl: formData.get("baseUrl") as string || undefined,
      apiVersion: formData.get("apiVersion") as string || undefined,
      authType: formData.get("authType") as any || "api_key",
      webhookUrl: formData.get("webhookUrl") as string || undefined,
      rateLimitPerMinute: parseInt(formData.get("rateLimitPerMinute") as string) || 60,
      timeoutSeconds: parseInt(formData.get("timeoutSeconds") as string) || 30,
      retryAttempts: parseInt(formData.get("retryAttempts") as string) || 3,
    });
  };

  const toggleActive = (id: number, isActive: boolean) => {
    updateMutation.mutate({ id, isActive: !isActive });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة التكاملات</h1>
          <p className="text-muted-foreground">إدارة التكاملات مع الأنظمة والخدمات الخارجية</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة تكامل
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة تكامل جديد</DialogTitle>
              <DialogDescription>أدخل بيانات التكامل مع النظام الخارجي</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">الكود</Label>
                    <Input id="code" name="code" placeholder="payment_stripe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="integrationType">النوع</Label>
                    <Select name="integrationType" required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        {integrationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">الاسم بالعربية</Label>
                    <Input id="nameAr" name="nameAr" placeholder="بوابة الدفع Stripe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                    <Input id="nameEn" name="nameEn" placeholder="Stripe Payment Gateway" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea id="description" name="description" placeholder="وصف التكامل..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">المزود</Label>
                    <Input id="provider" name="provider" placeholder="Stripe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">الفئة</Label>
                    <Select name="category" defaultValue="local">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">محلي</SelectItem>
                        <SelectItem value="international">دولي</SelectItem>
                        <SelectItem value="internal">داخلي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseUrl">رابط API</Label>
                    <Input id="baseUrl" name="baseUrl" placeholder="https://api.stripe.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiVersion">إصدار API</Label>
                    <Input id="apiVersion" name="apiVersion" placeholder="v1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authType">نوع المصادقة</Label>
                    <Select name="authType" defaultValue="api_key">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {authTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">رابط Webhook</Label>
                    <Input id="webhookUrl" name="webhookUrl" placeholder="https://..." />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rateLimitPerMinute">حد الطلبات/دقيقة</Label>
                    <Input id="rateLimitPerMinute" name="rateLimitPerMinute" type="number" defaultValue="60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeoutSeconds">المهلة (ثانية)</Label>
                    <Input id="timeoutSeconds" name="timeoutSeconds" type="number" defaultValue="30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retryAttempts">محاولات إعادة</Label>
                    <Input id="retryAttempts" name="retryAttempts" type="number" defaultValue="3" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو الكود..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="نوع التكامل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {integrationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التكامل</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المزود</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الصحة</TableHead>
                <TableHead>نشط</TableHead>
                <TableHead className="w-24">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filteredIntegrations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد تكاملات
                  </TableCell>
                </TableRow>
              ) : (
                filteredIntegrations?.map((integration: any) => (
                  <TableRow key={integration.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{integration.nameAr}</div>
                        <div className="text-sm text-muted-foreground">{integration.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {integrationTypes.find(t => t.value === integration.integrationType)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{integration.provider || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={integration.category === "local" ? "default" : "secondary"}>
                        {integration.category === "local" ? "محلي" : integration.category === "international" ? "دولي" : "داخلي"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={healthStatusColors[integration.healthStatus || "unknown"]}>
                        {healthStatusLabels[integration.healthStatus || "unknown"]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={integration.isActive}
                        onCheckedChange={() => toggleActive(integration.id, integration.isActive)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedIntegration(integration)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate({ id: integration.id })}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
