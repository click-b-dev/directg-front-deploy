/**
 * Sheet 컴포넌트
 * 슬라이드인 패널. Dialog 머신을 재사용한다.
 * side prop으로 방향을 지정하고 data-side 속성으로 노출한다.
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
import { createDialogMachine, connectDialog } from "@/machines/dialog";
import type { DialogConnectReturn } from "@/machines/dialog";
import { mergeProps } from "@/machines/shared/dom";
import { trapFocus, focusFirst } from "@/machines/shared/focus";
import type {
  SheetSide,
  SheetRootProps,
  SheetTriggerProps,
  SheetBackdropProps,
  SheetContentProps,
  SheetTitleProps,
  SheetDescriptionProps,
  SheetCloseTriggerProps,
} from "./sheet.types";

/** 내부 Context */
interface SheetContextValue extends DialogConnectReturn {
  contentRef: React.RefObject<HTMLDivElement | null>;
  side: SheetSide;
}

const SheetContext = createContext<SheetContextValue | null>(null);

const useSheetContext = () => {
  const ctx = useContext(SheetContext);
  if (!ctx) {
    throw new Error("Sheet 하위 컴포넌트는 Sheet.Root 안에서 사용해야 합니다.");
  }
  return ctx;
};

/** Root -- 상태 관리만 수행, DOM 렌더링 없음 */
const Root = ({
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  side = "right",
  id: idProp,
  children,
}: SheetRootProps) => {
  const id = useId(idProp);

  const [open, setOpen] = useControllable({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const machine = useMemo(() => createDialogMachine({ id, open }), [id, open]);

  const [state, context, send] = useMachine(machine);
  const api = connectDialog(state, context, send);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // 외부 open prop 동기화
  useEffect(() => {
    if (open && state === "closed") {
      send({ type: "OPEN" });
    } else if (!open && state === "open") {
      send({ type: "CLOSE" });
    }
  }, [open, state, send]);

  // 머신 상태 -> 외부 콜백 동기화
  useEffect(() => {
    const isOpen = state === "open";
    if (isOpen !== open) {
      setOpen(isOpen);
    }
  }, [state, open, setOpen]);

  // 포커스 트랩 + 초기 포커스 + 포커스 복원
  useEffect(() => {
    if (state !== "open") return;

    const contentEl = contentRef.current;
    if (!contentEl) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    triggerRef.current = previouslyFocused;

    focusFirst(contentEl);

    const cleanup = trapFocus(contentEl);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cleanup();
      document.body.style.overflow = originalOverflow;

      if (triggerRef.current && typeof triggerRef.current.focus === "function") {
        triggerRef.current.focus();
      }
    };
  }, [state]);

  const ctxValue = useMemo(
    () => ({ ...api, contentRef, side }),
    [api.isOpen, state, context, side, api, contentRef],
  );

  return <SheetContext.Provider value={ctxValue}>{children}</SheetContext.Provider>;
};

/** Trigger */
const Trigger = forwardRef<HTMLButtonElement, SheetTriggerProps>(({ children, ...rest }, ref) => {
  const api = useSheetContext();
  const triggerProps = {
    ...api.triggerProps,
    "data-scope": "sheet",
  };
  const props = mergeProps(triggerProps, rest as Record<string, unknown>);

  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
});

/** Backdrop */
const Backdrop = forwardRef<HTMLDivElement, SheetBackdropProps>(({ ...rest }, ref) => {
  const api = useSheetContext();

  if (!api.isOpen) return null;

  const backdropProps = {
    ...api.backdropProps,
    "data-scope": "sheet",
  };
  const props = mergeProps(backdropProps, rest as Record<string, unknown>);

  return <div ref={ref} {...props} />;
});

/** Content */
const Content = forwardRef<HTMLDivElement, SheetContentProps>(({ children, ...rest }, ref) => {
  const api = useSheetContext();

  if (!api.isOpen) return null;

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

  const contentProps = {
    ...api.contentProps,
    "data-scope": "sheet",
    "data-side": api.side,
  };
  const props = mergeProps(contentProps, rest as Record<string, unknown>);

  return (
    <div ref={mergedRef} {...props}>
      {children}
    </div>
  );
});

/** Title */
const Title = forwardRef<HTMLHeadingElement, SheetTitleProps>(({ children, ...rest }, ref) => {
  const api = useSheetContext();
  const titleProps = {
    ...api.titleProps,
    "data-scope": "sheet",
  };
  const props = mergeProps(titleProps, rest as Record<string, unknown>);

  return (
    <h2 ref={ref} {...props}>
      {children}
    </h2>
  );
});

/** Description */
const Description = forwardRef<HTMLParagraphElement, SheetDescriptionProps>(
  ({ children, ...rest }, ref) => {
    const api = useSheetContext();
    const descriptionProps = {
      ...api.descriptionProps,
      "data-scope": "sheet",
    };
    const props = mergeProps(descriptionProps, rest as Record<string, unknown>);

    return (
      <p ref={ref} {...props}>
        {children}
      </p>
    );
  },
);

/** CloseTrigger */
const CloseTrigger = forwardRef<HTMLButtonElement, SheetCloseTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useSheetContext();
    const closeTriggerProps = {
      ...api.closeTriggerProps,
      "data-scope": "sheet",
    };
    const props = mergeProps(closeTriggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

export const Sheet = {
  Root,
  Trigger,
  Backdrop,
  Content,
  Title,
  Description,
  CloseTrigger,
};
