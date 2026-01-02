import { toast } from "sonner";

export function useToast() {
  return {
    toast: (options: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
      if (options.variant === "destructive") {
        toast.error(options.title, {
          description: options.description,
        });
      } else {
        toast(options.title, {
          description: options.description,
        });
      }
    },
  };
}

export { toast };
