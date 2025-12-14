"use client"; 

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CalendarHeatmapProps = {
  onDateSelect?: (date: Date) => void;
  availabilityData?: number[]; // 각 날짜별 가용성 레벨 (0-4) 또는 투표 수
  maxVotes?: number; // 최대 투표 수 (가용성 레벨 계산용)
  selectedDateKey?: string; // 외부에서 선택된 날짜 키
  onDateSelectFromExternal?: (date: Date) => void; // 외부에서 날짜 선택 시 호출
  focusedDateKeys?: Set<string>; // 포커스된 날짜 키들 (참여자가 투표한 날짜)
  onMonthChange?: (year: number, month: number) => void; // 달 변경 시 호출
  highlightedDateKeys?: Set<string>; // 하이라이트할 날짜 키들 ("내 투표만 보기" 모드일 때)
};

const densityClass = (level: number, isSelected: boolean = false) => {
  // 로고 색상 기준 초록색 (green2: light: #C8E6C9, medium: #81C784, deep: #4CAF50)
  // 투표 수에 따라 초록색의 명도를 조절 - 더 연한 단계로 조정
  switch (level) {
    case 4:
      return "bg-[#81C784] text-white"; // medium green (더 연하게)
    case 3:
      return "bg-[#A5D6A7] text-[#333333]"; // light-medium green
    case 2:
      return "bg-[#C8E6C9] text-[#333333]"; // light green
    case 1:
      return "bg-[#E8F5E9] text-[#333333]"; // very light green
    default:
      return "bg-[#FDFCF8] text-[#333333]"; // 0명은 더 밝고 하얀 아이보리색
  }
};

export function CalendarHeatmap({
  onDateSelect,
  availabilityData,
  maxVotes = 10,
  selectedDateKey,
  onDateSelectFromExternal,
  focusedDateKeys,
  onMonthChange,
  highlightedDateKeys,
}: CalendarHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [animationDateKey, setAnimationDateKey] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 달 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    onMonthChange?.(year, month);
  }, [year, month, onMonthChange]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 이번 달의 모든 날짜 생성
  const monthDays = useMemo(() => {
    const days: { day: number; date: Date; label: string; dateStr: string }[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const label = dayLabels[dayOfWeek];
      const dateStr = `${month + 1}/${day}`;
      
      days.push({ day, date, label, dateStr });
    }
    
    return days;
  }, [year, month, daysInMonth]);

  // 각 날짜별 가용성 레벨 계산
  const getAvailabilityLevel = (dayIndex: number): number => {
    if (!availabilityData || !availabilityData[dayIndex]) {
      return 0;
    }
    
    const votes = availabilityData[dayIndex];
    // 투표 수를 0-4 레벨로 변환
    if (maxVotes === 0) return 0;
    const ratio = votes / maxVotes;
    
    if (ratio >= 0.8) return 4;
    if (ratio >= 0.6) return 3;
    if (ratio >= 0.4) return 2;
    if (ratio >= 0.2) return 1;
    return 0;
  };

  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const isDateSelected = (date: Date) => {
    const dateKey = getDateKey(date);
    return selectedDates.has(dateKey) || selectedDateKey === dateKey;
  };

  const isDateFocused = (date: Date) => {
    const dateKey = getDateKey(date);
    return focusedDateKeys?.has(dateKey) ?? false;
  };

  const isDateHighlighted = (date: Date) => {
    const dateKey = getDateKey(date);
    return highlightedDateKeys?.has(dateKey) ?? false;
  };

  // 외부에서 날짜 선택 시 처리
  useEffect(() => {
    if (selectedDateKey) {
      const dateKey = selectedDateKey;
      setSelectedDates((prev) => {
        const newSet = new Set(prev);
        newSet.add(dateKey);
        return newSet;
      });
      
      // 폭죽 애니메이션 제거
    }
  }, [selectedDateKey]);

  const handleDateClick = (date: Date) => {
    const dateKey = getDateKey(date);
    // 테두리 처리를 위한 selected 상태 저장 제거
    // setSelectedDates 호출하지 않음
    // 폭죽 애니메이션 제거
    
    onDateSelect?.(date);
  };

  return (
    <div className="w-full h-full bg-[#FAF9F6] p-2 md:p-3 lg:p-4 flex flex-col">
      {/* 헤더 */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all"
        >
          <ChevronLeft className="h-5 w-5 text-[#333333]" />
        </button>
        <h2 className="text-xl font-semibold text-[#333333] [font-family:var(--font-headline)]">
          {year}년 {monthNames[month]}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all"
        >
          <ChevronRight className="h-5 w-5 text-[#333333]" />
        </button>
      </div>

      {/* 범례 */}
      <div className="mb-2 flex items-center justify-center gap-3 text-xs text-[#333333] [font-family:var(--font-body)]">
        <span>0명</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={cn(
              "h-4 w-6 border border-[#DDDDDD]",
              densityClass(level),
            )}
          />
        ))}
        <span>{maxVotes}명</span>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-[#333333] py-2 [font-family:var(--font-body)]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 - 히트맵 형태 */}
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 overflow-visible" style={{ gridAutoRows: '1fr' }}>
        {/* 빈 칸 (첫 주의 시작일 이전) */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {/* 날짜들 */}
        {monthDays.map((dayInfo, dayIndex) => {
          const selected = isDateSelected(dayInfo.date);
          const focused = isDateFocused(dayInfo.date);
          const highlighted = isDateHighlighted(dayInfo.date);
          const availabilityLevel = getAvailabilityLevel(dayIndex);
          const votes = availabilityData?.[dayIndex] ?? 0;

          return (
            <button
              key={dayIndex}
              onClick={() => handleDateClick(dayInfo.date)}
              className={cn(
                "h-full rounded-sm border border-gray-200/50 text-sm font-medium transition-all [font-family:var(--font-body)] overflow-visible backdrop-blur-[6px]",
                "hover:opacity-80 active:scale-[0.95] active:translate-y-0.5",
                "transform transition-transform duration-150 ease-out",
                highlighted
                  ? "bg-white/60 backdrop-blur-md border-white/60 text-[#333333]"
                  : focused && !selected
                  ? "bg-blue-100/70 border-blue-300" 
                  : "",
                // highlighted가 아닐 때만 densityClass 적용
                !highlighted && densityClass(availabilityLevel, false)
              )}
              title={`${dayInfo.dateStr} - ${votes}명 투표`}
            >
              <div className="relative flex flex-col items-start justify-start h-full p-1 w-full">
                <span>{dayInfo.day}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

