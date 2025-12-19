type EventHeaderProps = {
  title: string;
  dateRange: string;
  location?: string;
  participants?: string;
};

export function EventHeader({
  title,
  dateRange,
  location,
  participants,
}: EventHeaderProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xl font-bold text-slate-900 [font-family:var(--font-headline)]">{title}</div>
      <div className="text-sm text-slate-700 [font-family:var(--font-body)]">{dateRange}</div>
      {location ? (
        <div className="text-sm text-slate-700 [font-family:var(--font-body)]">
          <span className="font-semibold text-blue-700">어디서?</span> {location}
        </div>
      ) : null}
      {participants ? (
        <div className="text-sm text-slate-700 [font-family:var(--font-body)]">
          <span className="font-semibold text-blue-700">누구랑?</span> {participants}
        </div>
      ) : null}
    </div>
  );
}





