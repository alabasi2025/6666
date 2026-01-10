import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { 
  ArrowRightLeft, Plus, Search, Filter, X, Eye, 
  CheckCircle, XCircle, Clock, AlertCircle, Calendar,
  TrendingUp, TrendingDown, DollarSign, FileText, CreditCard
} from "lucide-react";

interface FinancialTransfer {
  id: number;
  transferNumber: string;
  transferType: string;
  transferDate: string;
  periodStartDate: string | null;
  periodEndDate: string | null;
  salesTotalAmount: string;
  salesCount: number;
  collectionsTotalAmount: string;
  collectionsCount: number;
  status: string;
  journalEntryId: number | null;
  notes: string | null;
  createdAt: Date;
}

export default function FinancialTransfers() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<FinancialTransfer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const { data, isLoading, refetch } = trpc.customerSystem.getFinancialTransfers.useQuery({
    businessId: 1,
    page,
    limit: 20,
    status: filterStatus !== "all" ? filterStatus as any : undefined,
    transferType: filterType !== "all" ? filterType as any : undefined,
  });

  const { data: transferDetails, isLoading: detailsLoading } = trpc.customerSystem.getFinancialTransferDetails.useQuery(
    { transferId: selectedTransfer?.id || 0 },
    { enabled: !!selectedTransfer && showDetailsModal }
  );

  const createMutation = trpc.customerSystem.createFinancialTransfer.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreateModal(false);
      resetForm();
    },
  });

  const confirmMutation = trpc.customerSystem.confirmFinancialTransfer.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const cancelMutation = trpc.customerSystem.cancelFinancialTransfer.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const [formData, setFormData] = useState({
    transferType: "both" as const,
    transferDate: new Date().toISOString().split('T')[0],
    periodStartDate: "",
    periodEndDate: "",
    salesAccountId: "",
    collectionsAccountId: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      transferType: "both",
      transferDate: new Date().toISOString().split('T')[0],
      periodStartDate: "",
      periodEndDate: "",
      salesAccountId: "",
      collectionsAccountId: "",
      notes: "",
    });
  };

  const handleCreate = () => {
    createMutation.mutate({
      businessId: 1,
      transferType: formData.transferType,
      transferDate: formData.transferDate,
      periodStartDate: formData.periodStartDate || undefined,
      periodEndDate: formData.periodEndDate || undefined,
      salesAccountId: formData.salesAccountId ? parseInt(formData.salesAccountId) : undefined,
      collectionsAccountId: formData.collectionsAccountId ? parseInt(formData.collectionsAccountId) : undefined,
      notes: formData.notes || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    const labels: Record<string, string> = {
      pending: "معلق",
      processing: "قيد المعالجة",
      completed: "مكتمل",
      failed: "فشل",
      cancelled: "ملغي",
    };
    const icons: Record<string, any> = {
      pending: Clock,
      processing: AlertCircle,
      completed: CheckCircle,
      failed: XCircle,
      cancelled: XCircle,
    };
    const Icon = icons[status] || Clock;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        <Icon className="h-3 w-3" />
        {labels[status] || status}
      </span>
    );
  };

  const getTransferTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      sales: "مبيعات",
      collections: "تحصيلات",
      both: "مبيعات و تحصيلات",
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الترحيل المالي/المحاسبي</h1>
          <p className="text-gray-500 mt-1">إدارة الترحيبات المالية للمبيعات والتحصيلات</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          ترحيل جديد
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث برقم الترحيل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">معلق</option>
            <option value="processing">قيد المعالجة</option>
            <option value="completed">مكتمل</option>
            <option value="failed">فشل</option>
            <option value="cancelled">ملغي</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">جميع الأنواع</option>
            <option value="sales">مبيعات</option>
            <option value="collections">تحصيلات</option>
            <option value="both">مبيعات و تحصيلات</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-600">معلق</span>
          </div>
          <div className="text-2xl font-bold">
            {data?.data.filter((t: any) => t.status === "pending").length || 0}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600">مكتمل</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {data?.data.filter((t: any) => t.status === "completed").length || 0}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600">إجمالي المبيعات المرحلة</span>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {data?.data
              .filter((t: any) => t.status === "completed")
              .reduce((sum: number, t: any) => sum + parseFloat(t.salesTotalAmount || "0"), 0)
              .toLocaleString()} ر.س
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-gray-600">إجمالي التحصيلات المرحلة</span>
          </div>
          <div className="text-xl font-bold text-purple-600">
            {data?.data
              .filter((t: any) => t.status === "completed")
              .reduce((sum: number, t: any) => sum + parseFloat(t.collectionsTotalAmount || "0"), 0)
              .toLocaleString()} ر.س
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الترحيل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبيعات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التحصيلات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    لا توجد ترحيبات
                  </td>
                </tr>
              ) : (
                data?.data.map((transfer: any) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">{transfer.transferNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{getTransferTypeLabel(transfer.transferType)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(transfer.transferDate).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-6 py-4">
                      {parseFloat(transfer.salesTotalAmount || "0") > 0 ? (
                        <div>
                          <div className="font-medium text-blue-600">
                            {parseFloat(transfer.salesTotalAmount).toLocaleString()} ر.س
                          </div>
                          <div className="text-xs text-gray-500">({transfer.salesCount} فاتورة)</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {parseFloat(transfer.collectionsTotalAmount || "0") > 0 ? (
                        <div>
                          <div className="font-medium text-purple-600">
                            {parseFloat(transfer.collectionsTotalAmount).toLocaleString()} ر.س
                          </div>
                          <div className="text-xs text-gray-500">({transfer.collectionsCount} دفعة)</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(transfer.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTransfer(transfer);
                            setShowDetailsModal(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="التفاصيل"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {transfer.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                if (confirm("هل أنت متأكد من تأكيد هذا الترحيل؟")) {
                                  confirmMutation.mutate({ transferId: transfer.id });
                                }
                              }}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="تأكيد"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("هل أنت متأكد من إلغاء هذا الترحيل؟")) {
                                  cancelMutation.mutate({ transferId: transfer.id });
                                }
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="إلغاء"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              عرض {(page - 1) * 20 + 1} - {Math.min(page * 20, data.total)} من {data.total}
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
                disabled={page * 20 >= data.total}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">إنشاء ترحيل مالي جديد</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الترحيل *</label>
                  <select
                    value={formData.transferType}
                    onChange={(e) => setFormData({ ...formData, transferType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="sales">مبيعات فقط</option>
                    <option value="collections">تحصيلات فقط</option>
                    <option value="both">مبيعات و تحصيلات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الترحيل *</label>
                  <input
                    type="date"
                    required
                    value={formData.transferDate}
                    onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ بداية الفترة (للمبيعات)</label>
                  <input
                    type="date"
                    value={formData.periodStartDate}
                    onChange={(e) => setFormData({ ...formData, periodStartDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">اتركه فارغاً للترحيل اليومي (للتحصيلات)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ نهاية الفترة (للمبيعات)</label>
                  <input
                    type="date"
                    value={formData.periodEndDate}
                    onChange={(e) => setFormData({ ...formData, periodEndDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {(formData.transferType === "sales" || formData.transferType === "both") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">حساب المبيعات (في النظام المالي)</label>
                    <input
                      type="number"
                      value={formData.salesAccountId}
                      onChange={(e) => setFormData({ ...formData, salesAccountId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="معرف الحساب"
                    />
                  </div>
                )}
                {(formData.transferType === "collections" || formData.transferType === "both") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">حساب التحصيلات (في النظام المالي)</label>
                    <input
                      type="number"
                      value={formData.collectionsAccountId}
                      onChange={(e) => setFormData({ ...formData, collectionsAccountId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="معرف الحساب"
                    />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="ملاحظات إضافية..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء ترحيل"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">تفاصيل الترحيل - {selectedTransfer.transferNumber}</h2>
              <button onClick={() => { setShowDetailsModal(false); setSelectedTransfer(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {detailsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : transferDetails ? (
                <>
                  {/* Transfer Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">نوع الترحيل</div>
                      <div className="font-bold">{getTransferTypeLabel(transferDetails.transfer.transferType)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">الحالة</div>
                      <div>{getStatusBadge(transferDetails.transfer.status)}</div>
                    </div>
                    {(transferDetails.transfer.transferType === "sales" || transferDetails.transfer.transferType === "both") && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">إجمالي المبيعات</div>
                        <div className="text-2xl font-bold text-green-600">
                          {parseFloat(transferDetails.transfer.salesTotalAmount || "0").toLocaleString()} ر.س
                        </div>
                        <div className="text-xs text-gray-500 mt-1">({transferDetails.transfer.salesCount} فاتورة)</div>
                      </div>
                    )}
                    {(transferDetails.transfer.transferType === "collections" || transferDetails.transfer.transferType === "both") && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">إجمالي التحصيلات</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {parseFloat(transferDetails.transfer.collectionsTotalAmount || "0").toLocaleString()} ر.س
                        </div>
                        <div className="text-xs text-gray-500 mt-1">({transferDetails.transfer.collectionsCount} دفعة)</div>
                      </div>
                    )}
                  </div>

                  {/* Details Table */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">تفاصيل المرحلة</h3>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">رقم المرجع</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {transferDetails.details.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                لا توجد تفاصيل
                              </td>
                            </tr>
                          ) : (
                            transferDetails.details.map((detail: any) => (
                              <tr key={detail.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    detail.referenceType === "invoice" 
                                      ? "bg-red-100 text-red-800" 
                                      : "bg-green-100 text-green-800"
                                  }`}>
                                    {detail.referenceType === "invoice" ? "فاتورة" : "دفعة"}
                                  </span>
                                </td>
                                <td className="px-4 py-2 font-mono text-sm">{detail.referenceId}</td>
                                <td className="px-4 py-2 font-bold">
                                  {parseFloat(detail.amount || "0").toLocaleString()} ر.س
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد بيانات</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

