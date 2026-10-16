import type { ReactNode } from "react";

// 프로모션 화면 badge 통일 컴포넌트(개발자 승인 하 의도적 UI 개선, parity 예외).
// 일관 형태: rounded-2 · px-2 · py-1 · font-12. 색상=variant, 채움/외곽선=outline.
// 판매상태(ProductStatusBadge)·ranking 오버레이 등 레이아웃성 요소는 대상 아님.
export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "dark";

type BadgeProps = {
  variant: BadgeVariant;
  outline?: boolean;
  className?: string;
  children: ReactNode;
};

export const Badge = ({ variant, outline = false, className, children }: BadgeProps) => {
  const colorClass = outline ? `badge-outline-${variant}` : `bg-${variant}`;
  return (
    <span
      className={`badge ${colorClass} rounded-2 font-12 px-2 py-1${className ? ` ${className}` : ""}`}
    >
      {children}
    </span>
  );
};
