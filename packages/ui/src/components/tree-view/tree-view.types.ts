/**
 * TreeView React 컴포넌트 타입 정의
 */

export interface TreeViewRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 확장된 아이템 ID (controlled) */
  expandedIds?: string[];
  /** 기본 확장 아이템 ID (uncontrolled) */
  defaultExpandedIds?: string[];
  /** 확장 상태 변경 콜백 */
  onExpandedChange?: (ids: string[]) => void;
  /** 선택된 아이템 ID (controlled) */
  selectedIds?: string[];
  /** 기본 선택 아이템 ID (uncontrolled) */
  defaultSelectedIds?: string[];
  /** 선택 상태 변경 콜백 */
  onSelectedChange?: (ids: string[]) => void;
  /** 선택 모드 */
  selectionMode?: "single" | "multiple";
  children?: React.ReactNode;
}

export interface TreeViewTreeProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface TreeViewBranchProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 브랜치 ID (필수) */
  id: string;
  /** 깊이 (자동 계산 가능) */
  depth?: number;
  children?: React.ReactNode;
}

export interface TreeViewBranchContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface TreeViewBranchControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface TreeViewBranchTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface TreeViewBranchTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export interface TreeViewBranchIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export interface TreeViewBranchIndentGuideProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export interface TreeViewItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 아이템 ID (필수) */
  id: string;
  /** 깊이 (자동 계산 가능) */
  depth?: number;
  children?: React.ReactNode;
}

export interface TreeViewItemTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export interface TreeViewItemIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

/** 내부 Context */
export interface TreeViewContextValue {
  getRootProps: () => Record<string, unknown>;
  getTreeProps: () => Record<string, unknown>;
  getBranchProps: (props: { id: string; depth?: number }) => Record<string, unknown>;
  getBranchContentProps: (props: { id: string }) => Record<string, unknown>;
  getBranchControlProps: (props: { id: string }) => Record<string, unknown>;
  getBranchTriggerProps: (props: { id: string }) => Record<string, unknown>;
  getBranchTextProps: () => Record<string, unknown>;
  getBranchIndicatorProps: (props: { id: string }) => Record<string, unknown>;
  getBranchIndentGuideProps: (props: { depth?: number }) => Record<string, unknown>;
  getItemProps: (props: { id: string; depth?: number }) => Record<string, unknown>;
  getItemTextProps: () => Record<string, unknown>;
  getItemIndicatorProps: (props: { id: string }) => Record<string, unknown>;
  registerBranch: (id: string, parentId: string, childIds: string[]) => void;
  registerItem: (id: string, parentId: string) => void;
  unregisterNode: (id: string) => void;
}

/** Branch 내부 Context */
export interface TreeViewBranchContextValue {
  id: string;
  depth: number;
}
