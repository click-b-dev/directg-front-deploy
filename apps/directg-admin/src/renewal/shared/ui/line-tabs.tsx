import { Tabs } from "@click-b/ui";
import { cx } from "../lib/cx";

export type LineTabItem = { value: string; label: string; disabled?: boolean };

type LineTabsProps = {
  items: LineTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  "aria-label": string;
};

// Figma `Tab/Line`: 아래 선(primary 테두리) + 아이템 px12 py16 · 활성 = 하단 2px inverse 선 + Medium primary
export const LineTabs = ({
  items,
  value,
  onValueChange,
  "aria-label": ariaLabel,
}: LineTabsProps) => (
  <Tabs.Root value={value} onValueChange={onValueChange}>
    <Tabs.List
      aria-label={ariaLabel}
      className="rn:flex rn:items-end rn:border-b rn:border-solid rn:border-line"
    >
      {items.map((item) => (
        <Tabs.Trigger
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className={cx(
            "rn:px-12 rn:py-16 rn:text-body2",
            item.value === value
              ? "rn:border-b-2 rn:border-solid rn:border-ink rn:font-medium rn:text-ink"
              : "rn:font-regular rn:text-ink-2",
            "rn:disabled:text-ink-3",
          )}
        >
          {item.label}
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  </Tabs.Root>
);
