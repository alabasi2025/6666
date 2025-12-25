import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { PaginationNavProps } from "./types";

/**
 * مكون تصفح الصفحات
 * يدعم التنقل بين الصفحات مع خيارات متعددة
 */
export function PaginationNav({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showPrevNext = true,
  size = "default",
  className,
}: PaginationNavProps) {
  // حساب الصفحات المعروضة
  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const generatePagination = () => {
    const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last

    // إذا كان عدد الصفحات أقل من العدد المطلوب
    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, "dots-right", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, "dots-left", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, "dots-left", ...middleRange, "dots-right", totalPages];
    }

    return range(1, totalPages);
  };

  const pages = generatePagination();

  const buttonSize = {
    sm: "h-8 w-8 text-xs",
    default: "h-9 w-9 text-sm",
    lg: "h-10 w-10 text-base",
  }[size];

  const iconSize = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  return (
    <nav
      data-slot="pagination-nav"
      role="navigation"
      aria-label="تصفح الصفحات"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      {/* زر الصفحة الأولى */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className={buttonSize}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="الصفحة الأولى"
        >
          <ChevronsRight className={iconSize} />
        </Button>
      )}

      {/* زر الصفحة السابقة */}
      {showPrevNext && (
        <Button
          variant="outline"
          size="icon"
          className={buttonSize}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className={iconSize} />
        </Button>
      )}

      {/* أرقام الصفحات */}
      {pages.map((page, index) => {
        if (page === "dots-left" || page === "dots-right") {
          return (
            <span
              key={`${page}-${index}`}
              className={cn(
                "flex items-center justify-center",
                buttonSize
              )}
              aria-hidden="true"
            >
              <MoreHorizontal className={iconSize} />
            </span>
          );
        }

        const pageNumber = page as number;
        const isActive = pageNumber === currentPage;

        return (
          <Button
            key={pageNumber}
            variant={isActive ? "default" : "outline"}
            size="icon"
            className={cn(
              buttonSize,
              isActive && "pointer-events-none"
            )}
            onClick={() => onPageChange(pageNumber)}
            aria-label={`الصفحة ${pageNumber}`}
            aria-current={isActive ? "page" : undefined}
          >
            {pageNumber}
          </Button>
        );
      })}

      {/* زر الصفحة التالية */}
      {showPrevNext && (
        <Button
          variant="outline"
          size="icon"
          className={buttonSize}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="الصفحة التالية"
        >
          <ChevronLeft className={iconSize} />
        </Button>
      )}

      {/* زر الصفحة الأخيرة */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className={buttonSize}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="الصفحة الأخيرة"
        >
          <ChevronsLeft className={iconSize} />
        </Button>
      )}
    </nav>
  );
}

export default PaginationNav;
