import { cn } from "@/lib/utils";
import type { ProcessedFile } from "@/types";

export function StatusBadge({ status }: { status: ProcessedFile["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2.5 py-1 text-xs font-medium",
        status === "Completed" && "bg-emerald-100 text-emerald-800",
        status === "In Review" && "bg-amber-100 text-amber-900",
        status === "Failed" && "bg-red-100 text-red-800"
      )}
    >
      {status}
    </span>
  );
}
