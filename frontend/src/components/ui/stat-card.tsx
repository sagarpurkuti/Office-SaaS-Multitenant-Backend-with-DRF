import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  loading = false,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  loading?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-slate-400" /> : null}
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
      )}
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </Card>
  );
}
