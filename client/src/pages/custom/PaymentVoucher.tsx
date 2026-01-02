import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axios from "axios";
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  Wallet,
  User,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ArrowDownCircle,
  Coins,
  MoreVertical,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface PaymentVoucherProps {
  subSystemId?: number;
}

type TreasuryTypeFilter = "all" | "cash" | "bank" | "wallet" | "exchange";

type PaymentVoucherLineForm = {
  key: string;
  accountType: string;
  accountSubTypeId: string;
  accountId: string;
  analyticAccountId: string;
  analyticTreasuryId: string;
  description: string;
  amount: string;
};

const defaultAccountTypes = [
  { value: "asset", label: "أصول" },
  { value: "liability", label: "التزامات" },
  { value: "equity", label: "حقوق ملكية" },
  { value: "revenue", label: "إيرادات" },
  { value: "expense", label: "مصروفات" },
];

export default function PaymentVoucher({ subSystemId }: PaymentVoucherProps) {
  const deleteConfirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const params = useParams() as Record<string, string | undefined>;
  const id = subSystemId || (params.id ? parseInt(params.id) : undefined);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [treasuryTypeFilter, setTreasuryTypeFilter] = useState<TreasuryTypeFilter>("all");
  const [editingVoucherId, setEditingVoucherId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // بيانات دليل الحسابات (Custom System v2) لدعم البنود متعددة الأسطر
  const [accountTypes, setAccountTypes] = useState<any[]>(defaultAccountTypes);
  const [accountSubTypes, setAccountSubTypes] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  // ملاحظة: "الحساب التحليلي" هنا هو حساب (تفصيلي/ابن) مرتبط بحساب الدليل

  const createEmptyLine = (): PaymentVoucherLineForm => ({
    key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    accountType: "expense",
    accountSubTypeId: "",
    accountId: "",
    analyticAccountId: "",
    analyticTreasuryId: "",
    description: "",
    amount: "",
  });

  const [lines, setLines] = useState<PaymentVoucherLineForm[]>([createEmptyLine()]);

  const addLine = () => {
    setLines((prev) => [...prev, createEmptyLine()]);
  };

  const removeLine = (key: string) => {
    setLines((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((l) => l.key !== key);
    });
  };

  const updateLine = (key: string, patch: Partial<PaymentVoucherLineForm>) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  // Form state
  const [formData, setFormData] = useState({
    treasuryId: "",
    currencyCode: "",
    destinationType: "person" as "person" | "company" | "intermediary",
    destinationName: "",
    destinationIntermediaryId: "",
    description: "",
    voucherDate: new Date().toISOString().split("T")[0],
    voucherNumber: "",
  });

  // Fetch data
  const { data: subSystem } = trpc.customSystem.subSystems.getById.useQuery(
    { id: id || 0 },
    { enabled: !!id }
  );

  const { data: treasuries, isLoading: treasuriesLoading } = trpc.customSystem.treasuries.list.useQuery(
    { businessId: 1, subSystemId: id },
    { enabled: !!id }
  );

  const { data: intermediaryAccounts } = trpc.customSystem.intermediaryAccounts.list.useQuery(
    { businessId: 1 },
    { enabled: true }
  );

  const { data: paymentVouchers, refetch: refetchVouchers, isLoading: vouchersLoading, error: vouchersError } = 
    trpc.customSystem.paymentVouchers.list.useQuery(
      { businessId: 1, subSystemId: id },
      { enabled: !!id }
    );

  const confirmMutation = trpc.customSystem.paymentVouchers.confirm.useMutation({
    onSuccess: () => {
      toast.success("تم تأكيد السند وتحديث رصيد الخزينة");
      refetchVouchers();
    },
    onError: (error) => {
      toast.error("فشل في تأكيد السند: " + error.message);
    },
  });

  const deleteMutation = trpc.customSystem.paymentVouchers.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف السند");
      refetchVouchers();
    },
    onError: (error) => {
      toast.error("فشل في حذف السند: " + error.message);
    },
  });

  const { data: paymentVoucherDetails, isLoading: voucherDetailsLoading } =
    trpc.customSystem.paymentVouchers.getById.useQuery(
      { id: selectedVoucher?.id || 0, businessId: 1 },
      { enabled: isViewDialogOpen && !!selectedVoucher?.id }
    );

  const { data: editingVoucherDetails } =
    trpc.customSystem.paymentVouchers.getById.useQuery(
      { id: editingVoucherId || 0, businessId: 1 },
      { enabled: !!editingVoucherId }
    );

  // طباعة: جلب التفاصيل عند الطلب
  const [printVoucherId, setPrintVoucherId] = useState<number | null>(null);
  const { data: printVoucherDetails } =
    trpc.customSystem.paymentVouchers.getById.useQuery(
      { id: printVoucherId || 0, businessId: 1 },
      { enabled: !!printVoucherId }
    );

  // تعبئة النموذج عند تحرير سند
  useEffect(() => {
    if (!editingVoucherId || !editingVoucherDetails) return;
    const v = editingVoucherDetails as any;

    setFormData({
      voucherNumber: v.voucherNumber || "",
      treasuryId: v.treasuryId ? String(v.treasuryId) : "",
      currencyCode: v.currencyData?.code || v.currency || "",
      destinationType: v.destinationType || "person",
      destinationName: v.destinationName || "",
      destinationIntermediaryId: v.destinationIntermediaryId ? String(v.destinationIntermediaryId) : "",
      description: v.description || "",
      voucherDate: v.voucherDate || new Date().toISOString().split("T")[0],
    });

    const mappedLines =
      (v.lines || []).map((l: any) => ({
        key: `${l.id || Math.random()}`,
        accountType: l.accountType || "",
        accountSubTypeId: l.accountSubTypeId ? String(l.accountSubTypeId) : "",
        accountId: l.accountId ? String(l.accountId) : "",
        analyticAccountId: l.analyticAccountId ? String(l.analyticAccountId) : "",
        analyticTreasuryId: l.analyticTreasuryId ? String(l.analyticTreasuryId) : "",
        description: l.description || "",
        amount: l.amount ? String(l.amount) : "0",
      })) || [];

    setLines(mappedLines.length > 0 ? mappedLines : [createEmptyLine()]);
  }, [editingVoucherId, editingVoucherDetails]);

  // تحميل دليل الحسابات (أنواع/أنواع فرعية/حسابات) من Custom System v2
  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setAccountsLoading(true);

    Promise.all([
      axios
        .get("/api/custom-system/v2/account-types", {
          params: { subSystemId: id, includeInactive: true },
        })
        .then((res) => res.data)
        .catch(() => null),
      axios
        .get("/api/custom-system/v2/account-sub-types", {
          params: { isActive: true },
        })
        .then((res) => res.data)
        .catch(() => []),
      axios
        .get("/api/custom-system/v2/accounts", {
          params: { subSystemId: id, isActive: true },
        })
        .then((res) => res.data)
        .catch(() => []),
    ])
      .then(([types, subTypes, accountsData]) => {
        if (cancelled) return;
        if (Array.isArray(types) && types.length > 0) {
          setAccountTypes(types);
        } else {
          setAccountTypes(defaultAccountTypes);
        }
        setAccountSubTypes(Array.isArray(subTypes) ? subTypes : []);
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      })
      .finally(() => {
        if (cancelled) return;
        setAccountsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Get selected treasury currencies
  const selectedTreasury = treasuries?.find((t: any) => t.id === parseInt(formData.treasuryId));
  const treasuryCurrencyCodes: string[] = Array.isArray(selectedTreasury?.currencies)
    ? (selectedTreasury.currencies as string[])
    : [];
  const defaultTreasuryCurrencyCode: string | undefined = selectedTreasury?.defaultCurrency || treasuryCurrencyCodes[0];

  const filteredTreasuries = treasuries?.filter((t: any) => {
    if (treasuryTypeFilter === "all") return true;
    return t.treasuryType === treasuryTypeFilter;
  });

  // Create mutation
  const createMutation = trpc.customSystem.paymentVouchers.create.useMutation({
    onSuccess: (data) => {
      toast.success(`تم إنشاء سند الصرف بنجاح (${data.voucherNumber})`);
      setIsAddDialogOpen(false);
      resetForm();
      // مهم: تصفير الفلاتر حتى يظهر السند الجديد مباشرة
      setSearchTerm("");
      setStatusFilter("all");
      refetchVouchers();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const updateMutation = trpc.customSystem.paymentVouchers.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث السند بنجاح");
      setIsAddDialogOpen(false);
      setEditingVoucherId(null);
      resetForm();
      refetchVouchers();
    },
    onError: (error) => {
      toast.error("فشل في تحديث السند: " + error.message);
    },
  });

  const revertMutation = trpc.customSystem.paymentVouchers.revertToDraft.useMutation({
    onSuccess: () => {
      toast.success("تم إرجاع السند إلى مسودة مع عكس الأثر المالي");
      refetchVouchers();
    },
    onError: (error) => {
      toast.error("فشل في إرجاع السند: " + error.message);
    },
  });

  const linesTotal = useMemo(() => {
    return lines.reduce((sum, l) => sum + (parseFloat(l.amount || "0") || 0), 0);
  }, [lines]);

  const totalAmountStr = useMemo(() => {
    return linesTotal.toFixed(2);
  }, [linesTotal]);

  const voucherCurrency = useMemo(() => {
    return formData.currencyCode || defaultTreasuryCurrencyCode || "SAR";
  }, [formData.currencyCode, defaultTreasuryCurrencyCode]);

  // طباعة: فتح نافذة وطباعة عند توفر البيانات
  useEffect(() => {
    if (!printVoucherId || !printVoucherDetails) return;

    const v = printVoucherDetails as any;
    const lines = (v.lines as any[]) || [];
    const total = parseFloat(v.amount || "0");

    const formatMoney = (val: any) => {
      const num = parseFloat(val || "0");
      return Number.isFinite(num) ? num.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0";
    };

    const typeLabel = (code: any) => {
      const t = accountTypes.find((t: any) => (t.typeCode ?? t.value) === code);
      return t ? (t.typeNameAr ?? t.label ?? code ?? "-") : (code ?? "-");
    };

    const subTypeLabel = (id: any) => {
      const st = accountSubTypes.find((s: any) => s.id === id);
      return st ? st.nameAr : (id ?? "-");
    };

    const accountLabel = (id: any) => {
      const acc = accounts.find((a: any) => a.id === id);
      return acc ? `${acc.accountCode} - ${acc.accountNameAr}` : (id ?? "-");
    };

    const analyticLabel = (line: any) => {
      const trea = (treasuries || []).find((t: any) => t.id === line.analyticTreasuryId);
      if (trea) return `${trea.nameAr} (${trea.code})`;
      const acc = accounts.find((a: any) => a.id === line.analyticAccountId);
      if (acc) return `${acc.accountCode} - ${acc.accountNameAr}`;
      return line.analyticTreasuryId || line.analyticAccountId || "—";
    };

    const destinationLabel =
      v.destinationType === "person" ? "شخص" :
      v.destinationType === "company" ? "شركة" :
      v.destinationType === "intermediary" ? "حساب وسيط" :
      v.destinationType === "entity" ? "جهة" :
      v.destinationType === "party" ? "طرف" : "أخرى";

    const statusLabel =
      v.status === "confirmed" ? "مؤكد" :
      v.status === "draft" ? "مسودة" :
      v.status === "cancelled" ? "ملغي" : v.status || "-";

    const html = `
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>طباعة سند صرف ${v.voucherNumber || ""}</title>
        <style>
          body { font-family: "Cairo", Arial, sans-serif; direction: rtl; padding: 20px; color: #0f172a; background: #f8fafc; }
          h1 { margin: 0 0 12px 0; color: #0f172a; }
          .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; box-shadow: 0 10px 30px rgba(15,23,42,0.06); }
          .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px 16px; margin-bottom: 12px; }
          .label { color: #64748b; font-size: 13px; }
          .value { color: #0f172a; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: right; font-size: 13px; }
          th { background: #f1f5f9; color: #0f172a; }
          .total { font-weight: 700; background: #fff7ed; }
          .footer { margin-top: 12px; font-size: 12px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>سند صرف ${v.voucherNumber || ""}</h1>
          <div class="meta-grid">
            <div><div class="label">التاريخ</div><div class="value">${new Date(v.voucherDate || v.createdAt || "").toLocaleDateString("ar-SA")}</div></div>
            <div><div class="label">الخزينة</div><div class="value">${v.treasury?.nameAr || "-"}</div></div>
            <div><div class="label">نوع الخزينة</div><div class="value">${v.treasury?.treasuryType || "-"}</div></div>
            <div><div class="label">العملة</div><div class="value">${v.currencyData?.code || v.currency || ""}</div></div>
            <div><div class="label">المبلغ الكلي</div><div class="value">${formatMoney(v.amount)} ${v.currencyData?.code || v.currency || ""}</div></div>
            <div><div class="label">المستفيد</div><div class="value">${v.destinationName || "—"}</div></div>
            <div><div class="label">نوع المستفيد</div><div class="value">${destinationLabel}</div></div>
            <div><div class="label">الحالة</div><div class="value">${statusLabel}</div></div>
            <div><div class="label">عدد التعديلات</div><div class="value">${v.editCount ?? 0}</div></div>
            <div><div class="label">آخر تعديل</div><div class="value">${v.updatedAt ? new Date(v.updatedAt).toLocaleString("ar-SA") : "—"}</div></div>
            <div><div class="label">تاريخ الإنشاء</div><div class="value">${v.createdAt ? new Date(v.createdAt).toLocaleString("ar-SA") : "—"}</div></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>نوع الحساب</th>
                <th>النوع الفرعي</th>
                <th>الحساب</th>
                <th>الحساب التحليلي</th>
                <th>البيان</th>
                <th>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              ${lines
                .map((l, idx) => {
                  const tLabel = typeLabel(l.accountType);
                  const stLabel = subTypeLabel(l.accountSubTypeId);
                  const accLabel = accountLabel(l.accountId);
                  const anLabel = analyticLabel(l);
                  const desc = l.description || "";
                  const amt = formatMoney(l.amount);
                  return `<tr>
                    <td>${idx + 1}</td>
                    <td>${tLabel}</td>
                    <td>${stLabel}</td>
                    <td>${accLabel}</td>
                    <td>${anLabel}</td>
                    <td>${desc}</td>
                    <td>${amt}</td>
                  </tr>`;
                })
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="total">الإجمالي</td>
                <td class="total">${formatMoney(total)} ${v.currencyData?.code || v.currency || ""}</td>
              </tr>
            </tfoot>
          </table>

          ${v.description ? `<div style="margin-top:12px;"><div class="label">البيان</div><div class="value">${v.description}</div></div>` : ""}
        </div>

        <div class="footer">تم إنشاء التقرير بواسطة النظام - ${new Date().toLocaleString("ar-SA")}</div>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    } else {
      toast.error("تعذر فتح نافذة الطباعة، يرجى السماح بالنوافذ المنبثقة");
    }

    setPrintVoucherId(null);
  }, [printVoucherId, printVoucherDetails]);

  const resetForm = () => {
    setFormData({
      treasuryId: "",
      currencyCode: "",
      destinationType: "person",
      destinationName: "",
      destinationIntermediaryId: "",
      description: "",
      voucherDate: new Date().toISOString().split("T")[0],
      voucherNumber: "",
    });
    setTreasuryTypeFilter("all");
    setLines([createEmptyLine()]);
    setEditingVoucherId(null);
  };

  const handleSubmit = () => {
    if (!formData.treasuryId) {
      toast.error("يرجى اختيار الخزينة");
      return;
    }

    if (formData.destinationType !== "intermediary" && !formData.destinationName) {
      toast.error("يرجى إدخال اسم المستفيد");
      return;
    }

    if (formData.destinationType === "intermediary" && !formData.destinationIntermediaryId) {
      toast.error("يرجى اختيار الحساب الوسيط");
      return;
    }

    if (!lines || lines.length === 0) {
      toast.error("يرجى إضافة بند واحد على الأقل");
      return;
    }

    if (!Number.isFinite(linesTotal) || linesTotal <= 0) {
      toast.error("يرجى إدخال مبالغ صحيحة في البنود");
      return;
    }

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      if (!line.accountType) {
        toast.error(`يرجى اختيار نوع الحساب في البند رقم ${idx + 1}`);
        return;
      }
      if (!line.accountSubTypeId) {
        toast.error(`يرجى اختيار النوع الفرعي في البند رقم ${idx + 1}`);
        return;
      }
      if (!line.accountId) {
        toast.error(`يرجى اختيار الحساب في البند رقم ${idx + 1}`);
        return;
      }
      const lineAmount = parseFloat(line.amount || "0");
      if (!Number.isFinite(lineAmount) || lineAmount <= 0) {
        toast.error(`مبلغ غير صحيح في البند رقم ${idx + 1}`);
        return;
      }

      const acc = accounts.find((a: any) => a.id === parseInt(line.accountId));
      const analyticAccountsForAcc = accounts.filter(
        (a: any) => a.parentAccountId === parseInt(line.accountId) && a.isActive !== false
      );

      // إذا كان للحساب خزائن مرتبطة (حسب الربط accountId) يجب اختيار واحدة منها
      const linkedTreasuriesForAcc = (treasuries || []).filter(
        (t: any) => t.accountId === parseInt(line.accountId)
      );
      if (linkedTreasuriesForAcc.length > 0 && !line.analyticTreasuryId) {
        toast.error(`يرجى اختيار الحساب التحليلي (الخزينة) في البند رقم ${idx + 1}`);
        return;
      }

      // إذا كان الحساب يتطلب تحليلي (وفق إعدادات الدليل) ولم يتم اختيار تحليلي
      if (acc?.requiresCostCenter && linkedTreasuriesForAcc.length > 0 && !line.analyticTreasuryId) {
        toast.error(`هذا الحساب يتطلب حساب تحليلي في البند رقم ${idx + 1}`);
        return;
      }
    }

    const buildLines = () =>
      lines.map((l) => ({
        accountType: l.accountType,
        accountSubTypeId: l.accountSubTypeId ? parseInt(l.accountSubTypeId) : undefined,
        accountId: parseInt(l.accountId),
        analyticAccountId: l.analyticAccountId ? parseInt(l.analyticAccountId) : undefined,
        analyticTreasuryId: l.analyticTreasuryId ? parseInt(l.analyticTreasuryId) : undefined,
        description: l.description,
        amount: l.amount,
      }));

    const createPayload = {
      businessId: 1,
      subSystemId: id || 0,
      voucherNumber: formData.voucherNumber.trim() || undefined,
      voucherDate: formData.voucherDate,
      amount: totalAmountStr,
      treasuryId: parseInt(formData.treasuryId),
      currency: voucherCurrency,
      destinationType: formData.destinationType,
      destinationName: formData.destinationType !== "intermediary" ? formData.destinationName : undefined,
      destinationIntermediaryId:
        formData.destinationType === "intermediary"
          ? parseInt(formData.destinationIntermediaryId)
          : undefined,
      description: formData.description,
      lines: buildLines(),
    };

    const updatePayload = {
      id: editingVoucherId!,
      voucherNumber: formData.voucherNumber.trim() || undefined,
      voucherDate: formData.voucherDate,
      amount: totalAmountStr,
      treasuryId: parseInt(formData.treasuryId),
      destinationType: formData.destinationType,
      destinationName: formData.destinationType !== "intermediary" ? formData.destinationName : undefined,
      destinationIntermediaryId:
        formData.destinationType === "intermediary"
          ? parseInt(formData.destinationIntermediaryId)
          : undefined,
      description: formData.description,
      lines: buildLines(),
    };

    if (editingVoucherId) {
      updateMutation.mutate(updatePayload as any);
    } else {
      createMutation.mutate(createPayload as any);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 ml-1" />
            مؤكد
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="h-3 w-3 ml-1" />
            مسودة
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 ml-1" />
            ملغي
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredVouchers = (paymentVouchers ?? []).filter((voucher: any) => {
    const matchesSearch = 
      voucher.voucherNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.destinationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || voucher.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const viewVoucher = selectedVoucher
    ? { ...selectedVoucher, ...(paymentVoucherDetails ?? {}) }
    : paymentVoucherDetails;
  const viewLines: any[] = (paymentVoucherDetails as any)?.lines || [];

  const handleView = (voucher: any) => {
    setSelectedVoucher(voucher);
    setIsViewDialogOpen(true);
  };

  const handlePrint = (voucher: any) => {
    setPrintVoucherId(voucher.id);
  };

  const handleEdit = (voucher: any) => {
    if (voucher.status !== "draft") {
      toast.error("لا يمكن تعديل السند إلا وهو في حالة مسودة. أعده لمسودة أولاً.");
      return;
    }
    setEditingVoucherId(voucher.id);
    setIsAddDialogOpen(true);
  };

  const handleConfirm = (voucher: any) => {
    if (voucher.status === "confirmed") {
      toast.info("السند مؤكد بالفعل");
      return;
    }
    confirmMutation.mutate({ id: voucher.id } as any);
  };

  const handleDelete = (voucher: any) => {
    if (voucher.status !== "draft") {
      toast.error("لا يمكن حذف سند غير مسودة");
      return;
    }
    if (deleteConfirmTimer.current) {
      clearTimeout(deleteConfirmTimer.current);
      deleteConfirmTimer.current = null;
    }
    if (deleteConfirmId !== voucher.id) {
      setDeleteConfirmId(voucher.id);
      toast.warning("اضغط حذف مرة أخرى لتأكيد الحذف");
      deleteConfirmTimer.current = setTimeout(() => {
        setDeleteConfirmId(null);
      }, 5000);
      return;
    }
    setDeleteConfirmId(null);
    toast.info("جاري حذف السند...");
    deleteMutation.mutate({ id: voucher.id } as any);
  };

  const handleRevert = (voucher: any) => {
    if (voucher.status !== "confirmed") {
      toast.info("الإرجاع متاح فقط للسند المؤكد");
      return;
    }
    revertMutation.mutate({ id: voucher.id } as any);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
            <ArrowDownCircle className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">سندات الصرف</h1>
            <p className="text-zinc-400 text-sm">{subSystem?.nameAr || "النظام الفرعي"}</p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/30"
        >
          <Plus className="h-4 w-4 ml-2" />
          إنشاء سند صرف
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/20 to-rose-600/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400">إجمالي الصرف</p>
                <p className="text-2xl font-bold text-white">
                  {paymentVouchers
                    ?.filter((v: any) => v.status === "confirmed")
                    .reduce((sum: number, v: any) => sum + parseFloat(v.amount || "0"), 0)
                    .toLocaleString("ar-SA")} 
                </p>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">سندات مؤكدة</p>
                <p className="text-2xl font-bold text-white">
                  {paymentVouchers?.filter((v: any) => v.status === "confirmed").length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-400">سندات معلقة</p>
                <p className="text-2xl font-bold text-white">
                  {paymentVouchers?.filter((v: any) => v.status === "draft").length || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-400">إجمالي السندات</p>
                <p className="text-2xl font-bold text-white">
                  {paymentVouchers?.length || 0}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="بحث برقم السند أو اسم المستفيد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-zinc-800/50 border-zinc-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-zinc-800/50 border-zinc-700 text-white">
                <SelectValue placeholder="حالة السند" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => refetchVouchers()}
              className="border-zinc-700 text-zinc-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Receipt className="h-5 w-5 text-red-400" />
            قائمة سندات الصرف
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vouchersError ? (
            <div className="text-center py-8 text-red-400">
              حدث خطأ في تحميل السندات: {vouchersError.message}
            </div>
          ) : vouchersLoading ? (
            <div className="text-center py-8 text-zinc-500">جاري التحميل...</div>
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد سندات صرف</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400 text-right">رقم السند</TableHead>
                    <TableHead className="text-zinc-400 text-right">التاريخ</TableHead>
                    <TableHead className="text-zinc-400 text-right">المستفيد</TableHead>
                    <TableHead className="text-zinc-400 text-right">الخزينة</TableHead>
                    <TableHead className="text-zinc-400 text-right">المبلغ</TableHead>
                    <TableHead className="text-zinc-400 text-right">الحالة</TableHead>
                    <TableHead className="text-zinc-400 text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVouchers.map((voucher: any) => (
                    <TableRow key={voucher.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="text-white font-medium">
                        {voucher.voucherNumber}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {new Date(voucher.voucherDate || voucher.createdAt).toLocaleDateString("ar-SA")}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          {voucher.destinationType === "person" ? (
                            <User className="h-4 w-4 text-blue-400" />
                          ) : voucher.destinationType === "company" ? (
                            <Building2 className="h-4 w-4 text-purple-400" />
                          ) : (
                            <Wallet className="h-4 w-4 text-orange-400" />
                          )}
                          {voucher.destinationName || "حساب وسيط"}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {voucher.treasury?.nameAr || "-"}
                      </TableCell>
                      <TableCell className="text-red-400 font-bold">
                        {parseFloat(voucher.amount).toLocaleString("ar-SA")}{" "}
                        {voucher.currencyData?.code || voucher.currency || ""}
                      </TableCell>
                      <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-zinc-400 hover:text-white"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleView(voucher)}>
                              <Eye className="h-4 w-4 ml-2" />
                              عرض
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handlePrint(voucher)}>
                              <Printer className="h-4 w-4 ml-2" />
                              طباعة
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              disabled={voucher.status !== "draft"}
                              onClick={() => handleEdit(voucher)}
                            >
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem
                              className="cursor-pointer text-green-400 focus:text-green-300"
                              disabled={voucher.status !== "draft" || confirmMutation.isPending}
                              onClick={() => handleConfirm(voucher)}
                            >
                              <Check className="h-4 w-4 ml-2" />
                              تأكيد
                            </DropdownMenuItem>
                            {voucher.status === "confirmed" && (
                              <DropdownMenuItem
                                className="cursor-pointer text-amber-400 focus:text-amber-300"
                                disabled={revertMutation.isPending}
                                onClick={() => handleRevert(voucher)}
                              >
                                <RefreshCw className="h-4 w-4 ml-2" />
                                إرجاع لمسودة
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem
                              className="cursor-pointer text-red-400 focus:text-red-300"
                              disabled={voucher.status !== "draft" || deleteMutation.isPending}
                              onClick={() => handleDelete(voucher)}
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
            setIsAddDialogOpen(false);
          } else {
            setIsAddDialogOpen(true);
          }
        }}
      >
        <DialogContent
          className="bg-zinc-900 border-zinc-800 text-white w-[96vw] max-w-[96vw] sm:max-w-[96vw] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => {
            // منع الإغلاق بالخطأ أثناء التعديل
            if (editingVoucherId) e.preventDefault();
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800/70">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ArrowDownCircle className="h-6 w-6 text-red-400" />
              {editingVoucherId ? "تعديل سند صرف" : "إنشاء سند صرف جديد"}
            </DialogTitle>
            <p className="text-sm text-zinc-400">
              اختر نوع الخزينة ثم الخزينة والعملة، وبعدها أدخل بيانات المستفيد والمبلغ.
            </p>
          </DialogHeader>

          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voucher Number */}
            <div className="space-y-2">
              <Label className="text-zinc-400">رقم السند</Label>
              <Input
                value={formData.voucherNumber}
                onChange={(e) => setFormData({ ...formData, voucherNumber: e.target.value })}
                placeholder="يمكن تعديله أو تركه فارغاً للتوليد التلقائي"
                className="bg-zinc-800/50 border-zinc-700 text-white"
              />
            </div>

            {/* Treasury Selection */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-zinc-400">نوع الخزينة</Label>
              <Select
                value={treasuryTypeFilter}
                onValueChange={(value) => {
                  setTreasuryTypeFilter(value as TreasuryTypeFilter);
                  setFormData((prev) => ({ ...prev, treasuryId: "", currencyCode: "" }));
                }}
              >
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                  <SelectValue placeholder="اختر نوع الخزينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="cash">صندوق</SelectItem>
                  <SelectItem value="bank">بنك</SelectItem>
                  <SelectItem value="wallet">محفظة</SelectItem>
                  <SelectItem value="exchange">صراف</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Treasury Selection */}
            <div className="space-y-2">
              <Label className="text-zinc-400">الخزينة *</Label>
              <Select
                value={formData.treasuryId}
                onValueChange={(value) => {
                  const treasuryIdNum = parseInt(value);
                  const treasury = treasuries?.find((t: any) => t.id === treasuryIdNum);
                  const defaultCurrencyCode: string | undefined = treasury?.defaultCurrency || treasury?.currencies?.[0];

                  setFormData((prev) => ({
                    ...prev,
                    treasuryId: value,
                    currencyCode: defaultCurrencyCode || "",
                  }));
                }}
              >
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                  <SelectValue placeholder="اختر الخزينة" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTreasuries?.map((treasury: any) => (
                    <SelectItem key={treasury.id} value={treasury.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        {treasury.nameAr} ({treasury.code})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Currency Selection */}
            <div className="space-y-2">
              <Label className="text-zinc-400">العملة</Label>
              <Select
                value={formData.currencyCode}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, currencyCode: value }))}
                disabled={!formData.treasuryId || treasuryCurrencyCodes.length === 0}
              >
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                  <SelectValue placeholder="اختر العملة" />
                </SelectTrigger>
                <SelectContent>
                  {treasuryCurrencyCodes.map((code) => (
                    <SelectItem key={code} value={code}>
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        {code}
                        {defaultTreasuryCurrencyCode === code && (
                          <Badge className="mr-2 text-xs">افتراضي</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Total (computed from lines) */}
            <div className="space-y-2">
              <Label className="text-zinc-400">إجمالي السند</Label>
              <div className="h-10 px-3 flex items-center justify-between rounded-md bg-zinc-800/50 border border-zinc-700">
                <span className="text-white font-bold">
                  {linesTotal.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-zinc-400 text-sm">{voucherCurrency}</span>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-zinc-400">التاريخ</Label>
              <Input
                type="date"
                value={formData.voucherDate}
                onChange={(e) => setFormData({ ...formData, voucherDate: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>

            {/* Destination Type */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-zinc-400">نوع المستفيد *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.destinationType === "person" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, destinationType: "person", destinationIntermediaryId: "" })}
                  className={cn(
                    "flex-1",
                    formData.destinationType === "person"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "border-zinc-700 text-zinc-400"
                  )}
                >
                  <User className="h-4 w-4 ml-2" />
                  شخص
                </Button>
                <Button
                  type="button"
                  variant={formData.destinationType === "company" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, destinationType: "company", destinationIntermediaryId: "" })}
                  className={cn(
                    "flex-1",
                    formData.destinationType === "company"
                      ? "bg-purple-500 hover:bg-purple-600"
                      : "border-zinc-700 text-zinc-400"
                  )}
                >
                  <Building2 className="h-4 w-4 ml-2" />
                  شركة
                </Button>
                <Button
                  type="button"
                  variant={formData.destinationType === "intermediary" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, destinationType: "intermediary", destinationName: "" })}
                  className={cn(
                    "flex-1",
                    formData.destinationType === "intermediary"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "border-zinc-700 text-zinc-400"
                  )}
                >
                  <Wallet className="h-4 w-4 ml-2" />
                  حساب وسيط
                </Button>
              </div>
            </div>

            {/* Destination Name or Intermediary */}
            {formData.destinationType !== "intermediary" ? (
              <div className="space-y-2 md:col-span-2">
                <Label className="text-zinc-400">
                  {formData.destinationType === "person" ? "اسم الشخص" : "اسم الشركة"} *
                </Label>
                <Input
                  placeholder={formData.destinationType === "person" ? "أدخل اسم الشخص" : "أدخل اسم الشركة"}
                  value={formData.destinationName}
                  onChange={(e) => setFormData({ ...formData, destinationName: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>
            ) : (
              <div className="space-y-2 md:col-span-2">
                <Label className="text-zinc-400">الحساب الوسيط *</Label>
                <Select
                  value={formData.destinationIntermediaryId}
                  onValueChange={(value) => setFormData({ ...formData, destinationIntermediaryId: value })}
                >
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                    <SelectValue placeholder="اختر الحساب الوسيط" />
                  </SelectTrigger>
                  <SelectContent>
                    {intermediaryAccounts?.map((account: any) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Voucher Lines (Multi distribution) */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">بنود سند الصرف (توزيع المبلغ)</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLine}
                  className="border-zinc-700 text-zinc-300 hover:text-white"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة بند
                </Button>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-400 text-right min-w-[160px]">نوع الحساب</TableHead>
                      <TableHead className="text-zinc-400 text-right min-w-[180px]">النوع الفرعي</TableHead>
                      <TableHead className="text-zinc-400 text-right min-w-[260px]">الحساب (الدليل)</TableHead>
                      <TableHead className="text-zinc-400 text-right min-w-[220px]">الحساب التحليلي</TableHead>
                      <TableHead className="text-zinc-400 text-right min-w-[240px]">البيان</TableHead>
                      <TableHead className="text-zinc-400 text-right min-w-[140px]">المبلغ</TableHead>
                      <TableHead className="text-zinc-400 text-right w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => {
                      const preferredSubTypes = accountSubTypes.filter((st: any) => {
                        const stType = (st as any).accountType;
                        return !stType || stType === line.accountType;
                      });
                      // إذا لم يكن هناك ربط مباشر بين النوع والنوع الفرعي في البيانات، اعرض كل الأنواع الفرعية
                      const subTypesForType = preferredSubTypes.length > 0 ? preferredSubTypes : accountSubTypes;

                      const accountsForLine = accounts
                        .filter((acc: any) => {
                          if (acc.accountType !== line.accountType) return false;
                          if (line.accountSubTypeId) {
                            return acc.accountSubTypeId === parseInt(line.accountSubTypeId);
                          }
                          return true;
                        })
                        .filter((acc: any) => acc.allowManualEntry !== false);

                      const selectedAccount = accounts.find((a: any) => a.id === parseInt(line.accountId));

                      const analyticAccountsForLine = line.accountId
                        ? accounts
                            .filter((a: any) => a.parentAccountId === parseInt(line.accountId) && a.isActive !== false)
                            .filter((a: any) => a.allowManualEntry !== false)
                        : [];

                      // الخزائن المرتبطة بالحساب (عبر accountId)
                      const linkedTreasuries = line.accountId
                        ? (treasuries || []).filter((t: any) => t.accountId === parseInt(line.accountId))
                        : [];

                      // فلترة حسب نوع الخزينة من النوع الفرعي إن أمكن
                      const subTypeObj = line.accountSubTypeId
                        ? accountSubTypes.find((st: any) => st.id === parseInt(line.accountSubTypeId))
                        : null;
                      const subTypeCode = subTypeObj?.code as string | undefined;

                      const linkedTreasuriesByType = subTypeCode
                        ? linkedTreasuries.filter((t: any) => t.treasuryType === subTypeCode)
                        : linkedTreasuries;

                      const analyticTreasuriesForLine =
                        linkedTreasuriesByType.length > 0 ? linkedTreasuriesByType : linkedTreasuries;

                      const requiresAnalytic =
                        !!selectedAccount?.requiresCostCenter && analyticTreasuriesForLine.length > 0;

                      return (
                        <TableRow key={line.key} className="border-zinc-800 align-top">
                          {/* Account Type */}
                          <TableCell className="py-3">
                            <Select
                              value={line.accountType}
                              onValueChange={(value) =>
                                updateLine(line.key, {
                                  accountType: value,
                                  accountSubTypeId: "",
                                  accountId: "",
                                  analyticAccountId: "",
                                  analyticTreasuryId: "",
                                })
                              }
                              disabled={accountsLoading}
                            >
                              <SelectTrigger className="bg-zinc-900/60 border-zinc-800 text-white">
                                <SelectValue placeholder="اختر النوع" />
                              </SelectTrigger>
                              <SelectContent>
                                {accountTypes.map((t: any) => {
                                  const value = t.typeCode ?? t.value;
                                  const label = t.typeNameAr ?? t.label ?? value;
                                  return (
                                    <SelectItem key={value} value={String(value)}>
                                      {label}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          {/* Account Sub Type */}
                          <TableCell className="py-3">
                            <Select
                              value={line.accountSubTypeId}
                              onValueChange={(value) =>
                                updateLine(line.key, {
                                  accountSubTypeId: value,
                                  accountId: "",
                                  analyticAccountId: "",
                                  analyticTreasuryId: "",
                                })
                              }
                              disabled={!line.accountType || accountsLoading}
                            >
                              <SelectTrigger className="bg-zinc-900/60 border-zinc-800 text-white">
                                <SelectValue placeholder="اختر النوع الفرعي" />
                              </SelectTrigger>
                              <SelectContent>
                                {subTypesForType.map((st: any) => (
                                  <SelectItem key={st.id} value={String(st.id)}>
                                    {st.nameAr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          {/* Account (Chart) */}
                          <TableCell className="py-3">
                            <Select
                              value={line.accountId}
                              onValueChange={(value) =>
                                updateLine(line.key, {
                                  accountId: value,
                                  analyticAccountId: "",
                                  analyticTreasuryId: "",
                                })
                              }
                              disabled={!line.accountType || accountsLoading}
                            >
                              <SelectTrigger className="bg-zinc-900/60 border-zinc-800 text-white">
                                <SelectValue placeholder="اختر الحساب" />
                              </SelectTrigger>
                              <SelectContent>
                                {accountsForLine.map((acc: any) => (
                                  <SelectItem key={acc.id} value={String(acc.id)}>
                                    {acc.accountCode} - {acc.accountNameAr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          {/* Analytic Account (linked to selected chart account) */}
                          <TableCell className="py-3">
                            <Select
                              value={line.analyticTreasuryId}
                              onValueChange={(value) => updateLine(line.key, { analyticTreasuryId: value })}
                              disabled={!line.accountId || analyticTreasuriesForLine.length === 0}
                            >
                              <SelectTrigger className={cn(
                                "bg-zinc-900/60 border-zinc-800 text-white",
                                requiresAnalytic && "border-red-500/50"
                              )}>
                                <SelectValue
                                  placeholder={
                                    !line.accountId
                                      ? "اختر الحساب أولاً"
                                      : analyticTreasuriesForLine.length === 0
                                        ? "لا يوجد"
                                        : requiresAnalytic
                                          ? "مطلوب"
                                          : "اختياري"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {analyticTreasuriesForLine.map((t: any) => (
                                  <SelectItem key={t.id} value={String(t.id)}>
                                    {t.nameAr} ({t.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          {/* Statement */}
                          <TableCell className="py-3">
                            <Input
                              value={line.description}
                              onChange={(e) => updateLine(line.key, { description: e.target.value })}
                              placeholder="البيان..."
                              className="bg-zinc-900/60 border-zinc-800 text-white"
                            />
                          </TableCell>

                          {/* Amount */}
                          <TableCell className="py-3">
                            <Input
                              type="number"
                              value={line.amount}
                              onChange={(e) => updateLine(line.key, { amount: e.target.value })}
                              placeholder="0.00"
                              className="bg-zinc-900/60 border-zinc-800 text-white"
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLine(line.key)}
                              disabled={lines.length <= 1}
                              className="text-zinc-400 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>عدد البنود: {lines.length}</span>
                <span className="text-white font-bold">
                  الإجمالي: {linesTotal.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                  {voucherCurrency}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-zinc-400">البيان / الوصف</Label>
              <Textarea
                placeholder="أدخل وصف السند..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 pt-4 gap-2 border-t border-zinc-800/70">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
              className="border-zinc-700 text-zinc-400"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "جاري الحفظ..."
                : editingVoucherId
                  ? "تحديث السند"
                  : "إنشاء السند"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white w-[96vw] max-w-[96vw] sm:max-w-[96vw] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800/70">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-red-400" />
              تفاصيل سند الصرف
            </DialogTitle>
          </DialogHeader>

          {viewVoucher && (
            <div className="space-y-6 px-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-zinc-500 text-sm">رقم السند</p>
                  <p className="text-white font-bold">{viewVoucher.voucherNumber}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">التاريخ</p>
                  <p className="text-white">
                    {new Date(viewVoucher.voucherDate || viewVoucher.createdAt).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">المبلغ</p>
                  <p className="text-red-400 font-bold text-lg">
                    {parseFloat(viewVoucher.amount).toLocaleString("ar-SA")}{" "}
                    {viewVoucher.currencyData?.code || viewVoucher.currency || ""}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">الحالة</p>
                  {getStatusBadge(viewVoucher.status)}
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">الخزينة</p>
                  <p className="text-white">{viewVoucher.treasury?.nameAr || "-"}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">المستفيد</p>
                  <p className="text-white">{viewVoucher.destinationName || "حساب وسيط"}</p>
                </div>
              </div>

              {voucherDetailsLoading && (
                <div className="text-center text-zinc-500">جاري تحميل البنود...</div>
              )}

              {viewLines.length > 0 && (
                <div className="space-y-3">
                  <p className="text-zinc-300 font-semibold">بنود السند</p>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-800">
                          <TableHead className="text-zinc-400 text-right w-[60px]">#</TableHead>
                          <TableHead className="text-zinc-400 text-right min-w-[160px]">نوع الحساب</TableHead>
                          <TableHead className="text-zinc-400 text-right min-w-[180px]">النوع الفرعي</TableHead>
                          <TableHead className="text-zinc-400 text-right min-w-[260px]">الحساب</TableHead>
                          <TableHead className="text-zinc-400 text-right min-w-[220px]">الحساب التحليلي</TableHead>
                          <TableHead className="text-zinc-400 text-right min-w-[260px]">البيان</TableHead>
                          <TableHead className="text-zinc-400 text-right min-w-[140px]">المبلغ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewLines.map((l: any, idx: number) => {
                          const typeItem = accountTypes.find((t: any) => (t.typeCode ?? t.value) === l.accountType);
                          const typeLabel = typeItem ? (typeItem.typeNameAr ?? typeItem.label ?? l.accountType) : (l.accountType || "-");
                          const subType = accountSubTypes.find((st: any) => st.id === l.accountSubTypeId);
                          const acc = accounts.find((a: any) => a.id === l.accountId);
                          const analyticAcc = accounts.find((a: any) => a.id === l.analyticAccountId);
                          const analyticTreasury = (treasuries || []).find((t: any) => t.id === l.analyticTreasuryId);

                          return (
                            <TableRow key={l.id ?? idx} className="border-zinc-800">
                              <TableCell className="text-zinc-500">{idx + 1}</TableCell>
                              <TableCell className="text-white">{typeLabel}</TableCell>
                              <TableCell className="text-zinc-300">{subType?.nameAr || "-"}</TableCell>
                              <TableCell className="text-zinc-300">
                                {acc ? `${acc.accountCode} - ${acc.accountNameAr}` : l.accountId}
                              </TableCell>
                              <TableCell className="text-zinc-300">
                                {analyticTreasury
                                  ? `${analyticTreasury.nameAr} (${analyticTreasury.code})`
                                  : analyticAcc
                                    ? `${analyticAcc.accountCode} - ${analyticAcc.accountNameAr}`
                                    : l.analyticTreasuryId || l.analyticAccountId || "-"}
                              </TableCell>
                              <TableCell className="text-zinc-300">{l.description || "-"}</TableCell>
                              <TableCell className="text-white font-bold">
                                {parseFloat(l.amount || "0").toLocaleString("ar-SA")}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-zinc-800/70 text-sm text-zinc-400">
                <span>
                  عدد مرات التعديل:{" "}
                  <span className="text-white font-semibold">{viewVoucher.editCount ?? 0}</span>
                </span>
                <span>
                  آخر تعديل:{" "}
                  <span className="text-white font-semibold">
                    {viewVoucher.updatedAt ? new Date(viewVoucher.updatedAt).toLocaleString("ar-SA") : "—"}
                  </span>
                </span>
              </div>

              {viewVoucher.description && (
                <div>
                  <p className="text-zinc-500 text-sm">البيان</p>
                  <p className="text-white">{viewVoucher.description}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="px-6 pb-6 pt-4 border-t border-zinc-800/70">
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className="border-zinc-700 text-zinc-400"
            >
              إغلاق
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
