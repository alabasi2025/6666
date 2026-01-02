/**
 * النظام المخصص v2.2.0 - صفحة إدارة العملات
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Divider,
  Slider,
  InputAdornment,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  LinearProgress,
  Tooltip,
  Chip as MuiChip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useAuth } from "../../../_core/hooks/useAuth";
import axios from "axios";

interface Currency {
  id: number;
  businessId: number;
  code: string;
  nameAr: string;
  nameEn: string | null;
  symbol: string | null;
  isBaseCurrency: boolean;
  isActive: boolean;
  decimalPlaces: number;
  displayOrder: number | null;
  notes: string | null;
  currentRate: string | null;
  minRate: string | null;
  maxRate: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface CurrencyFormData {
  code: string;
  nameAr: string;
  nameEn: string;
  symbol: string;
  isBaseCurrency: boolean;
  isActive: boolean;
  decimalPlaces: number;
  displayOrder: number;
  notes: string;
  currentRate: string;
  minRate: string;
  maxRate: string;
}

const initialFormData: CurrencyFormData = {
  code: "",
  nameAr: "",
  nameEn: "",
  symbol: "",
  isBaseCurrency: false,
  isActive: true,
  decimalPlaces: 2,
  displayOrder: 0,
  notes: "",
  currentRate: "",
  minRate: "",
  maxRate: "",
};

export default function CurrenciesPage() {
  const { user } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [sortBy, setSortBy] = useState<"display_order" | "code" | "rate_desc">("display_order");

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCurrencyId, setCurrentCurrencyId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CurrencyFormData>(initialFormData);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  // حساب العملة الأساسية بعد تحميل العملات
  const baseCurrency = currencies.find((c) => c.isBaseCurrency);
  const baseCode = baseCurrency?.code || "YER";

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/custom-system/v2/currencies");
      setCurrencies(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في تحميل العملات");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (currency?: Currency) => {
    if (currency) {
      setEditMode(true);
      setCurrentCurrencyId(currency.id);
      setFormData({
        code: currency.code,
        nameAr: currency.nameAr,
        nameEn: currency.nameEn || "",
        symbol: currency.symbol || "",
        isBaseCurrency: currency.isBaseCurrency,
        isActive: currency.isActive,
        decimalPlaces: currency.decimalPlaces ?? 2,
        displayOrder: currency.displayOrder ?? 0,
        notes: currency.notes || "",
        currentRate: currency.currentRate || "",
        minRate: currency.minRate || "",
        maxRate: currency.maxRate || "",
      });
    } else {
      setEditMode(false);
      setCurrentCurrencyId(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentCurrencyId(null);
    setFormData(initialFormData);
  };

  const setField = (name: keyof CurrencyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredCurrencies = currencies
    .filter((c) => {
      const term = search.trim().toLowerCase();
      const match =
        !term ||
        c.code.toLowerCase().includes(term) ||
        c.nameAr.toLowerCase().includes(term) ||
        (c.nameEn || "").toLowerCase().includes(term) ||
        (c.symbol || "").toLowerCase().includes(term);
      const activeOk = showOnlyActive ? c.isActive : true;
      return match && activeOk;
    })
    .sort((a, b) => {
      if (sortBy === "rate_desc") {
        const ra = Number(a.currentRate || 0);
        const rb = Number(b.currentRate || 0);
        return rb - ra;
      }
      if (sortBy === "code") return a.code.localeCompare(b.code);
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });

  const shimmerRows = Array.from({ length: 4 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    if (name === "code") {
      setField("code", value.toUpperCase().trim());
      return;
    }
    if (["decimalPlaces", "displayOrder"].includes(name)) {
      setField(name as keyof CurrencyFormData, value === "" ? "" : Number(value));
      return;
    }
    setField(name as keyof CurrencyFormData, type === "checkbox" ? checked : value);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.code || !formData.nameAr) {
        setError("الرجاء إدخال رمز العملة والاسم بالعربية");
        return;
      }
      if (!formData.isBaseCurrency && !formData.currentRate) {
        setError("أدخل السعر الحالي مقابل العملة الأساسية أو اجعلها أساسية");
        return;
      }
      if (editMode && currentCurrencyId) {
        await axios.put(`/api/custom-system/v2/currencies/${currentCurrencyId}`, formData);
        setSuccess("تم تحديث العملة بنجاح");
      } else {
        await axios.post("/api/custom-system/v2/currencies", formData);
        setSuccess("تم إضافة العملة بنجاح");
      }
      handleCloseDialog();
      fetchCurrencies();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في حفظ العملة");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه العملة؟")) {
      return;
    }

    try {
      await axios.delete(`/api/custom-system/v2/currencies/${id}`);
      setSuccess("تم حذف العملة بنجاح");
      fetchCurrencies();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في حذف العملة");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card
        sx={{
          mb: 3,
          overflow: "hidden",
          position: "relative",
          background: "linear-gradient(135deg, #0b1220 0%, #0f172a 50%, #0a0f1d 100%)",
          color: "#ffffff",
        }}
      >
        <CardMedia
          component="div"
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.02,
            background:
              "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.35), transparent 25%), radial-gradient(circle at 80% 10%, rgba(167,139,250,0.35), transparent 25%), radial-gradient(circle at 50% 80%, rgba(52,211,153,0.28), transparent 30%)",
          }}
        />
        <CardHeader
          title="إدارة العملات وأسعار الصرف"
          subheader={`الأساس: ${baseCode} — تصميم متطور بدقة عالية`}
          sx={{ position: "relative", zIndex: 1, color: "#e5e7eb",
            "& .MuiCardHeader-subheader": { color: "#e2e8f0" },
            "& .MuiCardHeader-title": { color: "#ffffff" },
          }}
        />
        <CardContent sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
              <TextField
                fullWidth
                placeholder="بحث سريع: رمز، اسم، رمز مختصر..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">🔍</InputAdornment>,
                  sx: { color: "#f8fafc" },
                }}
                sx={{
                  "& .MuiInputBase-input": { color: "#ffffff" },
                  "& .MuiInputLabel-root": { color: "#cbd5e1" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#38bdf8" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#38bdf8" },
                  backgroundColor: "#0f172a",
                }}
              />
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 220 }}>
                <MuiChip
                  label="نشط فقط"
                  color={showOnlyActive ? "success" : "default"}
                  variant={showOnlyActive ? "filled" : "outlined"}
                  onClick={() => setShowOnlyActive((p) => !p)}
                  clickable
                />
                <MuiChip
                  label={sortBy === "rate_desc" ? "فرز بالسعر" : sortBy === "code" ? "فرز بالكود" : "فرز بالترتيب"}
                  variant="outlined"
                  onClick={() => {
                    if (sortBy === "display_order") setSortBy("rate_desc");
                    else if (sortBy === "rate_desc") setSortBy("code");
                    else setSortBy("display_order");
                  }}
                  clickable
                />
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchCurrencies}>
                تحديث
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                إضافة عملة
              </Button>
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 3 }}>
            <Card sx={{ flex: 1, bgcolor: "#0b1727", borderColor: "#1f2a3a" }} variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="info.main">
                  العملة الأساسية
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ color: "#7dd3fc" }}>
                  {baseCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  تُستخدم كأساس لاحتساب كل الأسعار
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: "#0b1b2c", borderColor: "#1f2f46" }} variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="success.main">
                  عدد العملات
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ color: "#ffffff" }}>
                  {currencies.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  بعد الفلترة: {filteredCurrencies.length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: "#1d1b2f", borderColor: "#2d2a4a" }} variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="warning.main">
                  تحديث الأسعار
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  أدخل أسعار دقيقة 6 منازل عشرية
                </Typography>
                <Button variant="outlined" size="small" onClick={() => fetchCurrencies()}>
                  تحديث يدوي
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ backgroundColor: "#0f172a" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#111827" }}>
                  <TableCell sx={{ color: "#ffffff", fontWeight: 700 }}>الرمز</TableCell>
                  <TableCell sx={{ color: "#ffffff", fontWeight: 700 }}>الاسم بالعربية</TableCell>
                  <TableCell sx={{ color: "#ffffff", fontWeight: 700 }}>الاسم بالإنجليزية</TableCell>
                  <TableCell sx={{ color: "#ffffff", fontWeight: 700 }}>الرمز المختصر</TableCell>
                  <TableCell sx={{ color: "#ffffff", fontWeight: 700 }} align="center">السعر الحالي مقابل {baseCode}</TableCell>
                  <TableCell sx={{ color: "#ffffff", fontWeight: 700 }} align="center">الحد الأدنى</TableCell>
                  <TableCell sx={{ color: "#ffffff", fontWeight: 700 }} align="center">الحد الأعلى</TableCell>
                  <TableCell sx={{ color: "#ffffff", fontWeight: 700 }} align="center">عملة أساسية</TableCell>
                  <TableCell sx={{ color: "#ffffff", fontWeight: 700 }} align="center">الحالة</TableCell>
                  <TableCell sx={{ color: "#ffffff", fontWeight: 700 }} align="center">الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  shimmerRows.map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={10} sx={{ backgroundColor: "#0f172a" }}>
                        <LinearProgress />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredCurrencies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ color: "#e5e7eb", backgroundColor: "#0f172a" }}>
                      لا توجد عملات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCurrencies.map((currency, idx) => (
                    <TableRow
                      key={currency.id}
                      sx={{
                        backgroundColor: idx % 2 === 0 ? "#0b1220" : "#0d1524",
                        "&:hover": { backgroundColor: "#13223b" },
                      }}
                    >
                      <TableCell sx={{ color: "#f8fafc" }}>{currency.code}</TableCell>
                      <TableCell sx={{ color: "#f8fafc" }}>{currency.nameAr}</TableCell>
                      <TableCell sx={{ color: "#e2e8f0" }}>{currency.nameEn || "-"}</TableCell>
                      <TableCell sx={{ color: "#e2e8f0" }}>{currency.symbol || "-"}</TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold" sx={{ color: "#38bdf8" }}>
                          {currency.currentRate ? parseFloat(currency.currentRate).toFixed(6) : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ color: "#f87171" }}>
                          {currency.minRate ? parseFloat(currency.minRate).toFixed(6) : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ color: "#4ade80" }}>
                          {currency.maxRate ? parseFloat(currency.maxRate).toFixed(6) : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {currency.isBaseCurrency ? (
                          <Chip label="نعم" color="primary" size="small" />
                        ) : (
                          <Chip label="لا" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {currency.isActive ? (
                          <Chip label="نشط" color="success" size="small" />
                        ) : (
                          <Chip label="غير نشط" color="error" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(currency)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(currency.id)}
                          disabled={currency.isBaseCurrency}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          {editMode ? "تعديل عملة" : "إضافة عملة جديدة"}
          <Typography variant="body2" color="text.secondary">
            أدخل البيانات بدقة، وستستخدم هذه العملة كأساس للتسعير والتقارير.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" }, gap: 2 }}>
              <Card variant="outlined">
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>معلومات أساسية</Typography>
                  <TextField
                    label="رمز العملة (ISO)"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    disabled={editMode}
                    placeholder="SAR, USD, YER"
                    helperText="3-10 أحرف كبيرة حسب معيار ISO"
                  />
                  <TextField
                    label="الاسم بالعربية"
                    name="nameAr"
                    value={formData.nameAr}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    placeholder="ريال سعودي"
                  />
                  <TextField
                    label="الاسم بالإنجليزية"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="Saudi Riyal"
                  />
                  <TextField
                    label="الرمز المختصر"
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="ر.س, $, ر.ي"
                  />
                  <TextField
                    label="ملاحظات"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="ملاحظات داخلية أو مرجع السعر"
                  />
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>التسعير مقابل {baseCode}</Typography>
                  <TextField
                    label={`السعر الحالي مقابل ${baseCode}`}
                    name="currentRate"
                    type="number"
                    value={formData.currentRate}
                    onChange={handleInputChange}
                    fullWidth
                    inputProps={{ step: "0.000001", min: "0" }}
                    placeholder="0.000000"
                    disabled={formData.isBaseCurrency}
                    helperText={formData.isBaseCurrency ? "العملة الأساسية سعرها دائماً 1" : "أدخل سعر الصرف الحالي بدقة 6 منازل"}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">{baseCode}</InputAdornment>,
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                    <TextField
                      label="الحد الأدنى (سقف سفلي)"
                      name="minRate"
                      type="number"
                      value={formData.minRate}
                      onChange={handleInputChange}
                      fullWidth
                      inputProps={{ step: "0.000001", min: "0" }}
                      placeholder="0.000000"
                      disabled={formData.isBaseCurrency}
                    />
                    <TextField
                      label="الحد الأعلى (سقف علوي)"
                      name="maxRate"
                      type="number"
                      value={formData.maxRate}
                      onChange={handleInputChange}
                      fullWidth
                      inputProps={{ step: "0.000001", min: "0" }}
                      placeholder="0.000000"
                      disabled={formData.isBaseCurrency}
                    />
                  </Box>

                  <Divider />

                  <Typography variant="subtitle2" color="text.secondary">
                    المنازل العشرية (للعرض والحساب)
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Slider
                      value={formData.decimalPlaces}
                      min={0}
                      max={6}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                      onChange={(_, val) => setField("decimalPlaces", Number(val))}
                    />
                    <TextField
                      label="منازل عشرية"
                      name="decimalPlaces"
                      type="number"
                      value={formData.decimalPlaces}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, max: 6 }}
                      sx={{ width: 120 }}
                    />
                  </Stack>

                  <TextField
                    label="ترتيب العرض"
                    name="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    inputProps={{ min: 0, max: 999 }}
                    fullWidth
                  />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="isBaseCurrency"
                          checked={formData.isBaseCurrency}
                          onChange={handleInputChange}
                        />
                      }
                      label="عملة أساسية"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                        />
                      }
                      label="نشط"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "تحديث" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
