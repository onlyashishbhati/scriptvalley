interface StatsSummaryRowProps {
  stats: {
    currentStreak: number;
    longestStreak: number;
    totalPotdSolved: number;
    sheetsFollowed: number;
    coursesInProgress: number;
  };
}

export default function StatsSummaryRow({ stats }: StatsSummaryRowProps) {
  const items = [
    { label: 'Current streak', value: stats.currentStreak, suffix: 'd' },
    { label: 'Longest streak', value: stats.longestStreak, suffix: 'd' },
    { label: 'Solved', value: stats.totalPotdSolved },
    { label: 'Sheets', value: stats.sheetsFollowed },
    { label: 'Courses', value: stats.coursesInProgress },
  ];

  return (
    <div className="w-full grid grid-cols-3 sm:grid-cols-5 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center rounded-xl border border-(--border-subtle) bg-(--bg-elevated) py-3 px-2"
        >
          <span className="text-(--text-primary) font-bold text-lg leading-none">
            {item.value}
            {item.suffix && <span className="text-xs font-normal">{item.suffix}</span>}
          </span>
          <span className="text-(--text-faint) text-[10px] mt-1.5 text-center leading-tight">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}