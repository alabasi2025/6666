/**
 * معالج استبدال العداد التالف
 * Meter Replacement Wizard
 * 
 * معالج متعدد الخطوات لاستبدال عداد تالف:
 * 1. اختيار العميل والعداد التالف
 * 2. حساب الاستهلاك التقديري (متوسط آخر 3 أشهر)
 * 3. إنشاء فاتورة الاستهلاك
 * 4. تحديد تكلفة العداد (مجاني/50%/كامل)
 * 5. إنشاء فاتورة العداد
 * 6. إنشاء أمر عمل
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, ArrowLeft, Check, Loader2, AlertCircle,
  User, Zap, Calculator, FileText, Wrench, CheckCircle
} from "lucide-react";

interface WizardStep {
  id: number;
  title: string;
  icon: any;
  isCompleted: boolean;
}

interface MeterReplacementData {
  // Step 1
  customerId?: number;
  customerName?: string;
  meterId?: number;
  meterNumber?: string;
  meterType?: string;
  
  // Step 2
  estimatedConsumption?: number;
  averageConsumption?: number;
  lastReadings?: any[];
  
  // Step 3
  consumptionInvoiceAmount?: number;
  consumptionInvoiceId?: number;
  
  // Step 4
  meterCostType?: "free" | "half" | "full";
  meterCost?: number;
  
  // Step 5
  meterInvoiceAmount?: number;
  meterInvoiceId?: number;
  
  // Step 6
  workOrderId?: number;
}

const steps: WizardStep[] = [
  { id: 1, title: "اختيار العميل والعداد", icon: User, isCompleted: false },
  { id: 2, title: "حساب الاستهلاك التقديري", icon: Calculator, isCompleted: false },
  { id: 3, title: "فاتورة الاستهلاك", icon: FileText, isCompleted: false },
  { id: 4, title: "تحديد تكلفة العداد", icon: Zap, isCompleted: false },
  { id: 5, title: "فاتورة العداد", icon: FileText, isCompleted: false },
  { id: 6, title: "إنشاء أمر العمل", icon: Wrench, isCompleted: false },
];

export default function MeterReplacementWizard() {
  const { toast } = useToast();
  const businessId = useBusinessId();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<MeterReplacementData>({});
  const [searchTerm, setSearchTerm] = useState("");
  
  // Queries
  const { data: customers } = trpc.billing.customers.search.useQuery(
    { businessId, search: searchTerm },
    { enabled: currentStep === 1 && searchTerm.length > 0 }
  );
  
  const { data: meterReadings, isLoading: loadingReadings } = trpc.billing.meterReadings.getHistory.useQuery(
    { meterId: wizardData.meterId!, limit: 3 },
    { enabled: currentStep === 2 && !!wizardData.meterId }
  );
  
  // Mutations
  const createConsumptionInvoice = trpc.billing.invoices.create.useMutation({
    onSuccess: (data) => {
      setWizardData({ ...wizardData, consumptionInvoiceId: data.id });
      toast({ title: "نجاح", description: "تم إنشاء فاتورة الاستهلاك" });
      goToNextStep();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
  
  const createMeterInvoice = trpc.billing.invoices.create.useMutation({
    onSuccess: (data) => {
      setWizardData({ ...wizardData, meterInvoiceId: data.id });
      toast({ title: "نجاح", description: "تم إنشاء فاتورة العداد" });
      goToNextStep();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
  
  const createWorkOrder = trpc.maintenance.workOrders.create.useMutation({
    onSuccess: (data) => {
      setWizardData({ ...wizardData, workOrderId: data.id });
      toast({ 
        title: "نجاح", 
        description: "تم إنشاء أمر العمل بنجاح. العملية مكتملة!",
        duration: 5000
      });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
  
  // Helper Functions
  const goToNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const calculateEstimatedConsumption = () => {
    if (meterReadings && meterReadings.length > 0) {
      const total = meterReadings.reduce((sum: number, reading: any) => 
        sum + parseFloat(reading.consumption || "0"), 0
      );
      const average = total / meterReadings.length;
      setWizardData({
        ...wizardData,
        averageConsumption: average,
        estimatedConsumption: average,
        lastReadings: meterReadings
      });
    }
  };
  
  const handleCreateConsumptionInvoice = () => {
    if (!wizardData.customerId || !wizardData.estimatedConsumption) {
      toast({ title: "خطأ", description: "يرجى التأكد من جميع البيانات", variant: "destructive" });
      return;
    }
    
    // حساب المبلغ (سعر افتراضي 0.18 ريال/كيلو)
    const amount = wizardData.estimatedConsumption * 0.18;
    setWizardData({ ...wizardData, consumptionInvoiceAmount: amount });
    
    createConsumptionInvoice.mutate({
      businessId,
      customerId: wizardData.customerId,
      meterId: wizardData.meterId,
      totalAmount: amount,
      description: `فاتورة استهلاك تقديري - استبدال عداد تالف`,
      dueDate: new Date().toISOString().split('T')[0],
    });
  };
  
  const handleCreateMeterInvoice = () => {
    if (!wizardData.customerId || !wizardData.meterCost) {
      toast({ title: "خطأ", description: "يرجى تحديد تكلفة العداد", variant: "destructive" });
      return;
    }
    
    setWizardData({ ...wizardData, meterInvoiceAmount: wizardData.meterCost });
    
    createMeterInvoice.mutate({
      businessId,
      customerId: wizardData.customerId,
      totalAmount: wizardData.meterCost,
      description: `فاتورة تكلفة عداد بديل`,
      dueDate: new Date().toISOString().split('T')[0],
    });
  };
  
  const handleCreateWorkOrder = () => {
    createWorkOrder.mutate({
      businessId,
      customerId: wizardData.customerId,
      workOrderType: "meter_replacement",
      priority: "high",
      description: `استبدال عداد تالف - ${wizardData.meterNumber}`,
      scheduledDate: new Date().toISOString().split('T')[0],
      estimatedCost: (wizardData.consumptionInvoiceAmount || 0) + (wizardData.meterInvoiceAmount || 0),
    });
  };
  
  // Render Steps
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label>البحث عن العميل</Label>
        <Input
          placeholder="ابحث بالاسم أو رقم الحساب..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-2"
        />
      </div>
      
      {customers && customers.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>رقم الحساب</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>الإجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer: any) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name_ar}</TableCell>
                <TableCell>{customer.account_number}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => {
                      setWizardData({
                        ...wizardData,
                        customerId: customer.id,
                        customerName: customer.name_ar,
                      });
                    }}
                  >
                    اختيار
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {wizardData.customerId && (
        <Card className="bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg">العميل المختار</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-bold">{wizardData.customerName}</p>
            <div className="mt-4">
              <Label>رقم العداد التالف</Label>
              <Input
                placeholder="أدخل رقم العداد..."
                value={wizardData.meterNumber || ""}
                onChange={(e) => setWizardData({ ...wizardData, meterNumber: e.target.value })}
                className="mt-2"
              />
            </div>
            <div className="mt-4">
              <Label>نوع العداد</Label>
              <Select
                value={wizardData.meterType}
                onValueChange={(value) => setWizardData({ ...wizardData, meterType: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="اختر نوع العداد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traditional">تقليدي</SelectItem>
                  <SelectItem value="sts">STS</SelectItem>
                  <SelectItem value="iot">IoT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end">
        <Button
          onClick={goToNextStep}
          disabled={!wizardData.customerId || !wizardData.meterNumber}
        >
          التالي
          <ArrowRight className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>حساب الاستهلاك التقديري</CardTitle>
          <CardDescription>
            سيتم حساب الاستهلاك بناءً على متوسط آخر 3 أشهر
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingReadings ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="mr-2">جاري جلب القراءات...</span>
            </div>
          ) : (
            <>
              {meterReadings && meterReadings.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>القراءة</TableHead>
                        <TableHead>الاستهلاك</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meterReadings.map((reading: any) => (
                        <TableRow key={reading.id}>
                          <TableCell>{new Date(reading.reading_date).toLocaleDateString('ar-SA')}</TableCell>
                          <TableCell>{reading.current_reading}</TableCell>
                          <TableCell>{reading.consumption} كيلو</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">المتوسط الشهري:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {wizardData.averageConsumption?.toFixed(2) || "0"} كيلو
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label>الاستهلاك التقديري للفترة الحالية (كيلو)</Label>
                    <Input
                      type="number"
                      value={wizardData.estimatedConsumption || ""}
                      onChange={(e) => setWizardData({
                        ...wizardData,
                        estimatedConsumption: parseFloat(e.target.value)
                      })}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      يمكنك تعديل القيمة إذا لزم الأمر
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                  <p>لا توجد قراءات سابقة لهذا العداد</p>
                  <div className="mt-4">
                    <Label>أدخل الاستهلاك التقديري يدوياً</Label>
                    <Input
                      type="number"
                      placeholder="الاستهلاك بالكيلو"
                      value={wizardData.estimatedConsumption || ""}
                      onChange={(e) => setWizardData({
                        ...wizardData,
                        estimatedConsumption: parseFloat(e.target.value)
                      })}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
              
              {!wizardData.averageConsumption && meterReadings && meterReadings.length > 0 && (
                <Button onClick={calculateEstimatedConsumption} className="w-full">
                  <Calculator className="ml-2 h-4 w-4" />
                  حساب المتوسط
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={goToPreviousStep}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          السابق
        </Button>
        <Button
          onClick={goToNextStep}
          disabled={!wizardData.estimatedConsumption || wizardData.estimatedConsumption <= 0}
        >
          التالي
          <ArrowRight className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>فاتورة الاستهلاك التقديري</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>العميل</Label>
              <Input value={wizardData.customerName} disabled className="mt-2" />
            </div>
            <div>
              <Label>رقم العداد</Label>
              <Input value={wizardData.meterNumber} disabled className="mt-2" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>الاستهلاك التقديري:</span>
              <span className="font-semibold">{wizardData.estimatedConsumption} كيلو</span>
            </div>
            <div className="flex justify-between">
              <span>سعر الكيلو:</span>
              <span className="font-semibold">0.18 ريال</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>المبلغ الإجمالي:</span>
              <span className="text-blue-600">
                {((wizardData.estimatedConsumption || 0) * 0.18).toFixed(2)} ريال
              </span>
            </div>
          </div>
          
          {wizardData.consumptionInvoiceId ? (
            <div className="bg-green-50 p-4 rounded-lg flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 ml-2" />
              <div>
                <p className="font-semibold text-green-700">تم إنشاء الفاتورة بنجاح</p>
                <p className="text-sm text-green-600">رقم الفاتورة: #{wizardData.consumptionInvoiceId}</p>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleCreateConsumptionInvoice}
              disabled={createConsumptionInvoice.isPending}
              className="w-full"
            >
              {createConsumptionInvoice.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <FileText className="ml-2 h-4 w-4" />
                  إنشاء فاتورة الاستهلاك
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={goToPreviousStep}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          السابق
        </Button>
        <Button
          onClick={goToNextStep}
          disabled={!wizardData.consumptionInvoiceId}
        >
          التالي
          <ArrowRight className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  const renderStep4 = () => {
    const meterPrices = {
      free: 0,
      half: 250,
      full: 500,
    };
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>تحديد تكلفة العداد البديل</CardTitle>
            <CardDescription>
              حدد من يتحمل تكلفة العداد البديل
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className={`cursor-pointer transition-all ${
                  wizardData.meterCostType === "free"
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setWizardData({ ...wizardData, meterCostType: "free", meterCost: 0 })}
              >
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-green-600">مجاني</div>
                  <p className="text-sm text-muted-foreground mt-2">تتحمل الشركة التكلفة</p>
                  <p className="text-2xl font-semibold mt-4">0 ريال</p>
                </CardContent>
              </Card>
              
              <Card
                className={`cursor-pointer transition-all ${
                  wizardData.meterCostType === "half"
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setWizardData({ ...wizardData, meterCostType: "half", meterCost: 250 })}
              >
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">50%</div>
                  <p className="text-sm text-muted-foreground mt-2">نصف التكلفة</p>
                  <p className="text-2xl font-semibold mt-4">250 ريال</p>
                </CardContent>
              </Card>
              
              <Card
                className={`cursor-pointer transition-all ${
                  wizardData.meterCostType === "full"
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setWizardData({ ...wizardData, meterCostType: "full", meterCost: 500 })}
              >
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-red-600">كامل</div>
                  <p className="text-sm text-muted-foreground mt-2">يتحمل العميل التكلفة</p>
                  <p className="text-2xl font-semibold mt-4">500 ريال</p>
                </CardContent>
              </Card>
            </div>
            
            {wizardData.meterCostType && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">التكلفة المحددة:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {wizardData.meterCost} ريال
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={goToPreviousStep}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            السابق
          </Button>
          <Button
            onClick={goToNextStep}
            disabled={!wizardData.meterCostType}
          >
            التالي
            <ArrowRight className="mr-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };
  
  const renderStep5 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>فاتورة تكلفة العداد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>نوع التكلفة:</span>
              <Badge>{wizardData.meterCostType === "free" ? "مجاني" : wizardData.meterCostType === "half" ? "50%" : "كامل"}</Badge>
            </div>
            <div className="flex justify-between">
              <span>تكلفة العداد:</span>
              <span className="font-semibold">{wizardData.meterCost} ريال</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>المبلغ الإجمالي:</span>
              <span className="text-blue-600">{wizardData.meterCost} ريال</span>
            </div>
          </div>
          
          {wizardData.meterInvoiceId ? (
            <div className="bg-green-50 p-4 rounded-lg flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 ml-2" />
              <div>
                <p className="font-semibold text-green-700">تم إنشاء الفاتورة بنجاح</p>
                <p className="text-sm text-green-600">رقم الفاتورة: #{wizardData.meterInvoiceId}</p>
              </div>
            </div>
          ) : wizardData.meterCost && wizardData.meterCost > 0 ? (
            <Button
              onClick={handleCreateMeterInvoice}
              disabled={createMeterInvoice.isPending}
              className="w-full"
            >
              {createMeterInvoice.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <FileText className="ml-2 h-4 w-4" />
                  إنشاء فاتورة العداد
                </>
              )}
            </Button>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-green-700 font-semibold">العداد مجاني - لا حاجة لفاتورة</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={goToPreviousStep}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          السابق
        </Button>
        <Button
          onClick={goToNextStep}
          disabled={wizardData.meterCost! > 0 && !wizardData.meterInvoiceId}
        >
          التالي
          <ArrowRight className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  const renderStep6 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إنشاء أمر العمل</CardTitle>
          <CardDescription>
            سيتم إنشاء أمر عمل لاستبدال العداد التالف
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold mb-2">ملخص العملية:</h4>
            <div className="flex justify-between text-sm">
              <span>العميل:</span>
              <span className="font-semibold">{wizardData.customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>العداد التالف:</span>
              <span className="font-semibold">{wizardData.meterNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>الاستهلاك التقديري:</span>
              <span className="font-semibold">{wizardData.estimatedConsumption} كيلو</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span>فاتورة الاستهلاك:</span>
              <span className="font-semibold">{wizardData.consumptionInvoiceAmount?.toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>فاتورة العداد:</span>
              <span className="font-semibold">{wizardData.meterInvoiceAmount?.toFixed(2) || 0} ريال</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>الإجمالي:</span>
              <span className="text-blue-600">
                {((wizardData.consumptionInvoiceAmount || 0) + (wizardData.meterInvoiceAmount || 0)).toFixed(2)} ريال
              </span>
            </div>
          </div>
          
          {wizardData.workOrderId ? (
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-bold text-green-700 mb-2">تمت العملية بنجاح!</h3>
              <p className="text-green-600 mb-4">تم إنشاء أمر العمل رقم #{wizardData.workOrderId}</p>
              <div className="space-y-2 text-sm">
                <p>✅ فاتورة الاستهلاك: #{wizardData.consumptionInvoiceId}</p>
                {wizardData.meterInvoiceId && <p>✅ فاتورة العداد: #{wizardData.meterInvoiceId}</p>}
                <p>✅ أمر العمل: #{wizardData.workOrderId}</p>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleCreateWorkOrder}
              disabled={createWorkOrder.isPending}
              className="w-full"
              size="lg"
            >
              {createWorkOrder.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Wrench className="ml-2 h-4 w-4" />
                  إنشاء أمر العمل وإكمال العملية
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={goToPreviousStep} disabled={!!wizardData.workOrderId}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          السابق
        </Button>
        {wizardData.workOrderId && (
          <Button onClick={() => window.location.href = "/dashboard/maintenance/work-orders"}>
            <Check className="ml-2 h-4 w-4" />
            إنهاء والذهاب لأوامر العمل
          </Button>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">معالج استبدال العداد التالف</h1>
        <p className="text-muted-foreground">
          اتبع الخطوات لإتمام عملية استبدال العداد بشكل تلقائي
        </p>
      </div>
      
      {/* Steps Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep === step.id
                      ? "bg-blue-600 text-white"
                      : currentStep > step.id
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <p className="text-xs mt-2 text-center max-w-[100px]">{step.title}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${
                  currentStep > step.id ? "bg-green-600" : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}
        </CardContent>
      </Card>
    </div>
  );
}

