const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (!minutes) return "0h 00m";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${String(rest).padStart(2, "0")}m`;
}

export function formatMonth(month: number, year: number): string {
  const name = MONTH_NAMES[month - 1] ?? String(month);
  return `${name} ${year}`;
}

export function formatAmount(
  value: string | number | null | undefined,
  currency = "NPR",
): string {
  if (value === null || value === undefined || value === "") return "—";
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) return String(value);
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Turns `WORK_FROM_HOME` into `Work from home` for display. */
export function humanizeEnum(value: string | null | undefined): string {
  if (!value) return "—";
  const lower = value.toLowerCase().replace(/_/g, " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function daysBetween(from: string, to: string): number {
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.round(diff / 86_400_000) + 1);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
