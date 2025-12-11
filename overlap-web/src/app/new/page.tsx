"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EventForm } from "@/components/event/EventForm";
import { BackgroundCardGrid } from "@/components/event/BackgroundCardGrid";

export default function NewEventPage() {
  const router = useRouter();
  const [participantCount, setParticipantCount] = useState(0);
  
  const handleParticipantCountChange = useCallback((count: number) => {
    setParticipantCount(count);
  }, []);

  const handleSubmit = (payload: {
    title: string;
    maxParticipants: number;
    location: string;
  }) => {
    // 고유 key 생성 (UUID v4)
    const eventId = crypto.randomUUID();
    
    // 생성된 key로 모임 페이지로 리다이렉트
    router.push(`/moim/${eventId}`);
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 overflow-hidden bg-[#F5F5DC] px-6 py-10">
      {/* 배경 카드 그리드 */}
      <BackgroundCardGrid activeCount={participantCount} />
      
      <div className="relative z-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 [font-family:var(--font-headline)]">새 모임 만들기</h1>
      </div>
      <div className="relative z-10">
        <EventForm 
          onSubmit={handleSubmit} 
          onParticipantCountChange={handleParticipantCountChange}
        />
      </div>
    </div>
  );
}


