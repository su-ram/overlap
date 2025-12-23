"use client"; 

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { isHoliday, getHolidayName } from "@/lib/holidays";

type CalendarHeatmapProps = {
  onDateSelect?: (date: Date) => void;
  availabilityData?: number[]; // 각 날짜별 가용성 레벨 (0-4) 또는 투표 수
  maxVotes?: number; // 최대 투표 수 (가용성 레벨 계산용)
  selectedDateKey?: string; // 외부에서 선택된 날짜 키
  onDateSelectFromExternal?: (date: Date) => void; // 외부에서 날짜 선택 시 호출
  focusedDateKeys?: Set<string>; // 포커스된 날짜 키들 (참여자가 투표한 날짜)
  onMonthChange?: (year: number, month: number) => void; // 달 변경 시 호출
  highlightedDateKeys?: Set<string>; // 하이라이트할 날짜 키들 ("내 투표만 보기" 모드일 때)
  fixedDateKeys?: Set<string>; // fix된 날짜 키들
  totalMembers?: number; // 모임 전체 인원 수 (70% 강조 처리용)
  unavailableDateKeys?: Set<string>; // 딤 처리할 날짜 키들 (pick: -1인 날짜)
  dateVotersMap?: Map<string, string[]>; // 날짜별 투표한 참여자 이름 목록
  dateUnavailableVotersMap?: Map<string, string[]>; // 날짜별 "안 되는 날"로 표시한 참여자 이름 목록 (pick: -1)
  selectedUserUnavailableDateKeys?: Set<string>; // 현재 선택된 사용자가 "안 되는 날"로 선택한 날짜 키들 (클릭 가능하도록)
};

const densityClass = (level: number, isSelected: boolean = false) => {
  // 로고 색상 기준 초록색 (green2: light: #C8E6C9, medium: #81C784, deep: #4CAF50)
  // 투표 수에 따라 초록색의 명도를 조절 - 3단계로 축소
  switch (level) {
    case 2:
      return "bg-[#81C784] text-white"; // medium green (높은 투표)
    case 1:
      return "bg-[#C8E6C9] text-[#333333]"; // light green (중간 투표)
    default:
      return "bg-white text-[#333333]"; // 0명은 흰색
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
  fixedDateKeys,
  totalMembers,
  unavailableDateKeys,
  dateVotersMap,
  dateUnavailableVotersMap,
  selectedUserUnavailableDateKeys,
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
    // 투표 수를 0-2 레벨로 변환 (3단계)
    if (maxVotes === 0) return 0;
    const ratio = votes / maxVotes;
    
    if (ratio >= 0.5) return 2; // 높은 투표
    if (ratio > 0) return 1; // 중간 투표
    return 0; // 투표 없음
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

  const isDateFixed = (date: Date) => {
    const dateKey = getDateKey(date);
    return fixedDateKeys?.has(dateKey) ?? false;
  };

  const isDateUnavailable = (date: Date) => {
    const dateKey = getDateKey(date);
    return unavailableDateKeys?.has(dateKey) ?? false;
  };

  // 70% 이상 투표한 날짜인지 확인
  const isDateHighVote = (dayIndex: number): boolean => {
    if (!availabilityData || !availabilityData[dayIndex] || !totalMembers || totalMembers === 0) {
      return false;
    }
    const votes = availabilityData[dayIndex];
    const ratio = votes / totalMembers;
    return ratio >= 0.7;
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
    <div className="w-full h-full bg-[#FAF9F6] p-0 md:p-2 lg:p-3 flex flex-col">
      {/* 헤더 */}
      <div className="mb-1 md:mb-1.5 flex items-center justify-between px-1 md:px-0">
        <button
          onClick={goToPreviousMonth}
          className="p-1.5 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all"
        >
          <ChevronLeft className="h-4 w-4 text-[#333333]" />
        </button>
        <h2 className="text-lg font-semibold text-[#333333] [font-family:var(--font-headline)]">
          {year}년 {monthNames[month]}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-1.5 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all"
        >
          <ChevronRight className="h-4 w-4 text-[#333333]" />
        </button>
      </div>

      {/* 범례 */}
      <div className="mb-1 md:mb-1.5 flex items-center justify-center gap-2 text-[10px] text-[#333333] [font-family:var(--font-body)]">
        <span>0명</span>
        {[0, 1, 2].map((level) => (
          <span
            key={level}
            className={cn(
              "h-3 w-5 border border-[#DDDDDD]",
              densityClass(level),
            )}
          />
        ))}
        <span>{totalMembers || maxVotes}명</span>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-0.5 md:mb-1">
        {dayLabels.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-[#333333] py-1 [font-family:var(--font-body)]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 - 히트맵 형태 */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1 flex-1 min-h-0 overflow-visible" style={{ gridAutoRows: '1fr' }}>
        {/* 빈 칸 (첫 주의 시작일 이전) */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {/* 날짜들 */}
        {monthDays.map((dayInfo, dayIndex) => {
          const selected = isDateSelected(dayInfo.date);
          const focused = isDateFocused(dayInfo.date);
          const highlighted = isDateHighlighted(dayInfo.date);
          const fixed = isDateFixed(dayInfo.date);
          const dateKey = getDateKey(dayInfo.date);
          const isSelectedUserUnavailable = selectedUserUnavailableDateKeys?.has(dateKey) ?? false;
          // "내 투표만 보기" 모드일 때는 현재 사용자의 unavailable 날짜만 체크, 아닐 때는 모든 unavailable 날짜 체크
          const isHighlightMode = highlightedDateKeys !== undefined;
          const isUnavailable = isHighlightMode 
            ? isSelectedUserUnavailable 
            : isDateUnavailable(dayInfo.date);
          // 현재 선택된 사용자가 선택한 "안 되는 날"은 클릭 가능 (disable 해제)
          const isClickable = isUnavailable && isSelectedUserUnavailable;
          // pick: -1인 날짜는 투표 수를 0으로 처리
          // "내 투표만 보기" 모드일 때는 내가 투표하지 않은 날짜는 항상 레벨 0 (흰색)
          const availabilityLevel = isHighlightMode
            ? (highlighted ? (isUnavailable ? 0 : getAvailabilityLevel(dayIndex)) : 0)
            : (isUnavailable ? 0 : getAvailabilityLevel(dayIndex));
          const votes = isUnavailable ? 0 : (availabilityData?.[dayIndex] ?? 0);
          const isHighVote = isUnavailable ? false : isDateHighVote(dayIndex);
          // 전원이 다 되는 날짜 확인 (100% 투표)
          const isAllMembersVoted = !isUnavailable && totalMembers && votes > 0 && votes === totalMembers;
          
          // 오늘 날짜인지 확인
          const today = new Date();
          const isToday = 
            dayInfo.date.getFullYear() === today.getFullYear() &&
            dayInfo.date.getMonth() === today.getMonth() &&
            dayInfo.date.getDate() === today.getDate();
          
          // 공휴일인지 확인
          const isHolidayDate = isHoliday(dayInfo.date);
          const holidayName = getHolidayName(dayInfo.date);
          
          // 해당 날짜에 투표한 참여자 목록 (pick: -1인 날짜는 빈 배열)
          const voters = isUnavailable ? [] : (dateVotersMap?.get(dateKey) || []);
          // 해당 날짜에 "안 되는 날"로 표시한 참여자 목록
          const unavailableVoters = isUnavailable ? (dateUnavailableVotersMap?.get(dateKey) || []) : [];
          // tooltip 표시 여부: "내 투표만 보기" 모드가 아닐 때만, 그리고 투표가 있거나 "안 되는 날"로 표시한 참여자가 있는 경우만
          const shouldShowTooltip = !isHighlightMode && (isUnavailable 
            ? unavailableVoters.length > 0 
            : (votes > 0 || voters.length > 0));

          return (
            <motion.button
              key={dayIndex}
              onClick={() => (isClickable || !isUnavailable) && handleDateClick(dayInfo.date)}
              disabled={isUnavailable && !isClickable}
              whileHover={isUnavailable && !isClickable ? {} : { backgroundColor: "#C8E6C9" }}
              whileTap={isUnavailable && !isClickable ? {} : { scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "h-full rounded-sm border text-xs font-medium [font-family:var(--font-body)] overflow-visible backdrop-blur-[6px] group",
                isUnavailable && !isClickable
                  ? "opacity-50 cursor-not-allowed" 
                  : "cursor-pointer",
                // "내 투표만 보기" 모드일 때 내가 투표한 날짜만 초록 배경 (1단계)
                isHighlightMode && highlighted && !isSelectedUserUnavailable
                  ? "bg-[#C8E6C9] text-[#333333]" // 내가 투표한 날짜 강조 (color range 1단계)
                  : "",
                // "내 투표만 보기" 모드일 때 안 되는 날로 투표한 날은 딤 처리만 (disable 아님)
                isHighlightMode && isSelectedUserUnavailable
                  ? "opacity-50"
                  : "",
                // 테두리 처리
                !isHighlightMode && isHighVote && !highlighted
                  ? "border-2 border-[#4CAF50] border-opacity-80 shadow-md"
                  : !highlighted
                  ? "border border-gray-200/50"
                  : "",
                !isHighlightMode && highlighted
                  ? "bg-white/60 backdrop-blur-md border-white/60 text-[#333333]"
                  : "",
                // 전원이 다 되는 날짜는 가장 진한 초록색 (투명도 없음)
                !isHighlightMode && !highlighted && isAllMembersVoted
                  ? "bg-[#4CAF50] text-white"
                  : "",
                // densityClass 적용 (내 투표만 보기 모드가 아닐 때만, 전원 투표가 아닌 경우)
                !isHighlightMode && !highlighted && !isAllMembersVoted && densityClass(availabilityLevel, false),
                // "내 투표만 보기" 모드에서 내가 투표하지 않은 날짜는 무조건 흰색 배경 (다른 사람 투표 여부와 무관)
                isHighlightMode && !highlighted && !isSelectedUserUnavailable
                  ? "bg-white text-[#333333]"
                  : ""
              )}
            >
              <div className="relative flex flex-col items-start justify-start h-full p-1 w-full">
                <div className="flex items-center gap-0.5" style={isUnavailable ? { opacity: 1 } : undefined}>
                  {isToday ? (
                    <span className={`font-bold ${isUnavailable ? "text-[#333333]" : (isHolidayDate ? "text-red-600" : "")}`}>{dayInfo.day}</span>
                  ) : fixed ? (
                    <span className={`font-bold ${isUnavailable ? "text-[#333333]" : (isHolidayDate ? "text-red-600" : "")}`}>{dayInfo.day}</span>
                  ) : (
                    <span className={isUnavailable ? "text-[#333333]" : (isHolidayDate ? "text-red-600" : "")}>{dayInfo.day}</span>
                  )}
                  {fixed && (
                    <span className="text-[10px]">📌</span>
                  )}
                </div>
                {holidayName && (
                  <span className={`text-[8px] font-medium leading-tight mt-0.5 ${isUnavailable ? "text-[#333333]" : "text-red-600"}`}>{holidayName}</span>
                )}
                {/* 점 표시: 내가 투표한 날짜만 (일반 투표 + 안 되는 날로 투표한 날짜) */}
                {focused && (
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] text-gray-600">●</span>
                )}
              </div>
              {/* Tooltip */}
              {shouldShowTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-gray-900 text-white text-[10px] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 [font-family:var(--font-body)] max-w-xs">
                <div className="flex flex-col gap-1">
                  {isUnavailable ? (
                    <>
                      <span>❌</span>
                      {unavailableVoters.length > 0 && (
                        <div className="text-[9px] text-gray-300 whitespace-normal break-words">
                          {unavailableVoters.map((voter, idx) => (
                            <span key={idx}>
                              {voter}
                              {idx < unavailableVoters.length - 1 && ", "}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="whitespace-nowrap">🟢 {votes}명 투표</span>
                      {voters.length > 0 && (
                        <div className="text-[9px] text-gray-300 whitespace-normal break-words">
                          {voters.map((voter, idx) => (
                            <span key={idx}>
                              {voter}
                              {idx < voters.length - 1 && ", "}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {/* Tooltip 화살표 */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                  <div className="w-2 h-2 bg-gray-900 transform rotate-45"></div>
                </div>
              </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

