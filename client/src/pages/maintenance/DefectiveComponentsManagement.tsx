/**
 * إدارة المكونات التالفة
 * Defective Components Management
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";
import { 
  Plus, AlertTriangle, Loader2, Eye, ClipboardCheck, XCircle, Wrench, Package
} from "lucide-react";

export default function DefectiveComponentsManagement() {
  const [location] = useLocation();
  const { toast } = useToast();
  const businessId = 1;
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showAssessDialog, setShowAssessDialog] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  
  const [newDefect, setNewDefect] = useState({
    componentType: "meter",
    serialNumber: "",
    defectReason: "",
    defectCategory: "wear_tear",
    severity: "moderate",
    foundAt: "",
  });
  
  const [assessment, setAssessment] = useState({
    technicalAssessment: "",
    rootCause: "",
    recommendations: "",
    repairFeasible: "maybe",
    estimatedCost: 0,
    recommendedAction: "investigate",
  });
  
  const { data, isLoading, refetch } = trpc.defectiveComponents.list.useQuery({
    businessId,
    componentType: typeFilter as any,
    assessmentStatus: statusFilter as any,
    page,
    limit: 20,
  });
  
  const { data: stats } = trpc.defectiveComponents.getStats.useQuery({ businessId });
  
  const createMutation = trpc.defectiveComponents.create.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم تسجيل المكون التالف بنجاح" });
      refetch();
      setShowReportDialog(false);
    },
  });
  
  const assessMutation = trpc.defectiveComponents.assess.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم تقييم المكون بنجاح" });
      refetch();
      setShowAssessDialog(false);
    },
  });
  
  const getSeverityBadge = (severity: string) => {
    const config = {
      minor: { label: "بسيط", variant: "secondary" as const },
      moderate: { label: "متوسط", variant: "default" as const },
      major: { label: "كبير", variant: "destructive" as const },
      critical: { label: "حرج", variant: "destructive" as const },
    };
    return <Badge variant={config[severity as keyof typeof config]?.variant || "default"}>
      {config[severity as keyof typeof config]?.label || severity}
    </Badge>;
  };
  
  const currentPageInfo = resolvePageInfo(location);
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            إدارة المكونات التالفة
          </h1>
          <p className="text-muted-foreground mt-2">
            تسجيل وتقييم ومتابعة المكونات التالفة (عدادات، محولات، كوابل، إلخ)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowReportDialog(true)} variant="destructive">
            <Plus className="w-4 h-4 ml-2" />
            تسجيل مكون تالف
          </Button>
          <EngineInfoDialog info={currentPageInfo} />
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{data?.total || 0}</div>
              <div className="text-sm text-muted-foreground mt-1">إجمالي التالف</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {data?.defectiveComponents?.filter((d: any) => d.assessment_status === "pending").length || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">في انتظار التقييم</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data?.defectiveComponents?.filter((d: any) => d.disposition === "repair").length || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">للإصلاح</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {data?.defectiveComponents?.filter((d: any) => d.disposition === "scrap").length || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">للإعدام</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المكونات التالفة ({data?.total || 0})</CardTitle>
          <CardDescription>جميع المكونات المسجلة كتالفة</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>النوع</TableHead>
                  <TableHead>الرقم التسلسلي</TableHead>
                  <TableHead>سبب التلف</TableHead>
                  <TableHead>الخطورة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>القرار</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.defectiveComponents?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      لا توجد مكونات تالفة مسجلة
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.defectiveComponents?.map((component: any) => (
                    <TableRow key={component.id}>
                      <TableCell>{component.component_type}</TableCell>
                      <TableCell className="font-mono">{component.serial_number || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{component.defect_reason}</TableCell>
                      <TableCell>{getSeverityBadge(component.severity)}</TableCell>
                      <TableCell>
                        <Badge variant={component.assessment_status === "assessed" ? "default" : "secondary"}>
                          {component.assessment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{component.disposition}</Badge>
                      </TableCell>
                      <TableCell>
                        {component.assessment_status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedComponent(component);
                              setShowAssessDialog(true);
                            }}
                          >
                            <ClipboardCheck className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Report Defect Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تسجيل مكون تالف</DialogTitle>
            <DialogDescription>تسجيل مكون أو معدة تالفة</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>نوع المكون</Label>
                <Select
                  value={newDefect.componentType}
                  onValueChange={(value: any) => setNewDefect({ ...newDefect, componentType: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meter">عداد</SelectItem>
                    <SelectItem value="transformer">محول</SelectItem>
                    <SelectItem value="cable">كابل</SelectItem>
                    <SelectItem value="switch">قاطع</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>الرقم التسلسلي (اختياري)</Label>
                <Input
                  value={newDefect.serialNumber}
                  onChange={(e) => setNewDefect({ ...newDefect, serialNumber: e.target.value })}
                  className="mt-2 font-mono"
                />
              </div>
            </div>
            
            <div>
              <Label>سبب التلف *</Label>
              <Textarea
                value={newDefect.defectReason}
                onChange={(e) => setNewDefect({ ...newDefect, defectReason: e.target.value })}
                placeholder="صف سبب التلف بالتفصيل..."
                className="mt-2"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>فئة التلف</Label>
                <Select
                  value={newDefect.defectCategory}
                  onValueChange={(value: any) => setNewDefect({ ...newDefect, defectCategory: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturing">عيب تصنيع</SelectItem>
                    <SelectItem value="wear_tear">استهلاك طبيعي</SelectItem>
                    <SelectItem value="accident">حادث</SelectItem>
                    <SelectItem value="misuse">سوء استخدام</SelectItem>
                    <SelectItem value="electrical">كهربائي</SelectItem>
                    <SelectItem value="mechanical">ميكانيكي</SelectItem>
                    <SelectItem value="environmental">بيئي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>الخطورة</Label>
                <Select
                  value={newDefect.severity}
                  onValueChange={(value: any) => setNewDefect({ ...newDefect, severity: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">بسيط</SelectItem>
                    <SelectItem value="moderate">متوسط</SelectItem>
                    <SelectItem value="major">كبير</SelectItem>
                    <SelectItem value="critical">حرج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => {
                createMutation.mutate({
                  businessId,
                  componentType: newDefect.componentType as any,
                  serialNumber: newDefect.serialNumber || undefined,
                  defectReason: newDefect.defectReason,
                  defectCategory: newDefect.defectCategory as any,
                  severity: newDefect.severity as any,
                  foundAt: newDefect.foundAt || undefined,
                });
              }}
              disabled={!newDefect.defectReason || createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : "تسجيل"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

