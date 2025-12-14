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
      <ul>
        {slots.map((slot, index) => {
          const isSelected = slot.dateObj && selectedDateKey === getDateKey(slot.dateObj);
          const isLast = index === slots.length - 1;
          
          return (
            <li 
              key={`${slot.date}-${index}`} 
              className={`flex items-center gap-3 py-4 px-2 cursor-default transition-colors border-b border-dashed border-gray-200 ${
                isLast ? "border-b-0" : ""
              } ${
                isSelected 
                  ? "bg-white/50 font-semibold" 
                  : "hover:bg-white/30"
              }`}
            >
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium [font-family:var(--font-body)] shrink-0"
                style={index < 3 ? {
                  backgroundColor: '#F5EDD9',
                  borderColor: '#DEB16A',
                  color: '#BA7C3B'
                } : {
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  color: '#6B7280'
                }}
              >
                {index + 1}
              </div>
              <span className={`text-sm flex-1 [font-family:var(--font-body)] ${
                isSelected ? "text-[#333333]" : "text-[#333333]"
              } ${index < 3 ? "font-bold" : ""}`}>{slot.date}</span>
              {slot.votes !== undefined && (
                <span className="text-xs text-gray-500 shrink-0 [font-family:var(--font-body)]">{slot.votes}명</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

