/**
 * FloatingPanel 컴포넌트
 * 드래그/리사이즈 가능한 플로팅 패널 (Dialog 변형).
 * 최소화, 최대화, Escape 닫기를 지원한다.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo } from "react";
import { useMachine } from "@/hooks/use-machine";
import { useControllable } from "@/hooks/use-controllable";
import { useId } from "@/hooks/use-id";
import { createFloatingPanelMachine, connectFloatingPanel } from "@/machines/floating-panel";
import type { FloatingPanelConnectReturn } from "@/machines/floating-panel";
import { mergeProps } from "@/machines/shared/dom";
import type {
  FloatingPanelRootProps,
  FloatingPanelTriggerProps,
  FloatingPanelPositionerProps,
  FloatingPanelContentProps,
  FloatingPanelHeaderProps,
  FloatingPanelTitleProps,
  FloatingPanelBodyProps,
  FloatingPanelDragTriggerProps,
  FloatingPanelResizeTriggerProps,
  FloatingPanelCloseTriggerProps,
  FloatingPanelMinimizeTriggerProps,
  FloatingPanelMaximizeTriggerProps,
} from "./floating-panel.types";

/** 내부 Context */
const FloatingPanelContext = createContext<FloatingPanelConnectReturn | null>(null);

const useFloatingPanelContext = () => {
  const ctx = useContext(FloatingPanelContext);
  if (!ctx) {
    throw new Error("FloatingPanel 하위 컴포넌트는 FloatingPanel.Root 안에서 사용해야 합니다.");
  }
  return ctx;
};

/** Root */
const Root = ({
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  position: positionProp,
  onPositionChange,
  size: sizeProp,
  onSizeChange,
  minSize,
  maxSize,
  id: idProp,
  children,
}: FloatingPanelRootProps) => {
  const id = useId(idProp);

  const [open, setOpen] = useControllable({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const machine = useMemo(
    () =>
      createFloatingPanelMachine({
        id,
        position: positionProp,
        size: sizeProp,
        minSize,
        maxSize,
      }),
    [id, positionProp, sizeProp, minSize, maxSize],
  );

  const [state, context, send] = useMachine(machine);
  const api = connectFloatingPanel(state, context, send);

  // 외부 open → 머신 동기화
  useEffect(() => {
    const machineIsOpen = state !== "closed";
    if (open && !machineIsOpen) {
      send({ type: "OPEN" });
    } else if (!open && machineIsOpen) {
      send({ type: "CLOSE" });
    }
  }, [open, state, send]);

  // 머신 상태 → 외부 콜백 동기화
  useEffect(() => {
    const machineIsOpen = state !== "closed";
    if (machineIsOpen !== open) {
      setOpen(machineIsOpen);
    }
  }, [state, open, setOpen]);

  // 위치/크기 변경 콜백
  useEffect(() => {
    onPositionChange?.(context.position);
  }, [context.position, onPositionChange]);

  useEffect(() => {
    onSizeChange?.(context.size);
  }, [context.size, onSizeChange]);

  // 글로벌 pointer move/up for dragging/resizing
  useEffect(() => {
    if (state !== "dragging" && state !== "resizing") return;

    const handlePointerMove = (e: PointerEvent) => {
      if (state === "dragging") {
        send({ type: "DRAG_MOVE", pointerX: e.clientX, pointerY: e.clientY });
      } else if (state === "resizing") {
        send({ type: "RESIZE_MOVE", pointerX: e.clientX, pointerY: e.clientY });
      }
    };

    const handlePointerUp = () => {
      if (state === "dragging") {
        send({ type: "DRAG_END" });
      } else if (state === "resizing") {
        send({ type: "RESIZE_END" });
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [state, send]);

  const ctxValue = useMemo(() => api, [state, context, api]);

  return <FloatingPanelContext.Provider value={ctxValue}>{children}</FloatingPanelContext.Provider>;
};

/** Trigger */
const Trigger = forwardRef<HTMLButtonElement, FloatingPanelTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useFloatingPanelContext();
    const props = mergeProps(api.triggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

/** Positioner */
const Positioner = forwardRef<HTMLDivElement, FloatingPanelPositionerProps>(
  ({ children, ...rest }, ref) => {
    const api = useFloatingPanelContext();

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
const Content = forwardRef<HTMLDivElement, FloatingPanelContentProps>(
  ({ children, ...rest }, ref) => {
    const api = useFloatingPanelContext();
    const props = mergeProps(api.contentProps, rest as Record<string, unknown>);

    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

/** Header */
const Header = forwardRef<HTMLDivElement, FloatingPanelHeaderProps>(
  ({ children, ...rest }, ref) => {
    const api = useFloatingPanelContext();
    const props = mergeProps(api.headerProps, rest as Record<string, unknown>);

    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

/** Title */
const Title = forwardRef<HTMLHeadingElement, FloatingPanelTitleProps>(
  ({ children, ...rest }, ref) => {
    const api = useFloatingPanelContext();
    const props = mergeProps(api.titleProps, rest as Record<string, unknown>);

    return (
      <h2 ref={ref} {...props}>
        {children}
      </h2>
    );
  },
);

/** Body */
const Body = forwardRef<HTMLDivElement, FloatingPanelBodyProps>(({ children, ...rest }, ref) => {
  const api = useFloatingPanelContext();
  const props = mergeProps(api.bodyProps, rest as Record<string, unknown>);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

/** DragTrigger — 드래그 핸들 영역 */
const DragTrigger = forwardRef<HTMLDivElement, FloatingPanelDragTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useFloatingPanelContext();
    const props = mergeProps(api.dragTriggerProps, rest as Record<string, unknown>);

    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

/** ResizeTrigger — 리사이즈 핸들 */
const ResizeTrigger = forwardRef<HTMLDivElement, FloatingPanelResizeTriggerProps>(
  ({ direction, ...rest }, ref) => {
    const api = useFloatingPanelContext();
    const resizeProps = api.getResizeTriggerProps({ direction });
    const props = mergeProps(resizeProps, rest as Record<string, unknown>);

    return <div ref={ref} {...props} />;
  },
);

/** CloseTrigger */
const CloseTrigger = forwardRef<HTMLButtonElement, FloatingPanelCloseTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useFloatingPanelContext();
    const props = mergeProps(api.closeTriggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

/** MinimizeTrigger */
const MinimizeTrigger = forwardRef<HTMLButtonElement, FloatingPanelMinimizeTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useFloatingPanelContext();
    const props = mergeProps(api.minimizeTriggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

/** MaximizeTrigger */
const MaximizeTrigger = forwardRef<HTMLButtonElement, FloatingPanelMaximizeTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useFloatingPanelContext();
    const props = mergeProps(api.maximizeTriggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

export const FloatingPanel = {
  Root,
  Trigger,
  Positioner,
  Content,
  Header,
  Title,
  Body,
  DragTrigger,
  ResizeTrigger,
  CloseTrigger,
  MinimizeTrigger,
  MaximizeTrigger,
};
