"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SkeletonLines } from "@/components/ui/skeleton";

export function WidgetCard({
  title,
  description,
  action,
  loading = false,
  error,
  children,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  loading?: boolean;
  error?: unknown;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          ) : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-indigo-700 hover:underline"
          >
            {action.label}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <div className="mt-4 flex-1">
        {loading ? (
          <SkeletonLines lines={3} />
        ) : error ? (
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : "Could not load this data."}
          </p>
        ) : (
          children
        )}
      </div>
    </Card>
  );
}

export function WidgetRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}

export function WidgetEmpty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}
