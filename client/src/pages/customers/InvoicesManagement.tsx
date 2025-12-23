// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Search, FileText, Check, Eye, Printer, Download, X } from "lucide-react";

interface Invoice {
  id: number;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string | null;
  customerId: number;
  meterId: number | null;
  meterNumber: string | null;
  previousReading: string | null;
  currentReading: string | null;
  totalConsumptionKWH: string | null;
  consumptionAmount: string | null;
  vatAmount: string | null;
  totalAmount: string | null;
  previousBalanceDue: string | null;
  finalAmount: string | null;
  paidAmount: string | null;
  balanceDue: string | null;
  status: string;
  invoiceType: string;
  createdAt: Date;
}

export default function InvoicesManagement() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.customerSystem.getInvoices.useQuery({
    page,
    limit: 20,
  });

  const { data: customers } = trpc.customerSystem.getCustomers.useQuery({ limit: 100 });

  const approveMutation = trpc.customerSystem.approveInvoice.useMutation({
    onSuccess: () => refetch(),
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      generated: "bg-yellow-100 text-yellow-800",
      partial: "bg-orange-100 text-orange-800",
      approved: "bg-blue-100 text-blue-800",
      locked: "bg-purple-100 text-purple-800",
      paid: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      generated: "مولدة",
      partial: "جزئية",
      approved: "معتمدة",
      locked: "مقفلة",
      paid: "مدفوعة",
      cancelled: "ملغاة",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.generated}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getInvoiceTypeLabel = (type: string) => {
    return type === "final" ? "نهائية" : "جزئية";
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers?.data.find((c: any) => c.id === customerId);
    return customer?.fullName || `عميل #${customerId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الفواتير</h1>
          <p className="text-gray-500 mt-1">عرض وإدارة فواتير العملاء</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">إجمالي الفواتير</p>
          <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">فواتير مدفوعة</p>
          <p className="text-2xl font-bold text-green-600">
            {data?.data.filter((i: Invoice) => i.status === "paid").length || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">فواتير معلقة</p>
          <p className="text-2xl font-bold text-yellow-600">
            {data?.data.filter((i: Invoice) => i.status !== "paid" && i.status !== "cancelled").length || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">إجمالي المستحقات</p>
          <p className="text-2xl font-bold text-red-600">
            {data?.data.reduce((sum: number, i: Invoice) => sum + parseFloat(i.balanceDue || "0"), 0).toLocaleString()} ر.س
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الفاتورة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العداد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاستهلاك</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستحق</th>
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
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    لا توجد فواتير
                  </td>
                </tr>
              ) : (
                data?.data.map((invoice: Invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{invoice.invoiceNo}</div>
                          <div className="text-sm text-gray-500">{invoice.invoiceDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{getCustomerName(invoice.customerId)}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono">{invoice.meterNumber || "-"}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {parseFloat(invoice.totalConsumptionKWH || "0").toLocaleString()} kWh
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {parseFloat(invoice.finalAmount || "0").toLocaleString()} ر.س
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${parseFloat(invoice.balanceDue || "0") > 0 ? "text-red-600" : "text-green-600"}`}>
                        {parseFloat(invoice.balanceDue || "0").toLocaleString()} ر.س
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowDetails(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="عرض التفاصيل"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {invoice.status === "generated" && (
                          <button
                            onClick={() => approveMutation.mutate({ id: invoice.id, approvedBy: 1 })}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="اعتماد"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button className="p-1 text-gray-600 hover:bg-gray-50 rounded" title="طباعة">
                          <Printer className="h-4 w-4" />
                        </button>
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

      {/* Invoice Details Modal */}
      {showDetails && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">تفاصيل الفاتورة</h2>
              <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedInvoice.invoiceNo}</h3>
                  <p className="text-gray-500">تاريخ الإصدار: {selectedInvoice.invoiceDate}</p>
                  {selectedInvoice.dueDate && (
                    <p className="text-gray-500">تاريخ الاستحقاق: {selectedInvoice.dueDate}</p>
                  )}
                </div>
                <div className="text-left">
                  {getStatusBadge(selectedInvoice.status)}
                  <p className="text-sm text-gray-500 mt-2">{getInvoiceTypeLabel(selectedInvoice.invoiceType)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">بيانات العميل</h4>
                <p className="text-gray-600">{getCustomerName(selectedInvoice.customerId)}</p>
                <p className="text-gray-600">رقم العداد: {selectedInvoice.meterNumber || "-"}</p>
              </div>

              {/* Consumption Details */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 text-gray-600">القراءة السابقة</td>
                      <td className="px-4 py-2 text-left font-mono">{parseFloat(selectedInvoice.previousReading || "0").toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-600">القراءة الحالية</td>
                      <td className="px-4 py-2 text-left font-mono">{parseFloat(selectedInvoice.currentReading || "0").toLocaleString()}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 text-gray-600">الاستهلاك (kWh)</td>
                      <td className="px-4 py-2 text-left font-bold">{parseFloat(selectedInvoice.totalConsumptionKWH || "0").toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount Details */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-gray-600">قيمة الاستهلاك</td>
                      <td className="px-4 py-2 text-left">{parseFloat(selectedInvoice.consumptionAmount || "0").toLocaleString()} ر.س</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 text-gray-600">ضريبة القيمة المضافة (15%)</td>
                      <td className="px-4 py-2 text-left">{parseFloat(selectedInvoice.vatAmount || "0").toLocaleString()} ر.س</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-600">إجمالي الفاتورة</td>
                      <td className="px-4 py-2 text-left font-bold">{parseFloat(selectedInvoice.totalAmount || "0").toLocaleString()} ر.س</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 text-gray-600">رصيد سابق</td>
                      <td className="px-4 py-2 text-left">{parseFloat(selectedInvoice.previousBalanceDue || "0").toLocaleString()} ر.س</td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td className="px-4 py-2 font-bold text-gray-900">المبلغ النهائي</td>
                      <td className="px-4 py-2 text-left font-bold text-blue-600">{parseFloat(selectedInvoice.finalAmount || "0").toLocaleString()} ر.س</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-600">المدفوع</td>
                      <td className="px-4 py-2 text-left text-green-600">{parseFloat(selectedInvoice.paidAmount || "0").toLocaleString()} ر.س</td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="px-4 py-2 font-bold text-gray-900">المستحق</td>
                      <td className="px-4 py-2 text-left font-bold text-red-600">{parseFloat(selectedInvoice.balanceDue || "0").toLocaleString()} ر.س</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إغلاق
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Printer className="h-4 w-4" />
                  طباعة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
