// Figma `stat-item`: page 배경 · radius 8 · px20 py16 · 라벨 body3 / 값 title3 Bold
type StatItemProps = { label: string; value: string };

export const StatItem = ({ label, value }: StatItemProps) => (
  <div className="rn:flex rn:min-w-0 rn:flex-1 rn:flex-col rn:gap-4 rn:rounded-8 rn:bg-page rn:px-20 rn:py-16 rn:whitespace-nowrap">
    <p className="rn:text-body3 rn:font-regular rn:text-ink-2">{label}</p>
    <p className="rn:text-title3 rn:font-bold rn:text-ink">{value}</p>
  </div>
);
