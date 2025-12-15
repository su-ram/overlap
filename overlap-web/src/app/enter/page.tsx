"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { buttonPrimary } from "@/colors";
import { EventForm } from "@/components/event/EventForm";
import { Loader } from "@/components/ui/Loader";

export default function EnterPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);


  const handleSubmit = async (payload: {
    title: string;
    maxParticipants: number;
    location: string;
  }) => {
    setIsCreating(true);
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
      setIsCreating(false);
      alert(error instanceof Error ? error.message : "모임 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAF9F6] px-6 py-10">
      {isCreating && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
            <Loader size="lg" />
            <p className="text-gray-700 [font-family:var(--font-body)]">모임을 생성하는 중...</p>
          </div>
        </div>
      )}
      <div
        className={cn(
          "relative flex w-full max-w-3xl flex-col items-center justify-center gap-8 p-10",
          "transition-all duration-700 ease-out",
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          isCreating && "opacity-50 pointer-events-none",
        )}
      >
        <div className="w-full max-w-md flex-shrink-0">
          <Image
            src="/logo.svg"
            alt="Overlap Logo"
            width={646}
            height={247}
            className="w-full h-auto"
            priority
          />
        </div>
        <div className="w-full max-w-md flex-shrink-0">
          <EventForm 
            onSubmit={handleSubmit}
          />
        </div>
      </div>
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.35;
          }
          50% {
            transform: translateY(-12px) translateX(6px);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.35;
          }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}

