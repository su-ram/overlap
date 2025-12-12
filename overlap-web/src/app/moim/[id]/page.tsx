"use client";

import { useState, useMemo } from "react";
import { CalendarHeatmap } from "@/components/calendar/CalendarHeatmap";
import { ParticipantCard } from "@/components/event/ParticipantCard";
import { TopTime } from "@/components/event/TopTime";

export default function EventPage({ params }: { params: { id: string } }) {
  const [selectedDateKey, setSelectedDateKey] = useState<string | undefined>();
  const [selectedParticipantIndices, setSelectedParticipantIndices] = useState<Set<number>>(new Set());
  const [focusedDateKeys, setFocusedDateKeys] = useState<Set<string>>(new Set());

  // 한 달의 날짜 수 계산
  const daysInCurrentMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, []);

  // 해당 월의 모든 날짜 생성
  const monthDates = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
    
    const dates = [];
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const label = dayLabels[dayOfWeek];
      const dateStr = `${month + 1}/${day} (${label})`;
      
      dates.push({
        date: dateStr,
        dateObj: date,
        votes: Math.floor(Math.random() * 10), // 예시 투표 수
      });
    }
    
    // 투표 수 기준으로 정렬 (내림차순)
    return dates.sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
  }, [daysInCurrentMonth]);

  const handleDateClickFromSidebar = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    setSelectedDateKey(dateKey);
  };

  // 참여자별 투표한 날짜 데이터 (예시)
  const participantVotes = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const participants = ["김수람", "김석현", "오현준"];
    
    const votes: Record<number, Set<string>> = {};
    participants.forEach((_, index) => {
      const dateKeys = new Set<string>();
      // 각 참여자가 랜덤하게 3-7개의 날짜에 투표했다고 가정
      const voteCount = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < voteCount; i++) {
        const day = Math.floor(Math.random() * daysInCurrentMonth) + 1;
        const date = new Date(year, month, day);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        dateKeys.add(dateKey);
      }
      votes[index] = dateKeys;
    });
    
    return votes;
  }, [daysInCurrentMonth]);

  // 참여자별 투표한 날짜를 Date 배열로 변환
  const participantVotesDates = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const dates: Record<number, Date[]> = {};
    
    Object.entries(participantVotes).forEach(([indexStr, dateKeys]) => {
      const index = parseInt(indexStr);
      dates[index] = Array.from(dateKeys).map(dateKey => {
        const [y, m, d] = dateKey.split('-').map(Number);
        return new Date(y, m, d);
      }).sort((a, b) => a.getDate() - b.getDate());
    });
    
    return dates;
  }, [participantVotes]);

  const handleParticipantClick = (index: number, name?: string) => {
    const newSelectedIndices = new Set(selectedParticipantIndices);
    
    if (newSelectedIndices.has(index)) {
      // 이미 선택된 참여자를 다시 클릭하면 제거
      newSelectedIndices.delete(index);
    } else {
      // 새로운 참여자 추가
      newSelectedIndices.add(index);
    }
    
    setSelectedParticipantIndices(newSelectedIndices);
    
    // 선택된 모든 참여자의 날짜를 합쳐서 표시
    const allFocusedDates = new Set<string>();
    newSelectedIndices.forEach(idx => {
      const votes = participantVotes[idx] || new Set();
      votes.forEach(dateKey => allFocusedDates.add(dateKey));
    });
    setFocusedDateKeys(allFocusedDates);
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* 좌측 사이드바 - 참여자 */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 shadow-lg">
        <div className="flex h-full flex-col p-3 md:p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 [font-family:var(--font-headline)]">참여자</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {Array.from({ length: 10 }).map((_, index) => {
                const participant = ["김수람", "김석현", "오현준"][index];
                const votedDates = participantVotesDates[index] || [];
                
                return (
                  <ParticipantCard
                    key={index}
                    index={index}
                    name={participant}
                    isEmpty={!participant}
                    onClick={() => !participant ? undefined : handleParticipantClick(index, participant)}
                    isSelected={selectedParticipantIndices.has(index)}
                    votedDates={votedDates}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* 우측 사이드바 - Top 시간 */}
      <aside className="fixed right-0 top-0 z-40 h-screen w-64 bg-white border-l border-slate-200 shadow-lg">
        <div className="flex h-full flex-col p-3 md:p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 [font-family:var(--font-headline)]">Top 시간</h2>
            <p className="mt-1 text-xs text-slate-500 [font-family:var(--font-body)]">
              이 날 어때
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <TopTime 
              slots={monthDates} 
              onDateClick={handleDateClickFromSidebar}
              selectedDateKey={selectedDateKey}
            />
          </div>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <div className="md:ml-64 md:mr-64">
        <div className="relative h-screen px-3 py-6 md:px-4 md:py-8 lg:px-6 lg:py-10 flex flex-col">
          <div className="w-full flex-1 flex flex-col gap-4 md:gap-6 min-h-0">
            {/* 메인 캘린더 - 히트맵 형태 */}
            <section className="w-full flex-1 min-h-0">
              <CalendarHeatmap 
                availabilityData={Array.from({ length: daysInCurrentMonth }, () => Math.floor(Math.random() * 10))}
                maxVotes={10}
                selectedDateKey={selectedDateKey}
                focusedDateKeys={focusedDateKeys}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

