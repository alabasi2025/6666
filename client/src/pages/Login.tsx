import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Zap, Shield, BarChart3, Settings, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

export default function Login() {
  const [location, setLocation] = useLocation();
  const pageInfo = resolvePageInfo(location);
  const [phone, setPhone] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("login_phone") || "0500000000";
      } catch {
        return "0500000000";
      }
    }
    return "0500000000";
  });
  const [password, setPassword] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("login_password") || "123456";
      } catch {
        return "123456";
      }
    }
    return "123456";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.loginWithPhone.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الدخول بنجاح");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "فشل تسجيل الدخول");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }
    // في الوضع التجريبي، كلمة المرور اختيارية
    const passwordToSend = password || "demo123";

    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ phone, password: passwordToSend } as any);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: BarChart3, title: "تحليلات متقدمة", description: "لوحات تحكم ذكية وتقارير شاملة" },
    { icon: Shield, title: "أمان عالي", description: "حماية متعددة المستويات للبيانات" },
    { icon: Settings, title: "إدارة متكاملة", description: "جميع العمليات في مكان واحد" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <EngineInfoDialog info={pageInfo} />
      </div>
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
              <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
              <CardDescription className="text-muted-foreground">
                أدخل رقم هاتفك وكلمة المرور للوصول إلى لوحة التحكم
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Input */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPhone(value);
                        try { localStorage.setItem("login_phone", value); } catch {}
                      }}
                      className="w-full h-11 pr-10 pl-4 text-right rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      dir="ltr"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="أدخل كلمة المرور"
                      value={password}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPassword(value);
                        try { localStorage.setItem("login_password", value); } catch {}
                      }}
                      className="w-full h-11 pr-10 pl-10 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <button type="button" onClick={() => toast.info("يرجى التواصل مع مدير النظام لإعادة تعيين كلمة المرور")} className="text-sm text-primary hover:underline">
                    نسيت كلمة المرور؟
                  </button>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="w-full h-12 text-base font-medium gradient-energy hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري تسجيل الدخول...
                    </div>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 ml-2" />
                      تسجيل الدخول
                    </>
                  )}
                </Button>
              </form>

              {/* Register Link */}
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  ليس لديك حساب؟{" "}
                  <button 
                    type="button" 
                    onClick={() => setLocation("/register")} 
                    className="text-primary hover:underline font-medium"
                  >
                    إنشاء حساب جديد
                  </button>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  بتسجيل الدخول، أنت توافق على{" "}
                  <button type="button" onClick={() => toast.info("شروط الاستخدام: باستخدامك للنظام فإنك توافق على الالتزام بسياسات الشركة")} className="text-primary hover:underline">شروط الاستخدام</button>
                  {" "}و{" "}
                  <button type="button" onClick={() => toast.info("سياسة الخصوصية: نحن نحمي بياناتك ولا نشاركها مع أطراف ثالثة")} className="text-primary hover:underline">سياسة الخصوصية</button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
