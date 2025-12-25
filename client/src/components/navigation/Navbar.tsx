import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, X } from "lucide-react";
import { NavbarProps, NavbarItem } from "./types";

/**
 * مكون شريط التنقل العلوي
 * يدعم الشعار، عناصر التنقل، والمحتوى المخصص
 */
export function Navbar({
  title,
  logo,
  items = [],
  rightContent,
  leftContent,
  sticky = true,
  transparent = false,
  className,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav
      data-slot="navbar"
      className={cn(
        "w-full border-b",
        sticky && "sticky top-0 z-50",
        transparent
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* الجانب الأيسر: الشعار والعنوان */}
          <div className="flex items-center gap-4">
            {leftContent}
            {logo && <div className="flex-shrink-0">{logo}</div>}
            {title && (
              <span className="text-lg font-semibold tracking-tight">
                {title}
              </span>
            )}
          </div>

          {/* عناصر التنقل - سطح المكتب */}
          <div className="hidden md:flex items-center gap-1">
            {items.map((item) => (
              <NavbarItemComponent key={item.id} item={item} />
            ))}
          </div>

          {/* الجانب الأيمن */}
          <div className="flex items-center gap-4">
            {rightContent}

            {/* زر القائمة للجوال */}
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* قائمة الجوال */}
        {mobileMenuOpen && items.length > 0 && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <MobileNavbarItem
                  key={item.id}
                  item={item}
                  onClose={() => setMobileMenuOpen(false)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/**
 * مكون عنصر التنقل لسطح المكتب
 */
function NavbarItemComponent({ item }: { item: NavbarItem }) {
  const Icon = item.icon;

  // إذا كان لديه عناصر فرعية
  if (item.children && item.children.length > 0) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "gap-1",
              item.active && "bg-accent text-accent-foreground"
            )}
            disabled={item.disabled}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.label}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {item.children.map((child) => (
            <DropdownMenuItem
              key={child.id}
              disabled={child.disabled}
              onClick={child.onClick}
              asChild={!!child.href}
            >
              {child.href ? (
                <a href={child.href} className="flex items-center gap-2">
                  {child.icon && <child.icon className="h-4 w-4" />}
                  {child.label}
                </a>
              ) : (
                <span className="flex items-center gap-2">
                  {child.icon && <child.icon className="h-4 w-4" />}
                  {child.label}
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // عنصر بسيط
  if (item.href) {
    return (
      <Button
        variant="ghost"
        className={cn(item.active && "bg-accent text-accent-foreground")}
        disabled={item.disabled}
        asChild
      >
        <a href={item.href} className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {item.label}
        </a>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className={cn(item.active && "bg-accent text-accent-foreground")}
      disabled={item.disabled}
      onClick={item.onClick}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {item.label}
    </Button>
  );
}

/**
 * مكون عنصر التنقل للجوال
 */
function MobileNavbarItem({
  item,
  onClose,
  level = 0,
}: {
  item: NavbarItem;
  onClose: () => void;
  level?: number;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const Icon = item.icon;

  const handleClick = () => {
    if (item.children && item.children.length > 0) {
      setExpanded(!expanded);
    } else {
      item.onClick?.();
      onClose();
    }
  };

  return (
    <div style={{ paddingRight: level * 16 }}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2",
          item.active && "bg-accent text-accent-foreground"
        )}
        disabled={item.disabled}
        onClick={handleClick}
        asChild={!!item.href && !item.children?.length}
      >
        {item.href && !item.children?.length ? (
          <a href={item.href} onClick={onClose}>
            {Icon && <Icon className="h-4 w-4" />}
            {item.label}
          </a>
        ) : (
          <span className="flex items-center gap-2 w-full">
            {Icon && <Icon className="h-4 w-4" />}
            <span className="flex-1">{item.label}</span>
            {item.children && item.children.length > 0 && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expanded && "rotate-180"
                )}
              />
            )}
          </span>
        )}
      </Button>

      {/* العناصر الفرعية */}
      {expanded && item.children && (
        <div className="mt-1">
          {item.children.map((child) => (
            <MobileNavbarItem
              key={child.id}
              item={child}
              onClose={onClose}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Navbar;
