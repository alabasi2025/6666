/**
 * النظام المخصص v2.2.0 - صفحة إدارة العملات
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          إدارة العملات وأسعار الصرف (مقابل {baseCode})
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchCurrencies}
            sx={{ mr: 2 }}
          >
            تحديث
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            إضافة عملة
          </Button>
        </Box>
      </Box>

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
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الرمز</TableCell>
                  <TableCell>الاسم بالعربية</TableCell>
                  <TableCell>الاسم بالإنجليزية</TableCell>
                  <TableCell>الرمز المختصر</TableCell>
                  <TableCell align="center">السعر الحالي مقابل {baseCode}</TableCell>
                  <TableCell align="center">الحد الأدنى</TableCell>
                  <TableCell align="center">الحد الأعلى</TableCell>
                  <TableCell align="center">عملة أساسية</TableCell>
                  <TableCell align="center">الحالة</TableCell>
                  <TableCell align="center">الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : currencies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      لا توجد عملات
                    </TableCell>
                  </TableRow>
                ) : (
                  currencies.map((currency) => (
                    <TableRow key={currency.id}>
                      <TableCell>{currency.code}</TableCell>
                      <TableCell>{currency.nameAr}</TableCell>
                      <TableCell>{currency.nameEn || "-"}</TableCell>
                      <TableCell>{currency.symbol || "-"}</TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {currency.currentRate ? parseFloat(currency.currentRate).toFixed(6) : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="error">
                          {currency.minRate ? parseFloat(currency.minRate).toFixed(6) : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="success.main">
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
        <DialogTitle>{editMode ? "تعديل عملة" : "إضافة عملة جديدة"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="رمز العملة (ISO)"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              required
              fullWidth
              disabled={editMode}
              placeholder="SAR, USD, YER"
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
            <Box sx={{ display: "flex", gap: 2 }}>
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
                helperText={formData.isBaseCurrency ? "العملة الأساسية سعرها دائماً 1" : ""}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label={`الحد الأدنى (سقف سفلي) مقابل ${baseCode}`}
                name="minRate"
                type="number"
                value={formData.minRate}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ step: "0.000001", min: "0" }}
                placeholder="0.000000"
                disabled={formData.isBaseCurrency}
                helperText={formData.isBaseCurrency ? "العملة الأساسية لا تحتاج حد أدنى" : "أدنى سعر صرف مسموح"}
              />
              <TextField
                label={`الحد الأعلى (سقف علوي) مقابل ${baseCode}`}
                name="maxRate"
                type="number"
                value={formData.maxRate}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ step: "0.000001", min: "0" }}
                placeholder="0.000000"
                disabled={formData.isBaseCurrency}
                helperText={formData.isBaseCurrency ? "العملة الأساسية لا تحتاج حد أعلى" : "أعلى سعر صرف مسموح"}
              />
            </Box>
            <TextField
              label="عدد المنازل العشرية"
              name="decimalPlaces"
              type="number"
              value={formData.decimalPlaces}
              onChange={handleInputChange}
              fullWidth
              inputProps={{ min: 0, max: 6 }}
            />
            <TextField
              label="ترتيب العرض"
              name="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="ملاحظات"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
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
          </Box>
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
