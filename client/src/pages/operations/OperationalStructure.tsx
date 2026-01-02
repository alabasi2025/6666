import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Radio, Zap, Sun, GitBranch, Package, Wrench, Activity,
  ChevronLeft, Settings, Eye, Plus, Battery, Gauge, Building2, Network
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

// أنواع المحطات
const stationTypes = [
  { value: "generation_distribution", label: "توليد وتوزيع", icon: Zap, color: "bg-blue-500" },
  { value: "generation", label: "توليد", icon: Building2, color: "bg-green-500" },
  { value: "distribution", label: "توزيع", icon: Network, color: "bg-purple-500" },
  { value: "solar", label: "طاقة شمسية", icon: Sun, color: "bg-yellow-500" },
];

// أيقونات الأصول حسب التصنيف
const assetIcons: Record<string, any> = {
  "المولدات": Radio,
  "لوحات التوزيع": GitBranch,
  "خزانات الوقود": Gauge,
  "الألواح الشمسية": Sun,
  "الانفرترات": Zap,
  "البطاريات": Battery,
};

export default function OperationalStructure() {
  const [stations, setStations] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات باستخدام API الصحيح
  const stationsQuery = trpc.station.list.useQuery({}, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const assetsQuery = trpc.asset.list.useQuery({ businessId: 1 }, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (stationsQuery.data) setStations(stationsQuery.data);
    if (assetsQuery.data) setAssets(assetsQuery.data);
    // إيقاف التحميل عند اكتمال الاستعلامات أو حدوث خطأ
    if (!stationsQuery.isLoading || stationsQuery.isError) {
      if (!assetsQuery.isLoading || assetsQuery.isError) {
        setLoading(false);
      }
    }
  }, [stationsQuery.data, assetsQuery.data, stationsQuery.isLoading, assetsQuery.isLoading, stationsQuery.isError, assetsQuery.isError]);

  // تجميع المحطات حسب النوع
  const groupedStations = stationTypes.map(type => ({
    ...type,
    stations: stations.filter(s => s.type === type.value)
  }));

  // الحصول على أصول محطة معينة
  const getStationAssets = (stationId: number) => {
    return assets.filter(a => a.stationId === stationId);
  };

  // تجميع الأصول حسب التصنيف
  const groupAssetsByCategory = (stationAssets: any[]) => {
    const grouped: Record<string, any[]> = {};
    stationAssets.forEach(asset => {
      const catName = asset.categoryName || "غير محدد";
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(asset);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المخطط التشغيلي</h1>
          <p className="text-muted-foreground">هيكل المحطات والأصول التشغيلية</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/operations/network">
            <Button variant="outline">
              <GitBranch className="h-4 w-4 ml-2" />
              شبكة التوزيع
            </Button>
          </Link>
          <Link href="/dashboard/operations/misc">
            <Button variant="outline">
              <Package className="h-4 w-4 ml-2" />
              الأصول المتنوعة
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stationTypes.map(type => (
          <Card key={type.value}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${type.color} bg-opacity-20 rounded-lg`}>
                  <type.icon className={`h-5 w-5 ${type.color.replace('bg-', 'text-')}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{type.label}</p>
                  <p className="text-xl font-bold">
                    {stations.filter(s => s.type === type.value).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Operational Structure Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            هيكل المحطات التشغيلي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-4" defaultValue={["generation_distribution", "generation", "distribution", "solar"]}>
            {groupedStations.map(group => (
              <AccordionItem key={group.value} value={group.value} className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${group.color} bg-opacity-20 rounded-lg`}>
                      <group.icon className={`h-5 w-5 ${group.color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="font-semibold">{group.label}</span>
                    <Badge variant="secondary">{group.stations.length} محطة</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {group.stations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">لا توجد محطات</p>
                  ) : (
                    <div className="space-y-3 mr-8">
                      {group.stations.map(station => {
                        const stationAssets = getStationAssets(station.id);
                        const groupedAssets = groupAssetsByCategory(stationAssets);
                        
                        return (
                          <Accordion key={station.id} type="single" collapsible>
                            <AccordionItem value={`station-${station.id}`} className="border rounded-lg bg-slate-50 dark:bg-slate-900">
                              <AccordionTrigger className="px-4 hover:no-underline">
                                <div className="flex items-center justify-between w-full ml-4">
                                  <div className="flex items-center gap-2">
                                    <Radio className="h-4 w-4 text-muted-foreground" />
                                    <span>{station.nameAr || station.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {stationAssets.length} أصل
                                    </Badge>
                                  </div>
                                  <Badge variant={station.status === "operational" ? "default" : "secondary"}>
                                    {station.status === "operational" ? "تعمل" : station.status}
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                {stationAssets.length === 0 ? (
                                  <p className="text-muted-foreground text-center py-2">لا توجد أصول</p>
                                ) : (
                                  <div className="space-y-3 mr-6">
                                    {Object.entries(groupedAssets).map(([catName, catAssets]) => {
                                      const AssetIcon = assetIcons[catName] || Package;
                                      return (
                                        <div key={catName} className="border rounded-lg p-3 bg-white dark:bg-slate-800">
                                          <div className="flex items-center gap-2 mb-2">
                                            <AssetIcon className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{catName}</span>
                                            <Badge variant="outline" className="text-xs">
                                              {catAssets.length}
                                            </Badge>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mr-6">
                                            {catAssets.map(asset => (
                                              <div 
                                                key={asset.id} 
                                                className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded border"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div className={`w-2 h-2 rounded-full ${
                                                    asset.status === "active" ? "bg-green-500" : "bg-gray-400"
                                                  }`} />
                                                  <span className="text-sm">{asset.nameAr || asset.name}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                  {asset.code}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-4 pt-3 border-t">
                                  <Button variant="outline" size="sm">
                                    <Plus className="h-3 w-3 ml-1" />
                                    إضافة أصل
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Wrench className="h-3 w-3 ml-1" />
                                    طلب صيانة
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Activity className="h-3 w-3 ml-1" />
                                    سجل العمليات
                                  </Button>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        );
                      })}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/dashboard/assets/list">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">إدارة الأصول</h3>
                  <p className="text-sm text-muted-foreground">عرض وإدارة جميع الأصول</p>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground mr-auto" />
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/dashboard/maintenance/work-orders">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Wrench className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold">الصيانة</h3>
                  <p className="text-sm text-muted-foreground">طلبات وجدول الصيانة</p>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground mr-auto" />
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/dashboard/scada/monitoring">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">المراقبة والتحكم</h3>
                  <p className="text-sm text-muted-foreground">متابعة الإنتاج والاستهلاك</p>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground mr-auto" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
