import type { ReactNode } from "react";
import { cx } from "../lib/cx";

type FormFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
  /** 모달용: 라벨 폭 124 · 좌우 패딩 12(라벨) / 16(값) */
  compact?: boolean;
};

// Figma `Form/Label`(node 30210:8714: 140×65, px20 py16, page 배경) + input-wrap(px20 py12, min-h65, gap8)
export const FormField = ({ label, children, className, compact = false }: FormFieldProps) => (
  <div className={cx("rn:flex rn:min-w-0 rn:flex-1 rn:items-stretch", className)}>
    <div
      className={cx(
        "rn:flex rn:shrink-0 rn:items-center rn:bg-page rn:py-16 rn:text-body2 rn:font-medium rn:text-ink-2",
        compact ? "rn:w-124 rn:px-12" : "rn:w-140 rn:px-20",
      )}
    >
      {label}
    </div>
    <div
      className={cx(
        "rn:flex rn:min-h-65 rn:min-w-0 rn:flex-1 rn:items-center rn:gap-8 rn:py-12",
        compact ? "rn:px-16" : "rn:px-20",
      )}
    >
      {children}
    </div>
  </div>
);

// 검색 카드의 form-wrap: 위 테두리 + 행마다 아래 테두리
export const FormTable = ({ children }: { children: ReactNode }) => (
  <div className="rn:flex rn:flex-col rn:border-t rn:border-solid rn:border-line">{children}</div>
);

export const FormRow = ({ children }: { children: ReactNode }) => (
  <div className="rn:flex rn:border-b rn:border-solid rn:border-line">{children}</div>
);
