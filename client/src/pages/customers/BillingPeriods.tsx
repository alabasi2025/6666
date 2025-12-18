import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Calendar, Play, Check, Lock, X, FileText } from "lucide-react";

interface BillingPeriod {
  id: number;
  name: string;
  periodNumber: number | null;
  month: number | null;
  year: number | null;
  startDate: string;
  endDate: string;
  status: string;
  totalMeters: number | null;
  readMeters: number | null;
  billedMeters: number | null;
  createdAt: Date;
}

export default function BillingPeriods() {
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, refetch } = trpc.customerSystem.getBillingPeriods.useQuery({});

  const createMutation = trpc.customerSystem.createBillingPeriod.useMutation({
    onSuccess: () => {
      refetch();
      setShowModal(false);
      resetForm();
    },
  });

  const updateStatusMutation = trpc.customerSystem.updateBillingPeriodStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const calculateInvoicesMutation = trpc.customerSystem.calculateInvoices.useMutation({
    onSuccess: (data) => {
      alert(`تم توليد ${data.count} فاتورة بنجاح!`);
      refetch();
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
    readingStartDate: "",
    readingEndDate: "",
    billingDate: "",
    dueDate: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      startDate: "",
      endDate: "",
      readingStartDate: "",
      readingEndDate: "",
      billingDate: "",
      dueDate: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      businessId: 1,
      ...formData,
      periodNumber: formData.month,
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-gray-100 text-gray-800",
      active: "bg-blue-100 text-blue-800",
      reading_phase: "bg-yellow-100 text-yellow-800",
      billing_phase: "bg-purple-100 text-purple-800",
      closed: "bg-green-100 text-green-800",
    };
    const labels: Record<string, string> = {
      pending: "معلقة",
      active: "نشطة",
      reading_phase: "مرحلة القراءات",
      billing_phase: "مرحلة الفوترة",
      closed: "مغلقة",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getNextStatus = (currentStatus: string) => {
    const flow: Record<string, string> = {
      pending: "active",
      active: "reading_phase",
      reading_phase: "billing_phase",
      billing_phase: "closed",
    };
    return flow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus: string) => {
    const labels: Record<string, string> = {
      pending: "تفعيل",
      active: "بدء القراءات",
      reading_phase: "بدء الفوترة",
      billing_phase: "إغلاق الفترة",
    };
    return labels[currentStatus];
  };

  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">فترات الفوترة</h1>
          <p className="text-gray-500 mt-1">إنشاء وإدارة فترات الفوترة الشهرية</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          إنشاء فترة جديدة
        </button>
      </div>

      {/* Periods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            لا توجد فترات فوترة
          </div>
        ) : (
          data?.data.map((period: BillingPeriod) => (
            <div key={period.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{period.name}</h3>
                  <p className="text-sm text-gray-500">
                    {period.month && period.year ? `${months[period.month - 1]} ${period.year}` : ""}
                  </p>
                </div>
                {getStatusBadge(period.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">تاريخ البداية:</span>
                  <span className="text-gray-900">{period.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">تاريخ النهاية:</span>
                  <span className="text-gray-900">{period.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">العدادات:</span>
                  <span className="text-gray-900">{period.totalMeters || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">تم قراءتها:</span>
                  <span className="text-gray-900">{period.readMeters || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">تم فوترتها:</span>
                  <span className="text-gray-900">{period.billedMeters || 0}</span>
                </div>
              </div>

              {/* Progress Bar */}
              {period.totalMeters && period.totalMeters > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${((period.readMeters || 0) / period.totalMeters) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {Math.round(((period.readMeters || 0) / period.totalMeters) * 100)}% مكتمل
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                {period.status !== "closed" && getNextStatus(period.status) && (
                  <button
                    onClick={() => {
                      const nextStatus = getNextStatus(period.status);
                      if (nextStatus) {
                        updateStatusMutation.mutate({
                          id: period.id,
                          status: nextStatus as any,
                        });
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm"
                  >
                    <Play className="h-4 w-4" />
                    {getNextStatusLabel(period.status)}
                  </button>
                )}
                {period.status === "reading_phase" && (
                  <button
                    onClick={() => calculateInvoicesMutation.mutate({ billingPeriodId: period.id })}
                    disabled={calculateInvoicesMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    توليد الفواتير
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">إنشاء فترة فوترة جديدة</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفترة *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: فترة يناير 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الشهر</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السنة</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">بداية القراءات</label>
                  <input
                    type="date"
                    value={formData.readingStartDate}
                    onChange={(e) => setFormData({ ...formData, readingStartDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نهاية القراءات</label>
                  <input
                    type="date"
                    value={formData.readingEndDate}
                    onChange={(e) => setFormData({ ...formData, readingEndDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الفوترة</label>
                  <input
                    type="date"
                    value={formData.billingDate}
                    onChange={(e) => setFormData({ ...formData, billingDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
