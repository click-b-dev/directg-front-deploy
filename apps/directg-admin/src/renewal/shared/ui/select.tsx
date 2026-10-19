import { Select as BaseSelect } from "@click-b/ui";
import arrowDown from "@/renewal/assets/icon-arrow-down.svg";
import arrowDownSm from "@/renewal/assets/icon-arrow-down-sm.svg";
import { cx } from "../lib/cx";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  /** 선택된 값이 없을 때 보여 줄 문구 */
  placeholder?: string;
  disabled?: boolean;
  /** Root(wrapper)에 적용할 className — 너비 지정 등 */
  rootClassName?: string;
  /** 목록 하단 페이지 크기 선택용(텍스트 14, 화살표 18, 높이 34) */
  compact?: boolean;
  "aria-label"?: string;
};

// 드롭다운 디자인: 트리거(h38 · pl12 pr8 · 텍스트 16 · 화살표 20) 아래로, 구분선을 둔 옵션 카드가 펼쳐진다.
// 열리면 화살표가 위로 뒤집힌다. 옵션 카드는 테두리 + 그림자(shadow-float).
export const Select = ({
  options,
  value,
  onValueChange,
  placeholder = "선택",
  disabled = false,
  rootClassName,
  compact = false,
  "aria-label": ariaLabel,
}: SelectProps) => (
  <BaseSelect.Root
    value={value}
    onValueChange={onValueChange}
    items={options}
    className={cx("rn:relative rn:inline-block", rootClassName)}
  >
    <BaseSelect.Trigger
      aria-label={ariaLabel}
      disabled={disabled}
      className={cx(
        "rn:group rn:flex rn:w-full rn:items-center rn:justify-between rn:gap-4 rn:rounded-8 rn:border rn:border-solid rn:border-line rn:bg-surface rn:pl-12 rn:text-left rn:outline-none",
        compact ? "rn:h-34 rn:pr-8 rn:text-body3" : "rn:h-38 rn:pr-8 rn:text-body2",
        "rn:focus-visible:border-line-2 rn:data-[state=open]:rounded-b-none rn:data-[state=open]:border-line-2",
        "rn:disabled:bg-page rn:disabled:text-line",
        value === "" ? "rn:text-ink-3" : "rn:text-ink",
      )}
    >
      <BaseSelect.ValueText
        placeholder={placeholder}
        className="rn:min-w-0 rn:flex-1 rn:truncate"
      />
      <img
        src={compact ? arrowDownSm : arrowDown}
        alt=""
        className={cx(
          "rn:shrink-0 rn:transition-transform rn:group-data-[state=open]:rotate-180",
          compact ? "rn:size-18" : "rn:size-20",
        )}
      />
    </BaseSelect.Trigger>
    <BaseSelect.Positioner className="rn:absolute rn:top-full rn:left-0 rn:z-20 rn:w-full">
      <BaseSelect.Content className="rn:overflow-hidden rn:rounded-b-8 rn:border rn:border-t-0 rn:border-solid rn:border-line-2 rn:bg-surface rn:shadow-float">
        <div className="rn:border-t rn:border-solid rn:border-line" />
        {options.map((option) => (
          <BaseSelect.Item
            key={option.value}
            value={option.value}
            label={option.label}
            disabled={option.disabled}
            className={cx(
              "rn:flex rn:cursor-pointer rn:items-center rn:px-12 rn:text-ink rn:data-[disabled]:cursor-not-allowed rn:data-[disabled]:text-ink-3 rn:data-[highlighted]:bg-page rn:data-[state=checked]:font-medium",
              compact ? "rn:h-34 rn:text-body3" : "rn:h-38 rn:text-body2",
            )}
          >
            {option.label}
          </BaseSelect.Item>
        ))}
      </BaseSelect.Content>
    </BaseSelect.Positioner>
  </BaseSelect.Root>
);
