 "use client";

import { useState, useEffect } from "react";
import { buttonPrimary } from "@/colors";
import { cn } from "@/lib/utils";

type EventFormProps = {
  onSubmit?: (payload: {
    title: string;
    maxParticipants: number;
    location: string;
  }) => void;
  onParticipantCountChange?: (count: number) => void;
};

export function EventForm({ onSubmit, onParticipantCountChange }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const count = parseInt(maxParticipants) || 0;
    onParticipantCountChange?.(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxParticipants]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ 
      title, 
      maxParticipants: parseInt(maxParticipants) || 0, 
      location
    });
  };

  return (
    <div className="relative flex min-h-[600px] items-center justify-center px-4">
      {/* 중앙 입력 폼 */}
      <form
        onSubmit={handleSubmit}
        className="z-10 w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-lg"
      >
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-800 [font-family:var(--font-body)]">모임</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none [font-family:var(--font-body)]"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-800 [font-family:var(--font-body)]">인원수</label>
          <input
            type="number"
            value={maxParticipants}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = parseInt(value);
              if (value === "" || (numValue >= 1 && numValue <= 10)) {
                setMaxParticipants(value);
              }
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none [font-family:var(--font-body)]"
            min="1"
            max="10"
            required
          />
        </div>
        <button
          type="submit"
          className={cn(buttonPrimary, "w-full")}
        >
          모임 만들기
        </button>
      </form>
    </div>
  );
}

