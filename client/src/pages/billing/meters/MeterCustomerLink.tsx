import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Link, User, Gauge, Check, X, AlertCircle } from "lucide-react";

export default function MeterCustomerLink() {
  const [activeTab, setActiveTab] = useState("by-meter");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMeter, setSelectedMeter] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [linkData, setLinkData] = useState({
    installationDate: new Date().toISOString().split("T")[0],
    initialReading: "0",
    tariffId: "",
  });

  // استعلامات البيانات
  const metersQuery = trpc.customerSystem.getMeters.useQuery({ page: 1, limit: 100 });
  const customersQuery = trpc.customerSystem.getCustomers.useQuery({ page: 1, limit: 100 });
  const tariffsQuery = trpc.customerSystem.getTariffs.useQuery({});
  
  // استعلامات الربط
  const availableMetersQuery = trpc.customerSystem.getAvailableMetersForCustomer.useQuery(
    { customerId: selectedCustomer?.id || 0 },
    { enabled: !!selectedCustomer && activeTab === "by-customer" }
  );
  
  const availableCustomersQuery = trpc.customerSystem.getAvailableCustomersForMeter.useQuery(
    { meterId: selectedMeter?.id || 0 },
    { enabled: !!selectedMeter && activeTab === "by-meter" }
  );

  const linkMutation = trpc.customerSystem.linkMeterToCustomer.useMutation();

  // ربط العداد بالعميل
  const handleLink = async () => {
    if (!selectedMeter || !selectedCustomer) {
      alert("يرجى اختيار العداد والعميل");
      return;
    }

    setLoading(true);
    try {
      await linkMutation.mutateAsync({
        meterId: selectedMeter.id,
        customerId: selectedCustomer.id,
      });
      
      // إعادة تحميل البيانات
      metersQuery.refetch();
      customersQuery.refetch();
      
      // إعادة تعيين النموذج
      setSelectedMeter(null);
      setSelectedCustomer(null);
      setLinkData({
        installationDate: new Date().toISOString().split("T")[0],
        initialReading: "0",
        tariffId: "",
      });
      
      alert("تم ربط العداد بالعميل بنجاح");
    } catch (error) {
      console.error("Error linking meter:", error);
      alert("حدث خطأ أثناء ربط العداد");
    } finally {
      setLoading(false);
    }
  };

  // تصفية العدادات غير المربوطة
  const unlinkedMeters = (metersQuery.data?.data || []).filter(
    (m: any) => !m.customerId
  );

  // تصفية العملاء
  const filteredCustomers = (customersQuery.data?.data || []).filter(
    (c: any) =>
      c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMeters = unlinkedMeters.filter(
    (m: any) =>
      m.meterNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link className="h-6 w-6" />
            ربط العدادات بالعملاء
          </h1>
          <p className="text-muted-foreground">
            ربط العدادات غير المربوطة مع العملاء المسجلين
          </p>
        </div>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Gauge className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{unlinkedMeters.length}</div>
                <p className="text-sm text-muted-foreground">عدادات غير مربوطة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {customersQuery.data?.total || 0}
                </div>
                <p className="text-sm text-muted-foreground">العملاء المسجلين</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {(metersQuery.data?.data || []).filter((m: any) => m.customerId).length}
                </div>
                <p className="text-sm text-muted-foreground">عدادات مربوطة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="by-meter">اختيار العداد أولاً</TabsTrigger>
          <TabsTrigger value="by-customer">اختيار العميل أولاً</TabsTrigger>
        </TabsList>

        {/* اختيار العداد أولاً */}
        <TabsContent value="by-meter" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* قائمة العدادات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    العدادات غير المربوطة
                  </span>
                  <Badge variant="secondary">{filteredMeters.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-9"
                    />
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {metersQuery.isLoading ? (
                      <p className="text-center py-8">جاري التحميل...</p>
                    ) : filteredMeters.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        لا توجد عدادات غير مربوطة
                      </p>
                    ) : (
                      filteredMeters.map((meter: any) => (
                        <div
                          key={meter.id}
                          onClick={() => setSelectedMeter(meter)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedMeter?.id === meter.id
                              ? "bg-primary/10 border-primary"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{meter.meterNumber}</p>
                              {meter.serialNumber && (
                                <p className="text-xs text-muted-foreground">
                                  {meter.serialNumber}
                                </p>
                              )}
                            </div>
                            {selectedMeter?.id === meter.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* قائمة العملاء المتاحين */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  العملاء المتاحين
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedMeter ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mb-4" />
                    <p>اختر عداداً أولاً لعرض العملاء المتاحين</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {availableCustomersQuery.isLoading ? (
                      <p className="text-center py-8">جاري التحميل...</p>
                    ) : availableCustomersQuery.data?.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        لا يوجد عملاء متاحين
                      </p>
                    ) : (
                      availableCustomersQuery.data?.map((customer: any) => (
                        <div
                          key={customer.id}
                          onClick={() => setSelectedCustomer(customer)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedCustomer?.id === customer.id
                              ? "bg-primary/10 border-primary"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{customer.fullName}</p>
                              <p className="text-xs text-muted-foreground">
                                {customer.accountNumber}
                              </p>
                            </div>
                            {selectedCustomer?.id === customer.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* اختيار العميل أولاً */}
        <TabsContent value="by-customer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* قائمة العملاء */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    العملاء
                  </span>
                  <Badge variant="secondary">
                    {customersQuery.data?.total || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-9"
                    />
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {customersQuery.isLoading ? (
                      <p className="text-center py-8">جاري التحميل...</p>
                    ) : filteredCustomers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        لا يوجد عملاء
                      </p>
                    ) : (
                      filteredCustomers.map((customer: any) => (
                        <div
                          key={customer.id}
                          onClick={() => setSelectedCustomer(customer)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedCustomer?.id === customer.id
                              ? "bg-primary/10 border-primary"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{customer.fullName}</p>
                              <p className="text-xs text-muted-foreground">
                                {customer.accountNumber}
                              </p>
                            </div>
                            {selectedCustomer?.id === customer.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* قائمة العدادات المتاحة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  العدادات المتاحة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedCustomer ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mb-4" />
                    <p>اختر عميلاً أولاً لعرض العدادات المتاحة</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {availableMetersQuery.isLoading ? (
                      <p className="text-center py-8">جاري التحميل...</p>
                    ) : availableMetersQuery.data?.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        لا توجد عدادات متاحة
                      </p>
                    ) : (
                      availableMetersQuery.data?.map((meter: any) => (
                        <div
                          key={meter.id}
                          onClick={() => setSelectedMeter(meter)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedMeter?.id === meter.id
                              ? "bg-primary/10 border-primary"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{meter.meterNumber}</p>
                              {meter.serialNumber && (
                                <p className="text-xs text-muted-foreground">
                                  {meter.serialNumber}
                                </p>
                              )}
                            </div>
                            {selectedMeter?.id === meter.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* بطاقة تأكيد الربط */}
      {selectedMeter && selectedCustomer && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              تأكيد الربط
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-muted-foreground">العداد</Label>
                <p className="font-semibold">{selectedMeter.meterNumber}</p>
                {selectedMeter.serialNumber && (
                  <p className="text-xs text-muted-foreground">
                    {selectedMeter.serialNumber}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">العميل</Label>
                <p className="font-semibold">{selectedCustomer.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedCustomer.accountNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>تاريخ التركيب</Label>
                <Input
                  type="date"
                  value={linkData.installationDate}
                  onChange={(e) =>
                    setLinkData({ ...linkData, installationDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>القراءة الافتتاحية</Label>
                <Input
                  type="number"
                  value={linkData.initialReading}
                  onChange={(e) =>
                    setLinkData({ ...linkData, initialReading: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>التعرفة</Label>
                <Select
                  value={linkData.tariffId}
                  onValueChange={(v) => setLinkData({ ...linkData, tariffId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التعرفة" />
                  </SelectTrigger>
                  <SelectContent>
                    {tariffsQuery.data?.data?.map((tariff: any) => (
                      <SelectItem key={tariff.id} value={tariff.id.toString()}>
                        {tariff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedMeter(null);
                  setSelectedCustomer(null);
                }}
              >
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              <Button onClick={handleLink} disabled={loading}>
                <Check className="h-4 w-4 ml-2" />
                {loading ? "جاري الربط..." : "تأكيد الربط"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

