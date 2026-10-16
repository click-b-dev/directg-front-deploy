/**
 * TreeView — WAI-ARIA Tree View 패턴 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 *
 * 트리 구조는 Branch/Item 컴포넌트 중첩으로 선언적으로 구성한다.
 * 등록된 노드 정보로 visible IDs를 머신에 전달한다.
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
import { useMachine } from "@/hooks";
import { useControllable } from "@/hooks";
import { useId } from "@/hooks";
import { createTreeViewMachine, connect } from "@/machines/tree-view";
import type {
  TreeViewRootProps,
  TreeViewTreeProps,
  TreeViewBranchProps,
  TreeViewBranchContentProps,
  TreeViewBranchControlProps,
  TreeViewBranchTriggerProps,
  TreeViewBranchTextProps,
  TreeViewBranchIndicatorProps,
  TreeViewBranchIndentGuideProps,
  TreeViewItemProps,
  TreeViewItemTextProps,
  TreeViewItemIndicatorProps,
  TreeViewContextValue,
  TreeViewBranchContextValue,
} from "./tree-view.types";

/* ─── React Context ─── */

const TreeViewContext = createContext<TreeViewContextValue | null>(null);

const useTreeViewContext = (): TreeViewContextValue => {
  const ctx = useContext(TreeViewContext);
  if (!ctx) throw new Error("TreeView compound components must be used within <TreeView.Root>");
  return ctx;
};

const BranchContext = createContext<TreeViewBranchContextValue | null>(null);

const useBranchContext = (): TreeViewBranchContextValue | null => {
  return useContext(BranchContext);
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, TreeViewRootProps>(
  (
    {
      expandedIds: controlledExpanded,
      defaultExpandedIds = [],
      onExpandedChange,
      selectedIds: controlledSelected,
      defaultSelectedIds = [],
      onSelectedChange,
      selectionMode = "single",
      children,
      ...props
    },
    ref,
  ) => {
    const id = useId();

    const [expandedIds, setExpandedIds] = useControllable({
      value: controlledExpanded,
      defaultValue: defaultExpandedIds,
      onChange: onExpandedChange,
    });

    const [selectedIds, setSelectedIds] = useControllable({
      value: controlledSelected,
      defaultValue: defaultSelectedIds,
      onChange: onSelectedChange,
    });

    const machine = useMemo(
      () =>
        createTreeViewMachine({
          id,
          expandedIds,
          selectedIds,
          selectionMode,
        }),
      [id, selectionMode],
    );

    const [state, ctx, send] = useMachine(machine);

    // 외부 expandedIds -> 머신 동기화
    useEffect(() => {
      send({ type: "SET_EXPANDED", ids: expandedIds });
    }, [expandedIds, send]);

    // 외부 selectedIds -> 머신 동기화
    useEffect(() => {
      send({ type: "SET_SELECTED", ids: selectedIds });
    }, [selectedIds, send]);

    // 머신 expandedIds -> 외부 동기화
    const prevExpanded = useRef(ctx.expandedIds);
    useEffect(() => {
      if (ctx.expandedIds !== prevExpanded.current) {
        prevExpanded.current = ctx.expandedIds;
        setExpandedIds(ctx.expandedIds);
      }
    }, [ctx.expandedIds, setExpandedIds]);

    // 머신 selectedIds -> 외부 동기화
    const prevSelected = useRef(ctx.selectedIds);
    useEffect(() => {
      if (ctx.selectedIds !== prevSelected.current) {
        prevSelected.current = ctx.selectedIds;
        setSelectedIds(ctx.selectedIds);
      }
    }, [ctx.selectedIds, setSelectedIds]);

    const api = connect(state, ctx, send);

    // 트리 구조 등록 시스템
    const childrenMapRef = useRef<Record<string, string[]>>({ __root__: [] });
    const parentMapRef = useRef<Record<string, string>>({});
    const branchIdsRef = useRef<string[]>([]);
    const registrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const flushRegistration = useCallback(() => {
      if (registrationTimer.current) clearTimeout(registrationTimer.current);
      registrationTimer.current = setTimeout(() => {
        // Compute visible IDs
        const visibleIds: string[] = [];
        const walk = (ids: string[]) => {
          for (const nodeId of ids) {
            visibleIds.push(nodeId);
            if (branchIdsRef.current.includes(nodeId) && ctx.expandedIds.includes(nodeId)) {
              walk(childrenMapRef.current[nodeId] ?? []);
            }
          }
        };
        walk(childrenMapRef.current["__root__"] ?? []);

        send({
          type: "REGISTER_TREE",
          childrenMap: { ...childrenMapRef.current },
          parentMap: { ...parentMapRef.current },
          branchIds: [...branchIdsRef.current],
          visibleIds,
        });
      }, 0);
    }, [ctx.expandedIds, send]);

    const registerBranch = useCallback(
      (nodeId: string, parentId: string, childIds: string[]) => {
        const parentKey = parentId || "__root__";
        if (!childrenMapRef.current[parentKey]) {
          childrenMapRef.current[parentKey] = [];
        }
        if (!childrenMapRef.current[parentKey]!.includes(nodeId)) {
          childrenMapRef.current[parentKey]!.push(nodeId);
        }
        childrenMapRef.current[nodeId] = childIds;
        parentMapRef.current[nodeId] = parentKey;
        if (!branchIdsRef.current.includes(nodeId)) {
          branchIdsRef.current.push(nodeId);
        }
        flushRegistration();
      },
      [flushRegistration],
    );

    const registerItem = useCallback(
      (nodeId: string, parentId: string) => {
        const parentKey = parentId || "__root__";
        if (!childrenMapRef.current[parentKey]) {
          childrenMapRef.current[parentKey] = [];
        }
        if (!childrenMapRef.current[parentKey]!.includes(nodeId)) {
          childrenMapRef.current[parentKey]!.push(nodeId);
        }
        parentMapRef.current[nodeId] = parentKey;
        flushRegistration();
      },
      [flushRegistration],
    );

    const unregisterNode = useCallback(
      (nodeId: string) => {
        const parent = parentMapRef.current[nodeId];
        if (parent && childrenMapRef.current[parent]) {
          childrenMapRef.current[parent] = childrenMapRef.current[parent]!.filter(
            (id) => id !== nodeId,
          );
        }
        delete childrenMapRef.current[nodeId];
        delete parentMapRef.current[nodeId];
        branchIdsRef.current = branchIdsRef.current.filter((id) => id !== nodeId);
        flushRegistration();
      },
      [flushRegistration],
    );

    // Re-compute visible IDs when expandedIds change
    useEffect(() => {
      flushRegistration();
    }, [ctx.expandedIds, flushRegistration]);

    const ctxValue = useMemo<TreeViewContextValue>(
      () => ({
        getRootProps: api.getRootProps,
        getTreeProps: api.getTreeProps,
        getBranchProps: api.getBranchProps,
        getBranchContentProps: api.getBranchContentProps,
        getBranchControlProps: api.getBranchControlProps,
        getBranchTriggerProps: api.getBranchTriggerProps,
        getBranchTextProps: api.getBranchTextProps,
        getBranchIndicatorProps: api.getBranchIndicatorProps,
        getBranchIndentGuideProps: api.getBranchIndentGuideProps,
        getItemProps: api.getItemProps,
        getItemTextProps: api.getItemTextProps,
        getItemIndicatorProps: api.getItemIndicatorProps,
        registerBranch,
        registerItem,
        unregisterNode,
      }),
      [api, registerBranch, registerItem, unregisterNode],
    );

    const rootProps = api.getRootProps();

    return (
      <TreeViewContext.Provider value={ctxValue}>
        <div ref={ref} {...rootProps} {...props}>
          {children}
        </div>
      </TreeViewContext.Provider>
    );
  },
);

/* ─── Tree ─── */

export const Tree = forwardRef<HTMLDivElement, TreeViewTreeProps>(({ children, ...props }, ref) => {
  const ctx = useTreeViewContext();
  const treeProps = ctx.getTreeProps();

  return (
    <div ref={ref} {...(treeProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
      {children}
    </div>
  );
});

/* ─── Branch ─── */

export const Branch = forwardRef<HTMLDivElement, TreeViewBranchProps>(
  ({ id: branchId, depth: depthProp, children, ...props }, ref) => {
    const ctx = useTreeViewContext();
    const parentBranch = useBranchContext();
    const depth = depthProp ?? (parentBranch ? parentBranch.depth + 1 : 0);

    const branchProps = ctx.getBranchProps({ id: branchId, depth });

    // Register branch (children are collected via sub-components)
    useEffect(() => {
      ctx.registerBranch(branchId, parentBranch?.id ?? "", []);
      return () => ctx.unregisterNode(branchId);
    }, [branchId, parentBranch?.id]);

    const branchCtx = useMemo<TreeViewBranchContextValue>(
      () => ({ id: branchId, depth }),
      [branchId, depth],
    );

    return (
      <BranchContext.Provider value={branchCtx}>
        <div ref={ref} {...(branchProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
          {children}
        </div>
      </BranchContext.Provider>
    );
  },
);

/* ─── BranchControl ─── */

export const BranchControl = forwardRef<HTMLDivElement, TreeViewBranchControlProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTreeViewContext();
    const branch = useBranchContext();
    if (!branch) throw new Error("BranchControl must be inside a Branch");

    const controlProps = ctx.getBranchControlProps({ id: branch.id });

    return (
      <div ref={ref} {...(controlProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── BranchTrigger ─── */

export const BranchTrigger = forwardRef<HTMLButtonElement, TreeViewBranchTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTreeViewContext();
    const branch = useBranchContext();
    if (!branch) throw new Error("BranchTrigger must be inside a Branch");

    const triggerProps = ctx.getBranchTriggerProps({ id: branch.id });

    return (
      <button
        ref={ref}
        {...(triggerProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── BranchText ─── */

export const BranchText = forwardRef<HTMLSpanElement, TreeViewBranchTextProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTreeViewContext();
    const textProps = ctx.getBranchTextProps();

    return (
      <span ref={ref} {...(textProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children}
      </span>
    );
  },
);

/* ─── BranchIndicator ─── */

export const BranchIndicator = forwardRef<HTMLSpanElement, TreeViewBranchIndicatorProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTreeViewContext();
    const branch = useBranchContext();
    if (!branch) throw new Error("BranchIndicator must be inside a Branch");

    const indicatorProps = ctx.getBranchIndicatorProps({ id: branch.id });

    return (
      <span ref={ref} {...(indicatorProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children}
      </span>
    );
  },
);

/* ─── BranchContent ─── */

export const BranchContent = forwardRef<HTMLDivElement, TreeViewBranchContentProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTreeViewContext();
    const branch = useBranchContext();
    if (!branch) throw new Error("BranchContent must be inside a Branch");

    const contentProps = ctx.getBranchContentProps({ id: branch.id });

    return (
      <div ref={ref} {...(contentProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── BranchIndentGuide ─── */

export const BranchIndentGuide = forwardRef<HTMLSpanElement, TreeViewBranchIndentGuideProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTreeViewContext();
    const branch = useBranchContext();
    const depth = branch?.depth ?? 0;
    const guideProps = ctx.getBranchIndentGuideProps({ depth });

    return (
      <span ref={ref} {...(guideProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children}
      </span>
    );
  },
);

/* ─── Item (leaf node) ─── */

export const Item = forwardRef<HTMLDivElement, TreeViewItemProps>(
  ({ id: itemId, depth: depthProp, children, ...props }, ref) => {
    const ctx = useTreeViewContext();
    const parentBranch = useBranchContext();
    const depth = depthProp ?? (parentBranch ? parentBranch.depth + 1 : 0);

    const itemProps = ctx.getItemProps({ id: itemId, depth });

    // Register leaf item
    useEffect(() => {
      ctx.registerItem(itemId, parentBranch?.id ?? "");
      return () => ctx.unregisterNode(itemId);
    }, [itemId, parentBranch?.id]);

    return (
      <div ref={ref} {...(itemProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── ItemText ─── */

export const ItemText = forwardRef<HTMLSpanElement, TreeViewItemTextProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTreeViewContext();
    const textProps = ctx.getItemTextProps();

    return (
      <span ref={ref} {...(textProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children}
      </span>
    );
  },
);

/* ─── ItemIndicator ─── */

export const ItemIndicator = forwardRef<HTMLSpanElement, TreeViewItemIndicatorProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTreeViewContext();

    // Get the parent item ID from closest [data-value] element
    const indicatorRef = useRef<HTMLSpanElement>(null);
    const parentValue =
      indicatorRef.current?.closest("[data-value]")?.getAttribute("data-value") ?? "";
    const indicatorProps = ctx.getItemIndicatorProps({ id: parentValue });

    return (
      <span
        ref={(node) => {
          (indicatorRef as React.MutableRefObject<HTMLSpanElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLSpanElement | null>).current = node;
        }}
        {...(indicatorProps as React.HTMLAttributes<HTMLSpanElement>)}
        {...props}
      >
        {children}
      </span>
    );
  },
);
