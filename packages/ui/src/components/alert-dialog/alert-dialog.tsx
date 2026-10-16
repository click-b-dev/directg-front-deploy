/**
 * AlertDialog 컴포넌트
 * WAI-ARIA AlertDialog 패턴 구현.
 * Dialog 머신을 재사용하되 role="alertdialog"이며 backdrop 클릭으로 닫히지 않는다.
 * 사용자의 명시적 행동(버튼 클릭, Escape)으로만 닫을 수 있다.
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
  AlertDialogRootProps,
  AlertDialogTriggerProps,
  AlertDialogBackdropProps,
  AlertDialogPositionerProps,
  AlertDialogContentProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
  AlertDialogCloseTriggerProps,
} from "./alert-dialog.types";

/** 내부 Context */
interface AlertDialogContextValue extends DialogConnectReturn {
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

const useAlertDialogContext = () => {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) {
    throw new Error("AlertDialog 하위 컴포넌트는 AlertDialog.Root 안에서 사용해야 합니다.");
  }
  return ctx;
};

/** Root -- 상태 관리만 수행, DOM 렌더링 없음 */
const Root = ({
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  id: idProp,
  children,
}: AlertDialogRootProps) => {
  const id = useId(idProp);
  const isControlled = openProp !== undefined;

  const [open, setOpen] = useControllable({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const defaultOpenRef = useRef(defaultOpen);
  const machine = useMemo(() => createDialogMachine({ id, open: defaultOpenRef.current }), [id]);

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

  // 머신 상태 -> 외부 콜백 동기화
  useEffect(() => {
    const isOpen = state === "open";
    if (isOpen !== open) {
      setOpen(isOpen);
    }
  }, [state, setOpen, open]);

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

  const ctxValue = useMemo(() => ({ ...api, contentRef }), [api, contentRef, state, context]);

  return <AlertDialogContext.Provider value={ctxValue}>{children}</AlertDialogContext.Provider>;
};

/** Trigger */
const Trigger = forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useAlertDialogContext();
    const triggerProps = {
      ...api.triggerProps,
      "data-scope": "alert-dialog",
    };
    const props = mergeProps(triggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

/** Backdrop -- AlertDialog에서는 클릭해도 닫히지 않는다 */
const Backdrop = forwardRef<HTMLDivElement, AlertDialogBackdropProps>(({ ...rest }, ref) => {
  const api = useAlertDialogContext();

  if (!api.isOpen) return null;

  const backdropProps = {
    ...api.backdropProps,
    "data-scope": "alert-dialog",
    // backdrop 클릭으로 닫히지 않도록 onClick을 제거
    onClick: undefined as unknown as () => void,
  };
  const props = mergeProps(backdropProps, rest as Record<string, unknown>);

  return <div ref={ref} {...props} />;
});

/** Positioner */
const Positioner = forwardRef<HTMLDivElement, AlertDialogPositionerProps>(
  ({ children, ...rest }, ref) => {
    const api = useAlertDialogContext();

    if (!api.isOpen) return null;

    const positionerProps = {
      ...api.positionerProps,
      "data-scope": "alert-dialog",
    };
    const props = mergeProps(positionerProps, rest as Record<string, unknown>);

    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

/** Content -- role="alertdialog" */
const Content = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ children, ...rest }, ref) => {
    const api = useAlertDialogContext();

    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        (api.contentRef as { current: HTMLDivElement | null }).current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as { current: HTMLDivElement | null }).current = node;
        }
      },
      [api.contentRef, ref],
    );

    const contentProps = {
      ...api.contentProps,
      "data-scope": "alert-dialog",
      role: "alertdialog" as const,
    };
    const props = mergeProps(contentProps, rest as Record<string, unknown>);

    return (
      <div ref={mergedRef} {...props}>
        {children}
      </div>
    );
  },
);

/** Title */
const Title = forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  ({ children, ...rest }, ref) => {
    const api = useAlertDialogContext();
    const titleProps = {
      ...api.titleProps,
      "data-scope": "alert-dialog",
    };
    const props = mergeProps(titleProps, rest as Record<string, unknown>);

    return (
      <h2 ref={ref} {...props}>
        {children}
      </h2>
    );
  },
);

/** Description */
const Description = forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  ({ children, ...rest }, ref) => {
    const api = useAlertDialogContext();
    const descriptionProps = {
      ...api.descriptionProps,
      "data-scope": "alert-dialog",
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
const CloseTrigger = forwardRef<HTMLButtonElement, AlertDialogCloseTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useAlertDialogContext();
    const closeTriggerProps = {
      ...api.closeTriggerProps,
      "data-scope": "alert-dialog",
    };
    const props = mergeProps(closeTriggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

export const AlertDialog = {
  Root,
  Trigger,
  Backdrop,
  Positioner,
  Content,
  Title,
  Description,
  CloseTrigger,
};
