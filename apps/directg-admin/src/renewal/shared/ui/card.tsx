import type { ComponentProps } from "react";
import { cx } from "../lib/cx";

// Figma `con-wrap`: p24 · radius 16 · 그림자 · 내부 gap 20
export const Card = ({ className, ...props }: ComponentProps<"section">) => (
  <section
    className={cx(
      "rn:flex rn:w-full rn:flex-col rn:gap-20 rn:rounded-16 rn:bg-surface rn:p-24 rn:shadow-card",
      className,
    )}
    {...props}
  />
);

// 카드 제목: 3×15 막대 + body1 SemiBold
export const CardTitle = ({ children }: { children: string }) => (
  <div className="rn:flex rn:items-center rn:gap-8">
    <span aria-hidden="true" className="rn:h-15 rn:w-3 rn:rounded-circle rn:bg-icon-3" />
    <h2 className="rn:text-body1 rn:font-semibold rn:text-ink">{children}</h2>
  </div>
);
