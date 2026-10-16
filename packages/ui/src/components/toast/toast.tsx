/**
 * Toast — WAI-ARIA Alert 패턴 + 자동 닫힘 알림 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useMachine, useId } from "@/hooks";
import { createToastGroupMachine, connect } from "@/machines/toast";
import type { ToastContext as ToastCtxType } from "@/machines/toast";
import type {
  ToastGroupRootProps,
  ToastRootProps,
  ToastTitleProps,
  ToastDescriptionProps,
  ToastActionTriggerProps,
  ToastCloseTriggerProps,
  ToastGroupContextValue,
  ToastContextValue,
  ToasterApi,
} from "./toast.types";

/* ─── React Context ─── */

const ToastGroupCtx = createContext<ToastGroupContextValue | null>(null);
const ToastItemCtx = createContext<ToastContextValue | null>(null);

const useToastGroupContext = (): ToastGroupContextValue => {
  const ctx = useContext(ToastGroupCtx);
  if (!ctx) throw new Error("Toast compound components must be used within <Toast.Group>");
  return ctx;
};

const useToastItemContext = (): ToastContextValue => {
  const ctx = useContext(ToastItemCtx);
  if (!ctx) throw new Error("Toast item components must be used within <Toast.Root>");
  return ctx;
};

/* ─── Toaster (외부 API 제공용) ─── */

let globalToasterApi: ToasterApi | null = null;

/** 컴포넌트 외부에서 토스트를 생성하기 위한 Toaster 객체 */
export const Toaster: ToasterApi = {
  create(options) {
    globalToasterApi?.create(options);
  },
  dismiss(id) {
    globalToasterApi?.dismiss(id);
  },
  dismissAll() {
    globalToasterApi?.dismissAll();
  },
};

/* ─── Group (Toaster Container) ─── */

export const Group = forwardRef<HTMLDivElement, ToastGroupRootProps>((props, ref) => {
  const {
    placement = "bottom-end",
    max = 0,
    defaultDuration = 5000,
    children,
    ...restProps
  } = props;

  const id = useId();

  const machine = useMemo(
    () =>
      createToastGroupMachine({
        id,
        placement,
        max,
        defaultDuration,
      }),
    [id],
  );

  const [state, ctx, send] = useMachine(machine);

  // 외부 props -> 머신 동기화
  useEffect(() => {
    send({
      type: "SET_CONTEXT",
      context: { placement, max, defaultDuration },
    });
  }, [placement, max, defaultDuration, send]);

  const api = connect(state, ctx, send);

  // 자동 닫힘 타이머 관리
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const scheduleTimer = useCallback(
    (toast: ToastCtxType) => {
      if (toast.data.duration <= 0 || toast.paused) return;

      const existing = timersRef.current.get(toast.data.id);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        send({ type: "DISMISS_TOAST", id: toast.data.id });
        timersRef.current.delete(toast.data.id);
      }, toast.remaining);

      timersRef.current.set(toast.data.id, timer);
    },
    [send],
  );

  // 토스트 목록 변경 시 타이머 관리
  useEffect(() => {
    const activeIds = new Set<string>();

    for (const toast of ctx.toasts) {
      activeIds.add(toast.data.id);

      if (toast.remaining <= 0) {
        // exiting 상태 — 일정 시간 후 제거
        const existing = timersRef.current.get(toast.data.id);
        if (existing) clearTimeout(existing);

        const removeTimer = setTimeout(() => {
          toast.data.onClose?.();
          send({ type: "REMOVE_TOAST", id: toast.data.id });
          timersRef.current.delete(toast.data.id);
        }, 300); // exit 애니메이션 시간

        timersRef.current.set(toast.data.id, removeTimer);
        continue;
      }

      if (toast.paused) {
        // 일시정지 — 타이머 제거
        const existing = timersRef.current.get(toast.data.id);
        if (existing) {
          clearTimeout(existing);
          timersRef.current.delete(toast.data.id);
        }
        continue;
      }

      scheduleTimer(toast);
    }

    // 제거된 토스트의 타이머 정리
    for (const [timerId] of timersRef.current) {
      if (!activeIds.has(timerId)) {
        clearTimeout(timersRef.current.get(timerId));
        timersRef.current.delete(timerId);
      }
    }
  }, [ctx.toasts, scheduleTimer, send]);

  // Cleanup
  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer);
      }
      timersRef.current.clear();
    };
  }, []);

  // 외부 API 등록
  const toasterApi = useMemo<ToasterApi>(
    () => ({
      create(options) {
        api.addToast(options);
      },
      dismiss(toastId) {
        api.dismissToast(toastId);
      },
      dismissAll() {
        api.dismissAll();
      },
    }),
    [api],
  );

  useEffect(() => {
    globalToasterApi = toasterApi;
    return () => {
      if (globalToasterApi === toasterApi) {
        globalToasterApi = null;
      }
    };
  }, [toasterApi]);

  const ctxValue = useMemo<ToastGroupContextValue>(
    () => ({
      toasts: ctx.toasts,
      placement: ctx.placement,
      api: toasterApi,
    }),
    [ctx.toasts, ctx.placement, toasterApi],
  );

  const groupProps = api.getGroupProps();

  return (
    <ToastGroupCtx.Provider value={ctxValue}>
      <div ref={ref} {...(groupProps as React.HTMLAttributes<HTMLDivElement>)} {...restProps}>
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {ctx.toasts.map((toast) => (
            <ToastRenderer key={toast.data.id} toast={toast} api={api} />
          ))}
        </ol>
        {children}
      </div>
    </ToastGroupCtx.Provider>
  );
});

/** 개별 Toast를 렌더링하는 내부 래퍼 (children으로 사용자 정의 가능) */
const ToastRenderer = ({
  toast,
  api,
}: {
  toast: ToastCtxType;
  api: ReturnType<typeof connect>;
}) => {
  const ctxValue = useMemo<ToastContextValue>(
    () => ({
      toast,
      getToastProps: () => api.getToastProps(toast),
      getToastTitleProps: () => api.getToastTitleProps(toast),
      getToastDescriptionProps: () => api.getToastDescriptionProps(toast),
      getToastActionTriggerProps: () => api.getToastActionTriggerProps(toast),
      getToastCloseTriggerProps: () => api.getToastCloseTriggerProps(toast),
    }),
    [toast, api],
  );

  const toastProps = api.getToastProps(toast);

  return (
    <ToastItemCtx.Provider value={ctxValue}>
      <li {...(toastProps as React.LiHTMLAttributes<HTMLLIElement>)}>
        {toast.data.title && (
          <div {...(api.getToastTitleProps(toast) as React.HTMLAttributes<HTMLDivElement>)}>
            {toast.data.title}
          </div>
        )}
        {toast.data.description && (
          <div {...(api.getToastDescriptionProps(toast) as React.HTMLAttributes<HTMLDivElement>)}>
            {toast.data.description}
          </div>
        )}
        {toast.data.actionLabel && (
          <button
            {...(api.getToastActionTriggerProps(
              toast,
            ) as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          >
            {toast.data.actionLabel}
          </button>
        )}
        <button
          {...(api.getToastCloseTriggerProps(
            toast,
          ) as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          aria-label="Close notification"
        >
          &times;
        </button>
      </li>
    </ToastItemCtx.Provider>
  );
};

/* ─── Root (사용자 정의 토스트 렌더링용) ─── */

export const Root = forwardRef<HTMLLIElement, ToastRootProps>(
  ({ toast, children, ...props }, ref) => {
    const groupCtx = useToastGroupContext();
    const groupId = useId();

    const machine = useMemo(
      () =>
        createToastGroupMachine({
          id: groupId,
          toasts: [toast],
        }),
      [groupId, toast],
    );

    const [gState, , gSend] = useMachine(machine);
    const gApi = connect(gState, { ...machine.initialContext, toasts: [toast] }, gSend);

    const ctxValue = useMemo<ToastContextValue>(
      () => ({
        toast,
        getToastProps: () => gApi.getToastProps(toast),
        getToastTitleProps: () => gApi.getToastTitleProps(toast),
        getToastDescriptionProps: () => gApi.getToastDescriptionProps(toast),
        getToastActionTriggerProps: () => gApi.getToastActionTriggerProps(toast),
        getToastCloseTriggerProps: () => {
          const closeProps = gApi.getToastCloseTriggerProps(toast);
          // Group의 dismiss를 직접 호출하도록 오버라이드
          return {
            ...closeProps,
            onClick: () => groupCtx.api.dismiss(toast.data.id),
          };
        },
      }),
      [toast, gApi, groupCtx.api],
    );

    const toastProps = gApi.getToastProps(toast);

    return (
      <ToastItemCtx.Provider value={ctxValue}>
        <li ref={ref} {...(toastProps as React.LiHTMLAttributes<HTMLLIElement>)} {...props}>
          {children}
        </li>
      </ToastItemCtx.Provider>
    );
  },
);

/* ─── Title ─── */

export const Title = forwardRef<HTMLDivElement, ToastTitleProps>(({ children, ...props }, ref) => {
  const ctx = useToastItemContext();
  const titleProps = ctx.getToastTitleProps();

  return (
    <div ref={ref} {...(titleProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
      {children}
    </div>
  );
});

/* ─── Description ─── */

export const Description = forwardRef<HTMLDivElement, ToastDescriptionProps>(
  ({ children, ...props }, ref) => {
    const ctx = useToastItemContext();
    const descProps = ctx.getToastDescriptionProps();

    return (
      <div ref={ref} {...(descProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── ActionTrigger ─── */

export const ActionTrigger = forwardRef<HTMLButtonElement, ToastActionTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useToastItemContext();
    const actionProps = ctx.getToastActionTriggerProps();

    return (
      <button
        ref={ref}
        {...(actionProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── CloseTrigger ─── */

export const CloseTrigger = forwardRef<HTMLButtonElement, ToastCloseTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useToastItemContext();
    const closeProps = ctx.getToastCloseTriggerProps();

    return (
      <button
        ref={ref}
        {...(closeProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
