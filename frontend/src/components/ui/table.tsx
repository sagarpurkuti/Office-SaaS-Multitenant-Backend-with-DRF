import { cn } from "@/lib/cn";

export function Table({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className={cn("w-full border-collapse text-sm", className)}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-slate-50">{children}</thead>;
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function Tr({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tr className={className}>{children}</tr>;
}

export function Th({
  children,
  className,
  align = "left",
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500",
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  align = "left",
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "px-4 py-3 text-slate-700",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function TableEmpty({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-10 text-center text-sm text-slate-500"
      >
        {children}
      </td>
    </tr>
  );
}
