"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { buttonPrimary } from "@/colors";

export default function EnterPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAF9F6] px-6">
      <div
        className={cn(
          "relative flex w-full max-w-3xl flex-col items-center gap-6 p-10 text-center",
          "transition-all duration-700 ease-out",
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        )}
      >
        <Image
          src="/logo.svg"
          alt="Overlap Logo"
          width={646}
          height={247}
          className="w-auto h-auto max-w-full"
          priority
        />
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="/new"
            className={buttonPrimary}
          >
            새 모임 만들기
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

