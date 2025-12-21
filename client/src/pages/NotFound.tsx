import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Home, ArrowRight, Search } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [location, setLocation] = useLocation();
  
  // Initialize trpc utils for potential future analytics
  const utils = trpc.useUtils();

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleGoDashboard = () => {
    setLocation("/dashboard");
  };

  const suggestedLinks = [
    { label: "لوحة التحكم", path: "/dashboard", icon: Home },
    { label: "نظام الفوترة", path: "/dashboard/billing", icon: Search },
    { label: "إدارة الأصول", path: "/dashboard/assets", icon: Search },
    { label: "الموارد البشرية", path: "/dashboard/hr", icon: Search },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4">
      <Card className="w-full max-w-lg mx-4 shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-red-500" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">404</h1>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
            الصفحة غير موجودة
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            عذراً، الصفحة التي تبحث عنها غير موجودة.
            <br />
            ربما تم نقلها أو حذفها.
          </p>

          {/* Current Path */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 mb-6 text-sm font-mono text-slate-600 dark:text-slate-400 break-all">
            {location}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button
              onClick={handleGoHome}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-4 h-4 ml-2" />
              الصفحة الرئيسية
            </Button>
            <Button
              onClick={handleGoDashboard}
              variant="outline"
              className="px-6 py-2.5 rounded-lg"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              لوحة التحكم
            </Button>
          </div>

          {/* Suggested Links */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">روابط مقترحة:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => setLocation(link.path)}
                  className="flex items-center gap-2 p-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
