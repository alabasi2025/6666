/**
 * مكون معلومات المحرك
 * Engine Info Dialog Component
 * 
 * يعرض معلومات تفصيلية عن المحرك:
 * - وصف الشاشة
 * - آلية العمل
 * - الشاشات المرتبطة
 * - Business Logic
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, BookOpen, Settings, Link2, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface EngineInfo {
  title: string;
  description: string;
  process: string;
  mechanism: string;
  relatedScreens: Array<{
    name: string;
    path: string;
    description: string;
  }>;
  businessLogic: string;
}

interface EngineInfoDialogProps {
  info: EngineInfo;
}

export default function EngineInfoDialog({ info }: EngineInfoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="h-4 w-4 mr-2" />
          معلومات
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            {info.title}
          </DialogTitle>
          <DialogDescription>{info.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* وصف العملية */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">عملية الشاشة</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg">
              {info.process}
            </p>
          </div>

          <Separator />

          {/* آلية العمل */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">آلية العمل</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg whitespace-pre-line">
              {info.mechanism}
            </p>
          </div>

          <Separator />

          {/* الشاشات المرتبطة */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">الشاشات المرتبطة</h3>
            </div>
            <div className="space-y-2">
              {info.relatedScreens.map((screen, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border"
                >
                  <Badge variant="outline" className="mt-1">
                    {index + 1}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{screen.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {screen.description}
                    </p>
                    <code className="text-xs text-primary mt-1 block">
                      {screen.path}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Business Logic */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Business Logic</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg whitespace-pre-line">
              {info.businessLogic}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


