// client/src/pages/settings/SMSSettings.tsx
// صفحة إعدادات خدمة SMS

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useBusinessId } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Save,
  Loader2,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

const SMS_SETTINGS_INFO = {
  title: "إعدادات خدمة SMS",
  description: "إدارة وتكوين خدمة الرسائل القصيرة (SMS).",
  process: `1) عند تحميل الصفحة:
   - استدعاء tRPC: messaging.templates.list لجلب قوالب الرسائل
   - عرض القوالب في جدول

2) إضافة قالب رسالة جديد:
   - النقر على "إضافة قالب"
   - اختيار نوع القالب (invoice, payment_reminder, etc.)
   - اختيار القناة (SMS, WhatsApp, Email)
   - كتابة الرسالة مع المتغيرات
   - حفظ القالب

3) إرسال رسالة تجريبية:
   - النقر على "إرسال تجريبي" بجانب القالب
   - إدخال رقم الهاتف
   - إرسال الرسالة`,
  mechanism: `- استعلام tRPC: messaging.templates.list.useQuery()
- نموذج CRUD مع التحقق من البيانات
- إرسال رسالة تجريبية عبر tRPC: messaging.send.useMutation()`,
  relatedScreens: [
    { name: "إعدادات WhatsApp", path: "/dashboard/settings/whatsapp", description: "إعدادات WhatsApp" },
    { name: "إعدادات البريد الإلكتروني", path: "/dashboard/settings/email", description: "إعدادات Email" },
  ],
  businessLogic: "خدمة SMS تتيح إرسال رسائل نصية للعملاء. يجب تكوين مزود SMS بشكل صحيح لضمان عملها.",
};

export default function SMSSettings() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [testPhone, setTestPhone] = useState("");

  const businessId = useBusinessId();

  const [formData, setFormData] = useState({
    templateName: "",
    templateType: "invoice" as const,
    channel: "sms" as const,
    subject: "",
    message: "",
    description: "",
    isDefault: false,
  });

  // Fetch templates
  const { data: templates, isLoading, refetch } = trpc.developer.integrations.messaging.templates.list.useQuery({
    businessId,
    channel: "sms",
  });

  // Create mutation
  const createMutation = trpc.developer.integrations.messaging.templates.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء القالب بنجاح");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("فشل في حفظ القالب: " + error.message);
    },
  });

  // Update mutation
  const updateMutation = trpc.developer.integrations.messaging.templates.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث القالب بنجاح");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("فشل في تحديث القالب: " + error.message);
    },
  });

  // Send test mutation
  const sendTestMutation = trpc.developer.integrations.messaging.send.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال الرسالة التجريبية بنجاح");
    },
    onError: (error) => {
      toast.error("فشل في إرسال الرسالة: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      templateName: "",
      templateType: "invoice",
      channel: "sms",
      subject: "",
      message: "",
      description: "",
      isDefault: false,
    });
    setEditingTemplate(null);
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      templateName: template.template_name || "",
      templateType: template.template_type || "invoice",
      channel: template.channel || "sms",
      subject: template.subject || "",
      message: template.message || "",
      description: template.description || "",
      isDefault: template.is_default || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({
        id: editingTemplate.id,
        ...formData,
      });
    } else {
      createMutation.mutate({
        businessId,
        ...formData,
      });
    }
  };

  const handleSendTest = (template: any) => {
    if (!testPhone) {
      toast.error("الرجاء إدخال رقم الهاتف");
      return;
    }

    // ✅ استخدام messagingRouter لإرسال رسالة تجريبية
    sendTestMutation.mutate({
      businessId,
      channel: template.channel || "sms",
      recipient: testPhone,
      template: template.template_type || "custom",
      data: {
        message: template.message || "",
        subject: template.subject || "",
      },
    });
  };

  const getTemplateTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      invoice: "فاتورة",
      payment_reminder: "تذكير بالدفع",
      payment_confirmation: "تأكيد الدفع",
      reading_notification: "إشعار قراءة",
      custom: "مخصص",
    };
    return labels[type] || type;
  };

  const currentPageInfo = resolvePageInfo("/dashboard/settings/sms");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-green-500" />
            إعدادات خدمة SMS
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة قوالب الرسائل النصية (SMS)
          </p>
        </div>
        <div className="flex gap-2">
          <EngineInfoDialog info={currentPageInfo} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة قالب
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "تعديل قالب الرسالة" : "إضافة قالب رسالة جديد"}
                </DialogTitle>
                <DialogDescription>
                  قم بإنشاء قالب رسالة SMS مع إمكانية استخدام المتغيرات
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>اسم القالب *</Label>
                    <Input
                      value={formData.templateName}
                      onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                      placeholder="مثال: قالب الفاتورة"
                      required
                    />
                  </div>
                  <div>
                    <Label>نوع القالب *</Label>
                    <Select
                      value={formData.templateType}
                      onValueChange={(value: any) => setFormData({ ...formData, templateType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invoice">فاتورة</SelectItem>
                        <SelectItem value="payment_reminder">تذكير بالدفع</SelectItem>
                        <SelectItem value="payment_confirmation">تأكيد الدفع</SelectItem>
                        <SelectItem value="reading_notification">إشعار قراءة</SelectItem>
                        <SelectItem value="custom">مخصص</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>الرسالة *</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="عزيزي {{customerName}}، فاتورة {{invoiceNumber}} بمبلغ {{amount}} ر.س مستحقة في {{dueDate}}"
                    rows={5}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    يمكنك استخدام المتغيرات مثل: {"{"}{"{"}customerName{"}"}{"}"}, {"{"}{"{"}invoiceNumber{"}"}{"}"}, {"{"}{"{"}amount{"}"}{"}"}
                  </p>
                </div>

                <div>
                  <Label>الوصف</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف القالب..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                  <Label htmlFor="isDefault">القالب الافتراضي لهذا النوع</Label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
                    {(createMutation.isLoading || updateMutation.isLoading) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        حفظ
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>قوالب الرسائل</CardTitle>
          <CardDescription>قائمة قوالب الرسائل النصية (SMS)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates?.map((template: any) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.template_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTemplateTypeLabel(template.template_type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            نشط
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            غير نشط
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendTest(template)}
                          disabled={sendTestMutation.isLoading}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          إرسال تجريبي
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                          <Edit className="w-4 h-4 mr-1" />
                          تعديل
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Test SMS Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="hidden">إرسال تجريبي</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إرسال رسالة تجريبية</DialogTitle>
            <DialogDescription>
              أدخل رقم الهاتف لإرسال رسالة تجريبية
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>رقم الهاتف *</Label>
              <Input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="0501234567"
                dir="ltr"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline">إلغاء</Button>
            <Button onClick={() => handleSendTest(null)}>إرسال</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

