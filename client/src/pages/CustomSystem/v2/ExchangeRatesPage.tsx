/**
 * النظام المخصص v2.2.0 - صفحة أسعار الصرف
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
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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
  currencyCode: string;
  currencyNameAr: string;
  currencySymbol: string;
}

interface ExchangeRate {
  id: number;
  businessId: number;
  fromCurrencyId: number;
  toCurrencyId: number;
  rate: string;
  effectiveDate: string;
  expiryDate: string | null;
  notes: string | null;
  createdAt: string;
}

interface ExchangeRateFormData {
  fromCurrencyId: number;
  toCurrencyId: number;
  rate: string;
  effectiveDate: string;
  expiryDate: string;
  notes: string;
}

const initialFormData: ExchangeRateFormData = {
  fromCurrencyId: 0,
  toCurrencyId: 0,
  rate: "",
  effectiveDate: new Date().toISOString().split("T")[0],
  expiryDate: "",
  notes: "",
};

export default function ExchangeRatesPage() {
  const { user } = useAuth();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRateId, setCurrentRateId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ExchangeRateFormData>(initialFormData);

  useEffect(() => {
    fetchCurrencies();
    fetchExchangeRates();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get("/api/custom-system/v2/currencies", {
        params: { isActive: true },
      });
      setCurrencies(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في تحميل العملات");
    }
  };

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/custom-system/v2/exchange-rates");
      setExchangeRates(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في تحميل أسعار الصرف");
    } finally {
      setLoading(false);
    }
  };

  const getCurrencyName = (currencyId: number) => {
    const currency = currencies.find((c) => c.id === currencyId);
    return currency ? `${currency.currencyNameAr} (${currency.currencyCode})` : "-";
  };

  const handleOpenDialog = (rate?: ExchangeRate) => {
    if (rate) {
      setEditMode(true);
      setCurrentRateId(rate.id);
      setFormData({
        fromCurrencyId: rate.fromCurrencyId,
        toCurrencyId: rate.toCurrencyId,
        rate: rate.rate,
        effectiveDate: rate.effectiveDate,
        expiryDate: rate.expiryDate || "",
        notes: rate.notes || "",
      });
    } else {
      setEditMode(false);
      setCurrentRateId(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentRateId(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editMode && currentRateId) {
        await axios.put(`/api/custom-system/v2/exchange-rates/${currentRateId}`, formData);
        setSuccess("تم تحديث سعر الصرف بنجاح");
      } else {
        await axios.post("/api/custom-system/v2/exchange-rates", formData);
        setSuccess("تم إضافة سعر الصرف بنجاح");
      }
      handleCloseDialog();
      fetchExchangeRates();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في حفظ سعر الصرف");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف سعر الصرف؟")) {
      return;
    }

    try {
      await axios.delete(`/api/custom-system/v2/exchange-rates/${id}`);
      setSuccess("تم حذف سعر الصرف بنجاح");
      fetchExchangeRates();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في حذف سعر الصرف");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          أسعار الصرف
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchExchangeRates}
            sx={{ mr: 2 }}
          >
            تحديث
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            إضافة سعر صرف
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
                  <TableCell>من عملة</TableCell>
                  <TableCell>إلى عملة</TableCell>
                  <TableCell align="center">السعر</TableCell>
                  <TableCell>تاريخ السريان</TableCell>
                  <TableCell>تاريخ الانتهاء</TableCell>
                  <TableCell>ملاحظات</TableCell>
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
                ) : exchangeRates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      لا توجد أسعار صرف
                    </TableCell>
                  </TableRow>
                ) : (
                  exchangeRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{getCurrencyName(rate.fromCurrencyId)}</TableCell>
                      <TableCell>{getCurrencyName(rate.toCurrencyId)}</TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {parseFloat(rate.rate).toFixed(6)}
                        </Typography>
                      </TableCell>
                      <TableCell>{rate.effectiveDate}</TableCell>
                      <TableCell>{rate.expiryDate || "-"}</TableCell>
                      <TableCell>{rate.notes || "-"}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(rate)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(rate.id)}
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
        <DialogTitle>{editMode ? "تعديل سعر صرف" : "إضافة سعر صرف جديد"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>من عملة</InputLabel>
              <Select
                name="fromCurrencyId"
                value={formData.fromCurrencyId}
                onChange={(e) => handleSelectChange("fromCurrencyId", e.target.value)}
                label="من عملة"
              >
                <MenuItem value={0}>اختر العملة</MenuItem>
                {currencies.map((currency) => (
                  <MenuItem key={currency.id} value={currency.id}>
                    {currency.currencyNameAr} ({currency.currencyCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>إلى عملة</InputLabel>
              <Select
                name="toCurrencyId"
                value={formData.toCurrencyId}
                onChange={(e) => handleSelectChange("toCurrencyId", e.target.value)}
                label="إلى عملة"
              >
                <MenuItem value={0}>اختر العملة</MenuItem>
                {currencies.map((currency) => (
                  <MenuItem key={currency.id} value={currency.id}>
                    {currency.currencyNameAr} ({currency.currencyCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="السعر"
              name="rate"
              type="number"
              value={formData.rate}
              onChange={handleInputChange}
              required
              fullWidth
              inputProps={{ step: "0.000001", min: "0" }}
            />

            <TextField
              label="تاريخ السريان"
              name="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={handleInputChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="تاريخ الانتهاء"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="ملاحظات"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
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
