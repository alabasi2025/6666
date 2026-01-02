import * as React from "react";
import { cn } from "@/lib/utils";
import { FormField, FormFieldProps } from "./FormField";
import { Button } from "@/components/ui/button";
import {
  CloudUploadIcon,
  FileIcon,
  ImageIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FilmIcon,
  MusicIcon,
  XIcon,
  AlertCircleIcon,
} from "lucide-react";

/**
 * ملف مرفوع
 */
export interface UploadedFile {
  /** معرف الملف */
  id: string;
  /** اسم الملف */
  name: string;
  /** حجم الملف بالبايت */
  size: number;
  /** نوع الملف */
  type: string;
  /** رابط المعاينة */
  preview?: string;
  /** الملف الأصلي */
  file: File;
  /** حالة الرفع */
  status: "pending" | "uploading" | "success" | "error";
  /** نسبة التقدم */
  progress?: number;
  /** رسالة الخطأ */
  error?: string;
}

/**
 * خصائص مكون FormFileUpload
 */
export interface FormFileUploadProps
  extends Omit<FormFieldProps, "children"> {
  /** الملفات المرفوعة */
  value?: UploadedFile[];
  /** دالة عند تغيير الملفات */
  onValueChange?: (files: UploadedFile[]) => void;
  /** أنواع الملفات المسموحة */
  accept?: string;
  /** السماح بملفات متعددة */
  multiple?: boolean;
  /** الحد الأقصى لحجم الملف (بالبايت) */
  maxSize?: number;
  /** الحد الأقصى لعدد الملفات */
  maxFiles?: number;
  /** إظهار المعاينة */
  showPreview?: boolean;
  /** نوع المعاينة */
  previewType?: "list" | "grid";
  /** نص منطقة السحب والإفلات */
  dropzoneText?: string;
  /** نص زر الاختيار */
  buttonText?: string;
  /** أنماط CSS إضافية لمنطقة السحب */
  dropzoneClassName?: string;
}

/**
 * تنسيق حجم الملف
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 بايت";
  const k = 1024;
  const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * الحصول على أيقونة الملف
 */
function getFileIcon(type: string): React.ReactNode {
  if (type.startsWith("image/")) return <ImageIcon className="size-6" />;
  if (type.startsWith("video/")) return <FilmIcon className="size-6" />;
  if (type.startsWith("audio/")) return <MusicIcon className="size-6" />;
  if (type.includes("pdf")) return <FileTextIcon className="size-6" />;
  if (type.includes("spreadsheet") || type.includes("excel"))
    return <FileSpreadsheetIcon className="size-6" />;
  return <FileIcon className="size-6" />;
}

/**
 * إنشاء معرف فريد
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * مكون FormFileUpload
 * رفع ملفات متقدم مع سحب وإفلات ومعاينة
 */
function FormFileUpload({
  // FormField props
  id,
  name,
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  dir = "rtl",
  className,
  labelClassName,
  // FileUpload specific props
  value = [],
  onValueChange,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  showPreview = true,
  previewType = "list",
  dropzoneText = "اسحب الملفات هنا أو انقر للاختيار",
  buttonText = "اختر ملف",
  dropzoneClassName,
}: FormFileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [files, setFiles] = React.useState<UploadedFile[]>(value);

  // تحديث الملفات عند تغيير القيمة الخارجية
  React.useEffect(() => {
    setFiles(value);
  }, [value]);

  // التحقق من صحة الملف
  const validateFile = (file: File): string | null => {
    // التحقق من الحجم
    if (maxSize && file.size > maxSize) {
      return `حجم الملف يتجاوز الحد الأقصى (${formatFileSize(maxSize)})`;
    }

    // التحقق من النوع
    if (accept) {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.replace("/*", "/"));
        }
        return file.type === type;
      });
      if (!isAccepted) {
        return "نوع الملف غير مسموح";
      }
    }

    return null;
  };

  // معالجة الملفات المحددة
  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: UploadedFile[] = [];

    // التحقق من عدد الملفات
    const totalFiles = files.length + selectedFiles.length;
    if (maxFiles && totalFiles > maxFiles) {
      // يمكن إضافة رسالة خطأ هنا
      return;
    }

    Array.from(selectedFiles).forEach((file) => {
      const error = validateFile(file);
      const uploadedFile: UploadedFile = {
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        status: error ? "error" : "pending",
        error: error || undefined,
      };

      // إنشاء معاينة للصور
      if (file.type.startsWith("image/") && !error) {
        uploadedFile.preview = URL.createObjectURL(file);
      }

      newFiles.push(uploadedFile);
    });

    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updatedFiles);
    onValueChange?.(updatedFiles);
  };

  // معالجة السحب والإفلات
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // حذف ملف
  const removeFile = (fileId: string) => {
    const fileToRemove = files.find((f) => f.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    const updatedFiles = files.filter((f) => f.id !== fileId);
    setFiles(updatedFiles);
    onValueChange?.(updatedFiles);
  };

  // فتح مربع حوار اختيار الملفات
  const openFileDialog = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const hasError = Boolean(error);

  return (
    <FormField
      id={id}
      name={name}
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      disabled={disabled}
      dir={dir}
      className={className}
      labelClassName={labelClassName}
    >
      <div className="space-y-3">
        {/* منطقة السحب والإفلات */}
        <div
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-input hover:border-primary/50",
            hasError && "border-destructive",
            disabled && "opacity-50 cursor-not-allowed",
            dropzoneClassName
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-2">
            <CloudUploadIcon
              className={cn(
                "size-10",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
            <p className="text-sm text-muted-foreground">{dropzoneText}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
            >
              {buttonText}
            </Button>
            {accept && (
              <p className="text-xs text-muted-foreground">
                الأنواع المسموحة: {accept}
              </p>
            )}
            {maxSize && (
              <p className="text-xs text-muted-foreground">
                الحد الأقصى للحجم: {formatFileSize(maxSize)}
              </p>
            )}
          </div>
        </div>

        {/* معاينة الملفات */}
        {showPreview && files.length > 0 && (
          <div
            className={cn(
              previewType === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                : "space-y-2"
            )}
          >
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "relative border rounded-lg overflow-hidden",
                  file.status === "error" && "border-destructive",
                  previewType === "list"
                    ? "flex items-center gap-3 p-3"
                    : "aspect-square"
                )}
              >
                {/* معاينة الصورة */}
                {file.preview && previewType === "grid" ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "flex items-center justify-center text-muted-foreground",
                      previewType === "grid"
                        ? "w-full h-full bg-muted"
                        : "size-12 bg-muted rounded"
                    )}
                  >
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="size-12 object-cover rounded"
                      />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </div>
                )}

                {/* معلومات الملف */}
                {previewType === "list" && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {file.status === "error" && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircleIcon className="size-3" />
                        {file.error}
                      </p>
                    )}
                  </div>
                )}

                {/* زر الحذف */}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className={cn(
                    "p-1 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors",
                    previewType === "grid"
                      ? "absolute top-1 right-1"
                      : "shrink-0"
                  )}
                  aria-label="حذف الملف"
                >
                  <XIcon className="size-4" />
                </button>

                {/* شريط التقدم */}
                {file.status === "uploading" && file.progress !== undefined && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
}

export { FormFileUpload };
