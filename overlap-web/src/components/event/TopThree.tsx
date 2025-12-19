type Slot = {
  label: string;
  time: string;
  rank: 1 | 2 | 3;
};

export function TopThree({ slots }: { slots: Slot[] }) {
  return (
    <div className="space-y-4">
      <ol className="space-y-3">
        {slots.map((slot) => (
          <li 
            key={slot.label} 
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
              slot.rank === 1 ? "bg-amber-500" :
              slot.rank === 2 ? "bg-slate-400" :
              "bg-amber-700"
            } [font-family:var(--font-headline)]`}>
              {slot.rank}
            </div>
            <div className="flex-1 [font-family:var(--font-body)]">
              <div className="font-semibold text-slate-900">{slot.label}</div>
              <div className="text-sm text-slate-600">{slot.time}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}







