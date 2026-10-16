/**
 * Drawer 컴포넌트
 * 모바일 친화적 슬라이드업 패널. Dialog 머신을 재사용한다.
 * side prop으로 방향을 지정하고 snapPoints로 스냅 위치를 정의한다.
 * data-side 속성으로 방향 정보를 노출한다.
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
  DrawerSide,
  DrawerRootProps,
  DrawerTriggerProps,
  DrawerBackdropProps,
  DrawerContentProps,
  DrawerHandleProps,
  DrawerTitleProps,
  DrawerDescriptionProps,
  DrawerCloseTriggerProps,
} from "./drawer.types";

/** 내부 Context */
interface DrawerContextValue extends DialogConnectReturn {
  contentRef: React.RefObject<HTMLDivElement | null>;
  side: DrawerSide;
  snapPoints: number[];
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

const useDrawerContext = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error("Drawer 하위 컴포넌트는 Drawer.Root 안에서 사용해야 합니다.");
  }
  return ctx;
};

/** Root -- 상태 관리만 수행, DOM 렌더링 없음 */
const Root = ({
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  side = "bottom",
  snapPoints = [],
  id: idProp,
  children,
}: DrawerRootProps) => {
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
    () => ({ ...api, contentRef, side, snapPoints }),
    [api.isOpen, state, context, side, snapPoints, api, contentRef],
  );

  return <DrawerContext.Provider value={ctxValue}>{children}</DrawerContext.Provider>;
};

/** Trigger */
const Trigger = forwardRef<HTMLButtonElement, DrawerTriggerProps>(({ children, ...rest }, ref) => {
  const api = useDrawerContext();
  const triggerProps = {
    ...api.triggerProps,
    "data-scope": "drawer",
  };
  const props = mergeProps(triggerProps, rest as Record<string, unknown>);

  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
});

/** Backdrop */
const Backdrop = forwardRef<HTMLDivElement, DrawerBackdropProps>(({ ...rest }, ref) => {
  const api = useDrawerContext();

  if (!api.isOpen) return null;

  const backdropProps = {
    ...api.backdropProps,
    "data-scope": "drawer",
  };
  const props = mergeProps(backdropProps, rest as Record<string, unknown>);

  return <div ref={ref} {...props} />;
});

/** Content */
const Content = forwardRef<HTMLDivElement, DrawerContentProps>(({ children, ...rest }, ref) => {
  const api = useDrawerContext();

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

  const snapPointsAttr = api.snapPoints.length > 0 ? api.snapPoints.join(",") : undefined;

  const contentProps = {
    ...api.contentProps,
    "data-scope": "drawer",
    "data-side": api.side,
    "data-snap-points": snapPointsAttr,
  };
  const props = mergeProps(contentProps, rest as Record<string, unknown>);

  return (
    <div ref={mergedRef} {...props}>
      {children}
    </div>
  );
});

/** Handle -- 드래그 핸들 */
const Handle = forwardRef<HTMLDivElement, DrawerHandleProps>(({ ...rest }, ref) => {
  const api = useDrawerContext();

  const handleProps = {
    "data-scope": "drawer" as const,
    "data-part": "handle" as const,
    "data-side": api.side,
    "aria-hidden": "true" as const,
  };
  const props = mergeProps(handleProps, rest as Record<string, unknown>);

  return <div ref={ref} {...props} />;
});

/** Title */
const Title = forwardRef<HTMLHeadingElement, DrawerTitleProps>(({ children, ...rest }, ref) => {
  const api = useDrawerContext();
  const titleProps = {
    ...api.titleProps,
    "data-scope": "drawer",
  };
  const props = mergeProps(titleProps, rest as Record<string, unknown>);

  return (
    <h2 ref={ref} {...props}>
      {children}
    </h2>
  );
});

/** Description */
const Description = forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  ({ children, ...rest }, ref) => {
    const api = useDrawerContext();
    const descriptionProps = {
      ...api.descriptionProps,
      "data-scope": "drawer",
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
const CloseTrigger = forwardRef<HTMLButtonElement, DrawerCloseTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useDrawerContext();
    const closeTriggerProps = {
      ...api.closeTriggerProps,
      "data-scope": "drawer",
    };
    const props = mergeProps(closeTriggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

export const Drawer = {
  Root,
  Trigger,
  Backdrop,
  Content,
  Handle,
  Title,
  Description,
  CloseTrigger,
};
