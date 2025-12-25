import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { DataTable, Column, StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Wrench,
  Filter,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Asset status mapping
const assetStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  active: { label: "نشط", variant: "success" },
  idle: { label: "غير نشط", variant: "secondary" },
  maintenance: { label: "صيانة", variant: "warning" },
  disposed: { label: "مستبعد", variant: "destructive" },
  transferred: { label: "منقول", variant: "default" },
};

export default function AssetsList() {
  const [, setLocation] = useLocation();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    categoryId: "",
    stationId: "",
    description: "",
    serialNumber: "",
    model: "",
    manufacturer: "",
    purchaseDate: "",
    purchaseCost: "",
    location: "",
    status: "active",
  });

  // Fetch assets from API
  const { data: assets = [], isLoading, refetch } = trpc.assets.list.useQuery({
    businessId: 1,
    status: filterStatus !== "all" ? filterStatus : undefined,
    categoryId: filterCategory !== "all" ? parseInt(filterCategory) : undefined,
  } as any);

  // Fetch categories
  const { data: categories = [] } = trpc.assets.categories.list.useQuery({
    businessId: 1,
  } as any);

  // Fetch stations
  const { data: stations = [] } = trpc.station.list.useQuery({
    businessId: 1,
  } as any);

  // Fetch dashboard stats
  const { data: stats } = trpc.assets.dashboardStats.useQuery({
    businessId: 1,
  } as any);

  // Mutations
  const createAsset = trpc.assets.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الأصل بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة الأصل");
    },
  });

  const updateAsset = trpc.assets.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الأصل بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث الأصل");
    },
  });

  const deleteAsset = trpc.assets.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الأصل بنجاح");
      setShowDeleteDialog(false);
      setSelectedAsset(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف الأصل");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      categoryId: "",
      stationId: "",
      description: "",
      serialNumber: "",
      model: "",
      manufacturer: "",
      purchaseDate: "",
      purchaseCost: "",
      location: "",
      status: "active",
    });
    setSelectedAsset(null);
  };

  // Stats cards data
  const statsCards = [
    {
      title: "إجمالي الأصول",
      value: stats?.totalAssets?.toLocaleString() || "0",
      change: "+12%",
      trend: "up",
      icon: Package,
      color: "primary",
    },
    {
      title: "قيمة الأصول",
      value: `${((stats?.totalValue || 0) / 1000000).toFixed(1)}M`,
      change: "+8%",
      trend: "up",
      icon: TrendingUp,
      color: "success",
    },
    {
      title: "الإهلاك المتراكم",
      value: `${((stats?.totalDepreciation || 0) / 1000000).toFixed(1)}M`,
      change: "-3%",
      trend: "down",
      icon: TrendingDown,
      color: "warning",
    },
    {
      title: "الأصول النشطة",
      value: stats?.activeAssets?.toLocaleString() || "0",
      change: "+5",
      trend: "up",
      icon: Wrench,
      color: "destructive",
    },
  ];

  // Table columns
  const columns: Column<any>[] = [
    {
      key: "code",
      title: "رقم الأصل",
      render: (value) => (
        <span className="font-mono text-primary">{value}</span>
      ),
    },
    {
      key: "nameAr",
      title: "اسم الأصل",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.location || "-"}</p>
        </div>
      ),
    },
    {
      key: "categoryId",
      title: "الفئة",
      render: (value) => {
        const category = categories.find((c: any) => c.id === value);
        return category?.nameAr || "-";
      },
    },
    {
      key: "status",
      title: "الحالة",
      render: (value) => <StatusBadge status={value} statusMap={assetStatusMap} />,
    },
    {
      key: "purchaseCost",
      title: "تكلفة الشراء",
      align: "right",
      render: (value) => (
        <span className="font-mono ltr-nums">
          {value ? Number(value).toLocaleString() : "0"} ر.س
        </span>
      ),
    },
    {
      key: "currentValue",
      title: "القيمة الحالية",
      align: "right",
      render: (value) => (
        <span className="font-mono ltr-nums text-success">
          {value ? Number(value).toLocaleString() : "0"} ر.س
        </span>
      ),
    },
    {
      key: "purchaseDate",
      title: "تاريخ الشراء",
      render: (value) => value ? new Date(value).toLocaleDateString("ar-SA") : "-",
    },
  ];

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleView = (asset: any) => {
    setLocation(`/dashboard/assets/view/${asset.id}`);
  };

  const handleEdit = (asset: any) => {
    setSelectedAsset(asset);
    setFormData({
      code: asset.code || "",
      nameAr: asset.nameAr || "",
      nameEn: asset.nameEn || "",
      categoryId: asset.categoryId?.toString() || "",
      stationId: asset.stationId?.toString() || "",
      description: asset.description || "",
      serialNumber: asset.serialNumber || "",
      model: asset.model || "",
      manufacturer: asset.manufacturer || "",
      purchaseDate: asset.purchaseDate || "",
      purchaseCost: asset.purchaseCost || "",
      location: asset.location || "",
      status: asset.status || "active",
    });
    setShowAddDialog(true);
  };

