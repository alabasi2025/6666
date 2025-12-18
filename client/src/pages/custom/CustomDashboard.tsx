import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  FileText, 
  Mail, 
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function CustomDashboard() {
  const [, setLocation] = useLocation();
  
  // TODO: Get businessId from context/selected business
  const businessId = 1;
  
  const { data: accounts = [] } = trpc.customSystem.accounts.list.useQuery({ businessId });
  const { data: notes = [] } = trpc.customSystem.notes.list.useQuery({ businessId, isArchived: false });
  const { data: memos = [] } = trpc.customSystem.memos.list.useQuery({ businessId });

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || "0"), 0);
  const pinnedNotes = notes.filter(n => n.isPinned);
  const urgentMemos = memos.filter(m => m.priority === "urgent" && m.status !== "archived");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-7 w-7 text-primary" />
            النظام المخصص
          </h1>
          <p className="text-muted-foreground">إدارة الحسابات والملاحظات والمذكرات</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الحسابات</CardTitle>
            <Calculator className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">حساب مسجل</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرصيد</CardTitle>
            {totalBalance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalBalance.toLocaleString()} ر.س
            </div>
            <p className="text-xs text-muted-foreground">الرصيد الإجمالي</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الملاحظات</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-xs text-muted-foreground">{pinnedNotes.length} مثبتة</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المذكرات</CardTitle>
            <Mail className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memos.length}</div>
            <p className="text-xs text-muted-foreground">{urgentMemos.length} عاجلة</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setLocation("/dashboard/custom/accounts")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              الحسابات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              إدارة الحسابات المالية وتتبع الأرصدة والحركات
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 ml-2" />
              إضافة حساب
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setLocation("/dashboard/custom/notes")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-yellow-500" />
              الملاحظات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              تدوين الملاحظات والأفكار مع إمكانية التصنيف والتثبيت
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 ml-2" />
              إضافة ملاحظة
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setLocation("/dashboard/custom/memos")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-500" />
              المذكرات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              إنشاء وإدارة المذكرات الداخلية والخارجية والتعاميم
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 ml-2" />
              إضافة مذكرة
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              آخر الملاحظات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">لا توجد ملاحظات</p>
            ) : (
              <div className="space-y-3">
                {notes.slice(0, 5).map((note) => (
                  <div 
                    key={note.id} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                    onClick={() => setLocation("/dashboard/custom/notes")}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mt-1.5" 
                      style={{ backgroundColor: note.color || '#6366f1' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{note.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    {note.isPinned && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">مثبتة</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Urgent Memos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              المذكرات العاجلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {urgentMemos.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">لا توجد مذكرات عاجلة</p>
            ) : (
              <div className="space-y-3">
                {urgentMemos.slice(0, 5).map((memo) => (
                  <div 
                    key={memo.id} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 cursor-pointer"
                    onClick={() => setLocation("/dashboard/custom/memos")}
                  >
                    <Mail className="h-4 w-4 text-red-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{memo.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {memo.memoNumber} - {new Date(memo.memoDate).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
