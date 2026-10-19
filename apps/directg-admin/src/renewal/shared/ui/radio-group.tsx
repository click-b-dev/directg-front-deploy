import { useRef, useState, type ComponentProps } from "react";
import { RadioGroup as BaseRadioGroup } from "@click-b/ui";
import radioOn from "@/renewal/assets/icon-radiobox-on.svg";
import { cx } from "../lib/cx";

export type RadioOption = { value: string; label: string };

type RadioGroupProps = Omit<ComponentProps<typeof BaseRadioGroup.Root>, "children"> & {
  options: RadioOption[];
};

// Figma `Radiobox` size=S(16px): off=테두리 primary 원, on=전용 아이콘. 라벨 body3, 간격 6.
export const RadioGroup = ({
  options,
  className,
  value,
  onValueChange,
  ...props
}: RadioGroupProps) => {
  // @click-b/ui RadioGroup은 제어 모드(value)에서 내부 효과 두 개가 값을 서로 되돌려 무한 렌더가 난다.
  // 그래서 내부는 비제어(defaultValue)로 쓰고, 부모가 사용자의 선택이 아닌 값으로 바꿀 때(예: 초기화)만
  // key를 바꿔 다시 마운트해 반영한다.
  const emitted = useRef(value);
  const [version, setVersion] = useState(0);
  if (value !== emitted.current) {
    emitted.current = value;
    setVersion((current) => current + 1);
  }

  return (
    <BaseRadioGroup.Root
      key={version}
      orientation="horizontal"
      className={cx("rn:flex rn:items-center rn:gap-20", className)}
      defaultValue={value}
      onValueChange={(next) => {
        emitted.current = next;
        onValueChange?.(next);
      }}
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
};
