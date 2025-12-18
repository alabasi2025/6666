import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Plus, 
  Search,
  Pin,
  PinOff,
  Trash2,
  Archive,
  Clock
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const priorities = [
  { value: "low", label: "منخفضة", color: "bg-gray-500" },
  { value: "medium", label: "متوسطة", color: "bg-blue-500" },
  { value: "high", label: "عالية", color: "bg-orange-500" },
  { value: "urgent", label: "عاجلة", color: "bg-red-500" },
];

const colors = [
  { value: "#6366f1", label: "بنفسجي" },
  { value: "#22c55e", label: "أخضر" },
  { value: "#eab308", label: "أصفر" },
  { value: "#ef4444", label: "أحمر" },
  { value: "#3b82f6", label: "أزرق" },
  { value: "#f97316", label: "برتقالي" },
  { value: "#ec4899", label: "وردي" },
  { value: "#64748b", label: "رمادي" },
];

export default function CustomNotes() {
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    color: "#6366f1",
  });

  const businessId = 1;

  const { data: notes = [], refetch } = trpc.customSystem.notes.list.useQuery({ 
    businessId, 
    isArchived: showArchived 
  });
  
  const createNote = trpc.customSystem.notes.create.useMutation({
    onSuccess: () => {
      
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      
    },
  });

  const updateNote = trpc.customSystem.notes.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteNote = trpc.customSystem.notes.delete.useMutation({
    onSuccess: () => {
      
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      priority: "medium",
      color: "#6366f1",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNote.mutate({ ...formData, businessId });
  };

  const togglePin = (id: number, isPinned: boolean) => {
    updateNote.mutate({ id, isPinned: !isPinned });
  };

  const toggleArchive = (id: number, isArchived: boolean) => {
    updateNote.mutate({ id, isArchived: !isArchived });
    toast({ title: isArchived ? "تم إلغاء الأرشفة" : "تم أرشفة الملاحظة" });
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.includes(searchTerm) ||
      (note.content && note.content.includes(searchTerm))
  );

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            الملاحظات
          </h1>
          <p className="text-muted-foreground">تدوين وإدارة الملاحظات</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة ملاحظة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة ملاحظة جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">العنوان *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="عنوان الملاحظة"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">المحتوى</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="محتوى الملاحظة..."
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">الأولوية</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${p.color}`} />
                            {p.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>اللون</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className={`w-6 h-6 rounded-full border-2 ${
                          formData.color === c.value ? "border-white ring-2 ring-primary" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c.value }}
                        onClick={() => setFormData({ ...formData, color: c.value })}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">التصنيف</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="مثال: عمل، شخصي، أفكار..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createNote.isPending}>
                  {createNote.isPending ? "جاري الإنشاء..." : "إنشاء الملاحظة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في الملاحظات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button
          variant={showArchived ? "default" : "outline"}
          onClick={() => setShowArchived(!showArchived)}
        >
          <Archive className="h-4 w-4 ml-2" />
          {showArchived ? "الملاحظات النشطة" : "الأرشيف"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{notes.length}</p>
              <p className="text-xs text-muted-foreground">إجمالي الملاحظات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Pin className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{pinnedNotes.length}</p>
              <p className="text-xs text-muted-foreground">ملاحظات مثبتة</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">!</div>
            <div>
              <p className="text-2xl font-bold">{notes.filter((n) => n.priority === "urgent").length}</p>
              <p className="text-xs text-muted-foreground">ملاحظات عاجلة</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">
                {notes.filter((n) => {
                  const today = new Date();
                  const noteDate = new Date(n.createdAt);
                  return today.toDateString() === noteDate.toDateString();
                }).length}
              </p>
              <p className="text-xs text-muted-foreground">ملاحظات اليوم</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Pin className="h-5 w-5 text-yellow-500" />
            ملاحظات مثبتة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onTogglePin={() => togglePin(note.id, note.isPinned)}
                onToggleArchive={() => toggleArchive(note.id, note.isArchived)}
                onDelete={() => deleteNote.mutate({ id: note.id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Notes */}
      <div>
        {pinnedNotes.length > 0 && (
          <h2 className="text-lg font-semibold mb-3">ملاحظات أخرى</h2>
        )}
        {unpinnedNotes.length === 0 && pinnedNotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد ملاحظات</p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة أول ملاحظة
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onTogglePin={() => togglePin(note.id, note.isPinned)}
                onToggleArchive={() => toggleArchive(note.id, note.isArchived)}
                onDelete={() => deleteNote.mutate({ id: note.id })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NoteCard({ 
  note, 
  onTogglePin, 
  onToggleArchive, 
  onDelete 
}: { 
  note: any; 
  onTogglePin: () => void; 
  onToggleArchive: () => void; 
  onDelete: () => void;
}) {
  const priorityInfo = priorities.find((p) => p.value === note.priority);

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow"
      style={{ borderTopColor: note.color, borderTopWidth: "3px" }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base line-clamp-1">{note.title}</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onTogglePin}>
              {note.isPinned ? (
                <PinOff className="h-4 w-4 text-yellow-500" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${priorityInfo?.color}`} />
          <span>{priorityInfo?.label}</span>
          {note.category && (
            <>
              <span>•</span>
              <span>{note.category}</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {note.content && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {note.content}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(note.createdAt).toLocaleDateString("ar-SA")}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleArchive}>
              <Archive className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
