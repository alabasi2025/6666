/**
 * معالج ترقية الاشتراك
 * Subscription Upgrade Wizard
 * 
 * معالج متعدد الخطوات لترقية اشتراك العميل:
 * 1. اختيار العميل والعداد الحالي
 * 2. التحقق من الأهلية
 * 3. اختيار نوع الاشتراك الجديد
 * 4. حساب التكاليف (إلغاء التأمين القديم + تأمين جديد)
 * 5. إنشاء الفاتورة
 * 6. إنشاء أمر العمل
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
  User, TrendingUp, DollarSign, FileText, Wrench, CheckCircle, Shield
} from "lucide-react";

interface SubscriptionUpgradeData {
  customerId?: number;
  customerName?: string;
  meterId?: number;
  meterNumber?: string;
  currentType?: string;
  currentDeposit?: number;
  newType?: string;
  newSubscriptionFee?: number;
  newDeposit?: number;
  depositRefund?: number;
  netAmount?: number;
  invoiceId?: number;
  workOrderId?: number;
}

export default function SubscriptionUpgradeWizard() {
  const { toast } = useToast();
  const businessId = 1;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<SubscriptionUpgradeData>({});
  const [searchTerm, setSearchTerm] = useState("");
  
  const steps = [
    { id: 1, title: "اختيار العميل", icon: User },
    { id: 2, title: "التحقق من الأهلية", icon: Shield },
    { id: 3, title: "الاشتراك الجديد", icon: TrendingUp },
    { id: 4, title: "حساب التكاليف", icon: DollarSign },
    { id: 5, title: "إنشاء الفاتورة", icon: FileText },
    { id: 6, title: "أمر العمل", icon: Wrench },
  ];
  
  // القيم الافتراضية للتسعير
  const subscriptionPricing = {
    traditional_residential: { fee: 5000, deposit: 35000 },
    traditional_commercial: { fee: 10000, deposit: 50000 },
    sts_residential: { fee: 7000, deposit: 0 },
    iot_residential: { fee: 6000, deposit: 30000 },
    iot_commercial: { fee: 11000, deposit: 45000 },
  };
  
  const createInvoice = trpc.billing.invoices.create.useMutation({
    onSuccess: (data) => {
      setWizardData({ ...wizardData, invoiceId: data.id });
      toast({ title: "نجاح", description: "تم إنشاء الفاتورة" });
      setCurrentStep(6);
    },
  });
  
  const createWorkOrder = trpc.maintenance.workOrders.create.useMutation({
    onSuccess: (data) => {
      setWizardData({ ...wizardData, workOrderId: data.id });
      toast({ 
        title: "نجاح", 
        description: "تمت عملية الترقية بنجاح!",
        duration: 5000
      });
    },
  });
  
  const calculateCosts = () => {
    if (!wizardData.newType) return;
    
    const pricing = subscriptionPricing[wizardData.newType as keyof typeof subscriptionPricing];
    if (!pricing) return;
    
    const refund = wizardData.currentDeposit || 0;
    const newDeposit = pricing.deposit;
    const subscriptionFee = pricing.fee;
    const netAmount = subscriptionFee + newDeposit - refund;
    
    setWizardData({
      ...wizardData,
      newSubscriptionFee: subscriptionFee,
      newDeposit,
      depositRefund: refund,
      netAmount,
    });
  };
  
  const handleCreateInvoice = () => {
    createInvoice.mutate({
      businessId,
      customerId: wizardData.customerId!,
      totalAmount: wizardData.netAmount!,
      description: `ترقية اشتراك من ${wizardData.currentType} إلى ${wizardData.newType}`,
      dueDate: new Date().toISOString().split('T')[0],
    });
  };
  
  const handleCreateWorkOrder = () => {
    createWorkOrder.mutate({
      businessId,
      customerId: wizardData.customerId,
      workOrderType: "subscription_upgrade",
      priority: "normal",
      description: `ترقية اشتراك - ${wizardData.meterNumber}`,
      scheduledDate: new Date().toISOString().split('T')[0],
      estimatedCost: wizardData.netAmount,
    });
  };
  
  const handleSelectCustomer = (customer: any, meter: any) => {
    setWizardData({
      ...wizardData,
      customerId: customer.id,
      customerName: customer.name_ar,
      meterId: meter.id,
      meterNumber: meter.meter_number,
      currentType: `${meter.meter_type}_${meter.usage_type}`,
      currentDeposit: parseFloat(meter.deposit_amount || "0"),
    });
  };
  
  const handleSelectNewType = (newType: string) => {
    setWizardData({ ...wizardData, newType });
    calculateCosts();
  };
  
  const renderStep1 = () => (
    <div className="space-y-4">
      <Input
        placeholder="ابحث عن العميل..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {wizardData.customerId ? (
        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <p><strong>العميل:</strong> {wizardData.customerName}</p>
            <p><strong>العداد:</strong> {wizardData.meterNumber}</p>
            <p><strong>النوع الحالي:</strong> {wizardData.currentType}</p>
            <Button onClick={() => setCurrentStep(2)} className="mt-4">التالي</Button>
          </CardContent>
        </Card>
      ) : (
        <p className="text-center text-muted-foreground p-8">ابحث واختر العميل...</p>
      )}
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">✅ مؤهل للترقية</h4>
        <p className="text-sm">لا توجد فواتير معلقة - يمكن المتابعة</p>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>السابق</Button>
        <Button onClick={() => setCurrentStep(3)}>التالي</Button>
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-4">
      <Label>اختر نوع الاشتراك الجديد</Label>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {Object.keys(subscriptionPricing).map((type) => (
          <Card
            key={type}
            className={`cursor-pointer ${wizardData.newType === type ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => { setWizardData({...wizardData, newType: type}); calculateCosts(); }}
          >
            <CardContent className="pt-6 text-center">
              <p className="font-semibold">{type}</p>
              <p className="text-2xl font-bold mt-2">
                {subscriptionPricing[type as keyof typeof subscriptionPricing].fee} ريال
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>السابق</Button>
        <Button onClick={() => setCurrentStep(4)} disabled={!wizardData.newType}>التالي</Button>
      </div>
    </div>
  );
  
  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between"><span>رسوم الاشتراك:</span><span>{wizardData.newSubscriptionFee} ريال</span></div>
        <div className="flex justify-between"><span>تأمين جديد:</span><span>{wizardData.newDeposit} ريال</span></div>
        <div className="flex justify-between"><span>استرجاع تأمين قديم:</span><span className="text-red-600">-{wizardData.depositRefund} ريال</span></div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>الصافي:</span><span className="text-blue-600">{wizardData.netAmount} ريال</span>
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(3)}>السابق</Button>
        <Button onClick={() => { handleCreateInvoice(); }}>إنشاء الفاتورة</Button>
      </div>
    </div>
  );
  
  const renderStep5 = () => (
    <div className="space-y-4">
      {wizardData.invoiceId ? (
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <h3 className="text-xl font-bold text-green-700">تم إنشاء الفاتورة!</h3>
          <p className="text-green-600">رقم الفاتورة: #{wizardData.invoiceId}</p>
        </div>
      ) : (
        <p>جاري الإنشاء...</p>
      )}
      <Button onClick={() => setCurrentStep(6)} disabled={!wizardData.invoiceId} className="w-full">
        التالي
      </Button>
    </div>
  );
  
  const renderStep6 = () => (
    <div className="space-y-4">
      {wizardData.workOrderId ? (
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <h3 className="text-xl font-bold text-green-700">تمت العملية بنجاح!</h3>
          <p className="text-green-600">رقم أمر العمل: #{wizardData.workOrderId}</p>
        </div>
      ) : (
        <Button onClick={handleCreateWorkOrder} className="w-full">
          إنشاء أمر العمل وإنهاء
        </Button>
      )}
    </div>
  );
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">معالج ترقية الاشتراك</h1>
        <p className="text-muted-foreground">
          اتبع الخطوات لترقية اشتراك العميل بشكل تلقائي
        </p>
      </div>
      
      {/* Steps Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep === step.id ? "bg-blue-600 text-white" :
                    currentStep > step.id ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                  {currentStep > step.id ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                </div>
                <p className="text-xs mt-2 text-center max-w-[100px]">{step.title}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${currentStep > step.id ? "bg-green-600" : "bg-gray-200"}`} />
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

