// صفحة إعداد محولات التيار (CT) - للـ ADW300
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, Zap, Save, RefreshCw } from "lucide-react";

const CT_SIZES = [100, 150, 200, 250, 300, 400, 600, 800, 1000];

export default function AcrelCTConfiguration() {
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Get meterId from URL params
  const params = new URLSearchParams(location.split("?")[1]);
  const meterId = params.get("meterId") ? parseInt(params.get("meterId")!) : 0;

  const [ctType, setCTType] = useState<"built_in" | "external">("external");
  const [ct1Size, setCT1Size] = useState(200);
  const [ct2Size, setCT2Size] = useState(200);
  const [ct3Size, setCT3Size] = useState(200);
  const [ct1CoreType, setCT1CoreType] = useState<"split" | "solid">("split");
  const [ct2CoreType, setCT2CoreType] = useState<"split" | "solid">("split");
  const [ct3CoreType, setCT3CoreType] = useState<"split" | "solid">("solid");

  const configureMutation = trpc.developer.integrations.acrel.ct.configure.useMutation({
    onSuccess: () => {
      toast({ title: "تم إعداد محولات التيار بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!meterId) {
      toast({ title: "خطأ", description: "الرجاء اختيار عداد", variant: "destructive" });
      return;
    }

    configureMutation.mutate({
      meterId,
      ct1Size,
      ct2Size,
      ct3Size,
      ct1CoreType,
      ct2CoreType,
      ct3CoreType,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-500" />
            إعداد محولات التيار (CT)
          </h1>
          <p className="text-muted-foreground mt-2">
            إعداد محولات التيار للعدادات ADW300 (Three Phase)
          </p>
        </div>
      </div>

      {/* CT Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>نوع محولات التيار</CardTitle>
          <CardDescription>
            اختر نوع المحولات المثبتة على العداد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={`cursor-pointer border-2 ${
                ctType === "built_in" ? "border-primary" : "border-border"
              }`}
              onClick={() => setCTType("built_in")}
            >
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">محولات مدمجة (Built-in)</h3>
                <p className="text-sm text-muted-foreground">
                  3 أقراص محول تيار 100 أمبير مثبتة بالعداد بأسلاك (لا يمكن تغييرها)
                </p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer border-2 ${
                ctType === "external" ? "border-primary" : "border-border"
              }`}
              onClick={() => setCTType("external")}
            >
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">محولات خارجية (External)</h3>
                <p className="text-sm text-muted-foreground">
                  بدون محولات - يركب له محولات منفصلة (100-1000 أمبير)
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* External CT Configuration */}
      {ctType === "external" && (
        <Card>
          <CardHeader>
            <CardTitle>إعداد المحولات الخارجية (3 حبات)</CardTitle>
            <CardDescription>
              اختر حجم ونوع قرص كل محول تيار
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* CT1 */}
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                محول التيار الأول (CT1)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>الحجم (أمبير)</Label>
                  <Select value={ct1Size.toString()} onValueChange={(v) => setCT1Size(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CT_SIZES.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} أمبير
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>نوع القرص</Label>
                  <Select value={ct1CoreType} onValueChange={(v: any) => setCT1CoreType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="split">قابل للفتح (Split Core)</SelectItem>
                      <SelectItem value="solid">حلقة مغلقة (Solid Core)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* CT2 */}
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-500" />
                محول التيار الثاني (CT2)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>الحجم (أمبير)</Label>
                  <Select value={ct2Size.toString()} onValueChange={(v) => setCT2Size(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CT_SIZES.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} أمبير
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>نوع القرص</Label>
                  <Select value={ct2CoreType} onValueChange={(v: any) => setCT2CoreType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="split">قابل للفتح (Split Core)</SelectItem>
                      <SelectItem value="solid">حلقة مغلقة (Solid Core)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* CT3 */}
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                محول التيار الثالث (CT3)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>الحجم (أمبير)</Label>
                  <Select value={ct3Size.toString()} onValueChange={(v) => setCT3Size(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CT_SIZES.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} أمبير
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>نوع القرص</Label>
                  <Select value={ct3CoreType} onValueChange={(v: any) => setCT3CoreType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="split">قابل للفتح (Split Core)</SelectItem>
                      <SelectItem value="solid">حلقة مغلقة (Solid Core)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-2">
              <Button onClick={handleSave} disabled={configureMutation.isPending}>
                {configureMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    حفظ التكوين
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

