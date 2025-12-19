type TimeSlot = {
  date: string; // 일자만 (예: "12/15 (Sun)")
  dateObj?: Date; // 실제 Date 객체
  votes?: number; // 투표 수 (선택사항)
};

type TopTimeProps = {
  slots: TimeSlot[];
  onDateClick?: (date: Date) => void;
  selectedDateKey?: string;
  fixedSlots?: Set<string>;
  totalMembers?: number; // 모임 전체 인원 수
};

export function TopTime({ slots, onDateClick, selectedDateKey, fixedSlots, totalMembers }: TopTimeProps) {
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
              onClick={() => slot.dateObj && onDateClick?.(slot.dateObj)}
              className={`flex items-center gap-1 py-1 px-1 cursor-pointer transition-colors border-b border-dashed border-gray-200 ${
                isLast ? "border-b-0" : ""
              } ${
                isSelected 
                  ? "bg-white/50 font-semibold" 
                  : "hover:bg-white/30"
              }`}
            >
              <div className="inline-flex items-center justify-center w-4 h-4 rounded-full border text-[9px] font-medium [font-family:var(--font-body)] shrink-0"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  color: '#6B7280'
                }}
              >
                {index + 1}
              </div>
              <div className="flex items-center gap-1 flex-1">
                <span className={`text-[10px] [font-family:var(--font-body)] ${
                  isSelected ? "text-[#333333]" : "text-[#333333]"
                }`}>{slot.date}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {slot.votes !== undefined && totalMembers && slot.votes === totalMembers && (
                  <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[9px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 [font-family:var(--font-body)]">
                    추천
                  </span>
                )}
                {slot.votes !== undefined && (
                  <span className="text-[9px] text-gray-500 [font-family:var(--font-body)]">{slot.votes}명</span>
                )}
                {slot.dateObj && fixedSlots?.has(getDateKey(slot.dateObj)) && (
                  <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[9px] font-medium bg-red-100 text-red-800 border border-red-300 [font-family:var(--font-body)] shrink-0">
                    캘박
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}





