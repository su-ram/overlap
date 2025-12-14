"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { supabaseClient } from "@/lib/supabaseClient";

type Day = { label: string; date: string };

const days: Day[] = [
  { label: "THU", date: "8/5" },
  { label: "FRI", date: "8/6" },
  { label: "SAT", date: "8/7" },
  { label: "SUN", date: "8/8" },
];

const hours = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const densityClass = (level: number) => {
  switch (level) {
    case 4:
      return "bg-yellow-600 text-slate-900";
    case 3:
      return "bg-yellow-500 text-slate-900";
    case 2:
      return "bg-yellow-300 text-slate-900";
    case 1:
      return "bg-yellow-200 text-slate-900";
    default:
      return "bg-amber-50";
  }
};

export default function TimetablePlaygroundPage() {
  const [values, setValues] = useState<number[][]>(
    () => Array.from({ length: hours.length }, () => Array(days.length).fill(0)),
  );
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [paintValue, setPaintValue] = useState<0 | 4>(4);
  const channelRef = useRef<any>(null);
  const skipBroadcastRef = useRef(false);
  const clientId = useMemo(
    () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
    [],
  );

  const totalCells = useMemo(() => days.length * hours.length, []);
  const filledCells = useMemo(
    () => values.flat().filter((v) => v > 0).length,
    [values],
  );

  const applyValue = (rowIdx: number, colIdx: number, next: number) => {
    setValues((prev) =>
      prev.map((row, r) =>
        r === rowIdx ? row.map((cell, c) => (c === colIdx ? next : cell)) : row,
      ),
    );
  };

  const handleDown = (rowIdx: number, colIdx: number) => {
    const current = values[rowIdx]?.[colIdx] ?? 0;
    const nextPaint: 0 | 4 = current > 0 ? 0 : 4; // 이미 칠해진 상태면 해제 모드로 드래그
    setPaintValue(nextPaint);
    setIsMouseDown(true);
    applyValue(rowIdx, colIdx, nextPaint);
  };

  const handleEnter = (rowIdx: number, colIdx: number) => {
    if (!isMouseDown) return;
    applyValue(rowIdx, colIdx, paintValue);
  };

  const handleUp = () => {
    setIsMouseDown(false);
  };

  // Supabase realtime channel for shared editing
  useEffect(() => {
    const channel = supabaseClient.channel("timetable-playground");
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "grid:update" }, ({ payload }) => {
        if (!payload) return;
        if (payload.sender === clientId) return;
        skipBroadcastRef.current = true;
        setValues(payload.values);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // no-op; wait for updates or user interactions
        }
      });

    return () => {
      if (channelRef.current) {
        supabaseClient.removeChannel(channelRef.current);
      }
    };
  }, [clientId]);

  // Broadcast when local grid changes (skip when change came from remote)
  useEffect(() => {
    if (skipBroadcastRef.current) {
      skipBroadcastRef.current = false;
      return;
    }
    const channel = channelRef.current;
    if (!channel) return;
    channel.send({
      type: "broadcast",
      event: "grid:update",
      payload: { sender: clientId, values },
    });
  }, [values, clientId]);

  return (
    <div
      className="min-h-screen bg-[#FAF9F6] px-6 py-10 font-sans text-slate-900 select-none"
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold">Timetable Playground (/timetable)</h1>
            <p className="text-sm text-slate-600">
              클릭하거나 드래그해서 셀을 칠해보세요. 토글 동작: 빈칸 → 파랑, 이미 칠해짐 → 해제.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            채워진 셀: {filledCells} / {totalCells}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-[78px_repeat(4,1fr)] bg-slate-50 text-center text-sm font-semibold text-slate-700">
            <div className="border-b border-slate-200 py-3"></div>
            {days.map((day) => (
              <div
                key={day.label}
                className="border-b border-l border-slate-200 py-3 first:border-l-0"
              >
                <div className="text-[13px] font-semibold">{day.label}</div>
                <div className="text-xs font-medium text-slate-500">{day.date}</div>
              </div>
            ))}
          </div>

          {values.map((row, rowIdx) => (
            <div
              key={hours[rowIdx] ?? rowIdx}
              className="grid grid-cols-[78px_repeat(4,1fr)] border-b border-slate-200 last:border-b-0"
            >
              <div className="flex items-center justify-center border-r border-dashed border-slate-200 bg-white py-3 text-sm text-slate-600">
                {hours[rowIdx]}
              </div>
              {row.map((cell, cellIdx) => (
                <button
                  key={`${rowIdx}-${cellIdx}`}
                  className={cn(
                    "border-l border-dashed border-slate-200 py-3 transition-colors first:border-l-0",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                    "active:brightness-[0.96]",
                    densityClass(cell),
                  )}
                  onMouseDown={() => handleDown(rowIdx, cellIdx)}
                  onMouseEnter={() => handleEnter(rowIdx, cellIdx)}
                  onMouseUp={handleUp}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span>0% 가능</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={cn(
                "h-4 w-6 rounded-sm border border-slate-200",
                densityClass(level),
              )}
            />
          ))}
          <span>100% 가능</span>
        </div>
      </div>
    </div>
  );
}

