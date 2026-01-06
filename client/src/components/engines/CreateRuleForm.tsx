import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateRuleFormProps {
  onSubmit: (data: any) => void;
}

export default function CreateRuleForm({ onSubmit }: CreateRuleFormProps) {
  const [formData, setFormData] = useState({
    meterType: "sts",
    usageType: "residential",
    subscriptionFee: "",
    depositAmount: "",
    depositRequired: false,
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      meterType: formData.meterType,
      usageType: formData.usageType,
      subscriptionFee: parseFloat(formData.subscriptionFee),
      depositAmount: parseFloat(formData.depositAmount) || 0,
      depositRequired: formData.depositRequired,
      notes: formData.notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>نوع العداد</Label>
          <Select
            value={formData.meterType}
            onValueChange={(v: any) => setFormData({ ...formData, meterType: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="traditional">تقليدي</SelectItem>
              <SelectItem value="sts">STS</SelectItem>
              <SelectItem value="iot">IoT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>نوع الاستخدام</Label>
          <Select
            value={formData.usageType}
            onValueChange={(v: any) => setFormData({ ...formData, usageType: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">سكني</SelectItem>
              <SelectItem value="commercial">تجاري</SelectItem>
              <SelectItem value="industrial">صناعي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>رسوم الاشتراك (ريال)</Label>
          <Input
            type="number"
            value={formData.subscriptionFee}
            onChange={(e) => setFormData({ ...formData, subscriptionFee: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>مبلغ التأمين (ريال)</Label>
          <Input
            type="number"
            value={formData.depositAmount}
            onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="depositRequired"
          checked={formData.depositRequired}
          onChange={(e) => setFormData({ ...formData, depositRequired: e.target.checked })}
        />
        <Label htmlFor="depositRequired">التأمين مطلوب</Label>
      </div>
      <div>
        <Label>ملاحظات</Label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      <Button type="submit" className="w-full">
        إنشاء قاعدة التسعير
      </Button>
    </form>
  );
}


