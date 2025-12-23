// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, X, DollarSign } from "lucide-react";

interface Tariff {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  meterType: string;
  customerType: string | null;
  baseCharge: string | null;
  tier1Limit: string | null;
  tier1Rate: string | null;
  tier2Limit: string | null;
  tier2Rate: string | null;
  tier3Limit: string | null;
  tier3Rate: string | null;
  tier4Rate: string | null;
  vatRate: string | null;
  isActive: boolean | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  createdAt: Date;
}

export default function TariffsManagement() {
  const [showModal, setShowModal] = useState(false);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);

  const { data, isLoading, refetch } = trpc.customerSystem.getTariffs.useQuery({});

  const createMutation = trpc.customerSystem.createTariff.useMutation({
    onSuccess: () => {
      refetch();
      setShowModal(false);
      resetForm();
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    meterType: "electricity" as const,
    customerType: "residential",
    baseCharge: "0",
    tier1Limit: "2000",
    tier1Rate: "0.18",
    tier2Limit: "4000",
    tier2Rate: "0.20",
    tier3Limit: "6000",
    tier3Rate: "0.25",
    tier4Rate: "0.30",
    vatRate: "15",
    effectiveFrom: new Date().toISOString().split("T")[0],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      meterType: "electricity",
      customerType: "residential",
      baseCharge: "0",
      tier1Limit: "2000",
      tier1Rate: "0.18",
      tier2Limit: "4000",
      tier2Rate: "0.20",
      tier3Limit: "6000",
      tier3Rate: "0.25",
      tier4Rate: "0.30",
      vatRate: "15",
      effectiveFrom: new Date().toISOString().split("T")[0],
    });
    setEditingTariff(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      businessId: 1,
      ...formData,
    });
  };

  const getMeterTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      electricity: "كهرباء",
      water: "ماء",
      gas: "غاز",
    };
    return types[type] || type;
  };

  const getCustomerTypeLabel = (type: string | null) => {
    if (!type) return "الكل";
    const types: Record<string, string> = {
      residential: "سكني",
      commercial: "تجاري",
      industrial: "صناعي",
      government: "حكومي",
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التعرفة</h1>
          <p className="text-gray-500 mt-1">إدارة شرائح التعرفة وأسعار الاستهلاك</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          إضافة تعرفة جديدة
        </button>
      </div>

      {/* Tariffs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            لا توجد تعرفات
          </div>
        ) : (
          data?.data.map((tariff: Tariff) => (
            <div key={tariff.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{tariff.name}</h3>
                  <p className="text-sm text-gray-500">{tariff.code}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tariff.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                  {tariff.isActive ? "نشطة" : "غير نشطة"}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">نوع العداد:</span>
                  <span className="text-gray-900">{getMeterTypeLabel(tariff.meterType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">نوع العميل:</span>
                  <span className="text-gray-900">{getCustomerTypeLabel(tariff.customerType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الرسوم الثابتة:</span>
                  <span className="text-gray-900">{parseFloat(tariff.baseCharge || "0").toFixed(2)} ر.س</span>
                </div>
              </div>

              {/* Tiers */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">شرائح الاستهلاك:</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between bg-green-50 p-2 rounded">
                    <span>0 - {parseFloat(tariff.tier1Limit || "0").toLocaleString()} kWh</span>
                    <span className="font-bold text-green-700">{tariff.tier1Rate} ر.س/kWh</span>
                  </div>
                  <div className="flex justify-between bg-yellow-50 p-2 rounded">
                    <span>{parseFloat(tariff.tier1Limit || "0").toLocaleString()} - {parseFloat(tariff.tier2Limit || "0").toLocaleString()} kWh</span>
                    <span className="font-bold text-yellow-700">{tariff.tier2Rate} ر.س/kWh</span>
                  </div>
                  <div className="flex justify-between bg-orange-50 p-2 rounded">
                    <span>{parseFloat(tariff.tier2Limit || "0").toLocaleString()} - {parseFloat(tariff.tier3Limit || "0").toLocaleString()} kWh</span>
                    <span className="font-bold text-orange-700">{tariff.tier3Rate} ر.س/kWh</span>
                  </div>
                  <div className="flex justify-between bg-red-50 p-2 rounded">
                    <span>أكثر من {parseFloat(tariff.tier3Limit || "0").toLocaleString()} kWh</span>
                    <span className="font-bold text-red-700">{tariff.tier4Rate} ر.س/kWh</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500">ضريبة: {tariff.vatRate}%</span>
                <div className="flex gap-2">
                  <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTariff ? "تعديل التعرفة" : "إضافة تعرفة جديدة"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم التعرفة *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: تعرفة سكنية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكود</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="RES-01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع العميل</label>
                  <select
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="residential">سكني</option>
                    <option value="commercial">تجاري</option>
                    <option value="industrial">صناعي</option>
                    <option value="government">حكومي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرسوم الثابتة (ر.س)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.baseCharge}
                    onChange={(e) => setFormData({ ...formData, baseCharge: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نسبة الضريبة (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.vatRate}
                    onChange={(e) => setFormData({ ...formData, vatRate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-3">شرائح الاستهلاك</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 items-center bg-green-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-green-700">الشريحة الأولى</span>
                    <div>
                      <label className="text-xs text-gray-500">الحد (kWh)</label>
                      <input
                        type="number"
                        value={formData.tier1Limit}
                        onChange={(e) => setFormData({ ...formData, tier1Limit: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">السعر (ر.س/kWh)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.tier1Rate}
                        onChange={(e) => setFormData({ ...formData, tier1Rate: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center bg-yellow-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-yellow-700">الشريحة الثانية</span>
                    <div>
                      <label className="text-xs text-gray-500">الحد (kWh)</label>
                      <input
                        type="number"
                        value={formData.tier2Limit}
                        onChange={(e) => setFormData({ ...formData, tier2Limit: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">السعر (ر.س/kWh)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.tier2Rate}
                        onChange={(e) => setFormData({ ...formData, tier2Rate: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center bg-orange-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-orange-700">الشريحة الثالثة</span>
                    <div>
                      <label className="text-xs text-gray-500">الحد (kWh)</label>
                      <input
                        type="number"
                        value={formData.tier3Limit}
                        onChange={(e) => setFormData({ ...formData, tier3Limit: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">السعر (ر.س/kWh)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.tier3Rate}
                        onChange={(e) => setFormData({ ...formData, tier3Rate: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center bg-red-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-red-700">الشريحة الرابعة</span>
                    <div className="text-center text-sm text-gray-500">ما فوق</div>
                    <div>
                      <label className="text-xs text-gray-500">السعر (ر.س/kWh)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.tier4Rate}
                        onChange={(e) => setFormData({ ...formData, tier4Rate: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ السريان</label>
                <input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
