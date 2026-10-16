/**
 * TagsInput connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, ariaAttr, composeEventHandlers } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { TagsInputState, TagsInputContext, TagsInputEvent } from "./types";
import { SCOPE, tagsInputAnatomy } from "./anatomy";

export interface TagsInputApi {
  value: string[];
  inputValue: string;
  count: number;
  isAtMax: boolean;
  isEditing: boolean;
  editedTagIndex: number;
  addTag(value: string): void;
  removeTag(index: number): void;
  clearAll(): void;
  setValue(value: string[]): void;
  getRootProps(): Record<string, unknown>;
  getLabelProps(): Record<string, unknown>;
  getControlProps(): Record<string, unknown>;
  getInputProps(): Record<string, unknown>;
  getItemProps(props: { index: number; value: string }): Record<string, unknown>;
  getItemTextProps(props: { index: number }): Record<string, unknown>;
  getItemDeleteTriggerProps(props: { index: number }): Record<string, unknown>;
  getItemPreviewProps(props: { index: number }): Record<string, unknown>;
  getItemInputProps(props: { index: number }): Record<string, unknown>;
  getClearTriggerProps(): Record<string, unknown>;
  getHiddenInputProps(): Record<string, unknown>;
}

export function connect(
  state: TagsInputState,
  ctx: TagsInputContext,
  send: Send<TagsInputEvent>,
): TagsInputApi {
  const isFocused = state === "focused" || state === "editing";
  const isEditing = state === "editing";
  const isAtMax = ctx.max > 0 && ctx.value.length >= ctx.max;

  function getInputId(): string {
    return `${ctx.id}:input`;
  }

  function getLabelId(): string {
    return `${ctx.id}:label`;
  }

  function getItemId(index: number): string {
    return `${ctx.id}:item:${index}`;
  }

  function getItemInputId(index: number): string {
    return `${ctx.id}:item-input:${index}`;
  }

  return {
    value: ctx.value,
    inputValue: ctx.inputValue,
    count: ctx.value.length,
    isAtMax,
    isEditing,
    editedTagIndex: ctx.editedTagIndex,

    addTag(value: string) {
      send({ type: "ADD_TAG", value });
    },

    removeTag(index: number) {
      send({ type: "REMOVE_TAG", index });
    },

    clearAll() {
      send({ type: "CLEAR_ALL" });
    },

    setValue(value: string[]) {
      send({ type: "SET_VALUE", value });
    },

    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": tagsInputAnatomy.root,
        "data-disabled": dataAttr(ctx.disabled),
        "data-readonly": dataAttr(ctx.readOnly),
        "data-focus": dataAttr(isFocused),
        id: ctx.id,
      };
    },

    getLabelProps() {
      return {
        id: getLabelId(),
        "data-scope": SCOPE,
        "data-part": tagsInputAnatomy.label,
        "data-disabled": dataAttr(ctx.disabled),
        htmlFor: getInputId(),
      };
    },

    getControlProps() {
      return {
        "data-scope": SCOPE,
        "data-part": tagsInputAnatomy.control,
        "data-disabled": dataAttr(ctx.disabled),
        "data-readonly": dataAttr(ctx.readOnly),
        "data-focus": dataAttr(isFocused),
        role: "group",
        "aria-labelledby": getLabelId(),
      };
    },

    getInputProps() {
      return {
        id: getInputId(),
        "data-scope": SCOPE,
        "data-part": tagsInputAnatomy.input,
        "data-disabled": dataAttr(ctx.disabled),
        type: "text" as const,
        disabled: ctx.disabled,
        readOnly: ctx.readOnly,
        placeholder: ctx.value.length === 0 ? ctx.placeholder : undefined,
        value: ctx.inputValue,
        "aria-label": "Add tag",
        "aria-disabled": ctx.disabled ? ariaAttr(true) : undefined,
        "aria-readonly": ctx.readOnly ? ariaAttr(true) : undefined,
        onChange: composeEventHandlers((e: Event) => {
          const target = e.target as HTMLInputElement;
          send({ type: "INPUT_CHANGE", value: target.value });
        }),
        onFocus: composeEventHandlers(() => {
          send({ type: "FOCUS" });
        }),
        onBlur: composeEventHandlers(() => {
          send({ type: "BLUR" });
        }),
        onKeyDown: composeEventHandlers((e: KeyboardEvent) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
          send({ type: "KEY_DOWN", key: e.key });
        }),
        onPaste: composeEventHandlers((e: ClipboardEvent) => {
          const pasteData = e.clipboardData?.getData("text/plain") ?? "";
          if (pasteData.includes(ctx.delimiter)) {
            e.preventDefault();
            send({ type: "PASTE", value: pasteData });
          }
        }),
      };
    },

    getItemProps(props) {
      const { index } = props;
      const isEditingThis = isEditing && ctx.editedTagIndex === index;

      return {
        id: getItemId(index),
        "data-scope": SCOPE,
        "data-part": tagsInputAnatomy.item,
        "data-disabled": dataAttr(ctx.disabled),
        "data-state": isEditingThis ? "editing" : "idle",
        "aria-label": `Tag: ${ctx.value[index]}`,
        role: "listitem",
      };
    },

    getItemTextProps(props) {
      const { index } = props;
      const isEditingThis = isEditing && ctx.editedTagIndex === index;

      return {
        "data-scope": SCOPE,
        "data-part": tagsInputAnatomy.itemText,
        "data-disabled": dataAttr(ctx.disabled),
        hidden: isEditingThis,
        onDoubleClick: composeEventHandlers(() => {
          send({ type: "TAG_CLICK", index });
        }),
      };
    },

    getItemDeleteTriggerProps(props) {
      const { index } = props;

      return {
        "data-scope": SCOPE,
        "data-part": tagsInputAnatomy.itemDeleteTrigger,
        "data-disabled": dataAttr(ctx.disabled),
        type: "button" as const,
        "aria-label": `Remove tag: ${ctx.value[index]}`,
        tabIndex: -1,
        disabled: ctx.disabled || ctx.readOnly,
        hidden: isEditing && ctx.editedTagIndex === index,
        onClick: composeEventHandlers(() => {
          send({ type: "REMOVE_TAG", index });
        }),
      };
    },

    getItemPreviewProps(props) {
      const { index } = props;
      const isEditingThis = isEditing && ctx.editedTagIndex === index;

      return {
        "data-scope": SCOPE,
        "data-part": tagsInputAnatomy.itemPreview,
        "data-disabled": dataAttr(ctx.disabled),
        hidden: isEditingThis,
      };
    },

    getItemInputProps(props) {
      const { index } = props;
      const isEditingThis = isEditing && ctx.editedTagIndex === index;

      return {
        id: getItemInputId(index),
        "data-scope": SCOPE,
        "data-part": tagsInputAnatomy.itemInput,
        type: "text" as const,
        hidden: !isEditingThis,
        disabled: ctx.disabled,
        value: isEditingThis ? ctx.editedTagValue : (ctx.value[index] ?? ""),
        "aria-label": `Edit tag: ${ctx.value[index]}`,
        onChange: composeEventHandlers((e: Event) => {
          const target = e.target as HTMLInputElement;
          send({ type: "EDIT_TAG_CHANGE", value: target.value });
        }),
        onBlur: composeEventHandlers(() => {
          if (isEditingThis) {
            send({ type: "EDIT_TAG_COMMIT" });
          }
        }),
        onKeyDown: composeEventHandlers((e: KeyboardEvent) => {
          send({ type: "EDIT_TAG_KEY_DOWN", key: e.key });
          if (e.key === "Enter" || e.key === "Escape") {
            e.preventDefault();
          }
        }),
      };
    },

    getClearTriggerProps() {
      return {
        "data-scope": SCOPE,
        "data-part": tagsInputAnatomy.clearTrigger,
        "data-disabled": dataAttr(ctx.disabled),
        type: "button" as const,
        "aria-label": "Clear all tags",
        disabled: ctx.disabled || ctx.readOnly || ctx.value.length === 0,
        onClick: composeEventHandlers(() => {
          send({ type: "CLEAR_ALL" });
        }),
      };
    },

    getHiddenInputProps() {
      return {
        "data-scope": SCOPE,
        "data-part": tagsInputAnatomy.hiddenInput,
        type: "hidden" as const,
        name: ctx.name,
        value: ctx.value.join(ctx.delimiter),
        disabled: ctx.disabled,
        readOnly: ctx.readOnly,
        "aria-hidden": "true" as const,
      };
    },
  };
}
