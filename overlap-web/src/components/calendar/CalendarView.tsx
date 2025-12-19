"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  onDateSelect?: (date: Date) => void;
}

export function CalendarView({ onDateSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

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

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const isSelected = (date: Date) => {
    return selectedDates.has(getDateKey(date));
  };

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
    onDateSelect?.(date);
  };

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={goToPreviousMonth}
          className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h2 className="text-xl font-semibold text-slate-900 [font-family:var(--font-headline)]">
          {year}년 {monthNames[month]}
        </h2>
        <button
          onClick={goToNextMonth}
          className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayLabels.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-slate-600 py-2 [font-family:var(--font-body)]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 빈 칸 (첫 주의 시작일 이전) */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* 날짜들 */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const date = new Date(year, month, day);
          const selected = isSelected(date);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(date)}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors [font-family:var(--font-body)] ${
                selected
                  ? "bg-blue-500 text-white font-semibold hover:bg-blue-600"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}



