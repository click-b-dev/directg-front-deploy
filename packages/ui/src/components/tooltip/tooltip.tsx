/**
 * Tooltip 컴포넌트
 * WAI-ARIA Tooltip 패턴 구현.
 * 호버/포커스로 열리는 정보성 오버레이. 포커스 트랩 없음.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine } from "@/hooks/use-machine";
import { useControllable } from "@/hooks/use-controllable";
import { useId } from "@/hooks/use-id";
import { createTooltipMachine, connectTooltip } from "@/machines/tooltip";
import type { TooltipConnectReturn } from "@/machines/tooltip";
import { mergeProps } from "@/machines/shared/dom";
import type {
  TooltipRootProps,
  TooltipTriggerProps,
  TooltipPositionerProps,
  TooltipContentProps,
  TooltipArrowProps,
} from "./tooltip.types";

/** 내부 Context */
const TooltipContext = createContext<TooltipConnectReturn | null>(null);

const useTooltipContext = () => {
  const ctx = useContext(TooltipContext);
  if (!ctx) {
    throw new Error("Tooltip 하위 컴포넌트는 Tooltip.Root 안에서 사용해야 합니다.");
  }
  return ctx;
};

/** Root -- 상태 관리만 수행, DOM 렌더링 없음 */
const Root = ({
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  openDelay = 700,
  closeDelay = 300,
  disabled = false,
  id: idProp,
  children,
}: TooltipRootProps) => {
  const id = useId(idProp);
  const isControlled = openProp !== undefined;

  const [open, setOpen] = useControllable({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const machine = useMemo(
    () => createTooltipMachine({ id, open: defaultOpen, openDelay, closeDelay, disabled }),

    [id, openDelay, closeDelay, disabled],
  );

  const [state, context, send] = useMachine(machine);
  const api = connectTooltip(state, context, send);

  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 지연 타이머 관리
  useEffect(() => {
    if (state === "opening") {
      openTimerRef.current = setTimeout(() => {
        send({ type: "OPEN_DELAY_COMPLETE" });
      }, openDelay);
      return () => {
        if (openTimerRef.current) clearTimeout(openTimerRef.current);
      };
    }

    if (state === "closing") {
      closeTimerRef.current = setTimeout(() => {
        send({ type: "CLOSE_DELAY_COMPLETE" });
      }, closeDelay);
      return () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      };
    }
  }, [state, openDelay, closeDelay, send]);

  const prevOpenRef = useRef(open);

  // 외부 open prop 동기화 (제어 모드에서만 외부 → 머신)
  useEffect(() => {
    if (!isControlled) {
      prevOpenRef.current = open;
      return;
    }
    const isOpen = state === "open" || state === "closing";
    if (open !== prevOpenRef.current) {
      prevOpenRef.current = open;
      if (open && !isOpen) {
        send({ type: "OPEN" });
      } else if (!open && isOpen) {
        send({ type: "CLOSE" });
      }
    }
  }, [open, state, send, isControlled]);

  // 머신 상태 -> 외부 콜백 동기화
  useEffect(() => {
    const isOpen = state === "open" || state === "closing";
    if (isOpen !== open) {
      setOpen(isOpen);
    }
  }, [state, setOpen]);

  // disabled 변경 동기화
  useEffect(() => {
    if (disabled && (state === "open" || state === "opening" || state === "closing")) {
      send({ type: "CLOSE" });
    }
  }, [disabled, state, send]);

  const ctxValue = useMemo(() => api, [api.isOpen, state, context, api]);

  return <TooltipContext.Provider value={ctxValue}>{children}</TooltipContext.Provider>;
};

/** Trigger */
const Trigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>(({ children, ...rest }, ref) => {
  const api = useTooltipContext();
  const props = mergeProps(api.triggerProps, rest as Record<string, unknown>);

  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
});

/** Positioner */
const Positioner = forwardRef<HTMLDivElement, TooltipPositionerProps>(
  ({ children, ...rest }, ref) => {
    const api = useTooltipContext();

    if (!api.isOpen) return null;

    const props = mergeProps(api.positionerProps, rest as Record<string, unknown>);

    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

/** Content */
const Content = forwardRef<HTMLDivElement, TooltipContentProps>(({ children, ...rest }, ref) => {
  const api = useTooltipContext();
  const props = mergeProps(api.contentProps, rest as Record<string, unknown>);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

/** Arrow */
const Arrow = forwardRef<HTMLDivElement, TooltipArrowProps>(({ ...rest }, ref) => {
  const api = useTooltipContext();
  const props = mergeProps(api.arrowProps, rest as Record<string, unknown>);

  return <div ref={ref} {...props} />;
});

export const Tooltip = {
  Root,
  Trigger,
  Positioner,
  Content,
  Arrow,
};
