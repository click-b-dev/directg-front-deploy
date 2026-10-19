import { Menu } from "@click-b/ui";
import { getButtonClassName, getButtonLabelClassName, type ButtonProps } from "./button";

export type DropdownMenuItem = {
  id: string;
  label: string;
  disabled?: boolean;
  onSelect?: () => void;
};

type DropdownMenuProps = {
  /** 트리거는 Button과 같은 모양으로 그린다 */
  trigger: Pick<ButtonProps, "tone" | "variant" | "size"> & { label: string };
  items: DropdownMenuItem[];
};

// Figma `dropdown`: 흰색 · p8 · radius 8 · 그림자 / `Dropdown/Item`: w140 h38 · px12 py8 · radius 4 · body3
export const DropdownMenu = ({ trigger, items }: DropdownMenuProps) => (
  <Menu.Root>
    <div className="rn:relative">
      <Menu.Trigger className={getButtonClassName(trigger)}>
        <span className={getButtonLabelClassName(trigger.size)}>{trigger.label}</span>
      </Menu.Trigger>
      <Menu.Positioner className="rn:absolute rn:top-full rn:right-0 rn:z-10 rn:mt-4 rn:hidden rn:data-[state=open]:block">
        <Menu.Content className="rn:flex rn:w-156 rn:flex-col rn:rounded-8 rn:bg-surface rn:p-8 rn:shadow-float">
          {items.map((item) => (
            <Menu.Item
              key={item.id}
              id={item.id}
              disabled={item.disabled}
              onSelect={item.onSelect}
              className="rn:flex rn:h-38 rn:cursor-pointer rn:items-center rn:rounded-4 rn:px-12 rn:py-8 rn:text-body3 rn:font-regular rn:text-ink rn:data-[disabled]:cursor-not-allowed rn:data-[disabled]:text-ink-3 rn:data-[highlighted]:bg-page"
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Positioner>
    </div>
  </Menu.Root>
);
