import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

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
  // 리스트 변경을 감지하기 위한 key 생성
  const listKey = useMemo(() => {
    return slots.map(s => s.date).join(',');
  }, [slots]);
  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const formatDateParts = (dateObj?: Date, dateStr?: string) => {
    if (dateObj) {
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      const dayOfWeek = dateObj.getDay();
      const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
      return {
        datePart: `${month}월 ${day}일`,
        dayPart: dayLabels[dayOfWeek]
      };
    }
    // dateObj가 없으면 dateStr에서 파싱 시도
    if (dateStr) {
      const match = dateStr.match(/(\d+)\/(\d+)\s*\((\w+)\)/);
      if (match) {
        const month = parseInt(match[1]);
        const day = parseInt(match[2]);
        const dayShort = match[3];
        const dayLabels: { [key: string]: string } = {
          "일": "일", "월": "월", "화": "화", 
          "수": "수", "목": "목", "금": "금", "토": "토"
        };
        return {
          datePart: `${month}월 ${day}일`,
          dayPart: dayLabels[dayShort] || dayShort
        };
      }
    }
    return {
      datePart: dateStr || "",
      dayPart: ""
    };
  };

  // 캘박된 항목이 있는지 확인
  const hasFixedSlots = slots.some((slot) => slot.dateObj && fixedSlots?.has(getDateKey(slot.dateObj)));

  return (
    <div className="w-full" style={{ perspective: "1000px" }}>
      <ul>
        {slots.map((slot, index) => {
          const isSelected = slot.dateObj && selectedDateKey === getDateKey(slot.dateObj);
          const isLast = index === slots.length - 1;
          const isFixed = slot.dateObj && fixedSlots?.has(getDateKey(slot.dateObj));
          const isFirstRank = index === 0;
          const shouldShowRecommended = !hasFixedSlots && isFirstRank;
          
          return (
            <motion.li 
              key={`${slot.date}-${index}-${listKey}`} 
              className="px-1"
              initial={{ opacity: 0, rotateX: 90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.05,
                ease: "easeOut"
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                onClick={() => slot.dateObj && onDateClick?.(slot.dateObj)}
                className={`flex items-center gap-1 py-1.5 min-h-[36px] cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? "bg-gray-50 font-semibold" 
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="text-xs font-medium text-gray-600 [font-family:var(--font-body)] w-6 shrink-0 flex items-center justify-center">
                  {index + 1}.
                </span>
                <div className="flex-1 min-w-0 flex items-center gap-0.5">
                  {(() => {
                    const { datePart, dayPart } = formatDateParts(slot.dateObj, slot.date);
                    return (
                      <>
                        <span className={`text-xs [font-family:var(--font-body)] w-16 shrink-0 px-1 flex items-center ${
                          isSelected ? "text-gray-900 font-bold" : "text-gray-900 font-normal"
                        }`}>{datePart}</span>
                        <span className={`text-xs [font-family:var(--font-body)] w-12 shrink-0 px-1 flex items-center ${
                          isSelected ? "text-gray-600 font-bold" : "text-gray-600 font-normal"
                        }`}>{dayPart}</span>
                      </>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {(shouldShowRecommended || (slot.votes !== undefined && totalMembers && slot.votes === totalMembers && slot.dateObj && !isFixed)) && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 [font-family:var(--font-body)]">
                      추천
                    </span>
                  )}
                  {slot.votes !== undefined && (
                    <span className="text-xs text-gray-500 [font-family:var(--font-body)]">{slot.votes}명</span>
                  )}
                  {slot.dateObj && fixedSlots?.has(getDateKey(slot.dateObj)) && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300 [font-family:var(--font-body)] shrink-0">
                      캘박
                    </span>
                  )}
                </div>
              </div>
              {!isLast && (
                <div className="border-b border-dashed border-gray-200"></div>
              )}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}







