/**
 * النظام المخصص v2.2.0 - صفحة إدارة الحسابات
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
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  AccountBalance as AccountIcon,
} from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "axios";

interface Account {
  id: number;
  accountCode: string;
  accountNameAr: string;
  accountNameEn: string | null;
  accountType: string;
  level: number;
  isActive: boolean;
  allowManualEntry: boolean;
}

interface Currency {
  id: number;
  currencyCode: string;
  currencyNameAr: string;
}

interface SubSystem {
  id: number;
  systemNameAr: string;
}

interface AccountFormData {
  subSystemId: number;
  accountCode: string;
  accountNameAr: string;
  accountNameEn: string;
  accountType: string;
  parentAccountId: number;
  level: number;
  description: string;
  isActive: boolean;
  allowManualEntry: boolean;
  requiresCostCenter: boolean;
  requiresParty: boolean;
  currencies: { currencyId: number; isDefault: boolean }[];
}

const initialFormData: AccountFormData = {
  subSystemId: 0,
  accountCode: "",
  accountNameAr: "",
  accountNameEn: "",
  accountType: "asset",
  parentAccountId: 0,
  level: 1,
  description: "",
  isActive: true,
  allowManualEntry: true,
  requiresCostCenter: false,
  requiresParty: false,
  currencies: [],
};

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [subSystems, setSubSystems] = useState<SubSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AccountFormData>(initialFormData);

  useEffect(() => {
    fetchCurrencies();
    fetchSubSystems();
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/custom-system/v2/accounts");
      setAccounts(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في تحميل الحسابات");
    } finally {
      setLoading(false);
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

  const fetchSubSystems = async () => {
    try {
      const response = await axios.get("/api/custom-system/v2/sub-systems", {
        params: { isActive: true },
      });
      setSubSystems(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في تحميل الأنظمة الفرعية");
    }
  };

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setEditMode(true);
      setCurrentAccountId(account.id);
      fetchAccountDetails(account.id);
    } else {
      setEditMode(false);
      setCurrentAccountId(null);
      setFormData(initialFormData);
      setOpenDialog(true);
    }
  };

  const fetchAccountDetails = async (accountId: number) => {
    try {
      const response = await axios.get(`/api/custom-system/v2/accounts/${accountId}`);
      const account = response.data;

      setFormData({
        subSystemId: account.subSystemId || 0,
        accountCode: account.accountCode,
        accountNameAr: account.accountNameAr,
        accountNameEn: account.accountNameEn || "",
        accountType: account.accountType,
        parentAccountId: account.parentAccountId || 0,
        level: account.level,
        description: account.description || "",
        isActive: account.isActive,
        allowManualEntry: account.allowManualEntry,
        requiresCostCenter: account.requiresCostCenter,
        requiresParty: account.requiresParty,
        currencies: account.currencies || [],
      });
      setOpenDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في جلب تفاصيل الحساب");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentAccountId(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCurrency = () => {
    setFormData((prev) => ({
      ...prev,
      currencies: [...prev.currencies, { currencyId: 0, isDefault: false }],
    }));
  };

  const handleRemoveCurrency = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      currencies: prev.currencies.filter((_, i) => i !== index),
    }));
  };

  const handleCurrencyChange = (index: number, field: string, value: any) => {
    const newCurrencies = [...formData.currencies];
    newCurrencies[index] = {
      ...newCurrencies[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      currencies: newCurrencies,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editMode && currentAccountId) {
        await axios.put(`/api/custom-system/v2/accounts/${currentAccountId}`, formData);
        setSuccess("تم تحديث الحساب بنجاح");
      } else {
        await axios.post("/api/custom-system/v2/accounts", formData);
        setSuccess("تم إضافة الحساب بنجاح");
      }
      handleCloseDialog();
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في حفظ الحساب");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الحساب؟")) {
      return;
    }

    try {
      await axios.delete(`/api/custom-system/v2/accounts/${id}`);
      setSuccess("تم حذف الحساب بنجاح");
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في حذف الحساب");
    }
  };

  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      asset: "أصول",
      liability: "التزامات",
      equity: "حقوق ملكية",
      revenue: "إيرادات",
      expense: "مصروفات",
    };
    return types[type] || type;
  };

  const getAccountTypeColor = (type: string) => {
    const colors: Record<string, any> = {
      asset: "success",
      liability: "error",
      equity: "info",
      revenue: "primary",
      expense: "warning",
    };
    return colors[type] || "default";
  };

  const filteredAccounts =
    currentTab === 0
      ? accounts
      : accounts.filter((acc) => {
          const types = ["asset", "liability", "equity", "revenue", "expense"];
          return acc.accountType === types[currentTab - 1];
        });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          إدارة الحسابات
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAccounts}
            sx={{ mr: 2 }}
          >
            تحديث
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            إضافة حساب
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

      <Card sx={{ mb: 2 }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab label="الكل" />
          <Tab label="أصول" />
          <Tab label="التزامات" />
          <Tab label="حقوق ملكية" />
          <Tab label="إيرادات" />
          <Tab label="مصروفات" />
        </Tabs>
      </Card>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الرمز</TableCell>
                  <TableCell>اسم الحساب</TableCell>
                  <TableCell>النوع</TableCell>
                  <TableCell align="center">المستوى</TableCell>
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
                ) : filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      لا توجد حسابات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.accountCode}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <AccountIcon fontSize="small" />
                          {account.accountNameAr}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getAccountTypeLabel(account.accountType)}
                          color={getAccountTypeColor(account.accountType)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">{account.level}</TableCell>
                      <TableCell align="center">
                        {account.isActive ? (
                          <Chip label="نشط" color="success" size="small" />
                        ) : (
                          <Chip label="غير نشط" color="error" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(account)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(account.id)}
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
        <DialogTitle>{editMode ? "تعديل حساب" : "إضافة حساب جديد"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="رمز الحساب"
                  name="accountCode"
                  value={formData.accountCode}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  disabled={editMode}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>النظام الفرعي</InputLabel>
                  <Select
                    name="subSystemId"
                    value={formData.subSystemId}
                    onChange={(e) => handleSelectChange("subSystemId", e.target.value)}
                    label="النظام الفرعي"
                  >
                    <MenuItem value={0}>بدون نظام فرعي</MenuItem>
                    {subSystems.map((sys) => (
                      <MenuItem key={sys.id} value={sys.id}>
                        {sys.systemNameAr}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="اسم الحساب بالعربية"
                  name="accountNameAr"
                  value={formData.accountNameAr}
                  onChange={handleInputChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="اسم الحساب بالإنجليزية"
                  name="accountNameEn"
                  value={formData.accountNameEn}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>نوع الحساب</InputLabel>
                  <Select
                    name="accountType"
                    value={formData.accountType}
                    onChange={(e) => handleSelectChange("accountType", e.target.value)}
                    label="نوع الحساب"
                  >
                    <MenuItem value="asset">أصول</MenuItem>
                    <MenuItem value="liability">التزامات</MenuItem>
                    <MenuItem value="equity">حقوق ملكية</MenuItem>
                    <MenuItem value="revenue">إيرادات</MenuItem>
                    <MenuItem value="expense">مصروفات</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="المستوى"
                  name="level"
                  type="number"
                  value={formData.level}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>

            <TextField
              label="الوصف"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
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
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="allowManualEntry"
                      checked={formData.allowManualEntry}
                      onChange={handleInputChange}
                    />
                  }
                  label="يسمح بالقيد اليدوي"
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 2 }}>
              العملات المدعومة
            </Typography>

            {formData.currencies.map((curr, index) => (
              <Grid container spacing={2} key={index}>
                <Grid item xs={10}>
                  <FormControl fullWidth>
                    <InputLabel>العملة</InputLabel>
                    <Select
                      value={curr.currencyId}
                      onChange={(e) => handleCurrencyChange(index, "currencyId", e.target.value)}
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
                <Grid item xs={2}>
                  <IconButton color="error" onClick={() => handleRemoveCurrency(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddCurrency}>
              إضافة عملة
            </Button>
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
