/**
 * Breadcrumb — WAI-ARIA Breadcrumb 패턴 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

/**
 * [Machine: 불필요] WAI-ARIA Breadcrumb 패턴이나 네비게이션 링크 목록으로 상태 전이 없음
 */

import { createContext, forwardRef, useContext } from "react";
import type {
  BreadcrumbRootProps,
  BreadcrumbListProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbPageProps,
  BreadcrumbSeparatorProps,
  BreadcrumbContextValue,
} from "./breadcrumb.types";

const SCOPE = "breadcrumb";

/* ─── React Context ─── */

const BreadcrumbContext = createContext<BreadcrumbContextValue>({ separator: "/" });

const useBreadcrumbContext = (): BreadcrumbContextValue => {
  return useContext(BreadcrumbContext);
};

/* ─── Root ─── */

const Root = forwardRef<HTMLElement, BreadcrumbRootProps>(
  ({ separator = "/", children, ...props }, ref) => {
    return (
      <BreadcrumbContext.Provider value={{ separator }}>
        <nav ref={ref} aria-label="Breadcrumb" data-scope={SCOPE} data-part="root" {...props}>
          {children}
        </nav>
      </BreadcrumbContext.Provider>
    );
  },
);

Root.displayName = "Breadcrumb.Root";

/* ─── List ─── */

const List = forwardRef<HTMLOListElement, BreadcrumbListProps>(({ children, ...props }, ref) => {
  return (
    <ol ref={ref} data-scope={SCOPE} data-part="list" {...props}>
      {children}
    </ol>
  );
});

List.displayName = "Breadcrumb.List";

/* ─── Item ─── */

const Item = forwardRef<HTMLLIElement, BreadcrumbItemProps>(({ children, ...props }, ref) => {
  return (
    <li ref={ref} data-scope={SCOPE} data-part="item" {...props}>
      {children}
    </li>
  );
});

Item.displayName = "Breadcrumb.Item";

/* ─── Link ─── */

const Link = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(({ children, ...props }, ref) => {
  return (
    <a ref={ref} data-scope={SCOPE} data-part="link" {...props}>
      {children}
    </a>
  );
});

Link.displayName = "Breadcrumb.Link";

/* ─── Page (current item) ─── */

const Page = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(({ children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      role="link"
      aria-current="page"
      aria-disabled="true"
      data-scope={SCOPE}
      data-part="page"
      {...props}
    >
      {children}
    </span>
  );
});

Page.displayName = "Breadcrumb.Page";

/* ─── Separator ─── */

const Separator = forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  ({ children, ...props }, ref) => {
    const ctx = useBreadcrumbContext();

    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        data-scope={SCOPE}
        data-part="separator"
        {...props}
      >
        {children ?? ctx.separator}
      </li>
    );
  },
);

Separator.displayName = "Breadcrumb.Separator";

export const Breadcrumb = { Root, List, Item, Link, Page, Separator };
