"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "luxury-focus h-11 w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 text-sm text-white placeholder:text-white/35",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "luxury-focus min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white placeholder:text-white/35",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";

export function Field({
  label,
  children,
  hint
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-white/70">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs text-white/40">{hint}</span> : null}
    </label>
  );
}

