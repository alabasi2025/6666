/**
 * إدارة الموافقات
 * Approvals Management
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";
import { 
  Plus, CheckCircle, XCircle, Clock, AlertTriangle, FileText, Loader2
} from "lucide-react";

export default function ApprovalsManagement() {
  const [location] = useLocation();
  const { toast } = useToast();
  const businessId = 1;
  
  const [statusFilter, setStatusFilter] = useState("pending");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewComments, setReviewComments] = useState("");
  
  const [newRequest, setNewRequest] = useState({
    requestType: "disconnect_meter",
    title: "",
    description: "",
    justification: "",
    amount: 0,
    priority: "normal",
  });
  
  const { data, isLoading, refetch } = trpc.approvals.list.useQuery({
    businessId,
    status: statusFilter && statusFilter !== "all" ? statusFilter as any : undefined,
  });
  
  const { data: stats } = trpc.approvals.getStats.useQuery({ businessId });
  
  const createMutation = trpc.approvals.create.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم إنشاء طلب الموافقة بنجاح" });
      refetch();
      setShowCreateDialog(false);
    },
  });
  
  const approveMutation = trpc.approvals.approve.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تمت الموافقة على الطلب" });
      refetch();
      setShowReviewDialog(false);
    },
  });
  
  const rejectMutation = trpc.approvals.reject.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم رفض الطلب" });
      refetch();
      setShowReviewDialog(false);
    },
  });
  
  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: "معلق", variant: "secondary" as const, icon: Clock },
      approved: { label: "موافق", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "مرفوض", variant: "destructive" as const, icon: XCircle },
      cancelled: { label: "ملغي", variant: "outline" as const, icon: XCircle },
    };
    
    const { label, variant, icon: Icon } = config[status as keyof typeof config] || config.pending;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };
  
  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { label: "منخفضة", variant: "secondary" as const },
      normal: { label: "عادية", variant: "default" as const },
      high: { label: "عالية", variant: "destructive" as const },
      urgent: { label: "عاجلة", variant: "destructive" as const },
    };
    
    return <Badge variant={config[priority as keyof typeof config]?.variant}>
      {config[priority as keyof typeof config]?.label}
    </Badge>;
  };
  
  const currentPageInfo = resolvePageInfo(location);
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            نظام الموافقات
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة طلبات الموافقة على العمليات الحساسة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 ml-2" />
            طلب موافقة جديد
          </Button>
          <EngineInfoDialog info={currentPageInfo} />
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats?.map((stat: any) => (
          <Card key={stat.status}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-sm mt-1">{getStatusBadge(stat.status)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
              <SelectItem value="approved">موافق</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>طلبات الموافقة</CardTitle>
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
                  <TableHead>العنوان</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الطالب</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.requests?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      لا توجد طلبات
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.requests?.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-semibold">{request.title}</TableCell>
                      <TableCell>{request.request_type}</TableCell>
                      <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                      <TableCell>
                        {request.amount ? `${parseFloat(request.amount).toFixed(2)} ريال` : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{request.requested_by_name}</TableCell>
                      <TableCell>
                        {new Date(request.requested_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowReviewDialog(true);
                            }}
                          >
                            مراجعة
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
      
      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>طلب موافقة جديد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>نوع الطلب</Label>
                <Select
                  value={newRequest.requestType}
                  onValueChange={(value: any) => setNewRequest({ ...newRequest, requestType: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disconnect_meter">فصل عداد</SelectItem>
                    <SelectItem value="reconnect_meter">إعادة توصيل عداد</SelectItem>
                    <SelectItem value="write_off_debt">إعفاء من دين</SelectItem>
                    <SelectItem value="refund">استرداد مبلغ</SelectItem>
                    <SelectItem value="void_invoice">إلغاء فاتورة</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>الأولوية</Label>
                <Select
                  value={newRequest.priority}
                  onValueChange={(value: any) => setNewRequest({ ...newRequest, priority: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="normal">عادية</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="urgent">عاجلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>العنوان</Label>
              <Input
                value={newRequest.title}
                onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                placeholder="عنوان الطلب..."
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>الوصف</Label>
              <Textarea
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                placeholder="وصف تفصيلي للطلب..."
                rows={3}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>المبررات</Label>
              <Textarea
                value={newRequest.justification}
                onChange={(e) => setNewRequest({ ...newRequest, justification: e.target.value })}
                placeholder="مبررات الطلب..."
                rows={2}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>المبلغ (إن وجد)</Label>
              <Input
                type="number"
                value={newRequest.amount}
                onChange={(e) => setNewRequest({ ...newRequest, amount: parseFloat(e.target.value) })}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => {
                createMutation.mutate({
                  businessId,
                  ...newRequest,
                  requestType: newRequest.requestType as any,
                  priority: newRequest.priority as any,
                });
              }}
              disabled={!newRequest.title || !newRequest.description || createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : "إنشاء طلب"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>مراجعة طلب الموافقة</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">العنوان</Label>
                  <p className="font-semibold">{selectedRequest.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">النوع</Label>
                  <p>{selectedRequest.request_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الطالب</Label>
                  <p>{selectedRequest.requested_by_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">التاريخ</Label>
                  <p>{new Date(selectedRequest.requested_at).toLocaleString('ar-SA')}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">الوصف</Label>
                <p className="mt-1">{selectedRequest.description}</p>
              </div>
              
              {selectedRequest.justification && (
                <div>
                  <Label className="text-muted-foreground">المبررات</Label>
                  <p className="mt-1">{selectedRequest.justification}</p>
                </div>
              )}
              
              {selectedRequest.amount && (
                <div>
                  <Label className="text-muted-foreground">المبلغ</Label>
                  <p className="text-2xl font-bold">{parseFloat(selectedRequest.amount).toFixed(2)} ريال</p>
                </div>
              )}
              
              <div>
                <Label>تعليقات المراجعة</Label>
                <Textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="أضف تعليقاتك..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowReviewDialog(false)}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (!reviewComments) {
                  toast({ title: "تحذير", description: "يجب إدخال سبب الرفض", variant: "destructive" });
                  return;
                }
                rejectMutation.mutate({
                  id: selectedRequest.id,
                  comments: reviewComments,
                });
              }}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : "رفض"}
            </Button>
            <Button
              onClick={() => {
                approveMutation.mutate({
                  id: selectedRequest.id,
                  comments: reviewComments || undefined,
                });
              }}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : "موافقة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

