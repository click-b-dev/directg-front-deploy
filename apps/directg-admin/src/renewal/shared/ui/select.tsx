import type { ComponentProps } from "react";
import { NativeSelect } from "@click-b/ui";
import arrowDown from "@/renewal/assets/icon-arrow-down.svg";
import arrowDownSm from "@/renewal/assets/icon-arrow-down-sm.svg";
import { cx } from "../lib/cx";

// Figma `Select/Item` (node 30019:3729): h38 · pl12 pr8 · 텍스트 16 · 화살표 20.
// compact = 목록 하단 페이지 크기 선택(텍스트 14, 화살표 18, py5).
export type SelectProps = ComponentProps<typeof NativeSelect.Field> & {
  /** Root(wrapper)에 적용할 className — 너비 지정 등 */
  rootClassName?: string;
  compact?: boolean;
};

export const Select = ({
  rootClassName,
  className,
  compact = false,
  children,
  value,
  ...props
}: SelectProps) => {
  const isPlaceholder = value === "" || value === undefined;
  return (
    <NativeSelect.Root className={cx("rn:relative rn:inline-block", rootClassName)}>
      <NativeSelect.Field
        value={value}
        className={cx(
          "rn:w-full rn:appearance-none rn:rounded-8 rn:border rn:border-solid rn:border-line rn:bg-surface rn:pl-12 rn:outline-none",
          compact ? "rn:h-34 rn:pr-30 rn:text-body3" : "rn:h-38 rn:pr-36 rn:text-body2",
          isPlaceholder ? "rn:text-ink-3" : "rn:text-ink",
          "rn:focus:border-line-2 rn:data-[invalid]:border-error rn:disabled:bg-page rn:disabled:text-line",
          className,
        )}
        {...props}
      >
        {children}
      </NativeSelect.Field>
      <NativeSelect.Icon
        className={cx(
          "rn:pointer-events-none rn:absolute rn:top-1/2 rn:right-8 rn:-translate-y-1/2",
          compact ? "rn:size-18" : "rn:size-20",
        )}
      >
        <img src={compact ? arrowDownSm : arrowDown} alt="" />
      </NativeSelect.Icon>
    </NativeSelect.Root>
  );
};
