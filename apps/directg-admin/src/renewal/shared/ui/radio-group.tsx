import type { ComponentProps } from "react";
import { RadioGroup as BaseRadioGroup } from "@click-b/ui";
import radioOn from "@/renewal/assets/icon-radiobox-on.svg";
import { cx } from "../lib/cx";

export type RadioOption = { value: string; label: string };

type RadioGroupProps = Omit<ComponentProps<typeof BaseRadioGroup.Root>, "children"> & {
  options: RadioOption[];
};

// Figma `Radiobox` size=S(16px): off=테두리 primary 원, on=전용 아이콘. 라벨 body3, 간격 6.
export const RadioGroup = ({ options, className, ...props }: RadioGroupProps) => (
  <BaseRadioGroup.Root
    orientation="horizontal"
    className={cx("rn:flex rn:items-center rn:gap-20", className)}
    {...props}
  >
    {options.map((option) => (
      <BaseRadioGroup.Item
        key={option.value}
        value={option.value}
        className="rn:inline-flex rn:cursor-pointer rn:items-center rn:gap-6"
      >
        <BaseRadioGroup.ItemControl className="rn:group rn:relative rn:size-16 rn:shrink-0 rn:rounded-circle rn:border rn:border-solid rn:border-line rn:data-[state=checked]:border-transparent rn:data-[disabled]:bg-page">
          <img
            src={radioOn}
            alt=""
            width={16}
            height={16}
            className="rn:absolute rn:-inset-px rn:hidden rn:max-w-none rn:group-data-[state=checked]:block"
          />
        </BaseRadioGroup.ItemControl>
        <BaseRadioGroup.ItemText className="rn:text-body3 rn:text-ink">
          {option.label}
        </BaseRadioGroup.ItemText>
        <BaseRadioGroup.ItemHiddenInput />
      </BaseRadioGroup.Item>
    ))}
  </BaseRadioGroup.Root>
);
