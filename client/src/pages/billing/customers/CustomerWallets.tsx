import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { 
  Wallet, Plus, Search, ArrowUpCircle, ArrowDownCircle, 
  Filter, X, Eye, RefreshCw, CreditCard, TrendingUp
} from "lucide-react";

interface WalletTransaction {
  id: number;
  transactionType: string;
  amount: string;
  balanceBefore: string | null;
  balanceAfter: string | null;
  description: string | null;
  referenceType: string | null;
  referenceId: number | null;
  createdAt: Date;
}

export default function CustomerWallets() {
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<string>("all");

  const { data: customers } = trpc.customerSystem.getCustomers.useQuery({ 
    limit: 100,
    search: searchTerm || undefined,
  });

  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = trpc.customerSystem.getWallet.useQuery(
    { customerId: selectedCustomerId || 0 },
    { enabled: !!selectedCustomerId }
  );

  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = trpc.customerSystem.getWalletTransactions.useQuery(
    {
      customerId: selectedCustomerId || 0,
      page,
      limit: 20,
      transactionType: filterType !== "all" ? filterType as any : undefined,
    },
    { enabled: !!selectedCustomerId }
  );

  const chargeMutation = trpc.customerSystem.chargeWallet.useMutation({
    onSuccess: () => {
      refetchWallet();
      refetchTransactions();
      setShowChargeModal(false);
      resetChargeForm();
    },
  });

  const withdrawMutation = trpc.customerSystem.withdrawFromWallet.useMutation({
    onSuccess: () => {
      refetchWallet();
      refetchTransactions();
      setShowWithdrawModal(false);
      resetWithdrawForm();
    },
  });

  const [chargeForm, setChargeForm] = useState({
    amount: "",
    description: "",
  });

  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    meterId: "",
    description: "",
  });

  const resetChargeForm = () => {
    setChargeForm({ amount: "", description: "" });
  };

  const resetWithdrawForm = () => {
    setWithdrawForm({ amount: "", meterId: "", description: "" });
  };

  const handleCharge = () => {
    if (!selectedCustomerId || !chargeForm.amount) return;
    
    chargeMutation.mutate({
      customerId: selectedCustomerId,
      amount: parseFloat(chargeForm.amount),
      description: chargeForm.description || undefined,
    });
  };

  const handleWithdraw = () => {
    if (!selectedCustomerId || !withdrawForm.amount) return;
    
    withdrawMutation.mutate({
      customerId: selectedCustomerId,
      amount: parseFloat(withdrawForm.amount),
      meterId: withdrawForm.meterId ? parseInt(withdrawForm.meterId) : undefined,
      description: withdrawForm.description || undefined,
    });
  };

  const getTransactionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      charge: "شحن",
      withdrawal: "سحب",
      payment: "دفع",
      refund: "استرداد",
      deposit: "إيداع",
      adjustment: "تعديل",
    };
    return types[type] || type;
  };

  const getTransactionTypeIcon = (type: string) => {
    if (["charge", "deposit", "refund"].includes(type)) {
      return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
    }
    return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
  };

  const getTransactionTypeColor = (type: string) => {
    if (["charge", "deposit", "refund"].includes(type)) {
      return "text-green-600";
    }
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">محافظ العملاء</h1>
          <p className="text-gray-500 mt-1">إدارة محافظ العملاء والمعاملات</p>
        </div>
      </div>

      {/* Search and Select Customer */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 space-y-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث بالاسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">اختر العميل</label>
          <select
            value={selectedCustomerId?.toString() || ""}
            onChange={(e) => setSelectedCustomerId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- اختر العميل --</option>
            {((customers as any)?.data || []).map((customer: any) => (
              <option key={customer.id} value={customer.id.toString()}>
                {customer.fullName} - {customer.mobileNo || customer.phone || ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Wallet Info */}
      {selectedCustomerId && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wallet Balance Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <Wallet className="h-8 w-8" />
                </div>
                <RefreshCw 
                  className="h-5 w-5 cursor-pointer hover:rotate-180 transition-transform"
                  onClick={() => refetchWallet()}
                />
              </div>
              <div className="text-sm opacity-90 mb-1">الرصيد الحالي</div>
              <div className="text-3xl font-bold">
                {walletLoading ? "..." : parseFloat(wallet?.balance || "0").toLocaleString()} ر.س
              </div>
              <div className="text-xs opacity-75 mt-2">
                آخر معاملة: {wallet?.lastTransactionDate 
                  ? new Date(wallet.lastTransactionDate).toLocaleDateString("ar-SA")
                  : "لا يوجد"}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
              <button
                onClick={() => setShowChargeModal(true)}
                className="w-full flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowUpCircle className="h-5 w-5" />
                شحن المحفظة
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={parseFloat(wallet?.balance || "0") <= 0}
                className="w-full flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownCircle className="h-5 w-5" />
                سحب من المحفظة
              </button>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">إحصائيات</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">إجمالي الشحنات</span>
                  <span className="font-bold text-green-600">
                    {transactions?.data
                      ?.filter((t: any) => ["charge", "deposit"].includes(t.transactionType))
                      .reduce((sum: number, t: any) => sum + parseFloat(t.amount || "0"), 0)
                      .toLocaleString() || "0"} ر.س
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">إجمالي السحوبات</span>
                  <span className="font-bold text-red-600">
                    {transactions?.data
                      ?.filter((t: any) => ["withdrawal", "payment"].includes(t.transactionType))
                      .reduce((sum: number, t: any) => sum + parseFloat(t.amount || "0"), 0)
                      .toLocaleString() || "0"} ر.س
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-gray-900 font-semibold">عدد المعاملات</span>
                  <span className="font-bold text-blue-600">
                    {transactions?.total || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">سجل المعاملات</h2>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">جميع الأنواع</option>
                <option value="charge">شحن</option>
                <option value="withdrawal">سحب</option>
                <option value="payment">دفع</option>
                <option value="refund">استرداد</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد قبل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد بعد</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactionsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : transactions?.data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        لا توجد معاملات
                      </td>
                    </tr>
                  ) : (
                    transactions?.data.map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getTransactionTypeIcon(transaction.transactionType)}
                            <span className="font-medium text-gray-900">
                              {getTransactionTypeLabel(transaction.transactionType)}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 font-bold ${getTransactionTypeColor(transaction.transactionType)}`}>
                          {["charge", "deposit", "refund"].includes(transaction.transactionType) ? "+" : "-"}
                          {parseFloat(transaction.amount || "0").toLocaleString()} ر.س
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {transaction.balanceBefore 
                            ? parseFloat(transaction.balanceBefore).toLocaleString() 
                            : "-"} ر.س
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {transaction.balanceAfter 
                            ? parseFloat(transaction.balanceAfter).toLocaleString() 
                            : "-"} ر.س
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {transaction.description || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(transaction.createdAt).toLocaleString("ar-SA")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {transactions && transactions.total > 20 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  عرض {(page - 1) * 20 + 1} - {Math.min(page * 20, transactions.total)} من {transactions.total}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    السابق
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 20 >= transactions.total}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Charge Modal */}
      {showChargeModal && selectedCustomerId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">شحن المحفظة</h2>
              <button onClick={() => { setShowChargeModal(false); resetChargeForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (ر.س) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={chargeForm.amount}
                  onChange={(e) => setChargeForm({ ...chargeForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (اختياري)</label>
                <textarea
                  value={chargeForm.description}
                  onChange={(e) => setChargeForm({ ...chargeForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="وصف العملية..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowChargeModal(false); resetChargeForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCharge}
                  disabled={!chargeForm.amount || chargeMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {chargeMutation.isPending ? "جاري الشحن..." : "شحن"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && selectedCustomerId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">سحب من المحفظة</h2>
              <button onClick={() => { setShowWithdrawModal(false); resetWithdrawForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">الرصيد المتاح</div>
                <div className="text-2xl font-bold text-blue-600">
                  {parseFloat(wallet?.balance || "0").toLocaleString()} ر.س
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (ر.س) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  max={parseFloat(wallet?.balance || "0")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العداد (اختياري - للدعم)</label>
                <input
                  type="number"
                  value={withdrawForm.meterId}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, meterId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="معرف العداد"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (اختياري)</label>
                <textarea
                  value={withdrawForm.description}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="وصف العملية..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowWithdrawModal(false); resetWithdrawForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawForm.amount || 
                    parseFloat(withdrawForm.amount) > parseFloat(wallet?.balance || "0") ||
                    withdrawMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {withdrawMutation.isPending ? "جاري السحب..." : "سحب"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

