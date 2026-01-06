/**
 * شاشة محرك التسوية
 * Reconciliation Engine Page
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GitBranch, Plus, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EngineInfoDialog, { EngineInfo } from "@/components/engines/EngineInfoDialog";

const RECONCILIATION_ENGINE_INFO: EngineInfo = {
  title: "محرك التسوية المرن",
  description: "إدارة التسويات المالية باستخدام الحسابات الوسيطة",
  process: `هذه الشاشة تتيح للمستخدم:
- عرض الحركات غير المطابقة في الحسابات الوسيطة
- عرض الحركات المطابقة
- إدارة الحسابات الوسيطة
- مطابقة الحركات يدوياً أو تلقائياً
- تسوية الحركات المطابقة وترحيلها للحسابات الدائمة`,
  mechanism: `1. يتم إنشاء حساب وسيط (Clearing Account) لكل عملية تحتاج تسوية
2. يتم تسجيل الحركات في الحساب الوسيط (مدين أو دائن)
3. النظام يبحث عن حركات متطابقة في الحساب الوسيط:
   - مطابقة 1:1 (حركة مدين مع حركة دائن بنفس المبلغ)
   - مطابقة 1:Many (حركة واحدة مع عدة حركات)
   - مطابقة Many:1 (عدة حركات مع حركة واحدة)
   - مطابقة Many:Many (عدة حركات مع عدة حركات)
4. عند المطابقة، يتم تسوية الحركات
5. يتم ترحيل الحركات المطابقة للحسابات الدائمة`,
  relatedScreens: [
    {
      name: "الحسابات المحاسبية",
      path: "/dashboard/accounting/chart-of-accounts",
      description: "إدارة الحسابات المحاسبية بما فيها الحسابات الوسيطة"
    },
    {
      name: "القيود اليومية",
      path: "/dashboard/accounting/journal-entries",
      description: "عرض القيود المحاسبية الناتجة عن التسوية"
    },
    {
      name: "كشف الحساب",
      path: "/dashboard/accounting/general-ledger",
      description: "عرض حركات الحسابات بعد التسوية"
    }
  ],
  businessLogic: `محرك التسوية المرن يعمل كالتالي:

1. الحسابات الوسيطة (Clearing Accounts):
   - حسابات مؤقتة تستخدم لمطابقة الحركات
   - كل حساب وسيط له غرض محدد (مثل: مطابقة الفواتير والمدفوعات)
   - الحركات في الحساب الوسيط تكون إما مدين أو دائن

2. عملية المطابقة:
   - يتم البحث عن حركات متطابقة في الحساب الوسيط
   - المطابقة تتم بناءً على المبلغ والتاريخ والوصف
   - يمكن المطابقة يدوياً أو تلقائياً

3. أنواع المطابقة:
   - 1:1: حركة مدين واحدة مع حركة دائن واحدة
   - 1:Many: حركة واحدة مع عدة حركات (مثل: فاتورة واحدة مع عدة دفعات)
   - Many:1: عدة حركات مع حركة واحدة (مثل: عدة فواتير مع دفعة واحدة)
   - Many:Many: عدة حركات مع عدة حركات

4. التسوية:
   - بعد المطابقة، يتم تسوية الحركات
   - الحركات المطابقة يتم ترحيلها للحسابات الدائمة
   - الحساب الوسيط يبقى فارغاً بعد التسوية

5. الفوائد:
   - تتبع دقيق للحركات غير المطابقة
   - تسهيل عملية المطابقة
   - تقليل الأخطاء المحاسبية`
};

export default function ReconciliationEngine() {
  const { toast } = useToast();
  const [businessId] = useState(1);
  const [selectedClearingAccount, setSelectedClearingAccount] = useState<number | null>(null);

  // جلب الحسابات الوسيطة (سيتم إضافتها لاحقاً)
  const clearingAccounts: any[] = [];

  // جلب الحركات غير المطابقة
  const { data: unmatchedEntries } = trpc.reconciliation.entries.getUnmatched.useQuery(
    {
      businessId,
      clearingAccountId: selectedClearingAccount || 0,
    },
    {
      enabled: !!selectedClearingAccount,
    }
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GitBranch className="w-8 h-8 text-pink-500" />
            محرك التسوية المرن
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة التسويات المالية باستخدام الحسابات الوسيطة
          </p>
        </div>
        <EngineInfoDialog info={RECONCILIATION_ENGINE_INFO} />
      </div>

      <Tabs defaultValue="unmatched" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unmatched">الحركات غير المطابقة</TabsTrigger>
          <TabsTrigger value="matched">الحركات المطابقة</TabsTrigger>
          <TabsTrigger value="clearing-accounts">الحسابات الوسيطة</TabsTrigger>
        </TabsList>

        <TabsContent value="unmatched">
          <Card>
            <CardHeader>
              <CardTitle>الحركات غير المطابقة</CardTitle>
              <CardDescription>الحركات التي تحتاج إلى مطابقة</CardDescription>
            </CardHeader>
            <CardContent>
              {unmatchedEntries && unmatchedEntries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>مدين</TableHead>
                      <TableHead>دائن</TableHead>
                      <TableHead>المصدر</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unmatchedEntries.map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.entryDate).toLocaleDateString("ar-SA")}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.debit || "-"}</TableCell>
                        <TableCell>{entry.credit || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.sourceModule}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            مطابقة
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد حركات غير مطابقة
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matched">
          <Card>
            <CardHeader>
              <CardTitle>الحركات المطابقة</CardTitle>
              <CardDescription>الحركات التي تمت تسويتها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                لا توجد حركات مطابقة حالياً
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clearing-accounts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>الحسابات الوسيطة</CardTitle>
                  <CardDescription>إدارة الحسابات الوسيطة للتسوية</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة حساب وسيط
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {clearingAccounts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الكود</TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clearingAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>{account.code}</TableCell>
                        <TableCell>{account.nameAr}</TableCell>
                        <TableCell>
                          <Badge variant="default">نشط</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            عرض
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد حسابات وسيطة. قم بإنشاء حساب وسيط للبدء
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

