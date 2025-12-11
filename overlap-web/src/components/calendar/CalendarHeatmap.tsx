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
};

const densityClass = (level: number, isSelected: boolean = false) => {
  if (isSelected) {
    // 선택된 경우 더 진한 색으로
    switch (level) {
      case 4:
        return "bg-stone-600 text-white";
      case 3:
        return "bg-stone-500 text-white";
      case 2:
        return "bg-stone-400 text-slate-900";
      case 1:
        return "bg-stone-300 text-slate-800";
      default:
        return "bg-stone-200 text-slate-700";
    }
  }
  
  // 기본 색상
  switch (level) {
    case 4:
      return "bg-stone-400 text-slate-900";
    case 3:
      return "bg-stone-300 text-slate-800";
    case 2:
      return "bg-stone-200 text-slate-700";
    case 1:
      return "bg-stone-100 text-slate-600";
    default:
      return "bg-slate-50 text-slate-500";
  }
};

export function CalendarHeatmap({
  onDateSelect,
  availabilityData,
  maxVotes = 10,
  selectedDateKey,
  onDateSelectFromExternal,
  focusedDateKeys,
}: CalendarHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [animationDateKey, setAnimationDateKey] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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

  // 외부에서 날짜 선택 시 처리
  useEffect(() => {
    if (selectedDateKey) {
      const dateKey = selectedDateKey;
      setSelectedDates((prev) => {
        const newSet = new Set(prev);
        newSet.add(dateKey);
        return newSet;
      });
      
      // 애니메이션 트리거
      setAnimationDateKey(dateKey);
      setTimeout(() => setAnimationDateKey(null), 1500);
    }
  }, [selectedDateKey]);

  const handleDateClick = (date: Date) => {
    const dateKey = getDateKey(date);
    setSelectedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
    
    // 클릭할 때마다 폭죽 애니메이션 트리거
    setAnimationDateKey(null);
    setTimeout(() => {
      setAnimationDateKey(dateKey);
      setTimeout(() => setAnimationDateKey(null), 1500);
    }, 10);
    
    onDateSelect?.(date);
  };

  return (
    <div className="w-full h-full bg-white p-2 md:p-3 lg:p-4 flex flex-col">
      {/* 헤더 */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h2 className="text-xl font-semibold text-slate-900 [font-family:var(--font-headline)]">
          {year}년 {monthNames[month]}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* 범례 */}
      <div className="mb-2 flex items-center justify-center gap-3 text-xs text-slate-600 [font-family:var(--font-body)]">
        <span>0명</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={cn(
              "h-4 w-6 border border-slate-200",
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
            className="text-center text-sm font-semibold text-slate-600 py-2 [font-family:var(--font-body)]"
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
          const availabilityLevel = getAvailabilityLevel(dayIndex);
          const votes = availabilityData?.[dayIndex] ?? 0;

          return (
            <button
              key={dayIndex}
              onClick={() => handleDateClick(dayInfo.date)}
              className={cn(
                "h-full rounded-none border border-slate-200 text-sm font-medium transition-all [font-family:var(--font-body)] overflow-visible",
                "hover:opacity-80",
                focused && !selected
                  ? "bg-blue-100/70 border-blue-300" 
                  : "",
                selected
                  ? "border-slate-400 border-2"
                  : "",
                densityClass(availabilityLevel, selected)
              )}
              title={`${dayInfo.dateStr} - ${votes}명 투표`}
            >
              <div className="relative flex flex-col items-start justify-start h-full p-1 w-full">
                <span>{dayInfo.day}</span>
                {votes > 0 && (
                  <span className="text-[10px] opacity-80 mt-1">{votes}</span>
                )}
                
                {/* 폭죽 애니메이션 효과 */}
                {animationDateKey === getDateKey(dayInfo.date) && (
                  <div className="absolute inset-0 pointer-events-none overflow-visible">
                    {/* 노란색/금색 별 */}
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={`yellow-${i}`}
                        className={`absolute left-0 top-0 bg-amber-400 rounded-full animate-star-burst ${
                          i % 3 === 0 ? 'w-8 h-8' : i % 3 === 1 ? 'w-7 h-7' : 'w-6 h-6'
                        }`}
                        style={{
                          '--star-angle': `${(i * 360) / 16}deg`,
                          '--star-delay': `${i * 0.02}s`,
                        } as React.CSSProperties}
                      />
                    ))}
                    {/* 연두색 폭죽 */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={`green-${i}`}
                        className="absolute left-0 top-0 w-6 h-6 bg-green-400 rounded-full animate-star-burst"
                        style={{
                          '--star-angle': `${(i * 360) / 6 + 15}deg`,
                          '--star-delay': `${i * 0.04}s`,
                        } as React.CSSProperties}
                      />
                    ))}
                    {/* 핑크색 폭죽 */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={`pink-${i}`}
                        className="absolute left-0 top-0 w-6 h-6 bg-pink-400 rounded-full animate-star-burst"
                        style={{
                          '--star-angle': `${(i * 360) / 6 + 30}deg`,
                          '--star-delay': `${i * 0.04 + 0.1}s`,
                        } as React.CSSProperties}
                      />
                    ))}
                    {/* 주황색 폭죽 */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={`orange-${i}`}
                        className="absolute left-0 top-0 w-6 h-6 bg-orange-400 rounded-full animate-star-burst"
                        style={{
                          '--star-angle': `${(i * 360) / 6 + 45}deg`,
                          '--star-delay': `${i * 0.04 + 0.2}s`,
                        } as React.CSSProperties}
                      />
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
