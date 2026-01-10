import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Search, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function PrepaidCodesManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ amount: "", count: "10", expiryDays: "30" });
  const [page, setPage] = useState(1);

  const { data, refetch } = trpc.customerSystem.getPrepaidCodes.useQuery({ businessId: 1, page, limit: 20 });
  const generateMutation = trpc.customerSystem.generatePrepaidCodes.useMutation({
    onSuccess: () => { setIsDialogOpen(false); refetch(); },
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">أكواد الشحن المسبق</h1>
          <p className="text-muted-foreground mt-1">إدارة أكواد الشحن المسبق</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إنشاء أكواد
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>قائمة الأكواد</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الكود</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((code: any) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono">{code.code}</TableCell>
                  <TableCell>{code.amount} ر.س</TableCell>
                  <TableCell>
                    <Badge variant={code.status === "active" ? "default" : "secondary"}>
                      {code.status === "active" ? "نشط" : code.status === "used" ? "مستخدم" : code.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(code.createdAt), "yyyy/MM/dd", { locale: ar })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>إنشاء أكواد شحن</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>المبلغ (ر.س)</Label>
              <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>العدد</Label>
              <Input type="number" value={formData.count} onChange={(e) => setFormData({ ...formData, count: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>مدة الصلاحية (أيام)</Label>
              <Input type="number" value={formData.expiryDays} onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
            <Button onClick={() => generateMutation.mutate({ 
              businessId: 1, 
              amount: parseFloat(formData.amount), 
              count: parseInt(formData.count), 
              expiryDays: parseInt(formData.expiryDays) 
            })}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

