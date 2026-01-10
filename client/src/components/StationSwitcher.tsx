// client/src/components/StationSwitcher.tsx
// مكون للتنقل بين المحطات

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StationSwitcherProps {
  currentStationId?: number;
  onStationChange?: (stationId: number) => void;
  businessId?: number;
  branchId?: number;
}

export default function StationSwitcher({
  currentStationId,
  onStationChange,
  businessId,
  branchId,
}: StationSwitcherProps) {
  const { toast } = useToast();
  const [selectedStationId, setSelectedStationId] = useState<number | undefined>(currentStationId);

  // جلب المحطات
  const { data: stations, isLoading } = trpc.station.list.useQuery({
    businessId,
    branchId,
  });

  const handleStationChange = (stationId: string) => {
    const id = parseInt(stationId);
    setSelectedStationId(id);
    
    // حفظ اختيار المحطة في localStorage
    localStorage.setItem("selectedStationId", id.toString());
    
    // استدعاء callback
    if (onStationChange) {
      onStationChange(id);
    }

    toast.success("تم تغيير المحطة بنجاح");
  };

  // جلب المحطة المختارة من localStorage عند التحميل
  useEffect(() => {
    if (!selectedStationId && !currentStationId) {
      const savedStationId = localStorage.getItem("selectedStationId");
      if (savedStationId) {
        const id = parseInt(savedStationId);
        setSelectedStationId(id);
        if (onStationChange) {
          onStationChange(id);
        }
      }
    }
  }, []);

  const currentStation = stations?.find((s: any) => s.id === (selectedStationId || currentStationId));

  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-4 h-4 text-muted-foreground" />
      <Select
        value={(selectedStationId || currentStationId)?.toString() || ""}
        onValueChange={handleStationChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[250px]">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري التحميل...</span>
            </div>
          ) : currentStation ? (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{currentStation.nameAr || currentStation.nameEn}</span>
            </div>
          ) : (
            <SelectValue placeholder="اختر المحطة" />
          )}
        </SelectTrigger>
        <SelectContent>
          {stations?.map((station: any) => (
            <SelectItem key={station.id} value={station.id.toString()}>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <div>
                  <div className="font-medium">{station.nameAr || station.nameEn}</div>
                  {station.code && (
                    <div className="text-xs text-muted-foreground">كود: {station.code}</div>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

