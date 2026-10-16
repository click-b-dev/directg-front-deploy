/**
 * HoverCard 컴포넌트
 * Tooltip과 유사하지만 풍부한 콘텐츠를 제공하는 비모달 오버레이.
 * 마우스가 trigger에서 content로 이동할 때 닫히지 않는다 (bridge gap).
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine } from "@/hooks/use-machine";
import { useControllable } from "@/hooks/use-controllable";
import { useId } from "@/hooks/use-id";
import { createHoverCardMachine, connectHoverCard } from "@/machines/hover-card";
import type { HoverCardConnectReturn } from "@/machines/hover-card";
import { mergeProps } from "@/machines/shared/dom";
import type {
  HoverCardRootProps,
  HoverCardTriggerProps,
  HoverCardPositionerProps,
  HoverCardContentProps,
  HoverCardArrowProps,
} from "./hover-card.types";

/** 내부 Context */
const HoverCardContext = createContext<HoverCardConnectReturn | null>(null);

const useHoverCardContext = () => {
  const ctx = useContext(HoverCardContext);
  if (!ctx) {
    throw new Error("HoverCard 하위 컴포넌트는 HoverCard.Root 안에서 사용해야 합니다.");
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
  id: idProp,
  children,
}: HoverCardRootProps) => {
  const id = useId(idProp);

  const [open, setOpen] = useControllable({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const machine = useMemo(
    () => createHoverCardMachine({ id, open, openDelay, closeDelay }),
    [id, open, openDelay, closeDelay],
  );

  const [state, context, send] = useMachine(machine);
  const api = connectHoverCard(state, context, send);

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

  // 외부 open prop 동기화
  useEffect(() => {
    const isOpen = state === "open" || state === "closing";
    if (open && !isOpen) {
      send({ type: "OPEN" });
    } else if (!open && isOpen) {
      send({ type: "CLOSE" });
    }
  }, [open, state, send]);

  // 머신 상태 -> 외부 콜백 동기화
  useEffect(() => {
    const isOpen = state === "open" || state === "closing";
    if (isOpen !== open) {
      setOpen(isOpen);
    }
  }, [state, open, setOpen]);

  const ctxValue = useMemo(() => api, [api.isOpen, state, context, api]);

  return <HoverCardContext.Provider value={ctxValue}>{children}</HoverCardContext.Provider>;
};

/** Trigger -- 기본적으로 앵커 태그 (링크 프리뷰 패턴) */
const Trigger = forwardRef<HTMLAnchorElement, HoverCardTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useHoverCardContext();
    const props = mergeProps(api.triggerProps, rest as Record<string, unknown>);

    return (
      <a ref={ref} {...props}>
        {children}
      </a>
    );
  },
);

/** Positioner */
const Positioner = forwardRef<HTMLDivElement, HoverCardPositionerProps>(
  ({ children, ...rest }, ref) => {
    const api = useHoverCardContext();

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
const Content = forwardRef<HTMLDivElement, HoverCardContentProps>(({ children, ...rest }, ref) => {
  const api = useHoverCardContext();
  const props = mergeProps(api.contentProps, rest as Record<string, unknown>);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

/** Arrow */
const Arrow = forwardRef<HTMLDivElement, HoverCardArrowProps>(({ ...rest }, ref) => {
  const api = useHoverCardContext();
  const props = mergeProps(api.arrowProps, rest as Record<string, unknown>);

  return <div ref={ref} {...props} />;
});

export const HoverCard = {
  Root,
  Trigger,
  Positioner,
  Content,
  Arrow,
};
