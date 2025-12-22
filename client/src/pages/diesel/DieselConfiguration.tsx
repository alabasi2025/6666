import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Package, Gauge, Pipette, ArrowDown, Save, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export default function DieselConfiguration() {
  const { toast } = useToast();
  const [selectedStation, setSelectedStation] = useState<string>("");
  
  const [config, setConfig] = useState({
    hasIntakePump: false,
    hasOutputPump: false,
    intakePumpHasMeter: false,
    outputPumpHasMeter: false,
  });

  const [pathElements, setPathElements] = useState<any[]>([]);

  const utils = trpc.useUtils();
  const { data: stations } = trpc.getStations.useQuery();
  const { data: tanks } = trpc.diesel.getDieselTanks.useQuery();
  const { data: pumps } = trpc.diesel.getDieselPumpMeters.useQuery();
  const { data: pipes } = trpc.diesel.getDieselPipes.useQuery();
  const { data: existingConfig } = trpc.diesel.getStationDieselConfig.useQuery(
    { stationId: parseInt(selectedStation) },
    { enabled: !!selectedStation }
  );

  const saveConfigMutation = trpc.diesel.saveStationDieselConfig.useMutation({
    onSuccess: () => {
      toast({ title: "تم حفظ التهيئة بنجاح" });
      utils.diesel.getStationDieselConfig.invalidate();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  // تحميل التهيئة الموجودة
  useEffect(() => {
    if (existingConfig) {
      setConfig({
        hasIntakePump: existingConfig.config?.hasIntakePump || false,
        hasOutputPump: existingConfig.config?.hasOutputPump || false,
        intakePumpHasMeter: existingConfig.config?.intakePumpHasMeter || false,
        outputPumpHasMeter: existingConfig.config?.outputPumpHasMeter || false,
      });
      setPathElements(existingConfig.path || []);
    } else {
      setConfig({
        hasIntakePump: false,
        hasOutputPump: false,
        intakePumpHasMeter: false,
        outputPumpHasMeter: false,
      });
      setPathElements([]);
    }
  }, [existingConfig]);

  // فلترة الأصول حسب المحطة
  const stationTanks = tanks?.filter((t: any) => t.stationId === parseInt(selectedStation)) || [];
  const stationPumps = pumps?.filter((p: any) => p.stationId === parseInt(selectedStation)) || [];
  const stationPipes = pipes?.filter((p: any) => p.stationId === parseInt(selectedStation)) || [];

  const addPathElement = (type: string) => {
    setPathElements([...pathElements, {
      sequenceOrder: pathElements.length + 1,
      elementType: type,
      tankId: null,
      pumpId: null,
      pipeId: null,
    }]);
  };

  const updatePathElement = (index: number, field: string, value: any) => {
    const updated = [...pathElements];
    updated[index] = { ...updated[index], [field]: value };
    setPathElements(updated);
  };

  const removePathElement = (index: number) => {
    const updated = pathElements.filter((_, i) => i !== index);
    // إعادة ترقيم
    updated.forEach((el, i) => el.sequenceOrder = i + 1);
    setPathElements(updated);
  };

  const handleSave = () => {
    if (!selectedStation) {
      toast({ title: "خطأ", description: "يرجى اختيار المحطة", variant: "destructive" });
      return;
    }
    saveConfigMutation.mutate({
      stationId: parseInt(selectedStation),
      config,
      path: pathElements,
    });
  };

  const getElementTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      receiving_tank: "خزان استلام",
      pipe: "مواصير",
      intake_pump: "طرمبة دخول",
      main_tank: "خزان رئيسي",
      pre_output_tank: "خزان قبل طرمبة الخروج",
      output_pump: "طرمبة خروج",
      generator_tank: "خزان مولد",
    };
    return types[type] || type;
  };

  const getElementIcon = (type: string) => {
    if (type.includes("tank")) return <Package className="h-4 w-4" />;
    if (type.includes("pump")) return <Gauge className="h-4 w-4" />;
    if (type === "pipe") return <Pipette className="h-4 w-4" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تهيئة مخطط الديزل</h1>
          <p className="text-muted-foreground">إعداد مسار الديزل في المحطة</p>
        </div>
        <Button onClick={handleSave} disabled={saveConfigMutation.isPending || !selectedStation}>
          <Save className="ml-2 h-4 w-4" />
          حفظ التهيئة
        </Button>
      </div>

      {/* اختيار المحطة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            اختيار المحطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label>المحطة</Label>
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger><SelectValue placeholder="اختر المحطة" /></SelectTrigger>
              <SelectContent>
                {stations?.map((station: any) => (
                  <SelectItem key={station.id} value={station.id.toString()}>{station.nameAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedStation && (
        <>
          {/* إعدادات الطرمبات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                إعدادات الطرمبات
              </CardTitle>
              <CardDescription>حدد نوع الطرمبات المتوفرة في المحطة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>طرمبة دخول (استلام)</Label>
                    <Switch
                      checked={config.hasIntakePump}
                      onCheckedChange={(checked) => setConfig({ ...config, hasIntakePump: checked })}
                    />
                  </div>
                  {config.hasIntakePump && (
                    <div className="flex items-center justify-between mr-4">
                      <Label className="text-sm text-muted-foreground">بعداد (تحسب الكمية)</Label>
                      <Switch
                        checked={config.intakePumpHasMeter}
                        onCheckedChange={(checked) => setConfig({ ...config, intakePumpHasMeter: checked })}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>طرمبة خروج (توزيع)</Label>
                    <Switch
                      checked={config.hasOutputPump}
                      onCheckedChange={(checked) => setConfig({ ...config, hasOutputPump: checked })}
                    />
                  </div>
                  {config.hasOutputPump && (
                    <div className="flex items-center justify-between mr-4">
                      <Label className="text-sm text-muted-foreground">بعداد (تحسب الكمية)</Label>
                      <Switch
                        checked={config.outputPumpHasMeter}
                        onCheckedChange={(checked) => setConfig({ ...config, outputPumpHasMeter: checked })}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* مسار الديزل */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                مسار الديزل
              </CardTitle>
              <CardDescription>حدد ترتيب العناصر في مسار الديزل من الاستلام إلى المولدات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* أزرار إضافة العناصر */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => addPathElement("receiving_tank")}>
                  <Package className="ml-2 h-4 w-4" />خزان استلام
                </Button>
                <Button variant="outline" size="sm" onClick={() => addPathElement("pipe")}>
                  <Pipette className="ml-2 h-4 w-4" />مواصير
                </Button>
                <Button variant="outline" size="sm" onClick={() => addPathElement("intake_pump")}>
                  <Gauge className="ml-2 h-4 w-4" />طرمبة دخول
                </Button>
                <Button variant="outline" size="sm" onClick={() => addPathElement("main_tank")}>
                  <Package className="ml-2 h-4 w-4" />خزان رئيسي
                </Button>
                <Button variant="outline" size="sm" onClick={() => addPathElement("pre_output_tank")}>
                  <Package className="ml-2 h-4 w-4" />خزان قبل الخروج
                </Button>
                <Button variant="outline" size="sm" onClick={() => addPathElement("output_pump")}>
                  <Gauge className="ml-2 h-4 w-4" />طرمبة خروج
                </Button>
                <Button variant="outline" size="sm" onClick={() => addPathElement("generator_tank")}>
                  <Package className="ml-2 h-4 w-4" />خزان مولد
                </Button>
              </div>

              <Separator />

              {/* عرض المسار */}
              {pathElements.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لم يتم تحديد مسار الديزل بعد. اضغط على الأزرار أعلاه لإضافة العناصر.
                </p>
              ) : (
                <div className="space-y-4">
                  {pathElements.map((element, index) => (
                    <div key={index}>
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                          {element.sequenceOrder}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {getElementIcon(element.elementType)}
                          <span className="font-medium">{getElementTypeLabel(element.elementType)}</span>
                        </div>
                        <div className="flex-1">
                          {element.elementType.includes("tank") && (
                            <Select
                              value={element.tankId?.toString() || ""}
                              onValueChange={(value) => updatePathElement(index, "tankId", parseInt(value))}
                            >
                              <SelectTrigger><SelectValue placeholder="اختر الخزان" /></SelectTrigger>
                              <SelectContent>
                                {stationTanks.map((tank: any) => (
                                  <SelectItem key={tank.id} value={tank.id.toString()}>
                                    {tank.nameAr} ({tank.capacity} لتر)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {element.elementType.includes("pump") && (
                            <Select
                              value={element.pumpId?.toString() || ""}
                              onValueChange={(value) => updatePathElement(index, "pumpId", parseInt(value))}
                            >
                              <SelectTrigger><SelectValue placeholder="اختر الطرمبة" /></SelectTrigger>
                              <SelectContent>
                                {stationPumps.map((pump: any) => (
                                  <SelectItem key={pump.id} value={pump.id.toString()}>
                                    {pump.nameAr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {element.elementType === "pipe" && (
                            <Select
                              value={element.pipeId?.toString() || ""}
                              onValueChange={(value) => updatePathElement(index, "pipeId", parseInt(value))}
                            >
                              <SelectTrigger><SelectValue placeholder="اختر المواصير" /></SelectTrigger>
                              <SelectContent>
                                {stationPipes.map((pipe: any) => (
                                  <SelectItem key={pipe.id} value={pipe.id.toString()}>
                                    {pipe.nameAr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removePathElement(index)}>
                          حذف
                        </Button>
                      </div>
                      {index < pathElements.length - 1 && (
                        <div className="flex justify-center py-2">
                          <ArrowDown className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ملخص الأصول */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  الخزانات المتاحة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stationTanks.length}</div>
                <p className="text-xs text-muted-foreground">خزان في هذه المحطة</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  الطرمبات المتاحة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stationPumps.length}</div>
                <p className="text-xs text-muted-foreground">طرمبة في هذه المحطة</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Pipette className="h-4 w-4" />
                  المواصير المتاحة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stationPipes.length}</div>
                <p className="text-xs text-muted-foreground">مجموعة مواصير</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
