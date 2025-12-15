 "use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { buttonSecondary } from "@/colors";
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
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ 
      title, 
      maxParticipants: 0, 
      location
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
    >
      <div className="relative">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 pr-32 py-2 text-sm focus:border-slate-200 focus:outline-none focus:ring-0 [font-family:var(--font-body)]"
          placeholder="모임 이름을 입력하세요"
          required
        />
        <motion.button
          type="submit"
          className={cn(buttonSecondary, "absolute right-0 top-1/2 -translate-y-1/2 flex-shrink-0")}
          whileHover={{ 
            scale: 1.02,
            y: -2
          }}
          whileTap={{ 
            scale: 0.98,
            y: 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 17 
          }}
        >
          모임 만들기
        </motion.button>
      </div>
    </form>
  );
}

