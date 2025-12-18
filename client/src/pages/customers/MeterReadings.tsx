import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Check, X, Gauge, Camera } from "lucide-react";

interface MeterReading {
  id: number;
  meterId: number;
  billingPeriodId: number;
  currentReading: string;
  previousReading: string | null;
  consumption: string | null;
  readingDate: string;
  readingType: string;
  status: string;
  isEstimated: boolean | null;
  notes: string | null;
  createdAt: Date;
}

export default function MeterReadings() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);

  const { data: periods } = trpc.customerSystem.getBillingPeriods.useQuery({});
  const { data: meters } = trpc.customerSystem.getMeters.useQuery({ limit: 100 });

  const { data: readings, isLoading, refetch } = trpc.customerSystem.getMeterReadings.useQuery({
    billingPeriodId: selectedPeriod || undefined,
  });

  const createMutation = trpc.customerSystem.createMeterReading.useMutation({
    onSuccess: () => {
      refetch();
      setShowModal(false);
      resetForm();
    },
  });

  const approveMutation = trpc.customerSystem.approveReading.useMutation({
    onSuccess: () => refetch(),
  });

  const [formData, setFormData] = useState({
    meterId: "",
    billingPeriodId: "",
    currentReading: "",
    previousReading: "",
    readingDate: new Date().toISOString().split("T")[0],
    readingType: "actual" as const,
    isEstimated: false,
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      meterId: "",
      billingPeriodId: selectedPeriod?.toString() || "",
      currentReading: "",
      previousReading: "",
      readingDate: new Date().toISOString().split("T")[0],
      readingType: "actual",
      isEstimated: false,
      notes: "",
    });
  };

  const handleMeterSelect = (meterId: string) => {
    const meter = meters?.data.find((m: any) => m.id === parseInt(meterId));
    setFormData({
      ...formData,
      meterId,
      previousReading: meter?.currentReading || "0",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      meterId: parseInt(formData.meterId),
      billingPeriodId: parseInt(formData.billingPeriodId),
      currentReading: formData.currentReading,
      previousReading: formData.previousReading,
      readingDate: formData.readingDate,
      readingType: formData.readingType,
      isEstimated: formData.isEstimated,
      notes: formData.notes || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      entered: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      locked: "bg-blue-100 text-blue-800",
      disputed: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      entered: "مدخلة",
      approved: "معتمدة",
      locked: "مقفلة",
      disputed: "متنازع عليها",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.entered}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getReadingTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      actual: "فعلية",
      estimated: "تقديرية",
      adjusted: "معدلة",
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">قراءات العدادات</h1>
          <p className="text-gray-500 mt-1">إدخال واعتماد قراءات العدادات</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          إدخال قراءة جديدة
        </button>
      </div>

      {/* Filter by Period */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">فترة الفوترة:</label>
          <select
            value={selectedPeriod || ""}
            onChange={(e) => setSelectedPeriod(e.target.value ? parseInt(e.target.value) : null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الفترات</option>
            {periods?.data.map((period: any) => (
              <option key={period.id} value={period.id}>{period.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العداد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القراءة السابقة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القراءة الحالية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاستهلاك</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ القراءة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : readings?.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    لا توجد قراءات
                  </td>
                </tr>
              ) : (
                readings?.data.map((reading: MeterReading) => {
                  const meter = meters?.data.find((m: any) => m.id === reading.meterId);
                  return (
                    <tr key={reading.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{meter?.meterNumber || reading.meterId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono">
                        {parseFloat(reading.previousReading || "0").toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-mono font-bold">
                        {parseFloat(reading.currentReading).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-600">
                          {parseFloat(reading.consumption || "0").toLocaleString()} kWh
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{reading.readingDate}</td>
                      <td className="px-6 py-4 text-gray-600">{getReadingTypeLabel(reading.readingType)}</td>
                      <td className="px-6 py-4">{getStatusBadge(reading.status)}</td>
                      <td className="px-6 py-4">
                        {reading.status === "entered" && (
                          <button
                            onClick={() => approveMutation.mutate({ id: reading.id, approvedBy: 1 })}
                            className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm"
                          >
                            <Check className="h-4 w-4" />
                            اعتماد
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">إدخال قراءة جديدة</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">فترة الفوترة *</label>
                <select
                  required
                  value={formData.billingPeriodId}
                  onChange={(e) => setFormData({ ...formData, billingPeriodId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- اختر الفترة --</option>
                  {periods?.data.filter((p: any) => p.status === "reading_phase" || p.status === "active").map((period: any) => (
                    <option key={period.id} value={period.id}>{period.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العداد *</label>
                <select
                  required
                  value={formData.meterId}
                  onChange={(e) => handleMeterSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- اختر العداد --</option>
                  {meters?.data.filter((m: any) => m.customerId).map((meter: any) => (
                    <option key={meter.id} value={meter.id}>{meter.meterNumber}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">القراءة السابقة</label>
                  <input
                    type="number"
                    value={formData.previousReading}
                    onChange={(e) => setFormData({ ...formData, previousReading: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">القراءة الحالية *</label>
                  <input
                    type="number"
                    required
                    value={formData.currentReading}
                    onChange={(e) => setFormData({ ...formData, currentReading: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {formData.currentReading && formData.previousReading && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">
                    الاستهلاك المحسوب: <strong>{(parseFloat(formData.currentReading) - parseFloat(formData.previousReading)).toLocaleString()} kWh</strong>
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ القراءة *</label>
                <input
                  type="date"
                  required
                  value={formData.readingDate}
                  onChange={(e) => setFormData({ ...formData, readingDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع القراءة</label>
                <select
                  value={formData.readingType}
                  onChange={(e) => setFormData({ ...formData, readingType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="actual">فعلية</option>
                  <option value="estimated">تقديرية</option>
                  <option value="adjusted">معدلة</option>
                </select>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
