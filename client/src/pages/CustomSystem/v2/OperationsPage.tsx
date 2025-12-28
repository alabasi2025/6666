/**
 * النظام المخصص v2.2.0 - شاشة العمليات الموحدة
 * (سند قبض، سند صرف، تحويل بين الحسابات)
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
  Tabs,
  Tab,
  Chip,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  SwapHoriz as TransferIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "axios";

interface Account {
  id: number;
  accountCode: string;
  accountNameAr: string;
  accountType: string;
}

interface Currency {
  id: number;
  currencyCode: string;
  currencyNameAr: string;
  currencySymbol: string;
}

interface Operation {
  id: number;
  entryNumber: string;
  entryDate: string;
  description: string;
  referenceType: string;
  referenceNumber: string;
  status: string;
  createdAt: string;
}

interface OperationFormData {
  operationType: "receipt" | "payment" | "transfer";
  operationNumber: string;
  operationDate: string;
  fromAccountId: number;
  toAccountId: number;
  amount: string;
  currencyId: number;
  exchangeRate: string;
  description: string;
  notes: string;
}

const initialFormData: OperationFormData = {
  operationType: "receipt",
  operationNumber: "",
  operationDate: new Date().toISOString().split("T")[0],
  fromAccountId: 0,
  toAccountId: 0,
  amount: "",
  currencyId: 0,
  exchangeRate: "1.000000",
  description: "",
  notes: "",
};

export default function OperationsPage() {
  const { user } = useAuth();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<OperationFormData>(initialFormData);

  useEffect(() => {
    fetchAccounts();
    fetchCurrencies();
    fetchOperations();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get("/api/custom-system/v2/accounts", {
        params: { isActive: true },
      });
      setAccounts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في تحميل الحسابات");
    }
  };

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

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/custom-system/v2/operations/recent", {
        params: { limit: 50 },
      });
      setOperations(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في تحميل العمليات");
    } finally {
      setLoading(false);
    }
  };

  const getAccountName = (accountId: number) => {
    const account = accounts.find((a) => a.id === accountId);
    return account ? `${account.accountCode} - ${account.accountNameAr}` : "-";
  };

  const getCurrencyName = (currencyId: number) => {
    const currency = currencies.find((c) => c.id === currencyId);
    return currency ? `${currency.currencyNameAr} (${currency.currencyCode})` : "-";
  };

  const handleOpenDialog = (operationType: "receipt" | "payment" | "transfer") => {
    setFormData({
      ...initialFormData,
      operationType,
      operationNumber: generateOperationNumber(operationType),
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
  };

  const generateOperationNumber = (type: string) => {
    const prefix = type === "receipt" ? "REC" : type === "payment" ? "PAY" : "TRF";
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
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
      const endpoint =
        formData.operationType === "receipt"
          ? "/api/custom-system/v2/operations/receipt"
          : formData.operationType === "payment"
          ? "/api/custom-system/v2/operations/payment"
          : "/api/custom-system/v2/operations/transfer";

      const payload: any = {
        operationNumber: formData.operationNumber,
        operationDate: formData.operationDate,
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        amount: parseFloat(formData.amount),
        currencyId: formData.currencyId,
        exchangeRate: parseFloat(formData.exchangeRate),
        description: formData.description,
        notes: formData.notes || null,
      };

      if (formData.operationType === "receipt") {
        payload.receiptNumber = formData.operationNumber;
        payload.receiptDate = formData.operationDate;
      } else if (formData.operationType === "payment") {
        payload.paymentNumber = formData.operationNumber;
        payload.paymentDate = formData.operationDate;
      } else {
        payload.transferNumber = formData.operationNumber;
        payload.transferDate = formData.operationDate;
      }

      await axios.post(endpoint, payload);

      const operationTypeAr =
        formData.operationType === "receipt"
          ? "سند القبض"
          : formData.operationType === "payment"
          ? "سند الصرف"
          : "التحويل";

      setSuccess(`تم إنشاء ${operationTypeAr} بنجاح`);
      handleCloseDialog();
      fetchOperations();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في حفظ العملية");
    }
  };

  const getOperationTypeLabel = (referenceType: string) => {
    switch (referenceType) {
      case "receipt":
        return { label: "سند قبض", color: "success" as const };
      case "payment":
        return { label: "سند صرف", color: "error" as const };
      case "transfer":
        return { label: "تحويل", color: "info" as const };
      default:
        return { label: "أخرى", color: "default" as const };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "posted":
        return { label: "مرحّل", color: "success" as const };
      case "draft":
        return { label: "مسودة", color: "warning" as const };
      case "reversed":
        return { label: "معكوس", color: "error" as const };
      default:
        return { label: status, color: "default" as const };
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          شاشة العمليات الموحدة
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchOperations}
            sx={{ mr: 2 }}
          >
            تحديث
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

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ cursor: "pointer" }} onClick={() => handleOpenDialog("receipt")}>
            <CardContent sx={{ textAlign: "center" }}>
              <ReceiptIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
              <Typography variant="h6">سند قبض</Typography>
              <Typography variant="body2" color="text.secondary">
                إنشاء سند قبض جديد
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ cursor: "pointer" }} onClick={() => handleOpenDialog("payment")}>
            <CardContent sx={{ textAlign: "center" }}>
              <PaymentIcon sx={{ fontSize: 48, color: "error.main", mb: 1 }} />
              <Typography variant="h6">سند صرف</Typography>
              <Typography variant="body2" color="text.secondary">
                إنشاء سند صرف جديد
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ cursor: "pointer" }} onClick={() => handleOpenDialog("transfer")}>
            <CardContent sx={{ textAlign: "center" }}>
              <TransferIcon sx={{ fontSize: 48, color: "info.main", mb: 1 }} />
              <Typography variant="h6">تحويل</Typography>
              <Typography variant="body2" color="text.secondary">
                تحويل بين حسابين
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            آخر العمليات
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>رقم العملية</TableCell>
                  <TableCell>التاريخ</TableCell>
                  <TableCell>النوع</TableCell>
                  <TableCell>الوصف</TableCell>
                  <TableCell align="center">الحالة</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : operations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      لا توجد عمليات
                    </TableCell>
                  </TableRow>
                ) : (
                  operations.map((operation) => {
                    const typeInfo = getOperationTypeLabel(operation.referenceType);
                    const statusInfo = getStatusLabel(operation.status);
                    return (
                      <TableRow key={operation.id}>
                        <TableCell>{operation.referenceNumber}</TableCell>
                        <TableCell>{operation.entryDate}</TableCell>
                        <TableCell>
                          <Chip label={typeInfo.label} color={typeInfo.color} size="small" />
                        </TableCell>
                        <TableCell>{operation.description}</TableCell>
                        <TableCell align="center">
                          <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {formData.operationType === "receipt"
            ? "إنشاء سند قبض"
            : formData.operationType === "payment"
            ? "إنشاء سند صرف"
            : "إنشاء تحويل"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="رقم العملية"
                  name="operationNumber"
                  value={formData.operationNumber}
                  onChange={handleInputChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="التاريخ"
                  name="operationDate"
                  type="date"
                  value={formData.operationDate}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth required>
              <InputLabel>
                {formData.operationType === "receipt"
                  ? "من حساب (الدافع)"
                  : "من حساب (المصدر)"}
              </InputLabel>
              <Select
                name="fromAccountId"
                value={formData.fromAccountId}
                onChange={(e) => handleSelectChange("fromAccountId", e.target.value)}
                label={
                  formData.operationType === "receipt"
                    ? "من حساب (الدافع)"
                    : "من حساب (المصدر)"
                }
              >
                <MenuItem value={0}>اختر الحساب</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountCode} - {account.accountNameAr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>
                {formData.operationType === "payment"
                  ? "إلى حساب (المستلم)"
                  : "إلى حساب (الهدف)"}
              </InputLabel>
              <Select
                name="toAccountId"
                value={formData.toAccountId}
                onChange={(e) => handleSelectChange("toAccountId", e.target.value)}
                label={
                  formData.operationType === "payment"
                    ? "إلى حساب (المستلم)"
                    : "إلى حساب (الهدف)"
                }
              >
                <MenuItem value={0}>اختر الحساب</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountCode} - {account.accountNameAr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="المبلغ"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  inputProps={{ step: "0.01", min: "0" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>العملة</InputLabel>
                  <Select
                    name="currencyId"
                    value={formData.currencyId}
                    onChange={(e) => handleSelectChange("currencyId", e.target.value)}
                    label="العملة"
                  >
                    <MenuItem value={0}>اختر العملة</MenuItem>
                    {currencies.map((currency) => (
                      <MenuItem key={currency.id} value={currency.id}>
                        {currency.currencyNameAr} ({currency.currencyCode})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="سعر الصرف"
              name="exchangeRate"
              type="number"
              value={formData.exchangeRate}
              onChange={handleInputChange}
              fullWidth
              inputProps={{ step: "0.000001", min: "0" }}
            />

            <TextField
              label="الوصف"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              fullWidth
              multiline
              rows={2}
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
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
