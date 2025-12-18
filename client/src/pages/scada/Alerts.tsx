import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  AlertTriangle, Bell, BellOff, CheckCircle, Clock,
  Filter, Search, Eye, MessageSquare, User, MapPin,
  XCircle, AlertCircle, Info, Volume2, VolumeX,
  Download, RefreshCw, Trash2, Archive
} from "lucide-react";
import { cn } from "@/lib/utils";

// Alert Severity Badge
function AlertSeverityBadge({ severity }: { severity: string }) {
  const severityConfig: Record<string, { label: string; color: string; icon: typeof AlertTriangle }> = {
    critical: { label: "حرج", color: "bg-destructive text-destructive-foreground", icon: XCircle },
    high: { label: "عالي", color: "bg-red-500 text-white", icon: AlertTriangle },
    medium: { label: "متوسط", color: "bg-warning text-warning-foreground", icon: AlertCircle },
    low: { label: "منخفض", color: "bg-blue-500 text-white", icon: Info },
    info: { label: "معلومات", color: "bg-muted text-muted-foreground", icon: Info },
  };

  const config = severityConfig[severity] || { label: severity, color: "bg-gray-500", icon: Info };
  const Icon = config.icon;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Sample Alerts Data
const alertsData = [
  {
    id: 1,
    title: "ارتفاع درجة حرارة المحول T-02",
    description: "تجاوزت درجة حرارة المحول T-02 الحد الأقصى المسموح به (65°C). درجة الحرارة الحالية: 68°C",
    equipment: "TR-002",
    equipmentName: "المحول T-02",
    location: "محطة الرياض الرئيسية",
    severity: "high",
    category: "temperature",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    notes: [],
  },
  {
    id: 2,
    title: "تجاوز حد الحمل في المحول T-02",
    description: "وصل حمل المحول T-02 إلى 92% من السعة القصوى. يُنصح بتوزيع الحمل على محولات أخرى.",
    equipment: "TR-002",
    equipmentName: "المحول T-02",
    location: "محطة الرياض الرئيسية",
    severity: "medium",
    category: "load",
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    notes: [],
  },
  {
    id: 3,
    title: "انقطاع الاتصال بالمولد G-01",
    description: "فقدان الاتصال بالمولد الاحتياطي G-01. آخر اتصال ناجح منذ 15 دقيقة.",
    equipment: "GEN-001",
    equipmentName: "المولد الاحتياطي G-01",
    location: "محطة جدة الفرعية",
    severity: "critical",
    category: "communication",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    acknowledged: true,
    acknowledgedBy: "أحمد محمد",
    acknowledgedAt: new Date(Date.now() - 10 * 60 * 1000),
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    notes: [
      { user: "أحمد محمد", text: "تم إرسال فريق الصيانة للتحقق", time: new Date(Date.now() - 10 * 60 * 1000) }
    ],
  },
  {
    id: 4,
    title: "انخفاض معامل القدرة",
    description: "انخفض معامل القدرة في لوحة التوزيع الرئيسية إلى 0.85. القيمة المطلوبة: 0.90 أو أعلى.",
    equipment: "MDB-001",
    equipmentName: "لوحة التوزيع الرئيسية",
    location: "محطة الدمام",
    severity: "low",
    category: "power_quality",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    acknowledged: true,
    acknowledgedBy: "سعد العتيبي",
    acknowledgedAt: new Date(Date.now() - 25 * 60 * 1000),
    resolved: true,
    resolvedBy: "سعد العتيبي",
    resolvedAt: new Date(Date.now() - 5 * 60 * 1000),
    notes: [
      { user: "سعد العتيبي", text: "تم تشغيل مكثفات تحسين معامل القدرة", time: new Date(Date.now() - 5 * 60 * 1000) }
    ],
  },
  {
    id: 5,
    title: "صيانة مجدولة للمحول T-03",
    description: "تذكير: موعد الصيانة الدورية للمحول T-03 غداً الساعة 8:00 صباحاً",
    equipment: "TR-003",
    equipmentName: "المحول T-03",
    location: "محطة الرياض الرئيسية",
    severity: "info",
    category: "maintenance",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    acknowledged: true,
    acknowledgedBy: "النظام",
    acknowledgedAt: new Date(Date.now() - 60 * 60 * 1000),
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    notes: [],
  },
  {
    id: 6,
    title: "تذبذب في الجهد الكهربائي",
    description: "تم رصد تذبذب في الجهد الكهربائي بنسبة ±5% في الخط الرئيسي",
    equipment: "LINE-001",
    equipmentName: "الخط الرئيسي",
    location: "محطة الرياض الرئيسية",
    severity: "medium",
    category: "voltage",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    acknowledged: true,
    acknowledgedBy: "محمد علي",
    acknowledgedAt: new Date(Date.now() - 40 * 60 * 1000),
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    notes: [],
  },
];

const alertStats = [
  { label: "إجمالي التنبيهات", value: 24, icon: Bell, color: "primary" },
  { label: "حرجة", value: 3, icon: XCircle, color: "destructive" },
  { label: "غير مؤكدة", value: 8, icon: AlertTriangle, color: "warning" },
  { label: "تم حلها اليوم", value: 12, icon: CheckCircle, color: "success" },
];

export default function Alerts() {
  const [selectedAlert, setSelectedAlert] = useState<typeof alertsData[0] | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedAlerts, setSelectedAlerts] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [noteText, setNoteText] = useState("");

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return date.toLocaleDateString("ar-SA");
  };

  const filteredAlerts = alertsData.filter(alert => {
    if (searchQuery && !alert.title.includes(searchQuery) && !alert.equipment.includes(searchQuery)) {
      return false;
    }
    if (severityFilter !== "all" && alert.severity !== severityFilter) {
      return false;
    }
    if (statusFilter === "unacknowledged" && alert.acknowledged) {
      return false;
    }
    if (statusFilter === "acknowledged" && !alert.acknowledged) {
      return false;
    }
    if (statusFilter === "resolved" && !alert.resolved) {
      return false;
    }
    if (statusFilter === "active" && alert.resolved) {
      return false;
    }
    if (categoryFilter !== "all" && alert.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const handleAcknowledge = (alertId: number) => {
    toast.success("تم تأكيد استلام التنبيه");
  };

  const handleAcknowledgeSelected = () => {
    toast.success(`تم تأكيد استلام ${selectedAlerts.length} تنبيه`);
    setSelectedAlerts([]);
  };

  const handleResolve = (alertId: number) => {
    toast.success("تم حل التنبيه");
    setShowDetailsDialog(false);
  };

  const handleAddNote = () => {
    if (noteText.trim()) {
      toast.success("تم إضافة الملاحظة");
      setNoteText("");
    }
  };

  const toggleSelectAlert = (alertId: number) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const selectAllAlerts = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map(a => a.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-7 h-7 text-warning" />
            إدارة التنبيهات
          </h1>
          <p className="text-muted-foreground">مراقبة وإدارة جميع تنبيهات النظام</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={soundEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 ml-2" /> : <VolumeX className="w-4 h-4 ml-2" />}
            {soundEnabled ? "الصوت مفعل" : "الصوت صامت"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {alertStats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={cn(
                    "text-3xl font-bold ltr-nums",
                    stat.color === "destructive" && "text-destructive",
                    stat.color === "warning" && "text-warning",
                    stat.color === "success" && "text-success"
                  )}>{stat.value}</p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl",
                  stat.color === "primary" && "bg-primary/20 text-primary",
                  stat.color === "destructive" && "bg-destructive/20 text-destructive",
                  stat.color === "warning" && "bg-warning/20 text-warning",
                  stat.color === "success" && "bg-success/20 text-success"
                )}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في التنبيهات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الخطورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                <SelectItem value="critical">حرج</SelectItem>
                <SelectItem value="high">عالي</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
                <SelectItem value="info">معلومات</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="unacknowledged">غير مؤكد</SelectItem>
                <SelectItem value="acknowledged">مؤكد</SelectItem>
                <SelectItem value="resolved">تم حله</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                <SelectItem value="temperature">درجة الحرارة</SelectItem>
                <SelectItem value="load">الحمل</SelectItem>
                <SelectItem value="communication">الاتصال</SelectItem>
                <SelectItem value="voltage">الجهد</SelectItem>
                <SelectItem value="power_quality">جودة الطاقة</SelectItem>
                <SelectItem value="maintenance">الصيانة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedAlerts.length > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                تم تحديد <strong>{selectedAlerts.length}</strong> تنبيه
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleAcknowledgeSelected}>
                  <CheckCircle className="w-4 h-4 ml-2" />
                  تأكيد الاستلام
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="w-4 h-4 ml-2" />
                  أرشفة
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedAlerts([])}>
                  إلغاء التحديد
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">قائمة التنبيهات ({filteredAlerts.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
                onCheckedChange={selectAllAlerts}
              />
              <span className="text-sm text-muted-foreground">تحديد الكل</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={cn(
                  "p-4 hover:bg-muted/30 transition-colors",
                  !alert.acknowledged && "bg-muted/20",
                  alert.resolved && "opacity-60"
                )}
              >
                <div className="flex items-start gap-4">
                  <Checkbox 
                    checked={selectedAlerts.includes(alert.id)}
                    onCheckedChange={() => toggleSelectAlert(alert.id)}
                  />
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    alert.severity === "critical" && "bg-destructive/20 text-destructive",
                    alert.severity === "high" && "bg-red-500/20 text-red-500",
                    alert.severity === "medium" && "bg-warning/20 text-warning",
                    alert.severity === "low" && "bg-blue-500/20 text-blue-500",
                    alert.severity === "info" && "bg-muted text-muted-foreground"
                  )}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <AlertSeverityBadge severity={alert.severity} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{alert.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(alert.timestamp)}
                      </span>
                      <span className="font-mono bg-muted px-2 py-0.5 rounded">{alert.equipment}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.location}
                      </span>
                      {alert.acknowledged && (
                        <span className="flex items-center gap-1 text-success">
                          <CheckCircle className="w-3 h-3" />
                          مؤكد بواسطة {alert.acknowledgedBy}
                        </span>
                      )}
                      {alert.resolved && (
                        <Badge variant="outline" className="text-success">تم الحل</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!alert.acknowledged && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        <CheckCircle className="w-4 h-4 ml-2" />
                        تأكيد
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setSelectedAlert(alert);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          {selectedAlert && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedAlert.title}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedAlert.equipment} - {selectedAlert.location}
                    </DialogDescription>
                  </div>
                  <AlertSeverityBadge severity={selectedAlert.severity} />
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Description */}
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm">{selectedAlert.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">وقت الحدوث</p>
                    <p className="font-medium">{selectedAlert.timestamp.toLocaleString("ar-SA")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المعدة</p>
                    <p className="font-medium">{selectedAlert.equipmentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">حالة التأكيد</p>
                    <p className="font-medium flex items-center gap-2">
                      {selectedAlert.acknowledged ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-success" />
                          مؤكد بواسطة {selectedAlert.acknowledgedBy}
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-warning" />
                          في انتظار التأكيد
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">حالة الحل</p>
                    <p className="font-medium flex items-center gap-2">
                      {selectedAlert.resolved ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-success" />
                          تم الحل
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-warning" />
                          قيد المعالجة
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    الملاحظات والتعليقات
                  </h4>
                  {selectedAlert.notes.length > 0 ? (
                    <div className="space-y-2">
                      {selectedAlert.notes.map((note, index) => (
                        <div key={index} className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {note.user}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatTime(note.time)}</span>
                          </div>
                          <p className="text-sm">{note.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">لا توجد ملاحظات</p>
                  )}
                  
                  {/* Add Note */}
                  <div className="mt-3 flex gap-2">
                    <Textarea
                      placeholder="أضف ملاحظة..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={2}
                    />
                    <Button onClick={handleAddNote} disabled={!noteText.trim()}>
                      إضافة
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                {!selectedAlert.acknowledged && (
                  <Button variant="outline" onClick={() => handleAcknowledge(selectedAlert.id)}>
                    <CheckCircle className="w-4 h-4 ml-2" />
                    تأكيد الاستلام
                  </Button>
                )}
                {!selectedAlert.resolved && (
                  <Button onClick={() => handleResolve(selectedAlert.id)}>
                    <CheckCircle className="w-4 h-4 ml-2" />
                    تم حل المشكلة
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
