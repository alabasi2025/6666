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
  currencyCode: string;
  currencyNameAr: string;
  currencyNameEn: string | null;
  currencySymbol: string;
  isBaseCurrency: boolean;
  isActive: boolean;
  createdAt: string;
}

interface CurrencyFormData {
  currencyCode: string;
  currencyNameAr: string;
  currencyNameEn: string;
  currencySymbol: string;
  isBaseCurrency: boolean;
  isActive: boolean;
}

const initialFormData: CurrencyFormData = {
  currencyCode: "",
  currencyNameAr: "",
  currencyNameEn: "",
  currencySymbol: "",
  isBaseCurrency: false,
  isActive: true,
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
        currencyCode: currency.currencyCode,
        currencyNameAr: currency.currencyNameAr,
        currencyNameEn: currency.currencyNameEn || "",
        currencySymbol: currency.currencySymbol,
        isBaseCurrency: currency.isBaseCurrency,
        isActive: currency.isActive,
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
          إدارة العملات
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
                  <TableCell align="center">عملة أساسية</TableCell>
                  <TableCell align="center">الحالة</TableCell>
                  <TableCell align="center">الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : currencies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      لا توجد عملات
                    </TableCell>
                  </TableRow>
                ) : (
                  currencies.map((currency) => (
                    <TableRow key={currency.id}>
                      <TableCell>{currency.currencyCode}</TableCell>
                      <TableCell>{currency.currencyNameAr}</TableCell>
                      <TableCell>{currency.currencyNameEn || "-"}</TableCell>
                      <TableCell>{currency.currencySymbol}</TableCell>
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "تعديل عملة" : "إضافة عملة جديدة"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="رمز العملة (ISO)"
              name="currencyCode"
              value={formData.currencyCode}
              onChange={handleInputChange}
              required
              fullWidth
              disabled={editMode}
              placeholder="SAR, USD, EUR"
            />
            <TextField
              label="الاسم بالعربية"
              name="currencyNameAr"
              value={formData.currencyNameAr}
              onChange={handleInputChange}
              required
              fullWidth
              placeholder="ريال سعودي"
            />
            <TextField
              label="الاسم بالإنجليزية"
              name="currencyNameEn"
              value={formData.currencyNameEn}
              onChange={handleInputChange}
              fullWidth
              placeholder="Saudi Riyal"
            />
            <TextField
              label="الرمز المختصر"
              name="currencySymbol"
              value={formData.currencySymbol}
              onChange={handleInputChange}
              required
              fullWidth
              placeholder="ر.س, $, €"
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
