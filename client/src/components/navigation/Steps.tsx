import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Circle, AlertCircle } from "lucide-react";
import { StepsProps, StepItemType } from "./types";

/**
 * مكون الخطوات
 * يعرض خطوات متتابعة مع حالات مختلفة
 */
export function Steps({
  steps,
  currentStep,
  orientation = "horizontal",
  variant = "default",
  size = "default",
  clickable = false,
  onStepChange,
  className,
}: StepsProps) {
  const handleStepClick = (index: number, step: StepItemType) => {
    if (clickable && !step.disabled && onStepChange) {
      onStepChange(index);
    }
  };

  const getStepStatus = (index: number, step: StepItemType): StepItemType["status"] => {
    if (step.status) return step.status;
    if (index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "pending";
  };

  const sizeClasses = {
    sm: {
      icon: "h-6 w-6 text-xs",
      connector: orientation === "horizontal" ? "h-0.5" : "w-0.5",
      text: "text-xs",
      description: "text-xs",
    },
    default: {
      icon: "h-8 w-8 text-sm",
      connector: orientation === "horizontal" ? "h-0.5" : "w-0.5",
      text: "text-sm",
      description: "text-xs",
    },
    lg: {
      icon: "h-10 w-10 text-base",
      connector: orientation === "horizontal" ? "h-1" : "w-1",
      text: "text-base",
      description: "text-sm",
    },
  }[size];

  const renderStepIcon = (status: StepItemType["status"], Icon: StepItemType["icon"], index: number) => {
    if (status === "completed") {
      return <Check className="h-4 w-4" />;
    }
    if (status === "error") {
      return <AlertCircle className="h-4 w-4" />;
    }
    if (Icon) {
      return <Icon className="h-4 w-4" />;
    }
    if (variant === "simple") {
      return (
        <Circle
          className={cn(
            "h-3 w-3",
            status === "current" && "fill-primary"
          )}
        />
      );
    }
    return <span>{index + 1}</span>;
  };

  return (
    <div
      data-slot="steps"
      className={cn(
        "flex",
        orientation === "horizontal"
          ? "flex-row items-start"
          : "flex-col items-start",
        className
      )}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(index, step);
        const isLast = index === steps.length - 1;
        const Icon = step.icon;

        return (
          <div
            key={step.id}
            className={cn(
              "flex",
              orientation === "horizontal"
                ? "flex-col items-center flex-1"
                : "flex-row items-start"
            )}
          >
            <div
              className={cn(
                "flex",
                orientation === "horizontal"
                  ? "flex-row items-center w-full"
                  : "flex-col items-center"
              )}
            >
              {/* أيقونة الخطوة */}
              <button
                type="button"
                onClick={() => handleStepClick(index, step)}
                disabled={!clickable || step.disabled}
                className={cn(
                  "flex items-center justify-center rounded-full border-2 transition-all shrink-0",
                  sizeClasses.icon,
                  clickable && !step.disabled && "cursor-pointer hover:scale-110",
                  !clickable && "cursor-default",
                  step.disabled && "opacity-50 cursor-not-allowed",
                  // حالات مختلفة
                  status === "completed" && "bg-primary border-primary text-primary-foreground",
                  status === "current" && "border-primary text-primary bg-primary/10",
                  status === "pending" && "border-muted-foreground/30 text-muted-foreground",
                  status === "error" && "border-destructive text-destructive bg-destructive/10",
                  // أنماط مختلفة
                  variant === "simple" && "border-0 bg-transparent",
                  variant === "circles" && "rounded-full"
                )}
              >
                {renderStepIcon(status, Icon, index)}
              </button>

              {/* الخط الموصل */}
              {!isLast && (
                <div
                  className={cn(
                    "transition-colors",
                    orientation === "horizontal"
                      ? cn("flex-1 mx-2", sizeClasses.connector)
                      : cn("my-2 h-8", sizeClasses.connector),
                    status === "completed" || index < currentStep
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>

            {/* نص الخطوة */}
            <div
              className={cn(
                "mt-2",
                orientation === "horizontal"
                  ? "text-center"
                  : "mr-3 text-right"
              )}
            >
              <p
                className={cn(
                  "font-medium",
                  sizeClasses.text,
                  status === "current" && "text-primary",
                  status === "completed" && "text-foreground",
                  status === "pending" && "text-muted-foreground",
                  status === "error" && "text-destructive"
                )}
              >
                {step.title}
              </p>
              {step.description && (
                <p
                  className={cn(
                    "text-muted-foreground mt-0.5",
                    sizeClasses.description
                  )}
                >
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Steps;
