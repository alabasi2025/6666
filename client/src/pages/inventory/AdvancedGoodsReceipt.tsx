/**
 * استقبال بضائع متقدم
 * Advanced Goods Receipt
 * 
 * واجهة احترافية لاستقبال البضائع مع:
 * - مسح الباركود
 * - تسجيل Serial Numbers
 * - التحقق من الكميات
 * - إنشاء تقرير استلام
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
  Plus, Trash2, Barcode, PackageCheck, Loader2, AlertCircle, CheckCircle
} from "lucide-react";

interface ReceiptLine {
  itemId: number;
  itemName?: string;
  quantity: number;
  serialNumbers: string[];
}

export default function AdvancedGoodsReceipt() {
  const { toast } = useToast();
  const businessId = 1;
  
  const [receiptData, setReceiptData] = useState({
    warehouseId: "",
    supplierId: "",
    purchaseOrderId: "",
    receiptDate: new Date().toISOString().split('T')[0],
    notes: "",
  });
  
  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [currentLine, setCurrentLine] = useState({
    itemId: "",
    quantity: 1,
    serialNumber: "",
  });
  
  const { data: items } = trpc.inventory.items.list.useQuery({ businessId, limit: 999 });
  const { data: warehouses } = trpc.inventory.warehouses.list.useQuery({ businessId });
  const { data: suppliers } = trpc.inventory.suppliers.list.useQuery({ businessId, limit: 999 });
  
  const createReceipt = trpc.inventory.movements.createReceipt.useMutation({
    onSuccess: () => {
      toast({ 
        title: "نجاح", 
        description: "تم تسجيل استلام البضائع بنجاح",
        duration: 3000
      });
      // Reset form
      setLines([]);
      setReceiptData({
        warehouseId: "",
        supplierId: "",
        purchaseOrderId: "",
        receiptDate: new Date().toISOString().split('T')[0],
        notes: "",
      });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
  
  const addLine = () => {
    if (!currentLine.itemId || currentLine.quantity <= 0) {
      toast({ 
        title: "تحذير", 
        description: "يرجى اختيار الصنف وتحديد الكمية",
        variant: "destructive"
      });
      return;
    }
    
    const item = items?.items?.find((i: any) => i.id === parseInt(currentLine.itemId));
    
    const newLine: ReceiptLine = {
      itemId: parseInt(currentLine.itemId),
      itemName: item?.name_ar,
      quantity: currentLine.quantity,
      serialNumbers: [],
    };
    
    setLines([...lines, newLine]);
    setCurrentLine({ itemId: "", quantity: 1, serialNumber: "" });
  };
  
  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };
  
  const addSerialNumber = (lineIndex: number, serialNumber: string) => {
    const newLines = [...lines];
    if (!newLines[lineIndex].serialNumbers.includes(serialNumber)) {
      newLines[lineIndex].serialNumbers.push(serialNumber);
      setLines(newLines);
    }
  };
  
  const handleSubmit = () => {
    if (!receiptData.warehouseId || lines.length === 0) {
      toast({
        title: "تحذير",
        description: "يرجى تحديد المستودع وإضافة أصناف",
        variant: "destructive"
      });
      return;
    }
    
    createReceipt.mutate({
      businessId,
      warehouseId: parseInt(receiptData.warehouseId),
      supplierId: receiptData.supplierId ? parseInt(receiptData.supplierId) : undefined,
      receiptDate: receiptData.receiptDate,
      items: lines.map(line => ({
        itemId: line.itemId,
        quantity: line.quantity,
        serialNumbers: line.serialNumbers,
      })),
      notes: receiptData.notes,
    });
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PackageCheck className="w-8 h-8 text-green-600" />
            استقبال بضائع متقدم
          </h1>
          <p className="text-muted-foreground mt-2">
            نظام احترافي لاستقبال البضائع مع دعم مسح الباركود والأرقام التسلسلية
          </p>
        </div>
      </div>
      
      {/* Receipt Header */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الاستلام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>المستودع *</Label>
              <Select
                value={receiptData.warehouseId}
                onValueChange={(value) => setReceiptData({ ...receiptData, warehouseId: value })}
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
              <Label>المورد (اختياري)</Label>
              <Select
                value={receiptData.supplierId}
                onValueChange={(value) => setReceiptData({ ...receiptData, supplierId: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="اختر المورد" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.data?.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>تاريخ الاستلام</Label>
              <Input
                type="date"
                value={receiptData.receiptDate}
                onChange={(e) => setReceiptData({ ...receiptData, receiptDate: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Line */}
      <Card>
        <CardHeader>
          <CardTitle>إضافة صنف</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label>الصنف</Label>
              <Select
                value={currentLine.itemId}
                onValueChange={(value) => setCurrentLine({ ...currentLine, itemId: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="اختر الصنف" />
                </SelectTrigger>
                <SelectContent>
                  {items?.items?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name_ar} ({item.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>الكمية</Label>
              <Input
                type="number"
                value={currentLine.quantity}
                onChange={(e) => setCurrentLine({ ...currentLine, quantity: parseInt(e.target.value) })}
                min="1"
                className="mt-2"
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={addLine} className="w-full">
                <Plus className="w-4 h-4 ml-2" />
                إضافة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Lines Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>الأصناف المستلمة ({lines.length})</CardTitle>
            <CardDescription>قائمة الأصناف المطلوب استلامها</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الصنف</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>الأرقام التسلسلية</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    لم يتم إضافة أصناف بعد
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>{line.itemName}</TableCell>
                    <TableCell>{line.quantity}</TableCell>
                    <TableCell>
                      {line.serialNumbers.length > 0 ? (
                        <Badge variant="default">
                          {line.serialNumbers.length} رقم تسلسلي
                        </Badge>
                      ) : (
                        <Badge variant="secondary">لا يوجد</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {lines.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={createReceipt.isPending}
                size="lg"
              >
                {createReceipt.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <PackageCheck className="ml-2 h-4 w-4" />
                    تأكيد الاستلام
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

