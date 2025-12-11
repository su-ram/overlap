interface ParticipantCardProps {
  name?: string;
  index: number;
  isEmpty?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  votedDates?: Date[]; // 투표한 날짜 목록
}

export function ParticipantCard({ name, index, isEmpty = false, onClick, isSelected = false, votedDates = [] }: ParticipantCardProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : `P${index + 1}`;

  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
    "bg-yellow-100 text-yellow-700",
    "bg-indigo-100 text-indigo-700",
    "bg-red-100 text-red-700",
    "bg-teal-100 text-teal-700",
  ];

  const colorClass = colors[index % colors.length];

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${month}/${day} (${weekdays[dayOfWeek]})`;
  };

  return (
    <div className="w-full">
      <div 
        onClick={isEmpty ? undefined : onClick}
        className={`flex items-center gap-2 p-1.5 transition-all duration-300 ${
          isEmpty 
            ? "opacity-40 cursor-not-allowed" 
            : isSelected 
              ? "bg-stone-50 cursor-pointer" 
              : "hover:bg-slate-50 cursor-pointer"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            isEmpty ? "bg-slate-200 text-slate-400" : colorClass
          }`}
        >
          {initials}
        </div>
        {name && (
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-semibold [font-family:var(--font-body)] ${
              isEmpty ? "text-slate-400" : "text-slate-800"
            }`}>
              {name}
            </div>
          </div>
        )}
      </div>
      
      {/* 드롭다운: 선택되었을 때 투표한 날짜 목록 표시 */}
      {isSelected && !isEmpty && votedDates.length > 0 && (
        <div className="mt-1 ml-12 border-l-2 border-slate-200 pl-2 py-1.5">
          <div className="text-xs font-semibold text-slate-600 mb-2 [font-family:var(--font-body)]">
            투표한 날짜 ({votedDates.length}일)
          </div>
          <div className="flex flex-col gap-1.5">
            {votedDates.map((date, idx) => (
              <div
                key={idx}
                className="text-xs text-slate-700 [font-family:var(--font-body)] text-left"
              >
                {formatDate(date)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
