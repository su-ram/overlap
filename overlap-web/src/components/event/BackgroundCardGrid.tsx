"use client";

import { useEffect, useState } from "react";

interface BackgroundCardGridProps {
  activeCount?: number;
}

export function BackgroundCardGrid({ activeCount = 0 }: BackgroundCardGridProps) {
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set());

  // 격자 형태로 많은 카드 배치 (예: 5x4 = 20개)
  const rows = 4;
  const cols = 5;
  const maxCards = rows * cols;

  useEffect(() => {
    const limitedCount = Math.min(activeCount, 10); // 최대 10명까지만 활성화
    
    if (limitedCount === 0) {
      setActiveIndices(new Set());
      return;
    }

    // 랜덤으로 활성화할 인덱스 선택
    const indices = Array.from({ length: maxCards }, (_, i) => i);
    const shuffled = [...indices].sort(() => Math.random() - 0.5);
    const selected = new Set(shuffled.slice(0, limitedCount));
    
    setActiveIndices(selected);
  }, [activeCount, maxCards]);

  // 20개의 유니크한 색상 조합 (테두리와 그림자용)
  const borderColors = [
    "border-blue-400 shadow-blue-200",
    "border-green-400 shadow-green-200",
    "border-purple-400 shadow-purple-200",
    "border-pink-400 shadow-pink-200",
    "border-yellow-400 shadow-yellow-200",
    "border-indigo-400 shadow-indigo-200",
    "border-red-400 shadow-red-200",
    "border-teal-400 shadow-teal-200",
    "border-orange-400 shadow-orange-200",
    "border-cyan-400 shadow-cyan-200",
    "border-emerald-400 shadow-emerald-200",
    "border-violet-400 shadow-violet-200",
    "border-rose-400 shadow-rose-200",
    "border-amber-400 shadow-amber-200",
    "border-lime-400 shadow-lime-200",
    "border-sky-400 shadow-sky-200",
    "border-fuchsia-400 shadow-fuchsia-200",
    "border-stone-400 shadow-stone-200",
    "border-slate-400 shadow-slate-200",
    "border-neutral-400 shadow-neutral-200",
  ];

  return (
    <div className="pointer-events-none absolute inset-0 grid grid-cols-5 gap-3 p-8">
      {Array.from({ length: maxCards }).map((_, index) => {
        const isActive = activeIndices.has(index);
        const colorClass = borderColors[index % borderColors.length];

        return (
          <div
            key={index}
            className="aspect-square transition-all duration-700 ease-out"
          >
            <div
              className={`h-full w-full rounded-xl border-2 bg-white ${
                isActive
                  ? `${colorClass} shadow-lg opacity-30`
                  : "border-slate-200 shadow-sm opacity-15"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

