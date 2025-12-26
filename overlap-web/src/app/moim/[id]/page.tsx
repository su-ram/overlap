"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CalendarHeatmap } from "@/components/calendar/CalendarHeatmap";
import { ParticipantCard } from "@/components/event/ParticipantCard";
import { TopTime } from "@/components/event/TopTime";
import { Logo } from "@/components/Logo";
import { buttonPrimary, buttonSecondary } from "@/colors";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/Loader";
import { useLoading } from "@/contexts/LoadingContext";

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
  const router = useRouter();
  const [moimId, setMoimId] = useState<string | null>(null);
  const [moimData, setMoimData] = useState<MoimData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setIsLoading } = useLoading();
  const [selectedDateKey, setSelectedDateKey] = useState<string | undefined>();
  const [selectedParticipantIndices, setSelectedParticipantIndices] = useState<Set<number>>(new Set());
  const [focusedDateKeys, setFocusedDateKeys] = useState<Set<string>>(new Set());
  const [newMemberName, setNewMemberName] = useState<string>("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [currentCalendarYear, setCurrentCalendarYear] = useState<number>(new Date().getFullYear());
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<number>(new Date().getMonth());
  const [showOnlyMyVotes, setShowOnlyMyVotes] = useState<boolean>(false);
  const [voteFilterMode, setVoteFilterMode] = useState<'available' | 'unavailable'>('available');
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
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const isInputFocusedRef = useRef<boolean>(false);
  const hasInitialLoadRef = useRef<boolean>(false);
  const [fixedSlots, setFixedSlots] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [unavailableDateKeys, setUnavailableDateKeys] = useState<Set<string>>(new Set());

  // 데스크톱에서는 사이드바를 기본적으로 열어두기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsLeftSidebarOpen(true);
        setIsRightSidebarOpen(true);
      } else {
        // 모바일에서는 인풋에 포커스가 없을 때만 사이드바를 닫음
        if (!isInputFocusedRef.current) {
          setIsRightSidebarOpen(false);
          // 좌측 사이드바는 사용자가 열어둔 상태라면 유지
        }
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

  // 로딩 상태를 전역 Context에 동기화
  useEffect(() => {
    setIsLoading(loading || (!moimData && !loading));
  }, [loading, moimData, setIsLoading]);

  // moim 정보 가져오기
  useEffect(() => {
    // moimId가 유효한지 확인
    if (!moimId || moimId === "undefined" || moimId === "null") {
      setLoading(false);
      return;
    }

    const fetchMoimData = async () => {
      const startTime = Date.now();
      try {
        console.log("Fetching moim data for id:", moimId);
        // 최소 2초 대기와 API 호출을 동시에 실행
        const [response] = await Promise.all([
          fetch(`/api/moim?id=${moimId}`),
          new Promise(resolve => setTimeout(resolve, 2000))
        ]);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch moim data");
        }
        const data = await response.json();
        console.log("Moim data fetched:", data);
        setMoimData(data);
        
        // 최소 2초가 지났는지 확인하고, 안 지났으면 남은 시간만큼 대기
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 2000) {
          await new Promise(resolve => setTimeout(resolve, 2000 - elapsedTime));
        }
      } catch (error) {
        // 에러 발생 시에도 최소 2초 대기
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 2000) {
          await new Promise(resolve => setTimeout(resolve, 2000 - elapsedTime));
        }
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

  // 선택된 참여자가 투표한 날짜 키 계산 (항상 계산)
  const selectedBuddyVotedDateKeys = useMemo(() => {
    if (!selectedBuddyId || !moimData?.slots) {
      return new Set<string>();
    }

    const dateKeys = new Set<string>();
    const year = currentCalendarYear;
    const month = currentCalendarMonth;

    moimData.slots.forEach((slot) => {
      if (!slot.date) return;
      const slotBuddyId = slot.buddy ? Number(slot.buddy) : null;
      if (slotBuddyId !== selectedBuddyId) return;

      const pickValue = slot.pick !== undefined && slot.pick !== null ? Number(slot.pick) : 0;
      
      // pick: -1인 경우는 제외 (안 되는 날로 투표한 날은 selectedUserUnavailableDateKeys에 포함됨)
      if (pickValue === -1) return;
      
      // pick이 0이거나 undefined인 경우는 투표하지 않은 것으로 간주 (제외)
      if (pickValue <= 0) return;

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
  }, [selectedBuddyId, moimData?.slots, currentCalendarYear, currentCalendarMonth]);

  // "내 투표만 보기"가 on일 때 선택된 참여자가 투표한 날짜 키 계산
  const myVotedDateKeys = useMemo(() => {
    if (!showOnlyMyVotes) {
      return new Set<string>();
    }
    return selectedBuddyVotedDateKeys;
  }, [showOnlyMyVotes, selectedBuddyVotedDateKeys]);

  // 필터 모드에 따른 날짜 키 계산
  const filteredDateKeys = useMemo(() => {
    if (!showOnlyMyVotes || !selectedBuddyId) {
      return undefined;
    }
    
    if (voteFilterMode === 'available') {
      // 되는 날: 내가 투표한 날짜
      return selectedBuddyVotedDateKeys;
    } else {
      // 안 되는 날: 내가 투표하지 않은 날짜
      const allDateKeys = new Set<string>();
      const year = currentCalendarYear;
      const month = currentCalendarMonth;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        allDateKeys.add(dateKey);
      }
      
      // 내가 투표한 날짜를 제외
      selectedBuddyVotedDateKeys.forEach(key => allDateKeys.delete(key));
      return allDateKeys;
    }
  }, [showOnlyMyVotes, selectedBuddyId, voteFilterMode, selectedBuddyVotedDateKeys, currentCalendarYear, currentCalendarMonth]);

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

    // 날짜별로 pick 값 합산 (pick이 -1인 경우는 제외)
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
          
          // pick이 -1이 아닌 경우만 투표 수에 합산
          const pickValue = slot.pick ? Number(slot.pick) : 0;
          if (pickValue !== -1) {
            const currentVotes = dateVotesMap.get(day) || 0;
            dateVotesMap.set(day, currentVotes + pickValue);
          }
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
  }, [moimData?.slots, daysInCurrentMonth, currentCalendarYear, currentCalendarMonth, showOnlyMyVotes, selectedBuddyId, voteFilterMode]);

  // 날짜별 투표한 참여자 목록 계산
  const dateVotersMap = useMemo(() => {
    const map = new Map<string, string[]>(); // dateKey -> 참여자 이름 배열
    
    if (!moimData?.slots || !moimData?.buddies) {
      return map;
    }

    const year = currentCalendarYear;
    const month = currentCalendarMonth;

    // buddy id -> 이름 매핑 생성
    const buddyNameMap = new Map<number, string>();
    moimData.buddies.forEach((buddy) => {
      const buddyId = buddy.id ? Number(buddy.id) : null;
      if (buddyId !== null) {
        const buddyName = buddy.name || buddy.member_name || `참여자 ${buddyId}`;
        buddyNameMap.set(buddyId, buddyName);
      }
    });

    // 각 slot을 순회하며 날짜별 참여자 목록 생성
    moimData.slots.forEach((slot) => {
      if (!slot.date || !slot.buddy) return;

      const pickValue = slot.pick ? Number(slot.pick) : 0;
      // pick이 -1인 경우는 제외
      if (pickValue === -1) return;

      try {
        const slotDate = new Date(slot.date);
        if (
          slotDate.getFullYear() === year &&
          slotDate.getMonth() === month
        ) {
          const dateKey = `${slotDate.getFullYear()}-${slotDate.getMonth()}-${slotDate.getDate()}`;
          const buddyId = Number(slot.buddy);
          const buddyName = buddyNameMap.get(buddyId);
          
          if (buddyName) {
            const existing = map.get(dateKey) || [];
            // 중복 제거
            if (!existing.includes(buddyName)) {
              map.set(dateKey, [...existing, buddyName]);
            }
          }
        }
      } catch (e) {
        console.warn("Failed to parse slot date:", slot.date);
      }
    });

    return map;
  }, [moimData?.slots, moimData?.buddies, currentCalendarYear, currentCalendarMonth]);

  // 날짜별 "안 되는 날"로 표시한 참여자 목록 계산 (pick: -1)
  const dateUnavailableVotersMap = useMemo(() => {
    const map = new Map<string, string[]>(); // dateKey -> 참여자 이름 배열
    
    if (!moimData?.slots || !moimData?.buddies) {
      return map;
    }

    const year = currentCalendarYear;
    const month = currentCalendarMonth;

    // buddy id -> 이름 매핑 생성
    const buddyNameMap = new Map<number, string>();
    moimData.buddies.forEach((buddy) => {
      const buddyId = buddy.id ? Number(buddy.id) : null;
      if (buddyId !== null) {
        const buddyName = buddy.name || buddy.member_name || `참여자 ${buddyId}`;
        buddyNameMap.set(buddyId, buddyName);
      }
    });

    // 각 slot을 순회하며 pick: -1인 참여자 목록 생성
    moimData.slots.forEach((slot) => {
      if (!slot.date || !slot.buddy) return;

      const pickValue = slot.pick ? Number(slot.pick) : 0;
      // pick이 -1인 경우만 포함
      if (pickValue !== -1) return;

      try {
        const slotDate = new Date(slot.date);
        if (
          slotDate.getFullYear() === year &&
          slotDate.getMonth() === month
        ) {
          const dateKey = `${slotDate.getFullYear()}-${slotDate.getMonth()}-${slotDate.getDate()}`;
          const buddyId = Number(slot.buddy);
          const buddyName = buddyNameMap.get(buddyId);
          
          if (buddyName) {
            const existing = map.get(dateKey) || [];
            // 중복 제거
            if (!existing.includes(buddyName)) {
              map.set(dateKey, [...existing, buddyName]);
            }
          }
        }
      } catch (e) {
        console.warn("Failed to parse slot date:", slot.date);
      }
    });

    return map;
  }, [moimData?.slots, moimData?.buddies, currentCalendarYear, currentCalendarMonth]);

  // 현재 선택된 사용자가 "안 되는 날"로 선택한 날짜 목록
  const selectedUserUnavailableDateKeys = useMemo(() => {
    const dateKeys = new Set<string>();
    
    if (!moimData?.slots || !selectedBuddyId) {
      return dateKeys;
    }

    const year = currentCalendarYear;
    const month = currentCalendarMonth;

    moimData.slots.forEach((slot) => {
      if (!slot.date || !slot.buddy) return;
      
      const slotBuddyId = slot.buddy ? Number(slot.buddy) : null;
      if (slotBuddyId !== selectedBuddyId) return;
      
      const pickValue = slot.pick ? Number(slot.pick) : 0;
      if (pickValue === -1) {
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
      }
    });

    return dateKeys;
  }, [moimData?.slots, selectedBuddyId, currentCalendarYear, currentCalendarMonth]);

  // 추천 일정 리스트 조회 함수 (재사용 가능하도록 분리)
  const fetchTopTimeslots = useCallback(async () => {
    if (!moimId) return;

    try {
      // 추천 일정과 pick: -1인 슬롯 목록을 동시에 가져오기
      const [topTimeslotsResponse, unavailableSlotsResponse] = await Promise.all([
        fetch(
          `/api/top-timeslots?moimId=${moimId}&year=${currentCalendarYear}&month=${currentCalendarMonth + 1}`
        ),
        fetch(
          `/api/unavailable-slots?moimId=${moimId}&year=${currentCalendarYear}&month=${currentCalendarMonth + 1}`
        ),
      ]);
      
      if (!topTimeslotsResponse.ok) {
        console.error("Failed to fetch top timeslots");
        setSlotList([]);
        return;
      }

      const data = await topTimeslotsResponse.json();
      const slots = data.slots || [];
      
      // pick: -1인 날짜 목록 가져오기
      let unavailableDateKeys = new Set<string>();
      if (unavailableSlotsResponse.ok) {
        const unavailableData = await unavailableSlotsResponse.json();
        unavailableDateKeys = new Set(unavailableData.dates || []);
      }
      
      const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
      
      const totalMembers = buddyList.length;
      
      const formattedSlots = slots
        .map((slot: any) => {
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
          
          const pickValue = slot.pick !== undefined && slot.pick !== null ? Number(slot.pick) : undefined;
          
          // pick이 -1인 경우는 제외 (엄격한 체크)
          if (pickValue === -1) {
            return null;
          }
          
          // unavailableDateKeys에 포함된 날짜도 제외
          if (dateObj) {
            const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
            if (unavailableDateKeys.has(dateKey)) {
              return null;
            }
          }
          
          // vote_count가 계산될 때 pick: -1이 포함되었을 수 있으므로, pick 값도 확인
          const votes = slot.vote_count || (pickValue && pickValue > 0 ? pickValue : 0) || slot.votes || 0;
          
          return {
            date: dateStr,
            dateObj,
            votes: votes,
            pick: pickValue,
          };
        })
        // null 값 제거 (pick: -1인 슬롯 및 unavailableDateKeys에 포함된 날짜)
        .filter((slot: any) => slot !== null && slot.pick !== -1)
        // 1명 이상 투표한 날짜만 필터링
        .filter((slot: { votes: number }) => {
          return slot.votes >= 1;
        })
        // 캘박된 슬롯을 우선순위로 정렬
        .sort((a: { dateObj?: Date }, b: { dateObj?: Date }) => {
          if (!a.dateObj || !b.dateObj) return 0;
          
          const getDateKey = (date: Date) => {
            return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          };
          
          const aIsFixed = fixedSlots.has(getDateKey(a.dateObj));
          const bIsFixed = fixedSlots.has(getDateKey(b.dateObj));
          
          // 캘박된 항목을 먼저
          if (aIsFixed && !bIsFixed) return -1;
          if (!aIsFixed && bIsFixed) return 1;
          
          return 0;
        })
        // 최대 10개까지만 표시
        .slice(0, 10);
      
      setSlotList(formattedSlots);
    } catch (error) {
      console.error("Error fetching top timeslots:", error);
      setSlotList([]);
    }
    // buddyList와 fixedSlots는 함수 내부에서 최신 값을 참조하므로 dependency에서 제거
    // 시간 데이터 변경 시에만 명시적으로 호출하도록 변경
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moimId, currentCalendarYear, currentCalendarMonth]);

  // 월 변경 핸들러 (useCallback으로 메모이제이션)
  const handleMonthChange = useCallback((year: number, month: number) => {
    // 실제로 월이 변경되었을 때만 처리
    if (year !== currentCalendarYear || month !== currentCalendarMonth) {
      // 먼저 slotList 초기화
      setSlotList([]);
      // 그 다음 월 변경 (useEffect에서 자동으로 fetchTopTimeslots 호출됨)
      setCurrentCalendarYear(year);
      setCurrentCalendarMonth(month);
    }
  }, [currentCalendarYear, currentCalendarMonth]);

  // 페이지 진입 시점에 top 리스트 조회 (moimData가 로드된 후)
  useEffect(() => {
    // moimData가 로드되고 캘린더가 렌더링된 후 (월 정보가 설정된 후) 페이지 진입 시점에 top slot 목록 조회
    if (moimId && moimData && !hasInitialLoadRef.current && currentCalendarYear && currentCalendarMonth !== undefined) {
      hasInitialLoadRef.current = true;
      fetchTopTimeslots();
    }
    // moimData의 id를 dependency로 사용하여 객체 참조 변경 문제 방지
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moimData?.id, currentCalendarYear, currentCalendarMonth]);

  // 월 변경 시 top 리스트 조회 (시간 데이터 변경 감지)
  useEffect(() => {
    // 초기 로드가 완료된 후 월이 변경될 때만 top slot 목록 조회
    if (moimId && hasInitialLoadRef.current && currentCalendarYear && currentCalendarMonth !== undefined) {
      fetchTopTimeslots();
    }
    // moimId는 함수 내부에서 체크하므로 dependency에서 제거 (배열 크기 일관성 유지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCalendarYear, currentCalendarMonth]);

  // 선택된 참여자가 변경될 때는 top slot 리스트를 갱신하지 않음

  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  // moimData에서 fix된 슬롯들을 fixedSlots에 반영
  useEffect(() => {
    if (moimData?.slots) {
      const fixedDateKeys = new Set<string>();
      moimData.slots.forEach((slot) => {
        if (slot.fix && slot.date) {
          // date를 Date 객체로 변환하여 dateKey 생성
          try {
            const date = new Date(slot.date);
            if (!isNaN(date.getTime())) {
              const dateKey = getDateKey(date);
              fixedDateKeys.add(dateKey);
            }
          } catch (e) {
            console.warn("Failed to parse date for fixed slot:", slot.date);
          }
        }
      });
      setFixedSlots(fixedDateKeys);
    }
  }, [moimData?.slots]);

  const handleDateClickFromSidebar = async (date: Date) => {
    const dateKey = getDateKey(date);
    setSelectedDateKey(dateKey);
    
    // 이미 fix된 슬롯인지 확인
    if (fixedSlots.has(dateKey)) {
      // fix 취소 (fix: false로 업데이트)
      if (moimId) {
        try {
          // 날짜를 YYYY-MM-DD 형식으로 변환
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;

          // API 호출하여 fix: false로 업데이트
          const response = await fetch("/api/slot", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              moimId: moimId,
              date: dateStr,
              fix: false,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to update slot");
          }

          // fixedSlots에서 제거
          setFixedSlots(prev => {
            const newSet = new Set(prev);
            newSet.delete(dateKey);
            return newSet;
          });
          
          // 모임 데이터 새로고침 (fix 상태 반영)
          await refreshMoimData();
          // 시간 데이터 변경 후 top slot 목록 재조회
          await fetchTopTimeslots();
          
          showToastMessage("취소했습니다.");
        } catch (error) {
          console.error("Error canceling fix:", error);
          alert(error instanceof Error ? error.message : "취소에 실패했습니다. 다시 시도해주세요.");
        }
      }
      return;
    }
    
    // 바로 fix 처리 (팝업 없이)
    if (moimId) {
      try {
        // 날짜를 YYYY-MM-DD 형식으로 변환
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        // API 호출하여 fix: true로 업데이트
        const response = await fetch("/api/slot", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moimId: moimId,
            date: dateStr,
            fix: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update slot");
        }

        setFixedSlots(prev => new Set(prev).add(dateKey));
        
        // 모임 데이터 새로고침 (fix 상태 반영)
        await refreshMoimData();
        // 시간 데이터 변경 후 top slot 목록 재조회
        await fetchTopTimeslots();
        
        // Confetti 효과
        triggerConfetti();
        
        // Toast 메시지 표시
        showToastMessage("만날 날짜가 확정되었습니다! 🎉");
      } catch (error) {
        console.error("Error fixing slot:", error);
        alert(error instanceof Error ? error.message : "슬롯 업데이트에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // Confetti 효과 함수 (폭죽 효과)
  const triggerConfetti = () => {
    const colors = [
      '#FFD700', // 노란색
      '#FF69B4', // 핑크색
      '#FF8C00', // 주황색
      '#4169E1', // 파란색
      '#90EE90', // 연두색
      '#9370DB'  // 보라색
    ];
    const confettiCount = 80;
    const duration = 2000;
    const confettiElements: HTMLElement[] = [];

    // 화면 중앙 좌표
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      const isWaterDrop = Math.random() < 0.3; // 30% 확률로 물방울
      const color = isWaterDrop ? '#FFFFFF' : colors[Math.floor(Math.random() * colors.length)];
      const size = isWaterDrop ? Math.random() * 8 + 4 : Math.random() * 10 + 5;
      
      // 랜덤 각도와 거리 (0~360도, 거리는 랜덤)
      const angle = (Math.PI * 2 * i) / confettiCount + Math.random() * 0.5;
      const distance = 200 + Math.random() * 300;
      const endX = centerX + Math.cos(angle) * distance;
      const endY = centerY + Math.sin(angle) * distance;
      
      const rotation = Math.random() * 720; // 더 많이 회전
      const durationMs = duration + Math.random() * 500;

      confetti.style.position = 'fixed';
      confetti.style.left = `${centerX}px`;
      confetti.style.top = `${centerY}px`;
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.backgroundColor = color;
      confetti.style.borderRadius = isWaterDrop ? '50% 0 50% 50%' : '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.opacity = '0.9';
      confetti.style.transformOrigin = 'center center';

      document.body.appendChild(confetti);
      confettiElements.push(confetti);

      // 폭죽 효과 애니메이션 (중앙에서 사방으로 퍼짐)
      confetti.animate([
        { 
          transform: `translate(0, 0) rotate(0deg) scale(1)`, 
          opacity: 1 
        },
        { 
          transform: `translate(${endX - centerX}px, ${endY - centerY}px) rotate(${rotation}deg) scale(0.3)`, 
          opacity: 0 
        }
      ], {
        duration: durationMs,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => {
        confetti.remove();
      };
    }

    // 일정 시간 후 남은 confetti 제거
    setTimeout(() => {
      confettiElements.forEach(el => {
        if (el.parentNode) {
          el.remove();
        }
      });
    }, duration + 1000);
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
      // 시간 데이터 변경이 아닐 수 있으므로 fetchTopTimeslots는 호출하지 않음
      // 슬롯 변경 시에만 명시적으로 fetchTopTimeslots() 호출
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
      // 2초 후에 복사 상태를 원래대로 되돌림
      setTimeout(() => {
        setIsUrlCopied(false);
      }, 2000);
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
    } else {
      // 새로운 참여자 선택 (기존 선택 해제)
      setSelectedParticipantIndices(new Set([index]));
    }
  };

  // 선택된 참여자가 투표한 모든 날짜 (일반 투표 + 안 되는 날) - useMemo로 안정화
  const allVotedDateKeys = useMemo(() => {
    const allKeys = new Set(selectedBuddyVotedDateKeys);
    selectedUserUnavailableDateKeys.forEach(key => allKeys.add(key));
    return allKeys;
  }, [selectedBuddyVotedDateKeys, selectedUserUnavailableDateKeys]);

  // 선택된 참여자가 변경될 때 focusedDateKeys 업데이트 (투표한 날짜 + 안 되는 날로 투표한 날짜)
  useEffect(() => {
    setFocusedDateKeys(allVotedDateKeys);
  }, [allVotedDateKeys]);

  // unavailableDateKeys 계산 및 업데이트
  useEffect(() => {
    if (!moimData?.slots) {
      setUnavailableDateKeys(new Set());
      return;
    }

    const unavailableKeys = new Set<string>();
    const year = currentCalendarYear;
    const month = currentCalendarMonth;

    moimData.slots.forEach((slot) => {
      if (!slot.date) return;
      
      const pickValue = slot.pick ? Number(slot.pick) : 0;
      if (pickValue === -1) {
        try {
          const slotDate = new Date(slot.date);
          if (
            slotDate.getFullYear() === year &&
            slotDate.getMonth() === month
          ) {
            const dateKey = `${slotDate.getFullYear()}-${slotDate.getMonth()}-${slotDate.getDate()}`;
            unavailableKeys.add(dateKey);
          }
        } catch (e) {
          console.warn("Failed to parse slot date:", slot.date);
        }
      }
    });

    setUnavailableDateKeys(unavailableKeys);
  }, [moimData?.slots, currentCalendarYear, currentCalendarMonth]);

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

  // 특정 날짜에 해당 사용자의 slot 정보 가져오기 (pick 값 포함)
  const getSlotInfo = async (dateStr: string, buddyId: string): Promise<{ exists: boolean; pick?: number }> => {
    if (!moimId || !buddyId) {
      return { exists: false };
    }

    try {
      const response = await fetch(`/api/slot?moimId=${moimId}&buddyId=${buddyId}&date=${dateStr}`);
      if (!response.ok) {
        return { exists: false };
      }

      const data = await response.json();
      const slots = data.slots || [];
      if (slots.length > 0) {
        const slot = slots[0];
        const pickValue = slot.pick !== undefined && slot.pick !== null ? Number(slot.pick) : undefined;
        return { exists: true, pick: pickValue };
      }
      return { exists: false };
    } catch (error) {
      console.error("Error getting slot info:", error);
      return { exists: false };
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

      // "안 되는 날" 모드일 때는 pick: -1로 생성/업데이트 또는 취소 (토글)
      if (voteFilterMode === 'unavailable') {
        // 기존 slot 정보 확인 (pick 값 포함)
        const slotInfo = await getSlotInfo(dateStr, String(selectedBuddyId));
        
        if (slotInfo.exists && slotInfo.pick === -1) {
          // 이미 pick: -1인 경우, 취소 (삭제)
          const deleteResponse = await fetch(`/api/slot?moimId=${moimId}&buddyId=${selectedBuddyId}&date=${dateStr}`, {
            method: "DELETE",
          });

          if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to delete slot");
          }
        } else if (slotInfo.exists) {
          // 기존 slot이 있으면 pick을 -1로 업데이트
          const updateResponse = await fetch("/api/slot", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              moimId: moimId,
              buddyId: selectedBuddyId,
              date: dateStr,
              pick: -1,
            }),
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to update slot");
          }
        } else {
          // slot이 없으면 pick: -1로 생성
          const createResponse = await fetch("/api/slot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              moimId: moimId,
              buddyId: selectedBuddyId,
              date: dateStr,
              pick: -1,
            }),
          });

          if (!createResponse.ok) {
            const errorData = await createResponse.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to create slot");
          }
        }
      } else {
        // 일반 모드: 기존 토글 로직
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
              pick: 1,
              // begin과 end는 선택사항 (현재는 null로 설정)
            }),
          });

          if (!createResponse.ok) {
            const errorData = await createResponse.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to create slot");
          }
        }
      }

      // 모임 데이터 새로고침 (slot list 다시 가져오기)
      await refreshMoimData();
      // 시간 데이터 변경 후 top slot 목록 재조회
      await fetchTopTimeslots();
    } catch (error) {
      console.error("Error toggling slot:", error);
      alert(error instanceof Error ? error.message : "시간 슬롯 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] z-[60]">
        <div className="text-center flex flex-col items-center gap-4">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  if (!moimData && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] z-[60]">
        <div className="text-center flex flex-col items-center gap-4">
          <Loader size="lg" />
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
      {isLeftSidebarOpen && !isInputFocused && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => {
            setIsLeftSidebarOpen(false);
          }}
        />
      )}

      {/* 좌측 사이드바 - 참여자 */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${
        isLeftSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-full flex-col p-3 md:p-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-[#333333] [font-family:var(--font-headline)]">
                참여자 ({buddyList.length}명)
              </h2>
            </div>
            <button
              onClick={() => setIsLeftSidebarOpen(false)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="사이드바 닫기"
              title="사이드바 닫기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          {/* 참여자 추가 입력 필드 - 상위로 이동 */}
          <div className="mb-3 pb-3">
            <div className="relative">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onFocus={() => {
                  isInputFocusedRef.current = true;
                  setIsInputFocused(true);
                }}
                onBlur={() => {
                  // 약간의 지연을 두어 버튼 클릭이 가능하도록
                  setTimeout(() => {
                    isInputFocusedRef.current = false;
                    setIsInputFocused(false);
                  }, 200);
                }}
                placeholder="참여자 이름"
                className="w-full px-3 pr-20 py-1 text-xs border border-gray-200/50 rounded-sm focus:outline-none focus:ring-0 focus:border-gray-200/50 bg-white text-gray-900 placeholder:text-gray-400 [font-family:var(--font-body)]"
                disabled={isAddingMember}
              />
              <button
                onClick={handleAddMember}
                disabled={!newMemberName.trim() || isAddingMember}
                className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition",
                  "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md"
                )}
              >
                추가
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="flex flex-col rounded-lg bg-white overflow-hidden">
              {/* 참여자 목록 */}
              {buddyList.map((buddy, index) => {
                const buddyName = buddy.name || buddy.member_name || `참여자 ${index + 1}`;
                
                return (
                  <li 
                    key={buddy.id || index}
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
        </div>
      </aside>

      {/* 우측 사이드바 - 추천 일정 (데스크톱만) */}
      <aside className={`hidden md:block fixed right-0 top-0 z-40 h-screen w-64 bg-white border-l border-gray-200 transition-transform duration-300 ease-in-out ${
        isRightSidebarOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex h-full flex-col p-3 md:p-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-[#333333] [font-family:var(--font-headline)]">추천 일정</h2>
            </div>
            <button
              onClick={() => setIsRightSidebarOpen(false)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="사이드바 닫기"
              title="사이드바 닫기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  fixedSlots={fixedSlots}
                  totalMembers={buddyList.length}
                />
              ) : (
                <div className="text-xs text-[#333333] text-center py-4 [font-family:var(--font-body)]">
                  투표된 시간이 없습니다
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <div className={`bg-[#FAF9F6] transition-all duration-300 md:min-w-0 ${
        isLeftSidebarOpen ? "md:ml-64" : "md:ml-0"
      } ${isRightSidebarOpen ? "md:mr-64" : "md:mr-0"}`}>
        <div className="relative min-h-screen md:h-screen px-0 py-4 md:px-4 md:py-8 lg:px-6 lg:py-10 flex flex-col md:overflow-hidden">
          {/* 모바일 사이드바 토글 버튼 */}
          <div className="flex items-center gap-2 mb-2 md:hidden px-2">
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
          <div className="mb-3 md:mb-6 px-2 md:px-0">
            {/* 첫 번째 행: 아이콘 및 버튼들 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyUrl}
                  className="p-1 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title={isUrlCopied ? "복사됨!" : "URL 복사"}
                  aria-label="URL 복사"
                >
                  {isUrlCopied ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                <select
                  value={voteFilterMode}
                  onChange={(e) => setVoteFilterMode(e.target.value as 'available' | 'unavailable')}
                  disabled={!selectedBuddyId}
                  className={`px-2 py-1 pr-6 text-xs bg-white text-[#333333] [font-family:var(--font-body)] focus:outline-none border border-gray-200/50 rounded-sm ${
                    !selectedBuddyId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="available">되는 날 🟢</option>
                  <option value="unavailable">안 되는 날 ❌</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
              {/* 데스크톱 사이드바 토글 버튼 */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                  className="p-1 text-gray-700 hover:bg-gray-100 rounded-md"
                  aria-label="참여자 사이드바 토글"
                  title={isLeftSidebarOpen ? "참여자 사이드바 닫기" : "참여자 사이드바 열기"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                  className="p-1 text-gray-700 hover:bg-gray-100 rounded-md"
                  aria-label="추천 일정 사이드바 토글"
                  title={isRightSidebarOpen ? "추천 일정 사이드바 닫기" : "추천 일정 사이드바 열기"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#333333] [font-family:var(--font-body)]">
                  내 투표만 보기
                </span>
                <button
                  onClick={() => {
                    if (selectedBuddyId) {
                      setShowOnlyMyVotes(!showOnlyMyVotes);
                      if (!showOnlyMyVotes) {
                        // 토글을 켤 때 필터 모드를 'available'로 초기화
                        setVoteFilterMode('available');
                      }
                    }
                  }}
                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none backdrop-blur-sm ${
                    showOnlyMyVotes ? "bg-[#333333]" : "bg-gray-300"
                  } ${!selectedBuddyId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={!selectedBuddyId}
                  title={!selectedBuddyId ? "참여자를 선택해주세요" : ""}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      showOnlyMyVotes ? "translate-x-[14px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              </div>
            </div>
            {/* 두 번째 행: 모임 타이틀 (전체 너비) */}
            <h1 className="text-2xl md:text-3xl font-bold text-[#333333] [font-family:var(--font-headline)] w-full">
              {moimData?.moim_name || "모임"}
            </h1>
          </div>

          <div className="w-full flex flex-col gap-4 md:gap-6 md:flex-1 md:min-h-0 md:overflow-hidden">
            {/* 메인 캘린더 - 히트맵 형태 */}
            <section className="w-full md:flex-1 md:min-h-0 relative z-0">
              <CalendarHeatmap 
                availabilityData={calendarAvailabilityData}
                maxVotes={Math.max(...calendarAvailabilityData, 1)}
                selectedDateKey={selectedDateKey}
                focusedDateKeys={focusedDateKeys}
                highlightedDateKeys={showOnlyMyVotes ? (filteredDateKeys || undefined) : undefined}
                fixedDateKeys={fixedSlots}
                totalMembers={buddyList.length}
                unavailableDateKeys={unavailableDateKeys}
                dateVotersMap={dateVotersMap}
                dateUnavailableVotersMap={dateUnavailableVotersMap}
                selectedUserUnavailableDateKeys={selectedUserUnavailableDateKeys}
                onDateSelect={handleCalendarDateClick}
                onMonthChange={handleMonthChange}
              />
            </section>

            {/* 모바일 추천 일정 목록 - 캘린더 아래 */}
            <section className="md:hidden w-full mt-4 mb-4 relative z-0">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <h2 className="text-xs font-semibold text-[#333333] [font-family:var(--font-headline)]">추천 일정</h2>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {slotList.length > 0 ? (
                    <TopTime 
                      slots={slotList} 
                      onDateClick={handleDateClickFromSidebar}
                      selectedDateKey={selectedDateKey}
                      fixedSlots={fixedSlots}
                      totalMembers={buddyList.length}
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

