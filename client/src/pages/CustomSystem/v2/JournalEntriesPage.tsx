/**
 * النظام المخصص v2.2.0 - صفحة القيود اليومية
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
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PostAdd as PostIcon,
  Undo as ReverseIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAuth } from "../../../_core/hooks/useAuth";
import axios from "axios";

interface Account {
  id: number;
  accountCode: string;
  accountNameAr: string;
}

interface Currency {
  id: number;
  currencyCode: string;
  currencyNameAr: string;
}

interface JournalEntry {
  id: number;
  entryNumber: string;
  entryDate: string;
  entryType: string;
  description: string;
  status: string;
  createdAt: string;
}

interface JournalEntryLine {
  accountId: number;
  debitAmount: string;
  creditAmount: string;
  currencyId: number;
  exchangeRate: string;
  description: string;
}

interface JournalEntryFormData {
  entryNumber: string;
  entryDate: string;
  entryType: string;
  description: string;
  notes: string;
  lines: JournalEntryLine[];
}

const initialLineData: JournalEntryLine = {
  accountId: 0,
  debitAmount: "0",
  creditAmount: "0",
  currencyId: 0,
  exchangeRate: "1.000000",
  description: "",
};

const initialFormData: JournalEntryFormData = {
  entryNumber: "",
  entryDate: new Date().toISOString().split("T")[0],
  entryType: "manual",
  description: "",
  notes: "",
  lines: [{ ...initialLineData }, { ...initialLineData }],
};

export default function JournalEntriesPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [formData, setFormData] = useState<JournalEntryFormData>(initialFormData);
  const [viewData, setViewData] = useState<any>(null);

  useEffect(() => {
    fetchAccounts();
    fetchCurrencies();
    fetchEntries();
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

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/custom-system/v2/journal-entries");
      setEntries(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في تحميل القيود اليومية");
    } finally {
      setLoading(false);
    }
  };

  const getAccountName = (accountId: number) => {
    const account = accounts.find((a) => a.id === accountId);
    return account ? `${account.accountCode} - ${account.accountNameAr}` : "-";
  };

  const handleOpenDialog = (entry?: JournalEntry) => {
    if (entry) {
      fetchEntryDetails(entry.id);
    } else {
      setEditMode(false);
      setCurrentEntryId(null);
      setFormData({
        ...initialFormData,
        entryNumber: generateEntryNumber(),
      });
      setOpenDialog(true);
    }
  };

  const fetchEntryDetails = async (entryId: number) => {
    try {
      const response = await axios.get(`/api/custom-system/v2/journal-entries/${entryId}`);
      const entry = response.data;

      if (entry.status === "draft") {
        setEditMode(true);
        setCurrentEntryId(entryId);
        setFormData({
          entryNumber: entry.entryNumber,
          entryDate: entry.entryDate,
          entryType: entry.entryType,
          description: entry.description,
          notes: entry.notes || "",
          lines: entry.lines.map((line: any) => ({
            accountId: line.accountId,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            currencyId: line.currencyId,
            exchangeRate: line.exchangeRate,
            description: line.description || "",
          })),
        });
        setOpenDialog(true);
      } else {
        setError("لا يمكن تعديل قيد مرحّل");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في جلب تفاصيل القيد");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentEntryId(null);
    setFormData(initialFormData);
  };

  const generateEntryNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `JE-${timestamp}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...formData.lines];
    newLines[index] = {
      ...newLines[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      lines: newLines,
    }));
  };

  const handleAddLine = () => {
    setFormData((prev) => ({
      ...prev,
      lines: [...prev.lines, { ...initialLineData }],
    }));
  };

  const handleRemoveLine = (index: number) => {
    if (formData.lines.length <= 2) {
      setError("يجب أن يحتوي القيد على سطرين على الأقل");
      return;
    }
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      lines: newLines,
    }));
  };

  const calculateTotals = () => {
    let totalDebit = 0;
    let totalCredit = 0;
    formData.lines.forEach((line) => {
      totalDebit += parseFloat(line.debitAmount || "0");
      totalCredit += parseFloat(line.creditAmount || "0");
    });
    return { totalDebit, totalCredit, difference: totalDebit - totalCredit };
  };

  const handleSubmit = async () => {
    try {
      const totals = calculateTotals();
      if (Math.abs(totals.difference) > 0.01) {
        setError(`القيد غير متوازن: الفرق = ${totals.difference.toFixed(2)}`);
        return;
      }

      if (editMode && currentEntryId) {
        await axios.put(`/api/custom-system/v2/journal-entries/${currentEntryId}`, formData);
        setSuccess("تم تحديث القيد بنجاح");
      } else {
        await axios.post("/api/custom-system/v2/journal-entries", formData);
        setSuccess("تم إنشاء القيد بنجاح");
      }
      handleCloseDialog();
      fetchEntries();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في حفظ القيد");
    }
  };

  const handlePost = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من ترحيل هذا القيد؟")) {
      return;
    }

    try {
      await axios.post(`/api/custom-system/v2/journal-entries/${id}/post`);
      setSuccess("تم ترحيل القيد بنجاح");
      fetchEntries();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في ترحيل القيد");
    }
  };

  const handleReverse = async (id: number) => {
    const reversalDate = prompt("أدخل تاريخ العكس (YYYY-MM-DD):");
    if (!reversalDate) return;

    const reversalReason = prompt("أدخل سبب العكس:");

    try {
      await axios.post(`/api/custom-system/v2/journal-entries/${id}/reverse`, {
        reversalDate,
        reversalReason,
      });
      setSuccess("تم عكس القيد بنجاح");
      fetchEntries();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في عكس القيد");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا القيد؟")) {
      return;
    }

    try {
      await axios.delete(`/api/custom-system/v2/journal-entries/${id}`);
      setSuccess("تم حذف القيد بنجاح");
      fetchEntries();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في حذف القيد");
    }
  };

  const handleView = async (id: number) => {
    try {
      const response = await axios.get(`/api/custom-system/v2/journal-entries/${id}`);
      setViewData(response.data);
      setViewDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في جلب تفاصيل القيد");
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

  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case "manual":
        return "يدوي";
      case "system_generated":
        return "تلقائي";
      case "reversal":
        return "عكس";
      default:
        return type;
    }
  };

  const totals = calculateTotals();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          القيود اليومية
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchEntries}
            sx={{ mr: 2 }}
          >
            تحديث
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            إضافة قيد يومي
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
                  <TableCell>رقم القيد</TableCell>
                  <TableCell>التاريخ</TableCell>
                  <TableCell>النوع</TableCell>
                  <TableCell>الوصف</TableCell>
                  <TableCell align="center">الحالة</TableCell>
                  <TableCell align="center">الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      لا توجد قيود يومية
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => {
                    const statusInfo = getStatusLabel(entry.status);
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.entryNumber}</TableCell>
                        <TableCell>{entry.entryDate}</TableCell>
                        <TableCell>{getEntryTypeLabel(entry.entryType)}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell align="center">
                          <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="info" onClick={() => handleView(entry.id)}>
                            <ViewIcon />
                          </IconButton>
                          {entry.status === "draft" && (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(entry)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handlePost(entry.id)}
                              >
                                <PostIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(entry.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                          {entry.status === "posted" && (
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleReverse(entry.id)}
                            >
                              <ReverseIcon />
                            </IconButton>
                          )}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>{editMode ? "تعديل قيد يومي" : "إضافة قيد يومي جديد"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="رقم القيد"
                  name="entryNumber"
                  value={formData.entryNumber}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  disabled={editMode}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="التاريخ"
                  name="entryDate"
                  type="date"
                  value={formData.entryDate}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>النوع</InputLabel>
                  <Select
                    name="entryType"
                    value={formData.entryType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, entryType: e.target.value }))
                    }
                    label="النوع"
                  >
                    <MenuItem value="manual">يدوي</MenuItem>
                    <MenuItem value="system_generated">تلقائي</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

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

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6">سطور القيد</Typography>

            {formData.lines.map((line, index) => (
              <Card key={index} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth required>
                      <InputLabel>الحساب</InputLabel>
                      <Select
                        value={line.accountId}
                        onChange={(e) => handleLineChange(index, "accountId", e.target.value)}
                        label="الحساب"
                      >
                        <MenuItem value={0}>اختر الحساب</MenuItem>
                        {accounts.map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.accountCode} - {account.accountNameAr}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="مدين"
                      type="number"
                      value={line.debitAmount}
                      onChange={(e) => handleLineChange(index, "debitAmount", e.target.value)}
                      fullWidth
                      inputProps={{ step: "0.01", min: "0" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="دائن"
                      type="number"
                      value={line.creditAmount}
                      onChange={(e) => handleLineChange(index, "creditAmount", e.target.value)}
                      fullWidth
                      inputProps={{ step: "0.01", min: "0" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth required>
                      <InputLabel>العملة</InputLabel>
                      <Select
                        value={line.currencyId}
                        onChange={(e) => handleLineChange(index, "currencyId", e.target.value)}
                        label="العملة"
                      >
                        <MenuItem value={0}>اختر العملة</MenuItem>
                        {currencies.map((currency) => (
                          <MenuItem key={currency.id} value={currency.id}>
                            {currency.currencyNameAr}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <IconButton color="error" onClick={() => handleRemoveLine(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="وصف السطر"
                      value={line.description}
                      onChange={(e) => handleLineChange(index, "description", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Card>
            ))}

            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddLine}>
              إضافة سطر
            </Button>

            <Card sx={{ p: 2, bgcolor: "grey.100" }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    <strong>إجمالي المدين:</strong> {totals.totalDebit.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    <strong>إجمالي الدائن:</strong> {totals.totalCredit.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography
                    variant="body1"
                    color={Math.abs(totals.difference) < 0.01 ? "success.main" : "error.main"}
                  >
                    <strong>الفرق:</strong> {totals.difference.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Card>

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
            {editMode ? "تحديث" : "حفظ"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>تفاصيل القيد</DialogTitle>
        <DialogContent>
          {viewData && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography>
                    <strong>رقم القيد:</strong> {viewData.entryNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>
                    <strong>التاريخ:</strong> {viewData.entryDate}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>
                    <strong>النوع:</strong> {getEntryTypeLabel(viewData.entryType)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>
                    <strong>الحالة:</strong>{" "}
                    <Chip
                      label={getStatusLabel(viewData.status).label}
                      color={getStatusLabel(viewData.status).color}
                      size="small"
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    <strong>الوصف:</strong> {viewData.description}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                سطور القيد
              </Typography>

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>الحساب</TableCell>
                      <TableCell align="right">مدين</TableCell>
                      <TableCell align="right">دائن</TableCell>
                      <TableCell>الوصف</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewData.lines?.map((line: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{getAccountName(line.accountId)}</TableCell>
                        <TableCell align="right">{parseFloat(line.debitAmount).toFixed(2)}</TableCell>
                        <TableCell align="right">{parseFloat(line.creditAmount).toFixed(2)}</TableCell>
                        <TableCell>{line.description || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
