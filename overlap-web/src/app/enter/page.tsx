"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

export default function EnterPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F5DC] px-6">
      <div
        className={cn(
          "relative flex w-full max-w-3xl flex-col items-center gap-6 p-10 text-center",
          "transition-all duration-700 ease-out",
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        )}
      >
        <Logo size={200} showText={true} colorScheme="green2" />
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="/new"
            className="rounded-full bg-[#2E6456] px-6 py-2.5 text-sm font-semibold text-[#F8F6F0] shadow-md transition hover:brightness-[1.05] hover:shadow-lg [font-family:var(--font-button)]"
          >
            새 모임 만들기
          </a>
          <a
            href="/moim/demo"
            className="rounded-full border border-[#8CAA92] bg-white px-6 py-2.5 text-sm font-semibold text-[#2F3A38] shadow-sm transition hover:border-[#76977e] hover:shadow-md [font-family:var(--font-button)]"
          >
            예시 보기
          </a>
          <a
            href="/timetable"
            className="rounded-full border border-[#E9D5B8] bg-white px-6 py-2.5 text-sm font-semibold text-[#2F3A38] shadow-sm transition hover:border-[#d5c09f] hover:shadow-md [font-family:var(--font-button)]"
          >
            타임테이블 테스트
          </a>
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

