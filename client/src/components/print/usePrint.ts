/**
 * @fileoverview Hook للطباعة
 * @module components/print/usePrint
 */

import { useRef, useState, useCallback } from "react";
import type { PrintOptions, UsePrintReturn } from "./types";

/**
 * أنماط CSS الافتراضية للطباعة
 */
const DEFAULT_PRINT_STYLES = `
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      margin: 0;
      padding: 0;
    }
    
    .no-print {
      display: none !important;
    }
    
    .print-break-before {
      page-break-before: always;
    }
    
    .print-break-after {
      page-break-after: always;
    }
    
    .print-avoid-break {
      page-break-inside: avoid;
    }
  }
`;

/**
 * Hook للطباعة
 * يوفر وظائف الطباعة مع دعم للتخصيص
 *
 * @param options - خيارات الطباعة
 * @returns مرجع العنصر ودالة الطباعة وحالة الطباعة
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { printRef, handlePrint, isPrinting } = usePrint({
 *     title: 'تقرير المبيعات',
 *     onAfterPrint: () => { /* معالجة ما بعد الطباعة */ },
 *   });
 *
 *   return (
 *     <div>
 *       <div ref={printRef}>
 *         <h1>محتوى للطباعة</h1>
 *       </div>
 *       <button onClick={handlePrint} disabled={isPrinting}>
 *         طباعة
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePrint(options: PrintOptions = {}): UsePrintReturn {
  const {
    title = document.title,
    delay = 250,
    closeAfterPrint = true,
    styles = "",
    onBeforePrint,
    onAfterPrint,
  } = options;

  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  /**
   * دالة تشغيل الطباعة
   */
  const handlePrint = useCallback(() => {
    if (!printRef.current || isPrinting) return;

    setIsPrinting(true);

    // تنفيذ دالة ما قبل الطباعة
    onBeforePrint?.();

    // الحصول على محتوى الطباعة
    const printContent = printRef.current.innerHTML;

    // إنشاء نافذة طباعة جديدة
    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (!printWindow) {
      console.error("فشل في فتح نافذة الطباعة. تأكد من السماح بالنوافذ المنبثقة.");
      setIsPrinting(false);
      return;
    }

    // كتابة محتوى الطباعة
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            /* إعادة تعيين الأنماط */
            *, *::before, *::after {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            /* الخطوط */
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
            
            body {
              font-family: 'Tajawal', 'Noto Sans Arabic', sans-serif;
              line-height: 1.5;
              color: #1f2937;
              background: white;
            }
            
            /* أنماط Tailwind الأساسية للطباعة */
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            .font-medium { font-weight: 500; }
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .text-lg { font-size: 1.125rem; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-3xl { font-size: 1.875rem; }
            .text-gray-400 { color: #9ca3af; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-900 { color: #111827; }
            .text-red-600 { color: #dc2626; }
            .text-green-600 { color: #16a34a; }
            .text-orange-600 { color: #ea580c; }
            .bg-white { background-color: white; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .bg-gray-200 { background-color: #e5e7eb; }
            .bg-yellow-50 { background-color: #fefce8; }
            .border { border-width: 1px; border-style: solid; border-color: #e5e7eb; }
            .border-t { border-top-width: 1px; border-top-style: solid; border-top-color: #e5e7eb; }
            .border-b { border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #e5e7eb; }
            .border-b-2 { border-bottom-width: 2px; }
            .border-gray-300 { border-color: #d1d5db; }
            .border-gray-400 { border-color: #9ca3af; }
            .border-gray-800 { border-color: #1f2937; }
            .border-dashed { border-style: dashed; }
            .rounded { border-radius: 0.25rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .p-2 { padding: 0.5rem; }
            .p-3 { padding: 0.75rem; }
            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .p-8 { padding: 2rem; }
            .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .pb-1 { padding-bottom: 0.25rem; }
            .pb-2 { padding-bottom: 0.5rem; }
            .pb-4 { padding-bottom: 1rem; }
            .pt-1 { padding-top: 0.25rem; }
            .pt-4 { padding-top: 1rem; }
            .pt-6 { padding-top: 1.5rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-3 { margin-top: 0.75rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-6 { margin-top: 1.5rem; }
            .mt-8 { margin-top: 2rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .flex { display: flex; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .gap-1 { gap: 0.25rem; }
            .gap-2 { gap: 0.5rem; }
            .gap-4 { gap: 1rem; }
            .gap-6 { gap: 1.5rem; }
            .gap-8 { gap: 2rem; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .justify-end { justify-content: flex-end; }
            .flex-1 { flex: 1 1 0%; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .space-y-6 > * + * { margin-top: 1.5rem; }
            .space-y-12 > * + * { margin-top: 3rem; }
            .w-full { width: 100%; }
            .w-8 { width: 2rem; }
            .w-10 { width: 2.5rem; }
            .w-12 { width: 3rem; }
            .w-14 { width: 3.5rem; }
            .w-16 { width: 4rem; }
            .w-20 { width: 5rem; }
            .w-24 { width: 6rem; }
            .w-48 { width: 12rem; }
            .w-80 { width: 20rem; }
            .h-8 { height: 2rem; }
            .h-10 { height: 2.5rem; }
            .h-12 { height: 3rem; }
            .h-16 { height: 4rem; }
            .h-24 { height: 6rem; }
            .min-h-\\[60px\\] { min-height: 60px; }
            .object-contain { object-fit: contain; }
            .overflow-x-auto { overflow-x: auto; }
            .whitespace-pre-wrap { white-space: pre-wrap; }
            
            /* أنماط الجدول */
            table { border-collapse: collapse; }
            
            ${DEFAULT_PRINT_STYLES}
            ${styles}
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();

    // انتظار تحميل المحتوى ثم الطباعة
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();

      if (closeAfterPrint) {
        printWindow.close();
      }

      setIsPrinting(false);

      // تنفيذ دالة ما بعد الطباعة
      onAfterPrint?.();
    }, delay);
  }, [isPrinting, title, delay, closeAfterPrint, styles, onBeforePrint, onAfterPrint]);

  return {
    printRef,
    handlePrint,
    isPrinting,
  };
}

/**
 * طباعة محتوى مباشرة بدون استخدام ref
 *
 * @param content - محتوى HTML للطباعة
 * @param options - خيارات الطباعة
 */
export function printContent(content: string, options: PrintOptions = {}): void {
  const {
    title = document.title,
    delay = 250,
    closeAfterPrint = true,
    styles = "",
    onBeforePrint,
    onAfterPrint,
  } = options;

  onBeforePrint?.();

  const printWindow = window.open("", "_blank", "width=800,height=600");

  if (!printWindow) {
    console.error("فشل في فتح نافذة الطباعة.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
          body {
            font-family: 'Tajawal', sans-serif;
            direction: rtl;
          }
          ${DEFAULT_PRINT_STYLES}
          ${styles}
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);

  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();

    if (closeAfterPrint) {
      printWindow.close();
    }

    onAfterPrint?.();
  }, delay);
}

export default usePrint;
