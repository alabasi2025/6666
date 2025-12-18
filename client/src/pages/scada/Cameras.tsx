import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Camera, Video, VideoOff, Search, RefreshCw, Settings,
  Maximize2, Grid3X3, Grid2X2, Square, MapPin, Clock,
  Wifi, WifiOff, Download, Play, Pause, Volume2, VolumeX,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw,
  AlertTriangle, CheckCircle, Eye, History
} from "lucide-react";
import { cn } from "@/lib/utils";

// Camera Status Badge
function CameraStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    online: { label: "متصل", color: "bg-success/20 text-success", icon: CheckCircle },
    offline: { label: "غير متصل", color: "bg-destructive/20 text-destructive", icon: VideoOff },
    recording: { label: "تسجيل", color: "bg-red-500/20 text-red-500", icon: Video },
    maintenance: { label: "صيانة", color: "bg-warning/20 text-warning", icon: Settings },
  };

  const config = statusConfig[status] || { label: status, color: "bg-gray-500/20 text-gray-500", icon: Camera };
  const Icon = config.icon;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Sample Cameras Data
const camerasData = [
  {
    id: 1,
    name: "كاميرا البوابة الرئيسية",
    code: "CAM-GATE-001",
    location: "محطة الرياض الرئيسية",
    area: "البوابة الرئيسية",
    status: "online",
    recording: true,
    ptz: true,
    nightVision: true,
    lastMotion: "منذ 5 دقائق",
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "كاميرا غرفة المحولات",
    code: "CAM-TR-001",
    location: "محطة الرياض الرئيسية",
    area: "غرفة المحولات",
    status: "recording",
    recording: true,
    ptz: true,
    nightVision: true,
    lastMotion: "منذ دقيقة",
    thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "كاميرا مركز التحكم",
    code: "CAM-CC-001",
    location: "مركز التحكم",
    area: "غرفة العمليات",
    status: "online",
    recording: true,
    ptz: false,
    nightVision: false,
    lastMotion: "الآن",
    thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "كاميرا المستودع",
    code: "CAM-WH-001",
    location: "محطة الرياض الرئيسية",
    area: "المستودع الرئيسي",
    status: "online",
    recording: true,
    ptz: true,
    nightVision: true,
    lastMotion: "منذ 30 دقيقة",
    thumbnail: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "كاميرا موقف السيارات",
    code: "CAM-PARK-001",
    location: "محطة الرياض الرئيسية",
    area: "موقف السيارات",
    status: "offline",
    recording: false,
    ptz: true,
    nightVision: true,
    lastMotion: "منذ ساعة",
    thumbnail: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "كاميرا محطة جدة",
    code: "CAM-JED-001",
    location: "محطة جدة الفرعية",
    area: "المدخل الرئيسي",
    status: "online",
    recording: true,
    ptz: true,
    nightVision: true,
    lastMotion: "منذ 15 دقيقة",
    thumbnail: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop",
  },
  {
    id: 7,
    name: "كاميرا محطة الدمام",
    code: "CAM-DAM-001",
    location: "محطة الدمام",
    area: "غرفة التحكم",
    status: "maintenance",
    recording: false,
    ptz: true,
    nightVision: true,
    lastMotion: "منذ يوم",
    thumbnail: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop",
  },
  {
    id: 8,
    name: "كاميرا المولدات",
    code: "CAM-GEN-001",
    location: "محطة جدة الفرعية",
    area: "غرفة المولدات",
    status: "online",
    recording: true,
    ptz: false,
    nightVision: true,
    lastMotion: "منذ 10 دقائق",
    thumbnail: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop",
  },
];

const cameraStats = [
  { label: "إجمالي الكاميرات", value: 24, icon: Camera, color: "primary" },
  { label: "متصل", value: 21, icon: Wifi, color: "success" },
  { label: "غير متصل", value: 2, icon: WifiOff, color: "destructive" },
  { label: "قيد التسجيل", value: 18, icon: Video, color: "warning" },
];

export default function Cameras() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [gridSize, setGridSize] = useState<"2x2" | "3x3" | "1x1">("3x3");
  const [selectedCamera, setSelectedCamera] = useState<typeof camerasData[0] | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const filteredCameras = camerasData.filter(camera => {
    if (searchQuery && !camera.name.includes(searchQuery) && !camera.code.includes(searchQuery)) {
      return false;
    }
    if (statusFilter !== "all" && camera.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const gridCols = {
    "1x1": "grid-cols-1",
    "2x2": "grid-cols-1 sm:grid-cols-2",
    "3x3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Camera className="w-7 h-7 text-primary" />
            نظام الكاميرات
          </h1>
          <p className="text-muted-foreground">مراقبة البث المباشر من جميع الكاميرات</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-lg p-1">
            <Button
              variant={gridSize === "1x1" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setGridSize("1x1")}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={gridSize === "2x2" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setGridSize("2x2")}
            >
              <Grid2X2 className="w-4 h-4" />
            </Button>
            <Button
              variant={gridSize === "3x3" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setGridSize("3x3")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cameraStats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={cn(
                    "text-3xl font-bold ltr-nums",
                    stat.color === "destructive" && "text-destructive",
                    stat.color === "warning" && "text-warning",
                    stat.color === "success" && "text-success"
                  )}>{stat.value}</p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl",
                  stat.color === "primary" && "bg-primary/20 text-primary",
                  stat.color === "destructive" && "bg-destructive/20 text-destructive",
                  stat.color === "warning" && "bg-warning/20 text-warning",
                  stat.color === "success" && "bg-success/20 text-success"
                )}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في الكاميرات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="online">متصل</SelectItem>
                <SelectItem value="offline">غير متصل</SelectItem>
                <SelectItem value="recording">قيد التسجيل</SelectItem>
                <SelectItem value="maintenance">صيانة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="الموقع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المواقع</SelectItem>
                <SelectItem value="riyadh">محطة الرياض الرئيسية</SelectItem>
                <SelectItem value="jeddah">محطة جدة الفرعية</SelectItem>
                <SelectItem value="dammam">محطة الدمام</SelectItem>
                <SelectItem value="control">مركز التحكم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cameras Grid */}
      <div className={cn("grid gap-4", gridCols[gridSize])}>
        {filteredCameras.map((camera) => (
          <Card 
            key={camera.id} 
            className={cn(
              "overflow-hidden card-hover cursor-pointer",
              camera.status === "offline" && "opacity-60"
            )}
            onClick={() => {
              setSelectedCamera(camera);
              setShowFullscreen(true);
            }}
          >
            {/* Video Preview */}
            <div className="relative aspect-video bg-black">
              {camera.status !== "offline" ? (
                <img 
                  src={camera.thumbnail} 
                  alt={camera.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              
              {/* Top Info */}
              <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                <CameraStatusBadge status={camera.status} />
                {camera.recording && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-xs">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    REC
                  </div>
                )}
              </div>
              
              {/* Bottom Info */}
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <h4 className="font-medium text-sm mb-1">{camera.name}</h4>
                <div className="flex items-center justify-between text-xs opacity-80">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {camera.area}
                  </span>
                  <span className="font-mono">{camera.code}</span>
                </div>
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                <div className="flex gap-2">
                  <Button size="icon" variant="secondary" className="rounded-full">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="rounded-full">
                    <History className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="rounded-full">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Camera Info */}
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {camera.location}
                </span>
                <div className="flex items-center gap-2">
                  {camera.ptz && (
                    <Badge variant="outline" className="text-xs">PTZ</Badge>
                  )}
                  {camera.nightVision && (
                    <Badge variant="outline" className="text-xs">IR</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="w-3 h-3" />
                آخر حركة: {camera.lastMotion}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-5xl p-0">
          {selectedCamera && (
            <>
              <DialogHeader className="p-4 pb-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    {selectedCamera.name}
                  </DialogTitle>
                  <CameraStatusBadge status={selectedCamera.status} />
                </div>
              </DialogHeader>
              
              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                {selectedCamera.status !== "offline" ? (
                  <img 
                    src={selectedCamera.thumbnail} 
                    alt={selectedCamera.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoOff className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}

                {/* Recording Indicator */}
                {selectedCamera.recording && (
                  <div className="absolute top-4 left-4 flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-xs">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    REC
                  </div>
                )}

                {/* Timestamp */}
                <div className="absolute top-4 right-4 px-2 py-1 rounded bg-black/60 text-white text-xs font-mono">
                  {new Date().toLocaleString("ar-SA")}
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* PTZ Controls */}
                  {selectedCamera.ptz && (
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="flex flex-col gap-1">
                        <Button variant="outline" size="icon" className="h-6">
                          <ChevronLeft className="w-3 h-3 rotate-90" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-6">
                          <ChevronLeft className="w-3 h-3 -rotate-90" />
                        </Button>
                      </div>
                      <Button variant="outline" size="icon">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <div className="border-r border-border h-8 mx-2" />
                      <Button variant="outline" size="icon">
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <History className="w-4 h-4 ml-2" />
                      التسجيلات
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 ml-2" />
                      تنزيل
                    </Button>
                    <Button variant="outline" size="sm">
                      <Maximize2 className="w-4 h-4 ml-2" />
                      ملء الشاشة
                    </Button>
                  </div>
                </div>

                {/* Camera Info */}
                <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">الموقع</p>
                    <p className="font-medium">{selectedCamera.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">المنطقة</p>
                    <p className="font-medium">{selectedCamera.area}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الكود</p>
                    <p className="font-medium font-mono">{selectedCamera.code}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">آخر حركة</p>
                    <p className="font-medium">{selectedCamera.lastMotion}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {filteredCameras.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد كاميرات</h3>
            <p className="text-muted-foreground">لم يتم العثور على كاميرات تطابق معايير البحث</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
