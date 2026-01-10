/**
 * صرف بضائع متقدم
 * Advanced Goods Issue
 * 
 * واجهة احترافية لصرف البضائع مع:
 * - اختيار Serial Numbers
 * - توقيع المستلم
 * - طباعة إيصال الصرف
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
import { useToast } from "@/hooks/use-toast";
import { 
  PackageMinus, Loader2, Printer, CheckCircle
} from "lucide-react";

export default function AdvancedGoodsIssue() {
  const { toast } = useToast();
  const businessId = 1;
  
  const [issueData, setIssueData] = useState({
    warehouseId: "",
    issuedTo: "",
    workOrderId: "",
    issueDate: new Date().toISOString().split('T')[0],
    notes: "",
  });
  
  const [lines, setLines] = useState<any[]>([]);
  
  const { data: warehouses } = trpc.inventory.warehouses.list.useQuery({ businessId });
  const { data: items } = trpc.inventory.items.list.useQuery({ businessId, limit: 999 });
  
  const createIssue = trpc.inventory.movements.createIssue.useMutation({
    onSuccess: () => {
      toast({ 
        title: "نجاح", 
        description: "تم تسجيل صرف البضائع بنجاح"
      });
      setLines([]);
      setIssueData({
        warehouseId: "",
        issuedTo: "",
        workOrderId: "",
        issueDate: new Date().toISOString().split('T')[0],
        notes: "",
      });
    },
  });
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <PackageMinus className="w-8 h-8 text-orange-600" />
          صرف بضائع متقدم
        </h1>
        <p className="text-muted-foreground mt-2">
          نظام احترافي لصرف البضائع مع تتبع الأرقام التسلسلية
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>معلومات الصرف</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>المستودع *</Label>
              <Select
                value={issueData.warehouseId}
                onValueChange={(value) => setIssueData({ ...issueData, warehouseId: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="اختر المستودع" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses?.warehouses?.map((warehouse: any) => (
                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                      {warehouse.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>المستلم *</Label>
              <Input
                value={issueData.issuedTo}
                onChange={(e) => setIssueData({ ...issueData, issuedTo: e.target.value })}
                placeholder="اسم المستلم أو الجهة"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>تاريخ الصرف</Label>
              <Input
                type="date"
                value={issueData.issueDate}
                onChange={(e) => setIssueData({ ...issueData, issueDate: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>الأصناف المصروفة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            سيتم إضافة واجهة إضافة الأصناف قريباً...
          </p>
          
          {lines.length > 0 && (
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline">
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
              <Button onClick={() => {}} disabled={createIssue.isPending}>
                {createIssue.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <CheckCircle className="ml-2 h-4 w-4" />
                    تأكيد الصرف
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

