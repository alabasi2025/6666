import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Zap, Shield, BarChart3, Settings } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const features = [
    { icon: BarChart3, title: "تحليلات متقدمة", description: "لوحات تحكم ذكية وتقارير شاملة" },
    { icon: Shield, title: "أمان عالي", description: "حماية متعددة المستويات للبيانات" },
    { icon: Settings, title: "إدارة متكاملة", description: "جميع العمليات في مكان واحد" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(oklch(0.55 0.2 250) 1px, transparent 1px),
                           linear-gradient(90deg, oklch(0.55 0.2 250) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-xl gradient-energy flex items-center justify-center energy-glow">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">نظام إدارة الطاقة</h1>
                <p className="text-sm text-muted-foreground">Energy Management System</p>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold text-foreground mb-6 leading-tight">
              إدارة <span className="text-gradient">ذكية</span> لقطاع الطاقة
            </h2>
            
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              منصة متكاملة لإدارة شركات الكهرباء والطاقة، تجمع بين الأصول والصيانة والعملاء والمحاسبة في نظام واحد احترافي.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-lg bg-card border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border">
            <CardHeader className="text-center pb-2">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-energy flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">مرحباً بك</CardTitle>
              <CardDescription className="text-muted-foreground">
                سجل دخولك للوصول إلى لوحة التحكم
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <Button 
                  className="w-full h-12 text-base font-medium gradient-energy hover:opacity-90 transition-opacity"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  <Zap className="w-5 h-5 ml-2" />
                  تسجيل الدخول
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">أو</span>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  ليس لديك حساب؟{" "}
                  <a href={getLoginUrl()} className="text-primary hover:underline font-medium">
                    إنشاء حساب جديد
                  </a>
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  بتسجيل الدخول، أنت توافق على{" "}
                  <a href="#" className="text-primary hover:underline">شروط الاستخدام</a>
                  {" "}و{" "}
                  <a href="#" className="text-primary hover:underline">سياسة الخصوصية</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
