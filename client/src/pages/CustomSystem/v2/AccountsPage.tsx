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
  Divider,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  AccountBalance as AccountIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Layers as LayersIcon,
  Settings as SettingsIcon,
  CurrencyExchange as CurrencyIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useAuth } from "../../../_core/hooks/useAuth";
import axios from "axios";

interface Account {
  id: number;
  accountCode: string;
  accountNameAr: string;
  accountNameEn: string | null;
  accountType: string;
  accountLevel?: "main" | "sub";
  parentAccountId?: number | null;
  level: number;
  isActive: boolean;
  allowManualEntry: boolean;
}

interface Currency {
  id: number;
  code: string;
  nameAr: string;
  nameEn?: string | null;
  symbol?: string | null;
  isBaseCurrency: boolean;
  isActive: boolean;
  decimalPlaces: number;
  currentRate?: string | null;
  maxRate?: string | null;
  minRate?: string | null;
  displayOrder?: number | null;
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
  accountLevel: "main" | "sub"; // رئيسي أو فرعي
  accountSubTypeId: number; // نوع الحساب الفرعي (صندوق، بنك، محفظة، إلخ)
  parentAccountId: number;
  level: number;
  displayOrder: number; // رقم الترتيب
  description: string;
  isActive: boolean;
  allowManualEntry: boolean;
  requiresCostCenter: boolean;
  requiresParty: boolean;
  currencies: { currencyId: number; isDefault: boolean }[];
}

interface AccountSubType {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string | null;
  accountType: string;
}

const initialFormData: AccountFormData = {
  subSystemId: 0,
  accountCode: "",
  accountNameAr: "",
  accountNameEn: "",
  accountType: "asset",
  accountLevel: "main", // افتراضياً رئيسي
  accountSubTypeId: 0,
  parentAccountId: 0,
  level: 1,
  displayOrder: 0, // رقم الترتيب - يتم توليده تلقائياً
  description: "",
  isActive: true,
  allowManualEntry: true,
  requiresCostCenter: false,
  requiresParty: false,
  currencies: [],
};

interface AccountsPageProps {
  subSystemId?: number;
}

export default function AccountsPage({ subSystemId }: AccountsPageProps = {}) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [subSystems, setSubSystems] = useState<SubSystem[]>([]);
  const [accountSubTypes, setAccountSubTypes] = useState<AccountSubType[]>([]);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);
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
    fetchAccountSubTypes();
    fetchAccountTypes();
    fetchAccounts();
  }, [subSystemId]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (subSystemId) {
        params.subSystemId = subSystemId;
      }
      const response = await axios.get("/api/custom-system/v2/accounts", { params });
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
      console.log("[AccountsPage] جلب العملات...");
      const response = await axios.get("/api/custom-system/v2/currencies", {
        params: { isActive: true },
      });
      console.log("[AccountsPage] استجابة API العملات:", response.data);
      if (response.data && Array.isArray(response.data)) {
        setCurrencies(response.data);
        console.log(`[AccountsPage] تم تحميل ${response.data.length} عملة بنجاح`);
        if (response.data.length === 0) {
          console.warn("لا توجد عملات متاحة");
        }
      } else {
        console.warn("استجابة غير صحيحة من API العملات:", response.data);
        setCurrencies([]);
      }
    } catch (err: any) {
      console.error("خطأ في تحميل العملات:", err);
      console.error("تفاصيل الخطأ:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      // لا نعرض خطأ للمستخدم لأن العملات اختيارية
      setCurrencies([]);
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

  const fetchAccountTypes = async () => {
    try {
      const response = await axios.get("/api/custom-system/v2/account-types", {
        params: { subSystemId },
      });
      setAccountTypes(response.data);
    } catch (err: any) {
      console.warn("فشل في تحميل أنواع الحسابات:", err);
      // الأنواع الافتراضية
      const defaultTypes = [
        { typeCode: 'asset', typeNameAr: 'أصول', typeNameEn: 'Assets' },
        { typeCode: 'liability', typeNameAr: 'التزامات', typeNameEn: 'Liabilities' },
        { typeCode: 'equity', typeNameAr: 'حقوق ملكية', typeNameEn: 'Equity' },
        { typeCode: 'revenue', typeNameAr: 'إيرادات', typeNameEn: 'Revenue' },
        { typeCode: 'expense', typeNameAr: 'مصروفات', typeNameEn: 'Expenses' },
      ];
      setAccountTypes(defaultTypes);
    }
  };

  const fetchAccountSubTypes = async () => {
    try {
      const response = await axios.get("/api/custom-system/v2/account-sub-types", {
        params: { isActive: true },
      });
      setAccountSubTypes(response.data);
    } catch (err: any) {
      // إذا لم يكن API موجوداً، سنستخدم الأنواع الافتراضية
      console.warn("فشل في تحميل الأنواع الفرعية:", err);
      // الأنواع الافتراضية
      const defaultSubTypes: AccountSubType[] = [
        { id: 1, code: 'cash', nameAr: 'صندوق', nameEn: 'Cash', accountType: 'asset' },
        { id: 2, code: 'bank', nameAr: 'بنك', nameEn: 'Bank', accountType: 'asset' },
        { id: 3, code: 'wallet', nameAr: 'محفظة', nameEn: 'Wallet', accountType: 'asset' },
        { id: 4, code: 'exchange', nameAr: 'صراف', nameEn: 'Exchange', accountType: 'asset' },
        { id: 5, code: 'warehouse', nameAr: 'مخزن', nameEn: 'Warehouse', accountType: 'asset' },
        { id: 6, code: 'supplier', nameAr: 'مورد', nameEn: 'Supplier', accountType: 'liability' },
        { id: 7, code: 'customer', nameAr: 'عميل', nameEn: 'Customer', accountType: 'revenue' },
        { id: 8, code: 'general', nameAr: 'عام', nameEn: 'General', accountType: 'asset' },
        { id: 9, code: 'employee_business', nameAr: 'أعمال الموظفين', nameEn: 'Employee Business', accountType: 'expense' },
        { id: 10, code: 'employee_advance', nameAr: 'سلف الموظفين', nameEn: 'Employee Advances', accountType: 'asset' },
        { id: 11, code: 'employee_salary', nameAr: 'رواتب الموظفين', nameEn: 'Employee Salaries', accountType: 'expense' },
      ];
      setAccountSubTypes(defaultSubTypes);
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
      // تعيين subSystemId تلقائياً عند إضافة حساب جديد
      // رقم الحساب فارغ ليدخله المستخدم
      setFormData({
        ...initialFormData,
        subSystemId: subSystemId || 0,
        accountCode: "",
        displayOrder: accounts.length + 1,
      });
      setOpenDialog(true);
    }
  };

  // دالة توليد رقم الحساب التلقائي
  const generateNextAccountCode = () => {
    if (accounts.length === 0) {
      return "1000"; // أول حساب
    }
    // الحصول على أعلى رقم حساب موجود
    const maxCode = Math.max(
      ...accounts.map((acc) => {
        const num = parseInt(acc.accountCode || "0", 10);
        return isNaN(num) ? 0 : num;
      })
    );
    return String(maxCode + 1);
  };

  const fetchAccountDetails = async (accountId: number) => {
    try {
      const response = await axios.get(`/api/custom-system/v2/accounts/${accountId}`);
      const account = response.data;

      // تحديد نوع الحساب (رئيسي أو فرعي) بناءً على parentAccountId
      const accountLevel = account.parentAccountId && account.parentAccountId > 0 ? "sub" : "main";
      
      setFormData({
        subSystemId: account.subSystemId || 0,
        accountCode: account.accountCode,
        accountNameAr: account.accountNameAr,
        accountNameEn: account.accountNameEn || "",
        accountType: account.accountType,
        accountLevel: accountLevel,
        accountSubTypeId: account.accountSubTypeId || 0,
        parentAccountId: account.parentAccountId || 0,
        level: account.level,
        displayOrder: account.displayOrder || 0,
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
      // إعداد البيانات للإرسال
      const submitData: any = {
        ...formData,
        // إذا كان subSystemId محدداً كـ prop، نستخدمه
        subSystemId: subSystemId || formData.subSystemId || null,
        // إذا كان حساب رئيسي، لا نرسل accountSubTypeId
        accountSubTypeId: formData.accountLevel === "sub" ? formData.accountSubTypeId : null,
        // parentAccountId: اختياري لجميع أنواع الحسابات (رئيسية وفرعية)
        // يستخدم فقط لترتيب الشجرة. الحسابات الرئيسية لا تتأثر بالعمليات المالية
        parentAccountId: formData.parentAccountId > 0 ? formData.parentAccountId : null,
        // رقم الترتيب
        displayOrder: formData.displayOrder || 0,
      };

      if (editMode && currentAccountId) {
        await axios.put(`/api/custom-system/v2/accounts/${currentAccountId}`, submitData);
        setSuccess("تم تحديث الحساب بنجاح");
      } else {
        await axios.post("/api/custom-system/v2/accounts", submitData);
        setSuccess("تم إضافة الحساب بنجاح");
      }
      handleCloseDialog();
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في حفظ الحساب");
    }
  };

  const handleDelete = async (id: number) => {
    // البحث عن الحساب لعرض اسمه في رسالة التأكيد
    const account = accounts.find(acc => acc.id === id);
    const accountName = account?.accountNameAr || account?.accountCode || 'هذا الحساب';
    
    if (!window.confirm(`هل أنت متأكد من حذف الحساب "${accountName}"؟\n\nملاحظة: لا يمكن حذف الحساب إذا كانت هناك حركات مالية عليه أو حسابات فرعية تابعة له.`)) {
      return;
    }

    try {
      await axios.delete(`/api/custom-system/v2/accounts/${id}`);
      setSuccess(`تم حذف الحساب "${accountName}" بنجاح`);
      fetchAccounts();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "فشل في حذف الحساب";
      setError(errorMessage);
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
    <Box 
      sx={{ 
        p: { xs: 2, md: 4 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header Section with Gradient */}
      <Card 
        sx={{ 
          mb: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}
              >
                إدارة الحسابات
              </Typography>
              <Typography variant="body2" color="text.secondary">
                دليل الحسابات المحاسبي الشامل
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchAccounts}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  borderColor: 'rgba(102, 126, 234, 0.5)',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#667eea',
                    background: 'rgba(102, 126, 234, 0.05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                تحديث
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => handleOpenDialog()}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                إضافة حساب
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)} 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          onClose={() => setSuccess(null)} 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)'
          }}
        >
          {success}
        </Alert>
      )}

      {/* Tabs Card */}
      <Card 
        sx={{ 
          mb: 3,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={currentTab} 
          onChange={(e, v) => setCurrentTab(v)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              minHeight: 64,
              '&.Mui-selected': {
                color: '#667eea',
              }
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab label="الكل" />
          <Tab label="أصول" />
          <Tab label="التزامات" />
          <Tab label="حقوق ملكية" />
          <Tab label="إيرادات" />
          <Tab label="مصروفات" />
        </Tabs>
      </Card>

      {/* Table Card */}
      <Card
        sx={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '& .MuiTableCell-head': {
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      borderBottom: 'none',
                      py: 2
                    }
                  }}
                >
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
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            border: '4px solid #f3f4f6',
                            borderTop: '4px solid #667eea',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' }
                            }
                          }}
                        />
                        <Typography color="text.secondary">جاري التحميل...</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <AccountIcon sx={{ fontSize: 64, color: 'text.disabled', opacity: 0.5 }} />
                        <Typography variant="h6" color="text.secondary">
                          لا توجد حسابات
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ابدأ بإضافة حساب جديد
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account, index) => (
                    <TableRow 
                      key={account.id}
                      sx={{
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.05)',
                          transform: 'scale(1.01)',
                          transition: 'all 0.2s ease'
                        },
                        transition: 'all 0.2s ease',
                        '& .MuiTableCell-root': {
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                          py: 2
                        }
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight={600} color="primary">
                          {account.accountCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <AccountIcon sx={{ fontSize: 20, color: '#667eea' }} />
                          </Box>
                          <Typography fontWeight={500}>
                            {account.accountNameAr}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getAccountTypeLabel(account.accountType)}
                          color={getAccountTypeColor(account.accountType)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={account.level}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            color: '#667eea',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {account.isActive ? (
                          <Chip 
                            label="نشط" 
                            color="success" 
                            size="small"
                            sx={{
                              fontWeight: 600,
                              boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)'
                            }}
                          />
                        ) : (
                          <Chip 
                            label="غير نشط" 
                            color="error" 
                            size="small"
                            sx={{
                              fontWeight: 600,
                              boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)'
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(account)}
                            sx={{
                              color: '#667eea',
                              '&:hover': {
                                background: 'rgba(102, 126, 234, 0.1)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(account.id)}
                            sx={{
                              color: '#f44336',
                              '&:hover': {
                                background: 'rgba(244, 67, 54, 0.1)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.5rem',
            py: 3,
            px: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AccountIcon />
          </Box>
          {editMode ? "تعديل حساب" : "إضافة حساب جديد"}
        </DialogTitle>
        <DialogContent sx={{ p: 0, background: 'rgba(249,250,251,0.5)' }}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {/* معلومات أساسية */}
            <Box sx={{ p: 4, pb: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <InfoIcon sx={{ color: '#667eea', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                  المعلومات الأساسية
                </Typography>
              </Stack>
              
              <Grid container spacing={3}>
                {/* رقم الحساب - قابل للتعديل عند الإنشاء فقط، معطّل عند التعديل */}
                <Grid item xs={12} md={4}>
                  <TextField
                    label={editMode ? "رقم الحساب (لا يمكن التعديل)" : "رقم الحساب *"}
                    name="accountCode"
                    value={formData.accountCode}
                    onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                    fullWidth
                    disabled={editMode}
                    required={!editMode}
                    InputProps={{
                      readOnly: editMode,
                      startAdornment: (
                        <CodeIcon sx={{ mr: 1, color: editMode ? '#999' : '#667eea', fontSize: 20 }} />
                      ),
                    }}
                    helperText={editMode ? "لا يمكن تعديل رقم الحساب بعد الحفظ" : "أدخل رقم الحساب (مطلوب)"}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        background: editMode ? 'rgba(102, 126, 234, 0.08)' : 'rgba(102, 126, 234, 0.05)',
                        '&.Mui-disabled': {
                          background: 'rgba(102, 126, 234, 0.08)',
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: editMode ? '#999' : '#667eea'
                      },
                      '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                        borderColor: editMode ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.5)',
                        borderStyle: editMode ? 'dashed' : 'solid'
                      }
                    }}
                  />
                </Grid>
                {/* رقم الترتيب */}
                <Grid item xs={12} md={4}>
                  <TextField
                    label="رقم الترتيب"
                    name="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    fullWidth
                    inputProps={{ min: 1 }}
                    InputProps={{
                      startAdornment: (
                        <LayersIcon sx={{ mr: 1, color: '#667eea', fontSize: 20 }} />
                      ),
                    }}
                    helperText="لترتيب عرض الحسابات"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        background: 'white',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea'
                      },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                        borderWidth: 2
                      }
                    }}
                  />
                </Grid>
                {/* حقل اختيار الحساب الأب - للترتيب في الشجرة (اختياري لجميع أنواع الحسابات) */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>الحساب الأب (للترتيب - اختياري)</InputLabel>
                    <Select
                      name="parentAccountId"
                      value={formData.parentAccountId}
                      onChange={(e) => handleSelectChange("parentAccountId", parseInt(e.target.value))}
                      label="الحساب الأب (للترتيب - اختياري)"
                      sx={{
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        background: 'white',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(102, 126, 234, 0.3)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                          borderWidth: 2
                        }
                      }}
                    >
                      <MenuItem value={0}>بدون حساب أب</MenuItem>
                      {accounts
                        .filter((acc) => acc.id !== currentAccountId) // استثناء الحساب الحالي عند التعديل
                        .map((acc) => {
                          // تحديد نوع الحساب بناءً على parentAccountId
                          const isMain = !acc.parentAccountId || acc.parentAccountId === 0;
                          return (
                            <MenuItem key={acc.id} value={acc.id}>
                              {acc.accountCode} - {acc.accountNameAr}
                              {isMain && " (رئيسي)"}
                            </MenuItem>
                          );
                        })}
                    </Select>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      اختياري: يستخدم فقط لترتيب الشجرة
                    </Typography>
                  </FormControl>
                </Grid>
              </Grid>

              {/* إخفاء حقل النظام الفرعي إذا كان محدداً مسبقاً (من داخل نظام فرعي) */}
              {!subSystemId && (
                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>النظام الفرعي</InputLabel>
                      <Select
                        name="subSystemId"
                        value={formData.subSystemId}
                        onChange={(e) => handleSelectChange("subSystemId", e.target.value)}
                        label="النظام الفرعي"
                        sx={{
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          background: 'white',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(102, 126, 234, 0.3)'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea',
                            borderWidth: 2
                          }
                        }}
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
              )}

              <Grid container spacing={3} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="اسم الحساب بالعربية"
                    name="accountNameAr"
                    value={formData.accountNameAr}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <AccountIcon sx={{ mr: 1, color: '#667eea', fontSize: 20 }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        background: 'white',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea'
                      },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                        borderWidth: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="اسم الحساب بالإنجليزية"
                    name="accountNameEn"
                    value={formData.accountNameEn}
                    onChange={handleInputChange}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <AccountIcon sx={{ mr: 1, color: '#667eea', fontSize: 20 }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        background: 'white',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea'
                      },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                        borderWidth: 2
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mx: 4, my: 1 }} />

            {/* تصنيف الحساب */}
            <Box sx={{ p: 4, pt: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CategoryIcon sx={{ color: '#667eea', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                  تصنيف الحساب
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>نوع الحساب</InputLabel>
                    <Select
                      name="accountType"
                      value={formData.accountType}
                      onChange={(e) => {
                        handleSelectChange("accountType", e.target.value);
                        handleSelectChange("accountSubTypeId", 0);
                      }}
                      label="نوع الحساب"
                      sx={{
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        background: 'white',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(102, 126, 234, 0.3)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                          borderWidth: 2
                        }
                      }}
                    >
                      {accountTypes.map((type: any) => (
                        <MenuItem key={type.typeCode} value={type.typeCode}>
                          {type.typeNameAr}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>نوع الحساب (رئيسي/فرعي)</InputLabel>
                    <Select
                      name="accountLevel"
                      value={formData.accountLevel}
                      onChange={(e) => {
                        handleSelectChange("accountLevel", e.target.value);
                        // عند اختيار حساب رئيسي، نزيل فقط نوع الحساب الفرعي
                        // لكن نترك parentAccountId كما هو (يمكن أن يكون له حساب أب للترتيب)
                        if (e.target.value === "main") {
                          handleSelectChange("accountSubTypeId", 0);
                        }
                      }}
                      label="نوع الحساب (رئيسي/فرعي)"
                      sx={{
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        background: 'white',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(102, 126, 234, 0.3)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                          borderWidth: 2
                        }
                      }}
                    >
                      <MenuItem value="main">حساب رئيسي</MenuItem>
                      <MenuItem value="sub">حساب فرعي</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* حقل نوع الحساب الفرعي - يظهر فقط إذا كان الحساب فرعي */}
              {formData.accountLevel === "sub" && (
                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>نوع الحساب الفرعي</InputLabel>
                      <Select
                        name="accountSubTypeId"
                        value={formData.accountSubTypeId}
                        onChange={(e) => handleSelectChange("accountSubTypeId", parseInt(e.target.value))}
                        label="نوع الحساب الفرعي"
                        sx={{
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          background: 'white',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(102, 126, 234, 0.3)'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea',
                            borderWidth: 2
                          }
                        }}
                      >
                        <MenuItem value={0}>اختر النوع الفرعي</MenuItem>
                        {accountSubTypes
                          .filter((subType) => subType.accountType === formData.accountType)
                          .map((subType) => (
                            <MenuItem key={subType.id} value={subType.id}>
                              {subType.nameAr}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}

            </Box>

            <Divider sx={{ mx: 4, my: 1 }} />

            {/* إعدادات إضافية */}
            <Box sx={{ p: 4, pt: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <SettingsIcon sx={{ color: '#667eea', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                  الإعدادات الإضافية
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="المستوى"
                    name="level"
                    type="number"
                    value={formData.level}
                    onChange={handleInputChange}
                    fullWidth
                    inputProps={{ min: 1 }}
                    InputProps={{
                      startAdornment: (
                        <LayersIcon sx={{ mr: 1, color: '#667eea', fontSize: 20 }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        background: 'white',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea'
                      },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                        borderWidth: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="الوصف"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: (
                        <DescriptionIcon sx={{ mr: 1, color: '#667eea', fontSize: 20, alignSelf: 'flex-start', mt: 1.5 }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        background: 'white',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea'
                      },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                        borderWidth: 2
                      }
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: formData.isActive 
                        ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)'
                        : 'rgba(0,0,0,0.02)',
                      border: formData.isActive ? '2px solid rgba(46, 125, 50, 0.3)' : '2px solid rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#4caf50',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#4caf50',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          نشط
                        </Typography>
                      }
                    />
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: formData.allowManualEntry 
                        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                        : 'rgba(0,0,0,0.02)',
                      border: formData.allowManualEntry ? '2px solid rgba(102, 126, 234, 0.3)' : '2px solid rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          name="allowManualEntry"
                          checked={formData.allowManualEntry}
                          onChange={handleInputChange}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#667eea',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#667eea',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          يسمح بالقيد اليدوي
                        </Typography>
                      }
                    />
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mx: 4, my: 1 }} />

            {/* العملات المدعومة */}
            <Box sx={{ p: 4, pt: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CurrencyIcon sx={{ color: '#667eea', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                  العملات المدعومة
                </Typography>
              </Stack>

              {currencies.length === 0 ? (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: 28
                    }
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    لا توجد عملات متاحة
                  </Typography>
                  <Typography variant="body2">
                    يرجى إضافة عملات من صفحة إدارة العملات أولاً
                  </Typography>
                </Alert>
              ) : formData.currencies.length === 0 ? (
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 2,
                    background: 'rgba(0,0,0,0.02)',
                    border: '2px dashed rgba(102, 126, 234, 0.3)'
                  }}
                >
                  <CurrencyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    لا توجد عملات محددة لهذا الحساب
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    اضغط على "إضافة عملة" لإضافة عملة جديدة
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {formData.currencies.map((curr, index) => (
                    <Card
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: 'white',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                          borderColor: '#667eea'
                        }
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={10}>
                          <FormControl fullWidth>
                            <InputLabel>العملة</InputLabel>
                            <Select
                              value={curr.currencyId}
                              onChange={(e) => handleCurrencyChange(index, "currencyId", parseInt(e.target.value))}
                              label="العملة"
                              sx={{
                                borderRadius: 2,
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(102, 126, 234, 0.3)'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#667eea',
                                  borderWidth: 2
                                }
                              }}
                            >
                              <MenuItem value={0}>اختر العملة</MenuItem>
                              {currencies.map((currency) => (
                                <MenuItem key={currency.id} value={currency.id}>
                                  {currency.nameAr} ({currency.code})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveCurrency(index)}
                            sx={{
                              '&:hover': {
                                background: 'rgba(244, 67, 54, 0.1)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              )}

              {currencies.length > 0 && (
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  onClick={handleAddCurrency}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    borderColor: 'rgba(102, 126, 234, 0.5)',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#667eea',
                      background: 'rgba(102, 126, 234, 0.05)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  إضافة عملة
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 2, background: 'rgba(249,250,251,0.5)' }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderColor: 'rgba(102, 126, 234, 0.5)',
              color: '#667eea',
              '&:hover': {
                borderColor: '#667eea',
                background: 'rgba(102, 126, 234, 0.05)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {editMode ? "تحديث" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
