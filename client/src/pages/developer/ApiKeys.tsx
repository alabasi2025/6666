import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Plus, Key, Copy, Trash2, RefreshCw, AlertTriangle,
  CheckCircle, Clock, Shield, Eye, EyeOff
} from "lucide-react";

export default function ApiKeys() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const { data: apiKeys, isLoading, refetch } = trpc.developer.apiKeys.list.useQuery({ businessId: 1 });

  const createMutation = trpc.developer.apiKeys.create.useMutation({
    onSuccess: (data) => {
      setNewApiKey(data.apiKey);
      toast.success("تم إنشاء مفتاح API بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const revokeMutation = trpc.developer.apiKeys.revoke.useMutation({
    onSuccess: () => {
      toast.success("تم إلغاء مفتاح API بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      businessId: 1,
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      rateLimitPerMinute: parseInt(formData.get("rateLimitPerMinute") as string) || 60,
      rateLimitPerDay: parseInt(formData.get("rateLimitPerDay") as string) || 10000,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ المفتاح");
  };

  const formatDate = (date: Date | string | null) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مفاتيح API</h1>
          <p className="text-muted-foreground">إدارة مفاتيح الوصول للواجهات البرمجية</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setNewApiKey(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إنشاء مفتاح جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء مفتاح API جديد</DialogTitle>
              <DialogDescription>
                سيتم عرض المفتاح مرة واحدة فقط. تأكد من حفظه في مكان آمن.
              </DialogDescription>
            </DialogHeader>
            {newApiKey ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>مهم!</AlertTitle>
                  <AlertDescription>
                    هذا هو مفتاح API الخاص بك. لن يتم عرضه مرة أخرى. احفظه في مكان آمن.
                  </AlertDescription>
                </Alert>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 text-sm break-all" dir="ltr">
                    {showKey ? newApiKey : "•".repeat(newApiKey.length)}
                  </code>
                  <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(newApiKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    setIsAddDialogOpen(false);
                    setNewApiKey(null);
                  }}>
                    تم الحفظ
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <form onSubmit={handleCreate}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم المفتاح</Label>
                    <Input id="name" name="name" placeholder="مفتاح تطبيق الجوال" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea id="description" name="description" placeholder="وصف استخدام هذا المفتاح..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rateLimitPerMinute">حد الطلبات/دقيقة</Label>
                      <Input id="rateLimitPerMinute" name="rateLimitPerMinute" type="number" defaultValue="60" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rateLimitPerDay">حد الطلبات/يوم</Label>
                      <Input id="rateLimitPerDay" name="rateLimitPerDay" type="number" defaultValue="10000" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء المفتاح"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>أمان مفاتيح API</AlertTitle>
        <AlertDescription>
          لا تشارك مفاتيح API الخاصة بك مع أي شخص. استخدم مفاتيح مختلفة لكل تطبيق أو خدمة.
        </AlertDescription>
      </Alert>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>المفاتيح النشطة</CardTitle>
              <CardDescription>قائمة بجميع مفاتيح API</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المفتاح</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الحدود</TableHead>
                <TableHead>آخر استخدام</TableHead>
                <TableHead>الاستخدام</TableHead>
                <TableHead>الحالة</TableHead>
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
              ) : apiKeys?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد مفاتيح API
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys?.map((key: any) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{key.name}</div>
                        <code className="text-xs text-muted-foreground" dir="ltr">
                          {key.keyPrefix}...
                        </code>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {key.description || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{key.rateLimitPerMinute}/دقيقة</div>
                        <div className="text-muted-foreground">{key.rateLimitPerDay}/يوم</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.lastUsedAt ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {formatDate(key.lastUsedAt)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">لم يُستخدم</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {key.usageCount || 0} طلب
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {key.isActive ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 ml-1" />
                          نشط
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          ملغي
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {key.isActive && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من إلغاء هذا المفتاح؟")) {
                              revokeMutation.mutate({ id: key.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>كيفية الاستخدام</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">إضافة المفتاح في الطلبات</h4>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" dir="ltr">
{`// في رأس الطلب (Header)
Authorization: Bearer YOUR_API_KEY

// أو كمعامل استعلام (Query Parameter)
GET /api/v1/endpoint?api_key=YOUR_API_KEY`}
            </pre>
          </div>
          <div>
            <h4 className="font-medium mb-2">مثال باستخدام cURL</h4>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" dir="ltr">
{`curl -X GET "https://api.example.com/v1/data" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
