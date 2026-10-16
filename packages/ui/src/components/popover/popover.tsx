/**
 * Popover 컴포넌트
 * WAI-ARIA Popover (non-modal dialog) 패턴 구현.
 * 클릭 토글, Escape 닫기, 외부 클릭 닫기를 지원한다.
 * 포커스 트랩 없음 (non-modal).
 */

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useMachine } from "@/hooks/use-machine";
import { useControllable } from "@/hooks/use-controllable";
import { useId } from "@/hooks/use-id";
import { createPopoverMachine, connectPopover } from "@/machines/popover";
import type { PopoverConnectReturn } from "@/machines/popover";
import { mergeProps } from "@/machines/shared/dom";
import type {
  PopoverRootProps,
  PopoverTriggerProps,
  PopoverPositionerProps,
  PopoverContentProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
  PopoverCloseTriggerProps,
  PopoverArrowProps,
} from "./popover.types";

/** 내부 Context */
interface PopoverContextValue extends PopoverConnectReturn {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

const usePopoverContext = () => {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error("Popover 하위 컴포넌트는 Popover.Root 안에서 사용해야 합니다.");
  }
  return ctx;
};

/** Root */
const Root = ({
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  id: idProp,
  children,
}: PopoverRootProps) => {
  const id = useId(idProp);
  const isControlled = openProp !== undefined;

  const [open, setOpen] = useControllable({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const machine = useMemo(
    () => createPopoverMachine({ id, open: defaultOpen }),

    [id],
  );

  const [state, context, send] = useMachine(machine);
  const api = connectPopover(state, context, send);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

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

  // 외부 클릭 닫기
  useEffect(() => {
    if (state !== "open") return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      const triggerEl = triggerRef.current;
      const contentEl = contentRef.current;

      if (triggerEl?.contains(target) || contentEl?.contains(target)) {
        return;
      }

      send({ type: "CLOSE" });
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [state, send]);

  // 열릴 때 content에 포커스 (non-modal이므로 트랩은 안 함)
  useEffect(() => {
    if (state === "open") {
      // requestAnimationFrame으로 DOM 렌더 후 포커스
      const raf = requestAnimationFrame(() => {
        contentRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [state]);

  const ctxValue = useMemo(
    () => ({ ...api, triggerRef, contentRef }),
    [api.isOpen, state, context, api, triggerRef, contentRef],
  );

  return <PopoverContext.Provider value={ctxValue}>{children}</PopoverContext.Provider>;
};

/** Trigger */
const Trigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(({ children, ...rest }, ref) => {
  const api = usePopoverContext();
  const props = mergeProps(api.triggerProps, rest as Record<string, unknown>);

  const mergedRef = useCallback(
    (node: HTMLButtonElement | null) => {
      (api.triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }
    },
    [api.triggerRef, ref],
  );

  return (
    <button ref={mergedRef} {...props}>
      {children}
    </button>
  );
});

/** Positioner */
const Positioner = forwardRef<HTMLDivElement, PopoverPositionerProps>(
  ({ children, ...rest }, ref) => {
    const api = usePopoverContext();

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
const Content = forwardRef<HTMLDivElement, PopoverContentProps>(({ children, ...rest }, ref) => {
  const api = usePopoverContext();

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      (api.contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [api.contentRef, ref],
  );

  const props = mergeProps(api.contentProps, rest as Record<string, unknown>);

  return (
    <div ref={mergedRef} {...props}>
      {children}
    </div>
  );
});

/** Title */
const Title = forwardRef<HTMLHeadingElement, PopoverTitleProps>(({ children, ...rest }, ref) => {
  const api = usePopoverContext();
  const props = mergeProps(api.titleProps, rest as Record<string, unknown>);

  return (
    <h3 ref={ref} {...props}>
      {children}
    </h3>
  );
});

/** Description */
const Description = forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(
  ({ children, ...rest }, ref) => {
    const api = usePopoverContext();
    const props = mergeProps(api.descriptionProps, rest as Record<string, unknown>);

    return (
      <p ref={ref} {...props}>
        {children}
      </p>
    );
  },
);

/** CloseTrigger */
const CloseTrigger = forwardRef<HTMLButtonElement, PopoverCloseTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = usePopoverContext();
    const props = mergeProps(api.closeTriggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

/** Arrow */
const Arrow = forwardRef<HTMLDivElement, PopoverArrowProps>(({ ...rest }, ref) => {
  const api = usePopoverContext();
  const props = mergeProps(api.arrowProps, rest as Record<string, unknown>);

  return <div ref={ref} {...props} />;
});

export const Popover = {
  Root,
  Trigger,
  Positioner,
  Content,
  Title,
  Description,
  CloseTrigger,
  Arrow,
};
