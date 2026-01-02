/**
 * مكون تصفح الجدول
 * @module tables/TablePagination
 */

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TablePaginationProps } from "./types";

/**
 * مكون تصفح الجدول الرئيسي
 */
export const TablePagination = memo(function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  showItemsInfo = true,
  showPageSizeOptions = true,
  showPageInput = true,
  className,
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    if (validPage !== currentPage) {
      onPageChange(validPage);
    }
  };

  const handlePageSizeChange = (size: string) => {
    onPageSizeChange?.(Number(size));
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 mt-4",
        className
      )}
    >
      {/* معلومات العناصر وحجم الصفحة */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {showPageSizeOptions && onPageSizeChange && (
          <>
            <span>عرض</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
        {showItemsInfo && (
          <span>
            {startItem} - {endItem} من أصل {totalItems.toLocaleString("ar-SA")} سجل
          </span>
        )}
      </div>

      {/* أزرار التنقل */}
      <div className="flex items-center gap-1">
        {/* الصفحة الأولى */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          title="الصفحة الأولى"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>

        {/* الصفحة السابقة */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="الصفحة السابقة"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* إدخال رقم الصفحة */}
        {showPageInput ? (
          <div className="flex items-center gap-1 mx-2">
            <span className="text-sm text-muted-foreground">صفحة</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="w-14 h-8 text-center"
            />
            <span className="text-sm text-muted-foreground">من {totalPages}</span>
          </div>
        ) : (
          <PageNumbers
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {/* الصفحة التالية */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="الصفحة التالية"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* الصفحة الأخيرة */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="الصفحة الأخيرة"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

/**
 * مكون أرقام الصفحات
 */
function PageNumbers({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}) {
  const pages = getVisiblePages(currentPage, totalPages, maxVisible);

  return (
    <div className="flex items-center gap-1 mx-2">
      {pages.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          );
        }

        return (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </Button>
        );
      })}
    </div>
  );
}

/**
 * حساب الصفحات المرئية
 */
function getVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisible: number
): (number | "...")[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    start = 1;
    end = maxVisible;
  }

  if (end > totalPages) {
    end = totalPages;
    start = totalPages - maxVisible + 1;
  }

  const pages: (number | "...")[] = [];

  if (start > 1) {
    pages.push(1);
    if (start > 2) {
      pages.push("...");
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push("...");
    }
    pages.push(totalPages);
  }

  return pages;
}

/**
 * مكون تصفح بسيط
 */
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronRight className="w-4 h-4 ml-1" />
        السابق
      </Button>
      <span className="text-sm text-muted-foreground">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        التالي
        <ChevronLeft className="w-4 h-4 mr-1" />
      </Button>
    </div>
  );
}

/**
 * مكون تصفح مع تحميل المزيد
 */
export function LoadMorePagination({
  hasMore,
  loading = false,
  onLoadMore,
  loadMoreText = "تحميل المزيد",
  loadingText = "جاري التحميل...",
  className,
}: {
  hasMore: boolean;
  loading?: boolean;
  onLoadMore: () => void;
  loadMoreText?: string;
  loadingText?: string;
  className?: string;
}) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className={cn("flex justify-center mt-4", className)}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2" />
            {loadingText}
          </>
        ) : (
          loadMoreText
        )}
      </Button>
    </div>
  );
}

/**
 * مكون تصفح لا نهائي
 */
export function InfiniteScrollPagination({
  hasMore,
  loading = false,
  onLoadMore,
  threshold = 100,
  className,
}: {
  hasMore: boolean;
  loading?: boolean;
  onLoadMore: () => void;
  threshold?: number;
  className?: string;
}) {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < threshold && hasMore && !loading) {
      onLoadMore();
    }
  };

  return (
    <div
      className={cn("overflow-auto", className)}
      onScroll={handleScroll}
    >
      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

/**
 * مكون معلومات التصفح
 */
export function PaginationInfo({
  currentPage,
  pageSize,
  totalItems,
  className,
}: {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  className?: string;
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      عرض {startItem} - {endItem} من أصل {totalItems.toLocaleString("ar-SA")} سجل
    </div>
  );
}

/**
 * مكون اختيار حجم الصفحة
 */
export function PageSizeSelector({
  pageSize,
  options = [10, 20, 50, 100],
  onChange,
  label = "عدد العناصر:",
  className,
}: {
  pageSize: number;
  options?: number[];
  onChange: (size: number) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <Select value={pageSize.toString()} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="w-[70px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default TablePagination;
