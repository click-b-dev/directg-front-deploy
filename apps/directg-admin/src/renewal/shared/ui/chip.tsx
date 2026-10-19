import type { ComponentProps } from "react";
import { Button as BaseButton } from "@click-b/ui";
import { cx } from "../lib/cx";

// Figma `Chips` (node 30028:9842): px14 py6 · radius 999 · 텍스트 body3
// selected = 테두리 secondary + 진한 글자(Medium), unselected = page 배경 + 보조 글자(Regular)
export type ChipProps = Omit<ComponentProps<typeof BaseButton>, "pressed"> & { selected?: boolean };

export const Chip = ({ selected = false, className, ...props }: ChipProps) => (
  <BaseButton
    pressed={selected}
    className={cx(
      "rn:inline-flex rn:items-center rn:justify-center rn:rounded-circle rn:px-14 rn:py-6 rn:text-body3 rn:whitespace-nowrap",
      selected
        ? "rn:border rn:border-solid rn:border-line-2 rn:bg-surface rn:font-medium rn:text-ink"
        : "rn:border rn:border-solid rn:border-page rn:bg-page rn:font-regular rn:text-ink-2",
      className,
    )}
    {...props}
  />
);
