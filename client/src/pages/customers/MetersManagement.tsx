import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Edit, Trash2, Gauge, Link, X, Zap, Droplets, Flame } from "lucide-react";

interface Meter {
  id: number;
  meterNumber: string;
  serialNumber: string | null;
  meterType: string;
  category: string;
  brand: string | null;
  model: string | null;
  currentReading: string | null;
  previousReading: string | null;
  balance: string | null;
  balanceDue: string | null;
  status: string;
  customerId: number | null;
  installationStatus: string;
  createdAt: Date;
}

export default function MetersManagement() {
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.customerSystem.getMeters.useQuery({
    page,
    limit: 20,
  });

  const { data: customers } = trpc.customerSystem.getCustomers.useQuery({ limit: 100 });
  const { data: tariffsData } = trpc.customerSystem.getTariffs.useQuery({});

  const createMutation = trpc.customerSystem.createMeter.useMutation({
    onSuccess: () => {
      refetch();
      setShowModal(false);
      resetForm();
    },
  });

  const linkMutation = trpc.customerSystem.linkMeterToCustomer.useMutation({
    onSuccess: () => {
      refetch();
      setShowLinkModal(false);
      setSelectedMeter(null);
    },
  });

  const [formData, setFormData] = useState({
    meterNumber: "",
    serialNumber: "",
    meterType: "electricity" as const,
    category: "offline" as const,
    brand: "",
    model: "",
    tariffId: "",
    installationStatus: "new" as const,
    previousReading: "0",
    signNumber: "",
    signColor: "",
  });

  const [linkCustomerId, setLinkCustomerId] = useState("");

  const resetForm = () => {
    setFormData({
      meterNumber: "",
      serialNumber: "",
      meterType: "electricity",
      category: "offline",
      brand: "",
      model: "",
      tariffId: "",
      installationStatus: "new",
      previousReading: "0",
      signNumber: "",
      signColor: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      businessId: 1,
      ...formData,
      tariffId: formData.tariffId ? parseInt(formData.tariffId) : undefined,
    });
  };

  const handleLink = () => {
    if (selectedMeter && linkCustomerId) {
      linkMutation.mutate({
        meterId: selectedMeter.id,
        customerId: parseInt(linkCustomerId),
      });
    }
  };

  const getMeterTypeIcon = (type: string) => {
    switch (type) {
      case "electricity": return <Zap className="h-5 w-5 text-yellow-500" />;
      case "water": return <Droplets className="h-5 w-5 text-blue-500" />;
      case "gas": return <Flame className="h-5 w-5 text-orange-500" />;
      default: return <Gauge className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMeterTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      electricity: "كهرباء",
      water: "ماء",
      gas: "غاز",
    };
    return types[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      offline: "عادي",
      iot: "ذكي (IoT)",
      code: "مسبق الدفع",
    };
    return categories[category] || category;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      faulty: "bg-red-100 text-red-800",
      not_installed: "bg-blue-100 text-blue-800",
    };
    const labels: Record<string, string> = {
      active: "نشط",
      inactive: "غير نشط",
      maintenance: "صيانة",
      faulty: "معطل",
      not_installed: "غير مركب",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.inactive}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة العدادات</h1>
          <p className="text-gray-500 mt-1">إضافة وإدارة العدادات وربطها بالعملاء</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          إضافة عداد جديد
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث برقم العداد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العداد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفئة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القراءة الحالية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد المستحق</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مرتبط بعميل</th>
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
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد عدادات
                  </td>
                </tr>
              ) : (
                data?.data.map((meter: Meter) => (
                  <tr key={meter.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getMeterTypeIcon(meter.meterType)}
                        <div>
                          <div className="font-medium text-gray-900">{meter.meterNumber}</div>
                          {meter.serialNumber && (
                            <div className="text-sm text-gray-500">{meter.serialNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{getMeterTypeLabel(meter.meterType)}</td>
                    <td className="px-6 py-4 text-gray-600">{getCategoryLabel(meter.category)}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono">
                      {parseFloat(meter.currentReading || "0").toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${parseFloat(meter.balanceDue || "0") > 0 ? "text-red-600" : "text-green-600"}`}>
                        {parseFloat(meter.balanceDue || "0").toLocaleString()} ر.س
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(meter.status)}</td>
                    <td className="px-6 py-4">
                      {meter.customerId ? (
                        <span className="text-green-600">✓ مرتبط</span>
                      ) : (
                        <span className="text-gray-400">غير مرتبط</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!meter.customerId && (
                          <button
                            onClick={() => {
                              setSelectedMeter(meter);
                              setShowLinkModal(true);
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="ربط بعميل"
                          >
                            <Link className="h-4 w-4" />
                          </button>
                        )}
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="تعديل">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="حذف">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Meter Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">إضافة عداد جديد</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم العداد *</label>
                  <input
                    type="text"
                    required
                    value={formData.meterNumber}
                    onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرقم التسلسلي</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع العداد</label>
                  <select
                    value={formData.meterType}
                    onChange={(e) => setFormData({ ...formData, meterType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="electricity">كهرباء</option>
                    <option value="water">ماء</option>
                    <option value="gas">غاز</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">فئة العداد</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="offline">عادي</option>
                    <option value="iot">ذكي (IoT)</option>
                    <option value="code">مسبق الدفع</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الشركة المصنعة</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموديل</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التعرفة</label>
                  <select
                    value={formData.tariffId}
                    onChange={(e) => setFormData({ ...formData, tariffId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- اختر التعرفة --</option>
                    {tariffsData?.data.map((tariff: any) => (
                      <option key={tariff.id} value={tariff.id}>{tariff.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">حالة التركيب</label>
                  <select
                    value={formData.installationStatus}
                    onChange={(e) => setFormData({ ...formData, installationStatus: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">جديد</option>
                    <option value="used">مستعمل</option>
                    <option value="not_installed">غير مركب</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">القراءة الافتتاحية</label>
                  <input
                    type="number"
                    value={formData.previousReading}
                    onChange={(e) => setFormData({ ...formData, previousReading: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم اللوحة</label>
                  <input
                    type="text"
                    value={formData.signNumber}
                    onChange={(e) => setFormData({ ...formData, signNumber: e.target.value })}
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
                  {createMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link to Customer Modal */}
      {showLinkModal && selectedMeter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">ربط العداد بعميل</h2>
              <button onClick={() => setShowLinkModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">رقم العداد:</p>
                <p className="font-bold text-gray-900">{selectedMeter.meterNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اختر العميل</label>
                <select
                  value={linkCustomerId}
                  onChange={(e) => setLinkCustomerId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- اختر العميل --</option>
                  {customers?.data.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>{customer.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleLink}
                  disabled={!linkCustomerId || linkMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {linkMutation.isPending ? "جاري الربط..." : "ربط"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
