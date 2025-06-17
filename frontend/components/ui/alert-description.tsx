// components/ui/alert-description.tsx
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AlertDescriptionProps extends HTMLAttributes<HTMLDivElement> {}

export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div className={cn("mt-1 text-sm opacity-80", className)} {...props} />
  );
}
