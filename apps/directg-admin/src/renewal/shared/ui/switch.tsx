import type { ComponentProps } from "react";
import { Switch as BaseSwitch } from "@click-b/ui";

// Figma `Switch`: 46×24 · p4 · 꺼짐=bg sub / 켜짐=primary · 썸 16 흰색
export const Switch = (props: ComponentProps<typeof BaseSwitch.Root>) => (
  <BaseSwitch.Root {...props}>
    <BaseSwitch.Control className="rn:flex rn:h-24 rn:w-46 rn:items-center rn:rounded-circle rn:bg-sub rn:p-4 rn:data-[state=checked]:bg-primary rn:data-[disabled]:opacity-60">
      <BaseSwitch.Thumb className="rn:block rn:size-16 rn:rounded-circle rn:bg-surface rn:transition-transform rn:data-[state=checked]:translate-x-22" />
    </BaseSwitch.Control>
    <BaseSwitch.HiddenInput />
  </BaseSwitch.Root>
);
