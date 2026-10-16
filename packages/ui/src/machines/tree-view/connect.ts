/**
 * TreeView connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, ariaAttr } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { TreeViewState, TreeViewContext, TreeViewEvent } from "./types";
import { SCOPE, treeViewAnatomy } from "./anatomy";

function getItemDomId(ctx: TreeViewContext, itemId: string): string {
  return `${ctx.id}:item:${itemId}`;
}

function getTreeId(ctx: TreeViewContext): string {
  return `${ctx.id}:tree`;
}

export function connect(state: TreeViewState, ctx: TreeViewContext, send: Send<TreeViewEvent>) {
  const isFocused = state === "focused";

  return {
    /** 확장된 ID 목록 */
    expandedIds: ctx.expandedIds,

    /** 선택된 ID 목록 */
    selectedIds: ctx.selectedIds,

    /** 포커스된 ID */
    focusedId: ctx.focusedId,

    /** 확장 상태 설정 */
    setExpandedIds(ids: string[]) {
      send({ type: "SET_EXPANDED", ids });
    },

    /** 선택 상태 설정 */
    setSelectedIds(ids: string[]) {
      send({ type: "SET_SELECTED", ids });
    },

    /** Root 속성 */
    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": treeViewAnatomy.root,
        "data-focus": dataAttr(isFocused),
      };
    },

    /** Tree (role="tree") 속성 */
    getTreeProps() {
      return {
        id: getTreeId(ctx),
        role: "tree" as const,
        "aria-label": "Tree",
        "data-scope": SCOPE,
        "data-part": treeViewAnatomy.tree,
        "data-focus": dataAttr(isFocused),
        onFocus() {
          send({ type: "FOCUS_IN" });
        },
        onBlur(e: React.FocusEvent) {
          const tree = e.currentTarget;
          if (!tree.contains(e.relatedTarget as Node)) {
            send({ type: "FOCUS_OUT" });
          }
        },
        onKeyDown(e: React.KeyboardEvent) {
          const handled = [
            "ArrowDown",
            "ArrowUp",
            "ArrowRight",
            "ArrowLeft",
            "Home",
            "End",
            "Enter",
            " ",
            "*",
          ];
          if (handled.includes(e.key)) {
            e.preventDefault();
          }
          send({ type: "KEY_DOWN", key: e.key });
        },
      };
    },

    /** Branch 래퍼 속성 */
    getBranchProps(props: { id: string; depth?: number }) {
      const isExpanded = ctx.expandedIds.includes(props.id);
      const isSelected = ctx.selectedIds.includes(props.id);

      return {
        "data-scope": SCOPE,
        "data-part": treeViewAnatomy.branch,
        "data-state": isExpanded ? "open" : "closed",
        "data-selected": dataAttr(isSelected),
        "data-value": props.id,
        "data-depth": props.depth,
      };
    },

    /** Branch control (클릭 가능 영역) 속성 */
    getBranchControlProps(props: { id: string }) {
      const isExpanded = ctx.expandedIds.includes(props.id);
      const isSelected = ctx.selectedIds.includes(props.id);
      const isFocusedItem = ctx.focusedId === props.id;

      return {
        id: getItemDomId(ctx, props.id),
        role: "treeitem" as const,
        tabIndex: isFocusedItem ? 0 : -1,
        "aria-expanded": ariaAttr(isExpanded),
        "aria-selected": ariaAttr(isSelected),
        "data-scope": SCOPE,
        "data-part": treeViewAnatomy.branchControl,
        "data-state": isExpanded ? "open" : "closed",
        "data-selected": dataAttr(isSelected),
        "data-focus": dataAttr(isFocusedItem),
        "data-value": props.id,
        onClick() {
          send({ type: "ITEM_CLICK", id: props.id });
        },
      };
    },

    /** Branch trigger (expand/collapse 토글 버튼) 속성 */
    getBranchTriggerProps(props: { id: string }) {
      const isExpanded = ctx.expandedIds.includes(props.id);

      return {
        type: "button" as const,
        tabIndex: -1,
        "aria-label": isExpanded ? "Collapse" : "Expand",
        "data-scope": SCOPE,
        "data-part": treeViewAnatomy.branchTrigger,
        "data-state": isExpanded ? "open" : "closed",
        onClick(e: React.MouseEvent) {
          e.stopPropagation();
          send({ type: "BRANCH_TOGGLE", id: props.id });
        },
      };
    },

    /** Branch 텍스트 속성 */
    getBranchTextProps() {
      return {
        "data-scope": SCOPE,
        "data-part": treeViewAnatomy.branchText,
      };
    },

    /** Branch indicator (펼침 아이콘) 속성 */
    getBranchIndicatorProps(props: { id: string }) {
      const isExpanded = ctx.expandedIds.includes(props.id);

      return {
        "aria-hidden": "true" as const,
        "data-scope": SCOPE,
        "data-part": treeViewAnatomy.branchIndicator,
        "data-state": isExpanded ? "open" : "closed",
      };
    },

    /** Branch content (자식 그룹) 속성 */
    getBranchContentProps(props: { id: string }) {
      const isExpanded = ctx.expandedIds.includes(props.id);

      return {
        role: "group" as const,
        hidden: !isExpanded,
        "data-scope": SCOPE,
        "data-part": treeViewAnatomy.branchContent,
        "data-state": isExpanded ? "open" : "closed",
      };
    },

    /** Branch indent guide 속성 */
    getBranchIndentGuideProps(props: { depth?: number }) {
      return {
        "aria-hidden": "true" as const,
        "data-scope": SCOPE,
        "data-part": treeViewAnatomy.branchIndentGuide,
        "data-depth": props.depth,
      };
    },

    /** Leaf item 속성 */
    getItemProps(props: { id: string; depth?: number }) {
      const isSelected = ctx.selectedIds.includes(props.id);
      const isFocusedItem = ctx.focusedId === props.id;

      return {
        id: getItemDomId(ctx, props.id),
        role: "treeitem" as const,
        tabIndex: isFocusedItem ? 0 : -1,
        "aria-selected": ariaAttr(isSelected),
        "data-scope": SCOPE,
        "data-part": treeViewAnatomy.item,
        "data-selected": dataAttr(isSelected),
        "data-focus": dataAttr(isFocusedItem),
        "data-value": props.id,
        "data-depth": props.depth,
        onClick() {
          send({ type: "ITEM_CLICK", id: props.id });
        },
      };
    },

    /** 아이템 텍스트 속성 */
    getItemTextProps() {
      return {
        "data-scope": SCOPE,
        "data-part": treeViewAnatomy.itemText,
      };
    },

    /** 아이템 선택 인디케이터 속성 */
    getItemIndicatorProps(props: { id: string }) {
      const isSelected = ctx.selectedIds.includes(props.id);
      return {
        "aria-hidden": "true" as const,
        hidden: !isSelected,
        "data-scope": SCOPE,
        "data-part": treeViewAnatomy.itemIndicator,
        "data-state": isSelected ? "checked" : "unchecked",
      };
    },
  };
}
