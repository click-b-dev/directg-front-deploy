/**
 * Editable connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, composeEventHandlers } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { EditableState, EditableContext, EditableEvent } from "./types";
import { SCOPE, editableAnatomy } from "./anatomy";

export interface EditableApi {
  value: string;
  previousValue: string;
  isEditing: boolean;
  isDisabled: boolean;
  edit(): void;
  submit(): void;
  cancel(): void;
  getRootProps(): Record<string, unknown>;
  getAreaProps(): Record<string, unknown>;
  getLabelProps(): Record<string, unknown>;
  getPreviewProps(): Record<string, unknown>;
  getInputProps(): Record<string, unknown>;
  getEditTriggerProps(): Record<string, unknown>;
  getSubmitTriggerProps(): Record<string, unknown>;
  getCancelTriggerProps(): Record<string, unknown>;
  getControlProps(): Record<string, unknown>;
}

export function connect(
  state: EditableState,
  ctx: EditableContext,
  send: Send<EditableEvent>,
): EditableApi {
  const isEditing = state === "editing";

  function getInputId(): string {
    return `${ctx.id}:input`;
  }

  function getLabelId(): string {
    return `${ctx.id}:label`;
  }

  function getPreviewId(): string {
    return `${ctx.id}:preview`;
  }

  return {
    value: ctx.value,
    previousValue: ctx.previousValue,
    isEditing,
    isDisabled: ctx.disabled,

    edit() {
      send({ type: "EDIT" });
    },

    submit() {
      send({ type: "SUBMIT" });
    },

    cancel() {
      send({ type: "CANCEL" });
    },

    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": editableAnatomy.root,
        "data-state": isEditing ? "editing" : "preview",
        "data-disabled": dataAttr(ctx.disabled),
        "data-readonly": dataAttr(ctx.readOnly),
        id: ctx.id,
      };
    },

    getAreaProps() {
      return {
        "data-scope": SCOPE,
        "data-part": editableAnatomy.area,
        "data-state": isEditing ? "editing" : "preview",
        "data-disabled": dataAttr(ctx.disabled),
        "aria-labelledby": getLabelId(),
      };
    },

    getLabelProps() {
      return {
        id: getLabelId(),
        "data-scope": SCOPE,
        "data-part": editableAnatomy.label,
        "data-disabled": dataAttr(ctx.disabled),
        htmlFor: getInputId(),
      };
    },

    getPreviewProps() {
      return {
        id: getPreviewId(),
        "data-scope": SCOPE,
        "data-part": editableAnatomy.preview,
        "data-state": isEditing ? "editing" : "preview",
        "data-disabled": dataAttr(ctx.disabled),
        "data-readonly": dataAttr(ctx.readOnly),
        "data-placeholder-shown": dataAttr(!ctx.value),
        hidden: isEditing,
        tabIndex: ctx.disabled || ctx.readOnly ? undefined : 0,
        role: "button",
        children: ctx.value || ctx.placeholder,
        onClick: composeEventHandlers(() => {
          send({ type: "EDIT" });
        }),
        onFocus: composeEventHandlers(() => {
          send({ type: "EDIT" });
        }),
      };
    },

    getInputProps() {
      return {
        id: getInputId(),
        "data-scope": SCOPE,
        "data-part": editableAnatomy.input,
        "data-state": isEditing ? "editing" : "preview",
        "data-disabled": dataAttr(ctx.disabled),
        type: "text" as const,
        hidden: !isEditing,
        disabled: ctx.disabled,
        readOnly: ctx.readOnly,
        placeholder: ctx.placeholder,
        value: ctx.value,
        "aria-labelledby": getLabelId(),
        maxLength: ctx.maxLength > 0 ? ctx.maxLength : undefined,
        onChange: composeEventHandlers((e: Event) => {
          const target = e.target as HTMLInputElement;
          send({ type: "INPUT_CHANGE", value: target.value });
        }),
        onBlur: composeEventHandlers(() => {
          send({ type: "BLUR" });
        }),
        onKeyDown: composeEventHandlers((e: KeyboardEvent) => {
          send({ type: "KEY_DOWN", key: e.key });
          if (e.key === "Enter" && ctx.submitOnEnter) {
            e.preventDefault();
          }
        }),
      };
    },

    getEditTriggerProps() {
      return {
        "data-scope": SCOPE,
        "data-part": editableAnatomy.editTrigger,
        "data-disabled": dataAttr(ctx.disabled),
        type: "button" as const,
        "aria-label": "Edit",
        hidden: isEditing,
        disabled: ctx.disabled || ctx.readOnly,
        onClick: composeEventHandlers(() => {
          send({ type: "EDIT" });
        }),
      };
    },

    getSubmitTriggerProps() {
      return {
        "data-scope": SCOPE,
        "data-part": editableAnatomy.submitTrigger,
        type: "button" as const,
        "aria-label": "Submit",
        hidden: !isEditing,
        disabled: ctx.disabled,
        onClick: composeEventHandlers(() => {
          send({ type: "SUBMIT" });
        }),
      };
    },

    getCancelTriggerProps() {
      return {
        "data-scope": SCOPE,
        "data-part": editableAnatomy.cancelTrigger,
        type: "button" as const,
        "aria-label": "Cancel",
        hidden: !isEditing,
        disabled: ctx.disabled,
        onClick: composeEventHandlers(() => {
          send({ type: "CANCEL" });
        }),
      };
    },

    getControlProps() {
      return {
        "data-scope": SCOPE,
        "data-part": editableAnatomy.control,
        "data-state": isEditing ? "editing" : "preview",
        "data-disabled": dataAttr(ctx.disabled),
      };
    },
  };
}
