import { cn } from "@/lib/cn";
import type { SelectHTMLAttributes } from "react";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-teal-700/30 focus:border-teal-700 focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
