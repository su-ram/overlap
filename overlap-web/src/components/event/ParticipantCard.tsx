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

  const emojis = [
    "😊", "🎉", "🌟", "🚀", "🎨", "🎵", "🎮", "📚",
    "🏃", "🍕", "☕", "🎯", "💡", "🔥", "⭐", "🌈",
    "🎪", "🎭", "🎬", "🎤", "🎸", "🎹", "🎺", "🎻"
  ];

  const emoji = emojis[index % emojis.length];

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
        className={`flex items-center gap-2 px-3 py-2 transition-all duration-300 ${
          isEmpty 
            ? "opacity-40 cursor-not-allowed" 
            : isSelected 
              ? "bg-gray-50 cursor-pointer" 
              : "hover:bg-gray-50 cursor-pointer"
        }`}
      >
        {name && (
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-lg flex-shrink-0">{emoji}</span>
            <div className={`text-sm [font-family:var(--font-body)] ${
              isEmpty 
                ? "text-gray-500 font-normal" 
                : isSelected
                  ? "text-gray-900 font-bold"
                  : "text-gray-900 font-normal"
            }`}>
              {name}
            </div>
          </div>
        )}
      </div>
      
      {/* 드롭다운: 선택되었을 때 투표한 날짜 목록 표시 */}
      {isSelected && !isEmpty && votedDates.length > 0 && (
        <div className="mt-1 ml-3 border-l-2 border-gray-200 pl-3 py-1.5">
          <div className="text-xs font-medium text-gray-600 mb-2 [font-family:var(--font-body)]">
            투표한 날짜 ({votedDates.length}일)
          </div>
          <div className="flex flex-col gap-1.5">
            {votedDates.map((date, idx) => (
              <div
                key={idx}
                className="text-xs text-gray-700 [font-family:var(--font-body)] text-left"
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


