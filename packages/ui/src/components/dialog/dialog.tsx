/**
 * Dialog 컴포넌트
 * WAI-ARIA Dialog (Modal) 패턴 구현.
 * 포커스 트랩, Escape 닫기, 오버레이 클릭 닫기, 포커스 복원을 지원한다.
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
  DialogRootProps,
  DialogTriggerProps,
  DialogBackdropProps,
  DialogPositionerProps,
  DialogContentProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseTriggerProps,
} from "./dialog.types";

/** 내부 Context */
interface DialogContextValue extends DialogConnectReturn {
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

const useDialogContext = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("Dialog 하위 컴포넌트는 Dialog.Root 안에서 사용해야 합니다.");
  }
  return ctx;
};

/** Root — 상태 관리만 수행, DOM 렌더링 없음 */
const Root = ({
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  id: idProp,
  children,
}: DialogRootProps) => {
  const id = useId(idProp);
  const isControlled = openProp !== undefined;

  const [open, setOpen] = useControllable({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const machine = useMemo(
    () => createDialogMachine({ id, open: defaultOpen }),

    [id],
  );

  const [state, context, send] = useMachine(machine);
  const api = connectDialog(state, context, send);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

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

  // 포커스 트랩 + 초기 포커스 + 포커스 복원
  useEffect(() => {
    if (state !== "open") return;

    const contentEl = contentRef.current;
    if (!contentEl) return;

    // 열기 전 포커스 기억
    const previouslyFocused = document.activeElement as HTMLElement | null;
    triggerRef.current = previouslyFocused;

    // 초기 포커스
    focusFirst(contentEl);

    // 포커스 트랩 설정
    const cleanup = trapFocus(contentEl);

    // 스크롤 방지
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cleanup();
      document.body.style.overflow = originalOverflow;

      // 포커스 복원
      if (triggerRef.current && typeof triggerRef.current.focus === "function") {
        triggerRef.current.focus();
      }
    };
  }, [state]);

  const ctxValue = useMemo(
    () => ({ ...api, contentRef }),
    [api.isOpen, state, context, api, contentRef],
  );

  return <DialogContext.Provider value={ctxValue}>{children}</DialogContext.Provider>;
};

/** Trigger */
const Trigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(({ children, ...rest }, ref) => {
  const api = useDialogContext();
  const props = mergeProps(api.triggerProps, rest as Record<string, unknown>);

  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
});

/** Backdrop */
const Backdrop = forwardRef<HTMLDivElement, DialogBackdropProps>(({ ...rest }, ref) => {
  const api = useDialogContext();

  if (!api.isOpen) return null;

  const props = mergeProps(api.backdropProps, rest as Record<string, unknown>);

  return <div ref={ref} {...props} />;
});

/** Positioner */
const Positioner = forwardRef<HTMLDivElement, DialogPositionerProps>(
  ({ children, ...rest }, ref) => {
    const api = useDialogContext();

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
const Content = forwardRef<HTMLDivElement, DialogContentProps>(({ children, ...rest }, ref) => {
  const api = useDialogContext();

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
const Title = forwardRef<HTMLHeadingElement, DialogTitleProps>(({ children, ...rest }, ref) => {
  const api = useDialogContext();
  const props = mergeProps(api.titleProps, rest as Record<string, unknown>);

  return (
    <h2 ref={ref} {...props}>
      {children}
    </h2>
  );
});

/** Description */
const Description = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ children, ...rest }, ref) => {
    const api = useDialogContext();
    const props = mergeProps(api.descriptionProps, rest as Record<string, unknown>);

    return (
      <p ref={ref} {...props}>
        {children}
      </p>
    );
  },
);

/** CloseTrigger */
const CloseTrigger = forwardRef<HTMLButtonElement, DialogCloseTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useDialogContext();
    const props = mergeProps(api.closeTriggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

export const Dialog = {
  Root,
  Trigger,
  Backdrop,
  Positioner,
  Content,
  Title,
  Description,
  CloseTrigger,
};
