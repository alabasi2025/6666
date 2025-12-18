import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import {
  Zap, Building2, Package, Wrench, UserCircle, Activity,
  BarChart3, Shield, ArrowLeft, CheckCircle2, Globe,
  Smartphone, Cloud, Lock, TrendingUp, Users
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  const features = [
    {
      icon: Building2,
      title: "إدارة الهيكل التنظيمي",
      description: "إدارة الشركات والفروع والمحطات بهيكل هرمي مرن",
    },
    {
      icon: Package,
      title: "إدارة الأصول الثابتة",
      description: "تتبع دورة حياة الأصول من الشراء حتى الإهلاك",
    },
    {
      icon: Wrench,
      title: "نظام الصيانة",
      description: "أوامر عمل ذكية وجدولة صيانة وقائية متقدمة",
    },
    {
      icon: UserCircle,
      title: "إدارة العملاء والفوترة",
      description: "نظام متكامل للعملاء والعدادات والفواتير",
    },
    {
      icon: Activity,
      title: "المراقبة والتحكم",
      description: "مراقبة المعدات والتنبيهات في الوقت الفعلي",
    },
    {
      icon: BarChart3,
      title: "التقارير والتحليلات",
      description: "أكثر من 113 تقرير مالي وتشغيلي وإداري",
    },
  ];

  const stats = [
    { value: "359+", label: "جدول بيانات" },
    { value: "1,603", label: "نقطة API" },
    { value: "248", label: "شاشة" },
    { value: "113+", label: "تقرير" },
  ];

  const benefits = [
    { icon: Cloud, text: "نظام سحابي متاح 24/7" },
    { icon: Lock, text: "أمان عالي المستوى" },
    { icon: Smartphone, text: "متوافق مع جميع الأجهزة" },
    { icon: Globe, text: "دعم متعدد اللغات" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-energy flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">نظام إدارة الطاقة</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/login")}>
              تسجيل الدخول
            </Button>
            <Button className="gradient-energy" onClick={() => window.location.href = getLoginUrl()}>
              ابدأ الآن
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.55 0.2 250) 1px, transparent 1px),
                             linear-gradient(90deg, oklch(0.55 0.2 250) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">الجيل الجديد من أنظمة إدارة الطاقة</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              نظام إدارة <span className="text-gradient">متكامل</span> لشركات الكهرباء والطاقة
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              منصة شاملة تجمع بين إدارة الأصول والصيانة والعملاء والمحاسبة في نظام واحد احترافي، مصممة خصيصاً لقطاع الطاقة.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="gradient-energy text-lg px-8 h-14 energy-glow"
                onClick={() => window.location.href = getLoginUrl()}
              >
                ابدأ مجاناً
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 h-14"
                onClick={() => setLocation("/login")}
              >
                تسجيل الدخول
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-border">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-gradient ltr-nums">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              كل ما تحتاجه في <span className="text-gradient">مكان واحد</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نظام متكامل يغطي جميع جوانب إدارة شركات الكهرباء والطاقة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover bg-card border-border">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                لماذا <span className="text-gradient">نظام إدارة الطاقة</span>؟
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                نظام مصمم بأحدث التقنيات لتلبية احتياجات قطاع الطاقة، مع التركيز على الأداء والأمان وسهولة الاستخدام.
              </p>

              <div className="space-y-4">
                {[
                  "نظام محاسبي متكامل مع شجرة حسابات مرنة",
                  "إدارة أصول شاملة مع تتبع الإهلاك",
                  "نظام صيانة وقائية وتصحيحية متقدم",
                  "مراقبة وتحكم في الوقت الفعلي (SCADA)",
                  "تقارير وتحليلات ذكية",
                  "دعم متعدد الشركات والفروع",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-foreground font-medium">{benefit.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-primary/20 to-accent/20 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                جاهز للبدء؟
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                انضم إلى مئات الشركات التي تستخدم نظام إدارة الطاقة لتحسين عملياتها
              </p>
              <Button 
                size="lg" 
                className="gradient-energy text-lg px-8 h-14 energy-glow"
                onClick={() => window.location.href = getLoginUrl()}
              >
                ابدأ الآن مجاناً
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-energy flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-foreground">نظام إدارة الطاقة</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
