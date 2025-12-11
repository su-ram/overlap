import { cn } from "@/lib/utils";

type Day = { label: string; date: string };

type TimeGridProps = {
  title: string;
  days: Day[];
  hours: string[];
  values: number[][]; // 0 | 1
  className?: string;
  showLegend?: boolean;
};

export function TimeGrid({
  title,
  days,
  hours,
  values,
  className,
  showLegend = true,
}: TimeGridProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 [font-family:var(--font-headline)]">
        <span className="text-lg">▶</span>
        {title}
      </h2>

      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-[78px_repeat(4,1fr)] bg-slate-50 text-center text-sm font-semibold text-slate-700 [font-family:var(--font-body)]">
          <div className="border-b border-slate-200 py-3"></div>
          {days.map((day) => (
            <div
              key={day.label}
              className="border-b border-l border-slate-200 py-3 first:border-l-0"
            >
              <div className="text-[13px] font-semibold [font-family:var(--font-body)]">{day.label}</div>
              <div className="text-xs font-medium text-slate-500 [font-family:var(--font-body)]">
                {day.date}
              </div>
            </div>
          ))}
        </div>

        {values.map((row, rowIdx) => (
          <div
            key={hours[rowIdx] ?? rowIdx}
            className="grid grid-cols-[78px_repeat(4,1fr)] border-b border-slate-200 last:border-b-0"
          >
            <div className="flex items-center justify-center border-r border-dashed border-slate-200 bg-white py-3 text-sm text-slate-600 [font-family:var(--font-body)]">
              {hours[rowIdx]}
            </div>
            {row.map((cell, cellIdx) => (
              <div
                key={`${rowIdx}-${cellIdx}`}
                className={cn(
                  "border-l border-dashed border-slate-200 py-3 transition-colors first:border-l-0",
                  cell ? "bg-blue-300" : "bg-pink-100",
                )}
              />
            ))}
          </div>
        ))}
      </div>

      {showLegend ? (
        <div className="flex items-center gap-3 text-xs text-slate-600 [font-family:var(--font-body)]">
          <span className="flex items-center gap-1">
            <span className="h-4 w-4 rounded-sm border border-slate-300 bg-pink-100" />
            불가
          </span>
          <span className="flex items-center gap-1">
            <span className="h-4 w-4 rounded-sm border border-slate-300 bg-blue-300" />
            가능
          </span>
        </div>
      ) : null}
    </div>
  );
}

