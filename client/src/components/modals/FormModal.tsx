/**
 * مكون نافذة النموذج (FormModal)
 * نافذة منبثقة تحتوي على نموذج مع أزرار إرسال وإلغاء
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FormModalProps, MODAL_SIZE_CLASSES } from "./types";

/**
 * مكون نافذة النموذج
 *
 * @example
 * ```tsx
 * <FormModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="إضافة مريض جديد"
 *   description="أدخل بيانات المريض الجديد"
 *   submitText="حفظ"
 *   cancelText="إلغاء"
 *   onSubmit={handleSubmit}
 *   loading={isSubmitting}
 * >
 *   <div className="space-y-4">
 *     <Input name="name" placeholder="الاسم" />
 *     <Input name="phone" placeholder="رقم الهاتف" />
 *   </div>
 * </FormModal>
 * ```
 */
export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  size = "md",
  submitText = "حفظ",
  cancelText = "إلغاء",
  onSubmit,
  onCancel,
  loading = false,
  submitDisabled = false,
  showCloseButton = true,
}: FormModalProps) {
  // حالة التحميل الداخلية
  const [isLoading, setIsLoading] = React.useState(false);

  // الحالة الفعلية للتحميل
  const actualLoading = loading || isLoading;

  // معالجة الإرسال
  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setIsLoading(true);
        await onSubmit(e);
      } catch (error) {
        console.error("Error in form submission:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [onSubmit]
  );

  // معالجة الإلغاء
  const handleCancel = React.useCallback(() => {
    if (actualLoading) return;
    onCancel?.();
    onOpenChange(false);
  }, [actualLoading, onCancel, onOpenChange]);

  // معالجة تغيير حالة الفتح
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!newOpen && actualLoading) return;
      onOpenChange(newOpen);
    },
    [actualLoading, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "w-full max-w-[calc(100%-2rem)]",
          MODAL_SIZE_CLASSES[size],
          className
        )}
        showCloseButton={showCloseButton && !actualLoading}
        onInteractOutside={(e) => {
          if (actualLoading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (actualLoading) {
            e.preventDefault();
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* الهيدر */}
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}

          {/* المحتوى */}
          <div className="py-4">{children}</div>

          {/* الفوتر */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={actualLoading}
            >
              {cancelText}
            </Button>
            <Button
              type="submit"
              disabled={actualLoading || submitDisabled}
            >
              {actualLoading && <Loader2 className="size-4 animate-spin" />}
              {submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook لإدارة حالة نافذة النموذج
 *
 * @example
 * ```tsx
 * const { isOpen, open, close, formData, setFormData, reset } = useFormModal({
 *   name: "",
 *   phone: "",
 * });
 *
 * <FormModal
 *   open={isOpen}
 *   onOpenChange={(open) => !open && close()}
 *   onSubmit={async () => {
 *     await saveData(formData);
 *     close();
 *   }}
 * >
 *   <Input
 *     value={formData.name}
 *     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 *   />
 * </FormModal>
 * ```
 */
export function useFormModal<T extends Record<string, unknown>>(
  initialData: T
) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<T>(initialData);
  const [editingId, setEditingId] = React.useState<string | number | null>(
    null
  );

  const open = React.useCallback((data?: Partial<T>, id?: string | number) => {
    if (data) {
      setFormData((prev) => ({ ...prev, ...data }));
    }
    if (id !== undefined) {
      setEditingId(id);
    }
    setIsOpen(true);
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
    setEditingId(null);
  }, []);

  const reset = React.useCallback(() => {
    setFormData(initialData);
    setEditingId(null);
  }, [initialData]);

  const openForEdit = React.useCallback(
    (data: T, id: string | number) => {
      setFormData(data);
      setEditingId(id);
      setIsOpen(true);
    },
    []
  );

  const openForCreate = React.useCallback(() => {
    reset();
    setIsOpen(true);
  }, [reset]);

  return {
    isOpen,
    setIsOpen,
    formData,
    setFormData,
    editingId,
    isEditing: editingId !== null,
    open,
    close,
    reset,
    openForEdit,
    openForCreate,
  };
}

export default FormModal;
