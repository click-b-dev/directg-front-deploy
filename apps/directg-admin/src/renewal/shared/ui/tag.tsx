import type { ComponentProps } from "react";
import { Badge } from "@click-b/ui";
import { cx } from "../lib/cx";

// Figma `Tag` (node 29945:9001): px8 py2 · radius 4 · 텍스트 body3 Medium
type Tone = "success" | "error" | "info" | "neutral" | "warning" | "outline";

export type TagProps = ComponentProps<typeof Badge.Root> & { tone: Tone };

const TONE: Record<Tone, string> = {
  success: "rn:rounded-4 rn:bg-success-bg rn:text-success",
  error: "rn:rounded-4 rn:bg-error-bg rn:text-error",
  info: "rn:rounded-4 rn:bg-info rn:text-brand",
  neutral: "rn:rounded-4 rn:bg-sub rn:text-ink",
  warning: "rn:rounded-4 rn:bg-warning-bg rn:text-warning",
  // 상품 카테고리 등: 테두리형 알약 (radius 40)
  outline: "rn:rounded-40 rn:border rn:border-solid rn:border-line-2 rn:text-ink",
};

export const Tag = ({ tone, className, ...props }: TagProps) => (
  <Badge.Root
    className={cx(
      "rn:inline-flex rn:items-center rn:justify-center rn:px-8 rn:py-2 rn:text-body3 rn:font-medium rn:whitespace-nowrap",
      TONE[tone],
      className,
    )}
    {...props}
  />
);
