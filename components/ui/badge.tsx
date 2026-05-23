import { STATUS_COLORS } from "@/lib/constants";
import { cn, titleCaseStatus } from "@/lib/utils";

export function Badge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium",
        STATUS_COLORS[status] ?? "border-white/15 bg-white/10 text-white/70",
        className
      )}
    >
      {titleCaseStatus(status)}
    </span>
  );
}

