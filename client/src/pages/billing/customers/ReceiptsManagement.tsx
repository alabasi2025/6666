import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Receipt, Printer } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function ReceiptsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const { data, refetch } = trpc.customerSystem.getReceipts.useQuery({
    businessId: 1,
    page,
    limit: 20,
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الإيصالات</h1>
          <p className="text-muted-foreground mt-1">عرض وطباعة إيصالات المدفوعات</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الإيصالات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="ابحث عن إيصال..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الإيصال</TableHead>
                <TableHead className="text-right">رقم المدفوعة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((receipt: any) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-mono">{receipt.receiptNumber}</TableCell>
                  <TableCell>{receipt.paymentId}</TableCell>
                  <TableCell>{format(new Date(receipt.issueDate), "yyyy/MM/dd", { locale: ar })}</TableCell>
                  <TableCell>{receipt.description || "-"}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4 ml-2" />
                      طباعة
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

