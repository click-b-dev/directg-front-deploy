// legacy Admin::getProductStatus($status) — 판매상태 색상 뱃지.
// 0 판매중 / 1 판매중지 / 3 판매종료 / 9 승인대기. 그 외(2 품절 등)는 빈값(legacy 동일).
const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  "0": { label: "판매중", cls: "badge-primary-lighten" },
  "1": { label: "판매중지", cls: "badge-warning-lighten" },
  "3": { label: "판매종료", cls: "badge-danger-lighten" },
  "9": { label: "승인대기", cls: "badge-secondary-lighten" },
};

export const ProductStatusBadge = ({ status }: { status: string }) => {
  const badge = STATUS_BADGE[status];
  if (!badge) {
    return null;
  }
  return <span className={`badge ${badge.cls} font-12`}>{badge.label}</span>;
};
