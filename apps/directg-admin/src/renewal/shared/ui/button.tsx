import type { ComponentProps, ReactNode } from "react";
import { Button as BaseButton } from "@click-b/ui";
import { cx } from "../lib/cx";

// Figma `Button` (node 29489:3301) — type × style × size × shape.
// S: h38 · py7 px12 · 텍스트 14 / 아이콘 20     M: h50 · py10 px12 · 텍스트 16 / 아이콘 24
type Tone = "primary" | "inverse" | "error";
type Variant = "filled" | "outline";
type Size = "S" | "M";
type Shape = "rectangle" | "round";

export type ButtonProps = ComponentProps<typeof BaseButton> & {
  tone?: Tone;
  variant?: Variant;
  size?: Size;
  shape?: Shape;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** 아이콘만 있는 정사각 버튼(S=38) */
  iconOnly?: boolean;
  /** 글자 굵기. 기본은 primary/error=SemiBold, inverse=Medium(Figma 기본값). 인스턴스가 덮어쓴 경우에만 지정 */
  weight?: "medium" | "semibold";
};

const SIZE: Record<Size, string> = {
  S: "rn:h-38 rn:py-7 rn:text-btn3",
  M: "rn:h-50 rn:py-10 rn:text-btn2",
};

const ICON_ONLY: Record<Size, string> = {
  S: "rn:size-38 rn:p-8",
  M: "rn:size-50 rn:p-12",
};

const WRAP: Record<Size, string> = {
  S: "rn:h-24",
  M: "rn:h-28",
};

const SHAPE: Record<Shape, string> = {
  rectangle: "rn:rounded-8",
  round: "rn:rounded-circle",
};

// primary = SemiBold, inverse = Medium
const TONE: Record<Tone, Record<Variant, string>> = {
  primary: {
    filled: "rn:border-primary rn:bg-primary  rn:text-surface",
    outline: "rn:border-primary rn:bg-surface  rn:text-brand",
  },
  error: {
    filled: "rn:border-error rn:bg-error  rn:text-surface",
    outline: "rn:border-error rn:bg-surface  rn:text-error",
  },
  inverse: {
    filled: "rn:border-inverse rn:bg-inverse  rn:text-surface",
    outline: "rn:border-line rn:bg-surface  rn:text-ink",
  },
};

type StyleOptions = Pick<
  ButtonProps,
  "tone" | "variant" | "size" | "shape" | "iconOnly" | "weight"
>;

// 버튼 모양 클래스 — 다른 헤드리스 트리거(Menu 등)에도 같은 모양을 입히기 위해 분리했다.
export const getButtonClassName = ({
  tone = "primary",
  variant = "filled",
  size = "M",
  shape = "rectangle",
  iconOnly = false,
  weight,
}: StyleOptions) =>
  cx(
    "rn:inline-flex rn:items-center rn:justify-center rn:gap-4 rn:border rn:border-solid rn:whitespace-nowrap",
    iconOnly ? ICON_ONLY[size] : cx(SIZE[size], "rn:px-12"),
    SHAPE[shape],
    TONE[tone][variant],
    (weight ?? (tone === "inverse" ? "medium" : "semibold")) === "medium"
      ? "rn:font-medium"
      : "rn:font-semibold",
    "rn:disabled:border-line rn:disabled:bg-page rn:disabled:text-line",
  );

export const getButtonLabelClassName = (size: Size = "M") =>
  cx("rn:flex rn:items-center rn:px-4", WRAP[size]);

export const Button = ({
  tone,
  variant,
  size = "M",
  shape,
  leftIcon,
  rightIcon,
  iconOnly = false,
  weight,
  className,
  children,
  ...props
}: ButtonProps) => (
  <BaseButton
    className={cx(getButtonClassName({ tone, variant, size, shape, iconOnly, weight }), className)}
    {...props}
  >
    {leftIcon}
    {iconOnly ? children : <span className={getButtonLabelClassName(size)}>{children}</span>}
    {rightIcon}
  </BaseButton>
);
