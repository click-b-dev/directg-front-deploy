/**
 * Collapsible 컴포넌트
 * WAI-ARIA Disclosure 패턴 구현. Compound Component 패턴 사용.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine } from "@/hooks/use-machine";
import { useControllable } from "@/hooks/use-controllable";
import { useId } from "@/hooks/use-id";
import { createCollapsibleMachine, connectCollapsible } from "@/machines/collapsible";
import type { CollapsibleConnectReturn } from "@/machines/collapsible";
import { mergeProps } from "@/machines/shared/dom";
import type {
  CollapsibleRootProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
} from "./collapsible.types";

/** 내부 Context */
const CollapsibleContext = createContext<CollapsibleConnectReturn | null>(null);

const useCollapsibleContext = () => {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error("Collapsible 하위 컴포넌트는 Collapsible.Root 안에서 사용해야 합니다.");
  }
  return ctx;
};

/** Root */
const Root = forwardRef<HTMLDivElement, CollapsibleRootProps>(
  (
    {
      open: openProp,
      onOpenChange,
      defaultOpen = false,
      disabled = false,
      id: idProp,
      children,
      ...rest
    },
    ref,
  ) => {
    const id = useId(idProp);
    const isControlled = openProp !== undefined;

    const [open, setOpen] = useControllable({
      value: openProp,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });

    const machine = useMemo(
      () => createCollapsibleMachine({ id, open: defaultOpen, disabled }),

      [id, disabled],
    );

    const [state, context, send] = useMachine(machine);
    const api = connectCollapsible(state, context, send);

    const prevOpenRef = useRef(open);

    // 외부 open prop 동기화 (제어 모드에서만 외부 → 머신)
    useEffect(() => {
      if (!isControlled) {
        prevOpenRef.current = open;
        return;
      }
      if (open !== prevOpenRef.current) {
        prevOpenRef.current = open;
        if (open && state === "closed") {
          send({ type: "OPEN" });
        } else if (!open && state === "open") {
          send({ type: "CLOSE" });
        }
      }
    }, [open, state, send, isControlled]);

    // 머신 상태 → 외부 콜백 동기화
    useEffect(() => {
      const isOpen = state === "open";
      if (isOpen !== open) {
        setOpen(isOpen);
      }
    }, [state, setOpen]);

    const rootProps = mergeProps(api.rootProps, rest as Record<string, unknown>);

    return (
      <CollapsibleContext.Provider value={api}>
        <div ref={ref} {...rootProps}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  },
);

/** Trigger */
const Trigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useCollapsibleContext();
    const { onKeyDown: _onKeyDown, ...triggerRest } = api.triggerProps;
    void _onKeyDown;
    const props = mergeProps(triggerRest, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props} onKeyDown={api.triggerProps.onKeyDown}>
        {children}
      </button>
    );
  },
);

/** Content */
const Content = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ children, ...rest }, ref) => {
    const api = useCollapsibleContext();
    const props = mergeProps(api.contentProps, rest as Record<string, unknown>);

    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

export const Collapsible = {
  Root,
  Trigger,
  Content,
};
