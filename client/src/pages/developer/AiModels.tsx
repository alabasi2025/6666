import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Brain, Activity, RefreshCw, Zap, TrendingUp, AlertTriangle, Settings } from "lucide-react";

const modelTypes = [
  { value: "consumption_forecast", label: "التنبؤ بالاستهلاك", icon: TrendingUp },
  { value: "fault_detection", label: "كشف الأعطال", icon: AlertTriangle },
  { value: "load_optimization", label: "تحسين الأحمال", icon: Zap },
  { value: "anomaly_detection", label: "كشف الشذوذ", icon: Activity },
  { value: "demand_prediction", label: "التنبؤ بالطلب", icon: TrendingUp },
  { value: "maintenance_prediction", label: "التنبؤ بالصيانة", icon: Settings },
];

export default function AiModels() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data: models, isLoading, refetch } = trpc.developer.ai.models.list.useQuery({ businessId: 1 });
  const { data: predictions } = trpc.developer.ai.predictions.list.useQuery({ businessId: 1, limit: 50 });

  const createMutation = trpc.developer.ai.models.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء النموذج بنجاح");
      setIsAddDialogOpen(false);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      businessId: 1,
      code: formData.get("code") as string,
      nameAr: formData.get("nameAr") as string,
      modelType: formData.get("modelType") as any,
      provider: formData.get("provider") as any || "internal",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الذكاء الاصطناعي</h1>
          <p className="text-muted-foreground">إدارة نماذج وتنبؤات الذكاء الاصطناعي</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 ml-2" />إضافة نموذج</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة نموذج ذكاء اصطناعي</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الكود</Label>
                    <Input name="code" placeholder="consumption_model_v1" required />
                  </div>
                  <div className="space-y-2">
                    <Label>النوع</Label>
                    <Select name="modelType" required>
                      <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                      <SelectContent>
                        {modelTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>الاسم</Label>
                  <Input name="nameAr" placeholder="نموذج التنبؤ بالاستهلاك" required />
                </div>
                <div className="space-y-2">
                  <Label>المزود</Label>
                  <Select name="provider" defaultValue="internal">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">داخلي</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="azure">Azure</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={createMutation.isPending}>إنشاء</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="models">
        <TabsList>
          <TabsTrigger value="models">النماذج</TabsTrigger>
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <Card className="col-span-full"><CardContent className="py-8 text-center">جاري التحميل...</CardContent></Card>
            ) : models?.length === 0 ? (
              <Card className="col-span-full"><CardContent className="py-8 text-center text-muted-foreground">لا توجد نماذج</CardContent></Card>
            ) : (
              models?.map((model: any) => (
                <Card key={model.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Brain className="h-8 w-8 text-purple-500" />
                      <Badge className={model.isActive ? "bg-green-500" : "bg-gray-500"}>
                        {model.isActive ? "نشط" : "معطل"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{model.nameAr}</CardTitle>
                    <CardDescription>{model.code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">النوع:</span>
                        <span>{modelTypes.find(t => t.value === model.modelType)?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">المزود:</span>
                        <span>{model.provider}</span>
                      </div>
                      {model.accuracy && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">الدقة:</span>
                          <span>{model.accuracy}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="predictions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>النموذج</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الكيان</TableHead>
                    <TableHead>الثقة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>التحقق</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد تنبؤات</TableCell>
                    </TableRow>
                  ) : (
                    predictions?.map((pred: any) => (
                      <TableRow key={pred.id}>
                        <TableCell>{pred.modelId}</TableCell>
                        <TableCell>{pred.predictionType}</TableCell>
                        <TableCell>{pred.targetEntity ? `${pred.targetEntity}#${pred.targetEntityId}` : "-"}</TableCell>
                        <TableCell>{pred.confidence ? `${pred.confidence}%` : "-"}</TableCell>
                        <TableCell>{new Date(pred.predictionDate).toLocaleDateString("ar-SA")}</TableCell>
                        <TableCell>
                          <Badge className={pred.isVerified ? "bg-green-500" : "bg-yellow-500"}>
                            {pred.isVerified ? "تم التحقق" : "قيد الانتظار"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
