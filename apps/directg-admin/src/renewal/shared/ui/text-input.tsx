import type { ComponentProps } from "react";
import { Input } from "@click-b/ui";
import { cx } from "../lib/cx";

// Figma `Input/Placeholder` (node 29974:10956) size: S=38 / M=44 / L=50
// 너비는 호출하는 쪽에서 지정한다(같은 속성 유틸리티가 충돌하므로 기본 너비를 두지 않는다).
// state: default / active(focus) / filled / error / readonly / disabled
type Size = "S" | "M" | "L";

export type TextInputProps = Omit<ComponentProps<typeof Input>, "size"> & { size?: Size };

const SIZE: Record<Size, string> = {
  S: "rn:h-38",
  M: "rn:h-44",
  L: "rn:h-50",
};

export const TextInput = ({ size = "S", className, ...props }: TextInputProps) => (
  <Input
    className={cx(
      "rn:rounded-8 rn:border rn:border-solid rn:border-line rn:bg-surface rn:px-12 rn:py-6 rn:text-body2 rn:text-ink rn:outline-none",
      "rn:placeholder:text-ink-3 rn:focus:border-line-2 rn:data-[invalid]:border-error",
      "rn:read-only:bg-page rn:disabled:bg-page rn:disabled:text-line",
      SIZE[size],
      className,
    )}
    {...props}
  />
);
