/**
 * Pagination — 페이지 네비게이션 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine } from "@/hooks";
import { useControllable } from "@/hooks";
import { useId } from "@/hooks";
import { createPaginationMachine, connect } from "@/machines/pagination";
import type {
  PaginationRootProps,
  PaginationPrevTriggerProps,
  PaginationNextTriggerProps,
  PaginationItemProps,
  PaginationEllipsisProps,
  PaginationContextValue,
} from "./pagination.types";

/* ─── React Context ─── */

const PaginationContext = createContext<PaginationContextValue | null>(null);

const usePaginationContext = (): PaginationContextValue => {
  const ctx = useContext(PaginationContext);
  if (!ctx) throw new Error("Pagination compound components must be used within <Pagination.Root>");
  return ctx;
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLElement, PaginationRootProps>(
  (
    {
      count,
      pageSize = 10,
      page: controlledPage,
      defaultPage = 1,
      onPageChange,
      siblingCount = 1,
      children,
      ...props
    },
    ref,
  ) => {
    const id = useId();

    const [page, setPage] = useControllable({
      value: controlledPage,
      defaultValue: defaultPage,
      onChange: onPageChange,
    });

    const machine = useMemo(
      () =>
        createPaginationMachine({
          id,
          count,
          pageSize,
          page,
          siblingCount,
        }),
      [id],
    );

    const [state, ctx, send] = useMachine(machine);

    // 외부 page -> 머신 동기화
    useEffect(() => {
      send({ type: "SET_PAGE", page });
    }, [page, send]);

    // 외부 count -> 머신 동기화
    useEffect(() => {
      send({ type: "SET_COUNT", count });
    }, [count, send]);

    // 외부 pageSize -> 머신 동기화
    useEffect(() => {
      send({ type: "SET_PAGE_SIZE", pageSize });
    }, [pageSize, send]);

    // 머신 page -> 외부 동기화
    const prevMachinePage = useRef(ctx.page);
    useEffect(() => {
      if (ctx.page !== prevMachinePage.current) {
        prevMachinePage.current = ctx.page;
        setPage(ctx.page);
      }
    }, [ctx.page, setPage]);

    const api = connect(state, ctx, send);

    const ctxValue = useMemo<PaginationContextValue>(
      () => ({
        page: ctx.page,
        totalPages: api.totalPages,
        pages: api.pages,
        isFirstPage: api.isFirstPage,
        isLastPage: api.isLastPage,
        setPage: api.setPage,
        getRootProps: api.getRootProps,
        getPrevTriggerProps: api.getPrevTriggerProps,
        getNextTriggerProps: api.getNextTriggerProps,
        getItemProps: api.getItemProps,
        getEllipsisProps: api.getEllipsisProps,
      }),
      [ctx.page, api],
    );

    const rootProps = api.getRootProps();

    return (
      <PaginationContext.Provider value={ctxValue}>
        <nav
          ref={ref as React.Ref<HTMLElement>}
          {...(rootProps as React.HTMLAttributes<HTMLElement>)}
          {...props}
        >
          {children}
        </nav>
      </PaginationContext.Provider>
    );
  },
);

/* ─── PrevTrigger ─── */

export const PrevTrigger = forwardRef<HTMLButtonElement, PaginationPrevTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = usePaginationContext();
    const prevProps = ctx.getPrevTriggerProps();

    return (
      <button
        ref={ref}
        {...(prevProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── NextTrigger ─── */

export const NextTrigger = forwardRef<HTMLButtonElement, PaginationNextTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = usePaginationContext();
    const nextProps = ctx.getNextTriggerProps();

    return (
      <button
        ref={ref}
        {...(nextProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── Item ─── */

export const Item = forwardRef<HTMLButtonElement, PaginationItemProps>(
  ({ value, children, ...props }, ref) => {
    const ctx = usePaginationContext();
    const itemProps = ctx.getItemProps({ value });

    return (
      <button
        ref={ref}
        {...(itemProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children ?? value}
      </button>
    );
  },
);

/* ─── Ellipsis ─── */

export const Ellipsis = forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  ({ index, children, ...props }, ref) => {
    const ctx = usePaginationContext();
    const ellipsisProps = ctx.getEllipsisProps({ index });

    return (
      <span ref={ref} {...(ellipsisProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children ?? "\u2026"}
      </span>
    );
  },
);
