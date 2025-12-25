/**
 * مكونات النوافذ المنبثقة (Modal Components)
 * تصدير جميع المكونات والأنواع والـ Hooks
 */

// ==================== الأنواع ====================
export type {
  ModalSize,
  DrawerDirection,
  AlertType,
  PopoverPlacement,
  TooltipPlacement,
  BaseModalProps,
  ModalProps,
  ConfirmDialogProps,
  AlertDialogProps,
  FormModalProps,
  DrawerProps,
  PopoverProps,
  TooltipProps,
  ModalContextValue,
} from "./types";

export { MODAL_SIZE_CLASSES, ALERT_TYPE_STYLES } from "./types";

// ==================== Modal ====================
export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalBody,
  useModal,
} from "./Modal";

// ==================== ConfirmDialog ====================
export {
  ConfirmDialog,
  useConfirmDialog,
} from "./ConfirmDialog";

// ==================== AlertDialog ====================
export {
  AlertDialogComponent,
  AlertDialog,
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  InfoAlert,
  useAlertDialog,
} from "./AlertDialog";

// ==================== FormModal ====================
export {
  FormModal,
  useFormModal,
} from "./FormModal";

// ==================== Drawer ====================
export {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  useDrawer,
} from "./Drawer";

// ==================== Popover ====================
export {
  Popover,
  PopoverComponent,
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverBody,
  PopoverFooter,
  usePopover,
} from "./Popover";

// ==================== Tooltip ====================
export {
  Tooltip,
  TooltipComponent,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  SimpleTooltip,
  KeyboardTooltip,
  IconTooltip,
  TruncatedTooltip,
  DelayedTooltip,
} from "./Tooltip";
