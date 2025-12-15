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

  const handleSubmit = async (payload: {
    title: string;
    maxParticipants: number;
    location: string;
  }) => {
    try {
      // Next.js API Route로 모임 생성
      const response = await fetch('/api/moim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moim_name: payload.title || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create moim: ${response.statusText}`);
      }

      const result = await response.json();
      const eventId = result.id; // UUID string
      
      // 생성된 ID로 모임 페이지로 리다이렉트
      router.push(`/moim/${eventId}`);
    } catch (error) {
      console.error('Error creating moim:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      // 에러 발생 시에도 기존 방식으로 폴백
      const eventId = crypto.randomUUID();
      router.push(`/moim/${eventId}`);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 overflow-hidden bg-[#FAF9F6] px-6 py-10">
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




