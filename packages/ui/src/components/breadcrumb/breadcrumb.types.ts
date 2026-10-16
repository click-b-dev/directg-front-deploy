/**
 * Breadcrumb React 컴포넌트 타입 정의
 * WAI-ARIA Breadcrumb 패턴
 */

import type { ComponentPropsWithRef, ReactNode } from "react";

export interface BreadcrumbRootProps extends ComponentPropsWithRef<"nav"> {
  /** separator between items (default: "/") */
  separator?: ReactNode;
}

export interface BreadcrumbListProps extends ComponentPropsWithRef<"ol"> {
  children?: ReactNode;
}

export interface BreadcrumbItemProps extends ComponentPropsWithRef<"li"> {
  children?: ReactNode;
}

export interface BreadcrumbLinkProps extends ComponentPropsWithRef<"a"> {
  children?: ReactNode;
}

export interface BreadcrumbPageProps extends ComponentPropsWithRef<"span"> {
  children?: ReactNode;
}

export interface BreadcrumbSeparatorProps extends ComponentPropsWithRef<"li"> {
  children?: ReactNode;
}

export interface BreadcrumbContextValue {
  separator: ReactNode;
}
