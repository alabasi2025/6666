import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { 
  Users, Gauge, FileText, CreditCard, TrendingUp, 
  AlertCircle, CheckCircle, Clock, DollarSign 
} from "lucide-react";

export default function CustomerDashboard() {
  const { data: stats, isLoading } = trpc.customerSystem.getDashboardStats.useQuery({});

  const statCards = [
    {
      title: "إجمالي العملاء",
      value: stats?.customersCount || 0,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "إجمالي العدادات",
      value: stats?.metersCount || 0,
      icon: Gauge,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "الفواتير",
      value: stats?.invoicesCount || 0,
      icon: FileText,
      color: "bg-purple-500",
      change: "+15%",
    },
    {
      title: "إجمالي الإيرادات",
      value: `${(stats?.totalRevenue || 0).toLocaleString()} ر.س`,
      icon: DollarSign,
      color: "bg-emerald-500",
      change: "+20%",
    },
    {
      title: "المستحقات المتأخرة",
      value: `${(stats?.totalOutstanding || 0).toLocaleString()} ر.س`,
      icon: AlertCircle,
      color: "bg-red-500",
      change: "-5%",
    },
  ];

  const quickActions = [
    { title: "إضافة عميل جديد", icon: Users, href: "/dashboard/customers/customers" },
    { title: "إضافة عداد", icon: Gauge, href: "/dashboard/customers/meters" },
    { title: "إدخال قراءات", icon: FileText, href: "/dashboard/customers/readings" },
    { title: "تحصيل دفعة", icon: CreditCard, href: "/dashboard/customers/payments" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">نظام العملاء والفوترة</h1>
          <p className="text-gray-500 mt-1">نظرة عامة على إدارة العملاء والعدادات والفوترة</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <action.icon className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">{action.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Workflow Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">سير عمل الفوترة</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs mt-2 text-gray-600">إنشاء فترة</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Gauge className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-xs mt-2 text-gray-600">إدخال القراءات</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs mt-2 text-gray-600">اعتماد القراءات</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs mt-2 text-gray-600">توليد الفواتير</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-xs mt-2 text-gray-600">التحصيل</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">إدارة العملاء</h3>
          <p className="text-gray-500 text-sm mb-4">إضافة وتعديل بيانات العملاء وربطهم بالعدادات</p>
          <a href="/dashboard/customers/customers" className="text-blue-600 text-sm font-medium hover:underline">
            الذهاب للعملاء ←
          </a>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">إدارة العدادات</h3>
          <p className="text-gray-500 text-sm mb-4">إضافة العدادات وربطها بالكابينات والعملاء</p>
          <a href="/dashboard/customers/meters" className="text-blue-600 text-sm font-medium hover:underline">
            الذهاب للعدادات ←
          </a>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">فترات الفوترة</h3>
          <p className="text-gray-500 text-sm mb-4">إنشاء وإدارة فترات الفوترة الشهرية</p>
          <a href="/dashboard/customers/billing-periods" className="text-blue-600 text-sm font-medium hover:underline">
            الذهاب لفترات الفوترة ←
          </a>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">قراءات العدادات</h3>
          <p className="text-gray-500 text-sm mb-4">إدخال واعتماد قراءات العدادات</p>
          <a href="/dashboard/customers/readings" className="text-blue-600 text-sm font-medium hover:underline">
            الذهاب للقراءات ←
          </a>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">الفواتير</h3>
          <p className="text-gray-500 text-sm mb-4">توليد واعتماد الفواتير</p>
          <a href="/dashboard/customers/invoices" className="text-blue-600 text-sm font-medium hover:underline">
            الذهاب للفواتير ←
          </a>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">المدفوعات</h3>
          <p className="text-gray-500 text-sm mb-4">تحصيل المدفوعات وإصدار الإيصالات</p>
          <a href="/dashboard/customers/payments" className="text-blue-600 text-sm font-medium hover:underline">
            الذهاب للمدفوعات ←
          </a>
        </div>
      </div>
    </div>
  );
}
