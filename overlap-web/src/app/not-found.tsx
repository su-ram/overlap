"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotFound } from "@/contexts/NotFoundContext";
import { buttonPrimary } from "@/colors";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const router = useRouter();
  const { setIsNotFound } = useNotFound();

  useEffect(() => {
    setIsNotFound(true);
    return () => setIsNotFound(false);
  }, [setIsNotFound]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="flex items-center gap-2 pt-6 pl-6">
        <p className="text-sm text-[#333333] [font-family:var(--font-body)]">
          길을 잃었습니다.
        </p>
        <button
          onClick={() => router.push("/enter")}
          className={cn(buttonPrimary, "text-xs [font-family:var(--font-body)]")}
        >
          홈으로 이동
        </button>
      </div>
    </div>
  );
}
