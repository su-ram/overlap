type TimeSlot = {
  date: string; // 일자만 (예: "12/15 (Sun)")
  dateObj?: Date; // 실제 Date 객체
  votes?: number; // 투표 수 (선택사항)
};

type TopTimeProps = {
  slots: TimeSlot[];
  onDateClick?: (date: Date) => void;
  selectedDateKey?: string;
};

export function TopTime({ slots, onDateClick, selectedDateKey }: TopTimeProps) {
  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  return (
    <div className="w-full">
      <ul className="divide-y divide-slate-200">
        {slots.map((slot, index) => {
          const isSelected = slot.dateObj && selectedDateKey === getDateKey(slot.dateObj);
          
          return (
            <li 
              key={`${slot.date}-${index}`} 
              onClick={() => slot.dateObj && onDateClick?.(slot.dateObj)}
              className={`flex items-center gap-3 py-2.5 px-2 cursor-pointer transition-colors ${
                isSelected 
                  ? "bg-stone-200 font-semibold" 
                  : "hover:bg-slate-50"
              }`}
            >
              <span className="text-xs font-semibold text-slate-400 w-6 shrink-0 [font-family:var(--font-body)]">
                {index + 1}
              </span>
              <span className={`text-sm flex-1 [font-family:var(--font-body)] ${
                isSelected ? "text-slate-900" : "text-slate-700"
              } ${index < 3 ? "font-bold" : ""}`}>{slot.date}</span>
              {slot.votes !== undefined && (
                <span className="text-xs text-slate-500 shrink-0 [font-family:var(--font-body)]">{slot.votes}명</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

