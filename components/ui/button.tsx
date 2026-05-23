"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
};

const variants = {
  primary: "bg-white text-ink shadow-glow hover:bg-champagne",
  secondary: "border border-white/10 bg-white/10 text-white hover:bg-white/15",
  ghost: "text-white/75 hover:bg-white/10 hover:text-white",
  danger: "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/15"
};

const sizes = {
  sm: "h-9 rounded-xl px-3 text-sm",
  md: "h-11 rounded-2xl px-4 text-sm",
  lg: "h-12 rounded-2xl px-5 text-base",
  icon: "h-11 w-11 rounded-2xl p-0"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "luxury-focus inline-flex items-center justify-center gap-2 font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  )
);

Button.displayName = "Button";

