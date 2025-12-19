import { ParticipantCard } from "./ParticipantCard";

interface ParticipantGridProps {
  maxParticipants: number;
  participants?: string[];
  onParticipantClick?: (index: number, name?: string) => void;
  selectedParticipantIndex?: number;
  participantVotes?: Record<number, Date[]>; // 참여자별 투표한 날짜 목록
}

export function ParticipantGrid({ maxParticipants, participants = [], onParticipantClick, selectedParticipantIndex, participantVotes = {} }: ParticipantGridProps) {
  return (
    <div className="w-full space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 [font-family:var(--font-headline)]">참여자 ({participants.length}/{maxParticipants})</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10">
        {Array.from({ length: maxParticipants }).map((_, index) => {
          const participant = participants[index];
          const votedDates = participantVotes[index] || [];
          return (
            <ParticipantCard
              key={index}
              index={index}
              name={participant}
              isEmpty={!participant}
              onClick={() => !participant ? undefined : onParticipantClick?.(index, participant)}
              isSelected={selectedParticipantIndex === index}
              votedDates={votedDates}
            />
          );
        })}
      </div>
    </div>
  );
}



