/**
 * مكون تصدير الجدول
 * @module tables/TableExport
 */

import { memo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileJson, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableExportProps, ExportFormat, ColumnDefinition, getNestedValue } from "./types";

/**
 * أيقونات صيغ التصدير
 */
const formatIcons: Record<ExportFormat, React.ReactNode> = {
  csv: <FileText className="w-4 h-4" />,
  excel: <FileSpreadsheet className="w-4 h-4" />,
  json: <FileJson className="w-4 h-4" />,
  pdf: <FileText className="w-4 h-4" />,
};

/**
 * أسماء صيغ التصدير
 */
const formatNames: Record<ExportFormat, string> = {
  csv: "CSV",
  excel: "Excel",
  json: "JSON",
  pdf: "PDF",
};

/**
 * مكون تصدير الجدول الرئيسي
 */
export const TableExport = memo(function TableExport<T>({
  data,
  columns,
  fileName = "export",
  formats = ["csv", "excel"],
  onExport,
  isOpen = false,
  onClose,
  className,
}: TableExportProps<T>) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(formats[0]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.filter((col) => !col.hidden).map((col) => col.key as string)
  );
  const [customFileName, setCustomFileName] = useState(fileName);
  const [exportAll, setExportAll] = useState(true);

  const handleExport = useCallback(() => {
    const exportColumns = columns.filter((col) =>
      selectedColumns.includes(col.key as string)
    );

    const exportData = data.map((row) => {
      const exportRow: Record<string, any> = {};
      exportColumns.forEach((col) => {
        const value = col.getExportValue
          ? col.getExportValue(row)
          : getNestedValue(row, col.key as string);
        exportRow[col.title] = value;
      });
      return exportRow;
    });

    if (onExport) {
      onExport(selectedFormat, exportData);
    } else {
      // التصدير الافتراضي
      switch (selectedFormat) {
        case "csv":
          exportToCSV(exportData, exportColumns, customFileName);
          break;
        case "excel":
          exportToExcel(exportData, exportColumns, customFileName);
          break;
        case "json":
          exportToJSON(exportData, customFileName);
          break;
        default:
          console.warn(`صيغة التصدير ${selectedFormat} غير مدعومة`);
      }
    }

    onClose?.();
  }, [
    data,
    columns,
    selectedColumns,
    selectedFormat,
    customFileName,
    onExport,
    onClose,
  ]);

  const toggleColumn = (columnKey: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const selectAllColumns = () => {
    setSelectedColumns(columns.map((col) => col.key as string));
  };

  const deselectAllColumns = () => {
    setSelectedColumns([]);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className={cn("sm:max-w-[500px]", className)}>
        <DialogHeader>
          <DialogTitle>تصدير البيانات</DialogTitle>
          <DialogDescription>
            اختر صيغة التصدير والأعمدة المراد تصديرها
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* اسم الملف */}
          <div className="space-y-2">
            <Label>اسم الملف</Label>
            <Input
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              placeholder="اسم الملف"
            />
          </div>

          {/* صيغة التصدير */}
          <div className="space-y-2">
            <Label>صيغة التصدير</Label>
            <RadioGroup
              value={selectedFormat}
              onValueChange={(value) => setSelectedFormat(value as ExportFormat)}
              className="flex flex-wrap gap-4"
            >
              {formats.map((format) => (
                <div key={format} className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value={format} id={`format-${format}`} />
                  <Label
                    htmlFor={`format-${format}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {formatIcons[format]}
                    {formatNames[format]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* اختيار الأعمدة */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>الأعمدة</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAllColumns}>
                  تحديد الكل
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAllColumns}>
                  إلغاء الكل
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg">
              {columns.map((column) => (
                <div
                  key={column.key as string}
                  className="flex items-center space-x-2 space-x-reverse"
                >
                  <Checkbox
                    id={`col-${String(column.key)}`}
                    checked={selectedColumns.includes(column.key as string)}
                    onCheckedChange={() => toggleColumn(column.key as string)}
                  />
                  <Label
                    htmlFor={`col-${String(column.key)}`}
                    className="text-sm cursor-pointer"
                  >
                    {column.title}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* معلومات التصدير */}
          <div className="text-sm text-muted-foreground">
            سيتم تصدير {data.length} سجل و {selectedColumns.length} عمود
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedColumns.length === 0}
          >
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

/**
 * زر تصدير سريع
 */
export function QuickExportButton<T>({
  data,
  columns,
  fileName = "export",
  formats = ["csv", "excel"],
  onExport,
  className,
}: {
  data: T[];
  columns: ColumnDefinition<T>[];
  fileName?: string;
  formats?: ExportFormat[];
  onExport?: (format: ExportFormat, data: any[]) => void;
  className?: string;
}) {
  const handleExport = (format: ExportFormat) => {
    const exportColumns = columns.filter((col) => !col.hidden);
    const exportData = data.map((row) => {
      const exportRow: Record<string, any> = {};
      exportColumns.forEach((col) => {
        const value = col.getExportValue
          ? col.getExportValue(row)
          : getNestedValue(row, col.key as string);
        exportRow[col.title] = value;
      });
      return exportRow;
    });

    if (onExport) {
      onExport(format, exportData);
    } else {
      switch (format) {
        case "csv":
          exportToCSV(exportData, exportColumns, fileName);
          break;
        case "excel":
          exportToExcel(exportData, exportColumns, fileName);
          break;
        case "json":
          exportToJSON(exportData, fileName);
          break;
      }
    }
  };

  if (formats.length === 1) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleExport(formats[0])}
        className={className}
        title={`تصدير ${formatNames[formats[0]]}`}
      >
        <Download className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          <Download className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((format) => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format)}
          >
            {formatIcons[format]}
            <span className="mr-2">تصدير {formatNames[format]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * تصدير إلى CSV
 */
function exportToCSV(
  data: Record<string, any>[],
  columns: ColumnDefinition[],
  fileName: string
) {
  const headers = columns.map((col) => col.title);
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.title];
      // إضافة علامات اقتباس للقيم التي تحتوي على فواصل أو أسطر جديدة
      if (typeof value === "string" && (value.includes(",") || value.includes("\n"))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? "";
    })
  );

  // إضافة BOM لدعم العربية في Excel
  const BOM = "\uFEFF";
  const csvContent = BOM + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  downloadFile(csvContent, `${fileName}.csv`, "text/csv;charset=utf-8");
}

/**
 * تصدير إلى Excel (CSV مع تنسيق Excel)
 */
function exportToExcel(
  data: Record<string, any>[],
  columns: ColumnDefinition[],
  fileName: string
) {
  // استخدام تنسيق CSV مع فاصل Tab لدعم أفضل في Excel
  const headers = columns.map((col) => col.title);
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.title];
      return value ?? "";
    })
  );

  const BOM = "\uFEFF";
  const content = BOM + [headers.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n");

  downloadFile(content, `${fileName}.xls`, "application/vnd.ms-excel;charset=utf-8");
}

/**
 * تصدير إلى JSON
 */
function exportToJSON(data: Record<string, any>[], fileName: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${fileName}.json`, "application/json;charset=utf-8");
}

/**
 * تحميل ملف
 */
function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * مكون معاينة التصدير
 */
export function ExportPreview({
  data,
  columns,
  maxRows = 5,
  className,
}: {
  data: Record<string, any>[];
  columns: ColumnDefinition[];
  maxRows?: number;
  className?: string;
}) {
  const previewData = data.slice(0, maxRows);

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {columns.map((col) => (
              <th
                key={col.key as string}
                className="px-2 py-1 text-right font-medium"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {previewData.map((row, index) => (
            <tr key={index} className="border-b">
              {columns.map((col) => (
                <td key={col.key as string} className="px-2 py-1">
                  {row[col.title] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > maxRows && (
        <div className="text-center text-sm text-muted-foreground py-2">
          ... و {data.length - maxRows} سجل آخر
        </div>
      )}
    </div>
  );
}

export default TableExport;
