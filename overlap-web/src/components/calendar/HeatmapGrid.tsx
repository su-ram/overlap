import { cn } from "@/lib/utils";

type Day = { label: string; date: string };

type HeatmapGridProps = {
  title: string;
  days: Day[];
  hours: string[];
  values: number[][]; // 0-4
  className?: string;
  showLegend?: boolean;
};

const densityClass = (level: number) => {
  switch (level) {
    case 4:
      return "bg-blue-700 text-white";
    case 3:
      return "bg-blue-500 text-white";
    case 2:
      return "bg-blue-300";
    case 1:
      return "bg-blue-200";
    default:
      return "bg-slate-100";
  }
};

export function HeatmapGrid({
  title,
  days,
  hours,
  values,
  className,
  showLegend = true,
}: HeatmapGridProps) {
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
                  densityClass(cell),
                )}
              />
            ))}
          </div>
        ))}
      </div>

      {showLegend ? (
        <div className="flex items-center gap-3 text-xs text-slate-600 [font-family:var(--font-body)]">
          <span>0% 가능</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={cn(
                "h-4 w-6 rounded-sm border border-slate-200",
                densityClass(level),
              )}
            />
          ))}
          <span>100% 가능</span>
        </div>
      ) : null}
    </div>
  );
}


