"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CalendarHeatmap } from "@/components/calendar/CalendarHeatmap";
import { ParticipantCard } from "@/components/event/ParticipantCard";
import { TopTime } from "@/components/event/TopTime";
import { buttonPrimary, buttonSecondary } from "@/colors";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/Loader";

type Buddy = {
  id: number; // bigint
  moim: string; // UUID
  name?: string;
  created_at?: string;
  [key: string]: any;
};

type Slot = {
  id: number; // bigint
  moim: string; // UUID
  buddy?: number; // bigint (buddy id)
  date?: string; // date
  begin?: string; // time without time zone
  end?: string; // time without time zone (예약어)
  pick?: number; // bigint (투표 수)
  created_at?: string;
  [key: string]: any;
};

type MoimData = {
  id: string;
  moim_name?: string;
  buddies: Buddy[];
  slots: Slot[];
  [key: string]: any;
};

export default function EventPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const [moimId, setMoimId] = useState<string | null>(null);
  const [moimData, setMoimData] = useState<MoimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateKey, setSelectedDateKey] = useState<string | undefined>();
  const [selectedParticipantIndices, setSelectedParticipantIndices] = useState<Set<number>>(new Set());
  const [focusedDateKeys, setFocusedDateKeys] = useState<Set<string>>(new Set());
  const [newMemberName, setNewMemberName] = useState<string>("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [currentCalendarYear, setCurrentCalendarYear] = useState<number>(new Date().getFullYear());
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<number>(new Date().getMonth());
  const [showOnlyMyVotes, setShowOnlyMyVotes] = useState<boolean>(false);
  const [slotList, setSlotList] = useState<Array<{
    date: string;
    dateObj?: Date;
    votes?: number;
  }>>([]);
  // 모바일에서는 기본적으로 닫혀있고, 데스크톱에서는 열려있도록
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(false);
  const [isUrlCopied, setIsUrlCopied] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  // 데스크톱에서는 사이드바를 기본적으로 열어두기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsLeftSidebarOpen(true);
        setIsRightSidebarOpen(true);
      } else {
        // 모바일에서는 좌측 사이드바만 닫고, 우측 사이드바는 항상 닫음
        setIsLeftSidebarOpen(false);
        setIsRightSidebarOpen(false);
      }
    };

    handleResize(); // 초기 설정
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // params에서 id 추출 (Promise 또는 동기)
  useEffect(() => {
    const extractId = async () => {
      if (params instanceof Promise) {
        const resolvedParams = await params;
        setMoimId(resolvedParams.id);
      } else {
        setMoimId(params.id);
      }
    };
    extractId();
  }, [params]);

  // moim 정보 가져오기
  useEffect(() => {
    // moimId가 유효한지 확인
    if (!moimId || moimId === "undefined" || moimId === "null") {
      setLoading(false);
      return;
    }

    const fetchMoimData = async () => {
      try {
        console.log("Fetching moim data for id:", moimId);
        const response = await fetch(`/api/moim?id=${moimId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch moim data");
        }
        const data = await response.json();
        console.log("Moim data fetched:", data);
        setMoimData(data);
      } catch (error) {
        console.error("Error fetching moim data:", error);
        setMoimData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMoimData();
  }, [moimId]);

  // 캘린더에서 보고 있는 달의 날짜 수 계산
  const daysInCurrentMonth = useMemo(() => {
    return new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
  }, [currentCalendarYear, currentCalendarMonth]);

  // buddy 리스트에서 참여자 이름 추출
  const buddyList = useMemo(() => {
    return moimData?.buddies || [];
  }, [moimData?.buddies]);

  // 선택된 참여자 ID 가져오기 (첫 번째 선택된 참여자)
  const selectedBuddyId = useMemo(() => {
    if (selectedParticipantIndices.size === 0) return null;
    const firstIndex = Array.from(selectedParticipantIndices)[0];
    const buddy = buddyList[firstIndex];
    return buddy?.id || null;
  }, [selectedParticipantIndices, buddyList]);

  // "내 투표만 보기"가 on일 때 선택된 참여자가 투표한 날짜 키 계산
  const myVotedDateKeys = useMemo(() => {
    if (!showOnlyMyVotes || !selectedBuddyId || !moimData?.slots) {
      return new Set<string>();
    }

    const dateKeys = new Set<string>();
    const year = currentCalendarYear;
    const month = currentCalendarMonth;

    moimData.slots.forEach((slot) => {
      if (!slot.date) return;
      const slotBuddyId = slot.buddy ? Number(slot.buddy) : null;
      if (slotBuddyId !== selectedBuddyId) return;

      try {
        const slotDate = new Date(slot.date);
        if (
          slotDate.getFullYear() === year &&
          slotDate.getMonth() === month
        ) {
          const dateKey = `${slotDate.getFullYear()}-${slotDate.getMonth()}-${slotDate.getDate()}`;
          dateKeys.add(dateKey);
        }
      } catch (e) {
        console.warn("Failed to parse slot date:", slot.date);
      }
    });

    return dateKeys;
  }, [showOnlyMyVotes, selectedBuddyId, moimData?.slots, currentCalendarYear, currentCalendarMonth]);

  // slot 데이터를 캘린더에 매핑 (날짜별 투표 수 집계) - 캘린더에서 보고 있는 달 기준
  const calendarAvailabilityData = useMemo(() => {
    if (!moimData?.slots) {
      return Array.from({ length: daysInCurrentMonth }, () => 0);
    }

    // 캘린더에서 현재 보고 있는 달/년도 사용
    const year = currentCalendarYear;
    const month = currentCalendarMonth;

    // 토글이 on이고 선택된 참여자가 있으면 해당 참여자의 슬롯만 필터링
    let filteredSlots = moimData.slots;
    if (showOnlyMyVotes && selectedBuddyId) {
      filteredSlots = moimData.slots.filter((slot) => {
        const slotBuddyId = slot.buddy ? Number(slot.buddy) : null;
        return slotBuddyId === selectedBuddyId;
      });
    }

    // 날짜별로 pick 값 합산
    const dateVotesMap = new Map<number, number>();

    filteredSlots.forEach((slot) => {
      if (!slot.date) return;

      try {
        const slotDate = new Date(slot.date);
        // 캘린더에서 보고 있는 달의 날짜인지 확인 (date 기준)
        if (
          slotDate.getFullYear() === year &&
          slotDate.getMonth() === month
        ) {
          const day = slotDate.getDate();
          const currentVotes = dateVotesMap.get(day) || 0;
          // pick 값이 있으면 합산 (pick은 bigint이므로 number로 변환)
          const pickValue = slot.pick ? Number(slot.pick) : 0;
          dateVotesMap.set(day, currentVotes + pickValue);
        }
      } catch (e) {
        // 날짜 파싱 실패 시 무시
        console.warn("Failed to parse slot date:", slot.date);
      }
    });

    // 날짜 인덱스(1-based)로 배열 생성
    const availabilityData: number[] = [];
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      availabilityData.push(dateVotesMap.get(day) || 0);
    }

    return availabilityData;
  }, [moimData?.slots, daysInCurrentMonth, currentCalendarYear, currentCalendarMonth, showOnlyMyVotes, selectedBuddyId]);

  // Top 시간 리스트 조회 함수 (재사용 가능하도록 분리)
  const fetchTopTimeslots = useCallback(async () => {
    if (!moimId) return;

    try {
      const response = await fetch(
        `/api/top-timeslots?moimId=${moimId}&year=${currentCalendarYear}&month=${currentCalendarMonth + 1}`
      );
      
      if (!response.ok) {
        console.error("Failed to fetch top timeslots");
        setSlotList([]);
        return;
      }

      const data = await response.json();
      const slots = data.slots || [];
      
      const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
      
      const formattedSlots = slots.map((slot: any) => {
        let dateObj: Date | undefined;
        let dateStr = "";
        
        // slot에서 date 정보 추출 (RPC 함수 반환 형식에 따라 조정 필요)
        if (slot.date) {
          try {
            dateObj = new Date(slot.date);
            if (!isNaN(dateObj.getTime())) {
              const month = dateObj.getMonth() + 1;
              const day = dateObj.getDate();
              const dayOfWeek = dateObj.getDay();
              dateStr = `${month}/${day} (${dayLabels[dayOfWeek]})`;
            }
          } catch (e) {
            console.warn("Failed to parse date:", slot.date);
          }
        }
        
        return {
          date: dateStr,
          dateObj,
          votes: slot.vote_count || slot.pick || slot.votes || 0,
        };
      });
      
      setSlotList(formattedSlots);
    } catch (error) {
      console.error("Error fetching top timeslots:", error);
      setSlotList([]);
    }
  }, [moimId, currentCalendarYear, currentCalendarMonth]);

  // 캘린더 year/month 변경 시 top 리스트 조회
  useEffect(() => {
    fetchTopTimeslots();
  }, [fetchTopTimeslots]);

  const handleDateClickFromSidebar = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    setSelectedDateKey(dateKey);
  };

  // 모임 데이터 새로고침
  const refreshMoimData = async () => {
    if (!moimId) return;
    
    try {
      const response = await fetch(`/api/moim?id=${moimId}`);
      if (response.ok) {
        const data = await response.json();
        setMoimData(data);
      }
      // 모임 데이터 새로고침 후 top 리스트도 재조회
      await fetchTopTimeslots();
    } catch (error) {
      console.error("Error refreshing moim data:", error);
    }
  };

  // Toast 메시지 표시 헬퍼 함수
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setToastMessage("");
    }, 2000);
  };

  // URL 복사 핸들러
  const handleCopyUrl = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setIsUrlCopied(true);
      showToastMessage("URL이 복사되었습니다");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      alert("URL 복사에 실패했습니다.");
    }
  };

  // 참여자 추가 핸들러
  const handleAddMember = async () => {
    if (!moimId || !newMemberName.trim()) return;

    setIsAddingMember(true);
    try {
      const response = await fetch("/api/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moimId: moimId,
          memberName: newMemberName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to add member";
        
        // 중복 에러인 경우 (409 Conflict)
        if (response.status === 409) {
          alert(errorMessage);
          return;
        }
        
        throw new Error(errorMessage);
      }

      // 참여자 이름 저장 (초기화 전에)
      const addedMemberName = newMemberName.trim();
      
      // 입력 필드 초기화
      setNewMemberName("");
      
      // 모임 데이터 새로고침 (buddy list 다시 가져오기)
      await refreshMoimData();
      
      // 성공 메시지 표시
      showToastMessage(`${addedMemberName}님이 추가되었습니다`);
    } catch (error) {
      console.error("Error adding member:", error);
      alert(error instanceof Error ? error.message : "참여자 추가에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsAddingMember(false);
    }
  };

  // Enter 키 핸들러
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newMemberName.trim()) {
      handleAddMember();
    }
  };

  const handleParticipantClick = (index: number, buddyId?: number | string) => {
    // 선택 가능한 개수는 1개로 제한
    if (selectedParticipantIndices.has(index)) {
      // 이미 선택된 참여자를 다시 클릭하면 제거
      setSelectedParticipantIndices(new Set());
      setFocusedDateKeys(new Set());
    } else {
      // 새로운 참여자 선택 (기존 선택 해제)
      setSelectedParticipantIndices(new Set([index]));
      // TODO: 선택된 참여자의 투표한 날짜를 가져와서 focusedDateKeys에 설정
      // 현재는 빈 Set으로 설정
      setFocusedDateKeys(new Set());
    }
  };

  // 특정 날짜에 해당 사용자의 slot이 존재하는지 확인 (모임 + 사용자 키)
  const checkSlotExists = async (dateStr: string, buddyId: string): Promise<boolean> => {
    if (!moimId || !buddyId) {
      console.warn("checkSlotExists: moimId or buddyId is missing");
      return false;
    }

    try {
      const response = await fetch(`/api/slot?moimId=${moimId}&buddyId=${buddyId}&date=${dateStr}`);
      if (!response.ok) {
        console.warn("checkSlotExists: API response not ok", response.status);
        return false;
      }

      const data = await response.json();
      const exists = (data.slots || []).length > 0;
      console.log(`checkSlotExists: moim=${moimId}, buddy=${buddyId}, date=${dateStr}, exists=${exists}`);
      return exists;
    } catch (error) {
      console.error("Error checking slot:", error);
      return false;
    }
  };

  // 캘린더 날짜 클릭 핸들러 (토글 기능)
  const handleCalendarDateClick = async (date: Date) => {
    // 참여자가 선택되지 않았으면 알림 후 중단
    if (!selectedBuddyId || selectedParticipantIndices.size === 0) {
      alert("시간 슬롯을 생성하려면 먼저 참여자를 선택해주세요.");
      return;
    }

    if (!moimId) {
      alert("모임 정보를 불러올 수 없습니다.");
      return;
    }

    try {
      // 날짜를 YYYY-MM-DD 형식으로 변환
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      // 모임 + 버디 조합으로 해당 날짜의 slot이 존재하는지 확인
      const slotExists = await checkSlotExists(dateStr, String(selectedBuddyId));

      if (slotExists) {
        // 모임 + 버디 조합의 slot이 존재하면 삭제 (토글)
        console.log(`Deleting slot: moim=${moimId}, buddy=${selectedBuddyId}, date=${dateStr}`);
        const deleteResponse = await fetch(`/api/slot?moimId=${moimId}&buddyId=${selectedBuddyId}&date=${dateStr}`, {
          method: "DELETE",
        });

        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to delete slot");
        }
      } else {
        // 모임 + 버디 조합의 slot이 없으면 생성
        console.log(`Creating slot: moim=${moimId}, buddy=${selectedBuddyId}, date=${dateStr}`);
        const createResponse = await fetch("/api/slot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moimId: moimId,
            buddyId: selectedBuddyId,
            date: dateStr,
            // begin과 end는 선택사항 (현재는 null로 설정)
          }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to create slot");
        }
      }

      // 모임 데이터 새로고침 (slot list 다시 가져오기)
      await refreshMoimData();
    } catch (error) {
      console.error("Error toggling slot:", error);
      alert(error instanceof Error ? error.message : "시간 슬롯 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="text-center flex flex-col items-center gap-4">
          <Loader size="lg" />
          <p className="text-[#333333] [font-family:var(--font-body)]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!moimData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#333333]">모임을 찾을 수 없습니다</h1>
          <p className="mt-2 text-[#333333]">존재하지 않는 모임 ID입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Toast 메시지 */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 [font-family:var(--font-body)]">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 모바일 오버레이 */}
      {isLeftSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => {
            setIsLeftSidebarOpen(false);
          }}
        />
      )}

      {/* 좌측 사이드바 - 참여자 */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 bg-[#FAF9F6] border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out ${
        isLeftSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-full flex-col p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900 [font-family:var(--font-headline)]">참여자</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700 [font-family:var(--font-body)]">
                {buddyList.length}명
              </span>
            </div>
            <button
              onClick={() => setIsLeftSidebarOpen(false)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="사이드바 닫기"
              title="사이드바 닫기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4">
            <ul className="flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden">
              {/* 참여자 목록 */}
              {buddyList.map((buddy, index) => {
                const buddyName = buddy.name || buddy.member_name || `참여자 ${index + 1}`;
                
                return (
                  <li 
                    key={buddy.id || index} 
                    className={index > 0 ? "border-t border-gray-200" : ""}
                  >
                    <ParticipantCard
                      index={index}
                      name={buddyName}
                      isEmpty={false}
                      onClick={() => handleParticipantClick(index, buddy.id)}
                      isSelected={selectedParticipantIndices.has(index)}
                      votedDates={[]} // TODO: buddy의 투표한 날짜 데이터 연결
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 참여자 추가 입력 필드 - 목록 아래 */}
          <div className="pt-4 border-t border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="참여자 이름"
                className="w-full px-3 pr-20 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 [font-family:var(--font-body)]"
                disabled={isAddingMember}
              />
              <motion.button
                onClick={handleAddMember}
                disabled={!newMemberName.trim() || isAddingMember}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
                whileHover={{ 
                  scale: 1.05,
                  y: -1
                }}
                whileTap={{ 
                  scale: 0.95,
                  y: 0
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 17 
                }}
              >
                추가
              </motion.button>
            </div>
          </div>
        </div>
      </aside>

      {/* 우측 사이드바 - Top 시간 (데스크톱만) */}
      <aside className={`hidden md:block fixed right-0 top-0 z-40 h-screen w-64 bg-[#FAF9F6] border-l border-white/70 shadow-lg transition-transform duration-300 ease-in-out ${
        isRightSidebarOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex h-full flex-col p-3 md:p-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#333333] [font-family:var(--font-headline)]">Top 시간</h2>
              <p className="mt-1 text-xs text-[#333333] [font-family:var(--font-body)]">
                이 날 어때
              </p>
            </div>
            <button
              onClick={() => setIsRightSidebarOpen(false)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="사이드바 닫기"
              title="사이드바 닫기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="mt-4">
              {slotList.length > 0 ? (
                <TopTime 
                  slots={slotList} 
                  onDateClick={handleDateClickFromSidebar}
                  selectedDateKey={selectedDateKey}
                />
              ) : (
                <div className="text-sm text-[#333333] text-center py-4">
                  등록된 시간 슬롯이 없습니다
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <div className={`bg-[#FAF9F6] transition-all duration-300 w-full ${
        isLeftSidebarOpen ? "md:ml-64" : "md:ml-0"
      } ${isRightSidebarOpen ? "md:mr-64" : "md:mr-0"}`}>
        <div className="relative min-h-screen md:h-screen px-3 py-6 md:px-4 md:py-8 lg:px-6 lg:py-10 flex flex-col md:overflow-hidden">
          {/* 모바일 사이드바 토글 버튼 */}
          <div className="flex items-center gap-2 mb-4 md:hidden">
            <button
              onClick={() => setIsLeftSidebarOpen(true)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              aria-label="참여자 사이드바 열기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>

          {/* 모임 제목 및 토글 */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-[#333333] [font-family:var(--font-headline)]">
                {moimData?.moim_name || "모임"}
              </h1>
              <button
                onClick={handleCopyUrl}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title={isUrlCopied ? "복사됨!" : "URL 복사"}
                aria-label="URL 복사"
              >
                {isUrlCopied ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {/* 데스크톱 사이드바 토글 버튼 */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  aria-label="참여자 사이드바 토글"
                  title={isLeftSidebarOpen ? "참여자 사이드바 닫기" : "참여자 사이드바 열기"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  aria-label="Top 시간 사이드바 토글"
                  title={isRightSidebarOpen ? "Top 시간 사이드바 닫기" : "Top 시간 사이드바 열기"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <span className="text-sm text-[#333333] [font-family:var(--font-body)]">
                내 투표만 보기
              </span>
              <button
                onClick={() => setShowOnlyMyVotes(!showOnlyMyVotes)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 backdrop-blur-sm ${
                  showOnlyMyVotes ? "bg-white/60" : "bg-white/40"
                }`}
                disabled={!selectedBuddyId}
                title={!selectedBuddyId ? "참여자를 선택해주세요" : ""}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showOnlyMyVotes ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4 md:gap-6 md:flex-1 md:min-h-0 md:overflow-hidden">
            {/* 메인 캘린더 - 히트맵 형태 */}
            <section className="w-full md:flex-1 md:min-h-0 relative z-0">
              <CalendarHeatmap 
                availabilityData={calendarAvailabilityData}
                maxVotes={Math.max(...calendarAvailabilityData, 1)}
                selectedDateKey={selectedDateKey}
                focusedDateKeys={focusedDateKeys}
                highlightedDateKeys={showOnlyMyVotes ? myVotedDateKeys : undefined}
                onDateSelect={handleCalendarDateClick}
                onMonthChange={(year, month) => {
                  setCurrentCalendarYear(year);
                  setCurrentCalendarMonth(month);
                }}
              />
            </section>

            {/* 모바일 Top 시간 목록 - 캘린더 아래 */}
            <section className="md:hidden w-full mt-4 mb-4 relative z-0">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-[#333333] [font-family:var(--font-headline)]">Top 시간</h2>
                  <p className="mt-1 text-xs text-[#333333] [font-family:var(--font-body)]">
                    이 날 어때
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {slotList.length > 0 ? (
                    <TopTime 
                      slots={slotList} 
                      onDateClick={handleDateClickFromSidebar}
                      selectedDateKey={selectedDateKey}
                    />
                  ) : (
                    <div className="text-sm text-[#333333] text-center py-4">
                      등록된 시간 슬롯이 없습니다
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

