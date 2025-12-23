// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, CreditCard, Receipt, X, DollarSign, Banknote } from "lucide-react";

interface Payment {
  id: number;
  paymentNo: string;
  paymentDate: string;
  customerId: number;
  invoiceId: number | null;
  amount: string;
  paymentMethod: string;
  referenceNo: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
}

export default function PaymentsManagement() {
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.customerSystem.getPayments.useQuery({
    page,
    limit: 20,
  });

  const { data: customers } = trpc.customerSystem.getCustomers.useQuery({ limit: 100 });
  const { data: invoices } = trpc.customerSystem.getInvoices.useQuery({ limit: 100 });

  const createMutation = trpc.customerSystem.createPayment.useMutation({
    onSuccess: () => {
      refetch();
      setShowModal(false);
      resetForm();
    },
  });

  const [formData, setFormData] = useState({
    customerId: "",
    invoiceId: "",
    amount: "",
    paymentMethod: "cash" as const,
    referenceNo: "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      customerId: "",
      invoiceId: "",
      amount: "",
      paymentMethod: "cash",
      referenceNo: "",
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  const handleCustomerSelect = (customerId: string) => {
    setFormData({ ...formData, customerId, invoiceId: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      businessId: 1,
      customerId: parseInt(formData.customerId),
      invoiceId: formData.invoiceId ? parseInt(formData.invoiceId) : undefined,
      amount: formData.amount,
      paymentMethod: formData.paymentMethod,
      referenceNo: formData.referenceNo || undefined,
      paymentDate: formData.paymentDate,
      notes: formData.notes || undefined,
      collectedBy: 1,
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash": return <Banknote className="h-5 w-5 text-green-500" />;
      case "bank_transfer": return <DollarSign className="h-5 w-5 text-blue-500" />;
      case "card": return <CreditCard className="h-5 w-5 text-purple-500" />;
      default: return <Receipt className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: "نقدي",
      bank_transfer: "تحويل بنكي",
      card: "بطاقة",
      check: "شيك",
      online: "إلكتروني",
    };
    return methods[method] || method;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    const labels: Record<string, string> = {
      pending: "معلق",
      completed: "مكتمل",
      cancelled: "ملغي",
      refunded: "مسترد",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers?.data.find((c: any) => c.id === customerId);
    return customer?.fullName || `عميل #${customerId}`;
  };

  const getCustomerInvoices = () => {
    if (!formData.customerId) return [];
    return invoices?.data.filter((i: any) => 
      i.customerId === parseInt(formData.customerId) && 
      parseFloat(i.balanceDue || "0") > 0
    ) || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المدفوعات</h1>
          <p className="text-gray-500 mt-1">تسجيل وإدارة مدفوعات العملاء</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          تسجيل دفعة جديدة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">إجمالي المدفوعات</p>
          <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">إجمالي المبالغ المحصلة</p>
          <p className="text-2xl font-bold text-green-600">
            {data?.data.reduce((sum: number, p: Payment) => sum + parseFloat(p.amount), 0).toLocaleString()} ر.س
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">مدفوعات اليوم</p>
          <p className="text-2xl font-bold text-blue-600">
            {data?.data.filter((p: Payment) => p.paymentDate === new Date().toISOString().split("T")[0]).length || 0}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الدفعة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">طريقة الدفع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    لا توجد مدفوعات
                  </td>
                </tr>
              ) : (
                data?.data.map((payment: Payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{payment.paymentNo}</div>
                          {payment.referenceNo && (
                            <div className="text-sm text-gray-500">مرجع: {payment.referenceNo}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{getCustomerName(payment.customerId)}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">
                        {parseFloat(payment.amount).toLocaleString()} ر.س
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="text-gray-600">{getPaymentMethodLabel(payment.paymentMethod)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{payment.paymentDate}</td>
                    <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">تسجيل دفعة جديدة</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العميل *</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- اختر العميل --</option>
                  {customers?.data.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>{customer.fullName}</option>
                  ))}
                </select>
              </div>
              {formData.customerId && getCustomerInvoices().length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفاتورة (اختياري)</label>
                  <select
                    value={formData.invoiceId}
                    onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- دفعة عامة --</option>
                    {getCustomerInvoices().map((invoice: any) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNo} - مستحق: {parseFloat(invoice.balanceDue).toLocaleString()} ر.س
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">نقدي</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="card">بطاقة</option>
                  <option value="check">شيك</option>
                  <option value="online">إلكتروني</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم المرجع</label>
                <input
                  type="text"
                  value={formData.referenceNo}
                  onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="رقم الحوالة أو الشيك"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الدفع *</label>
                <input
                  type="date"
                  required
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? "جاري الحفظ..." : "تسجيل الدفعة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
