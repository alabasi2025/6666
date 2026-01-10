import { useState } from "react";
import MeterLocationMap from "@/components/maps/MeterLocationMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function MetersMap() {
  const [selectedMeter, setSelectedMeter] = useState<any>(null);

  // افتراض businessId = 1 (يجب تحديثه من السياق أو المستخدم)
  const businessId = 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            خريطة العدادات
          </h1>
          <p className="text-muted-foreground">
            عرض وإدارة مواقع العدادات على الخريطة
          </p>
        </div>
      </div>

      <MeterLocationMap
        businessId={businessId}
        onMeterSelect={(meter) => setSelectedMeter(meter)}
      />
    </div>
  );
}

