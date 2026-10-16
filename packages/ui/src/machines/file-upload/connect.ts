/**
 * FileUpload connect
 * 머신 상태를 파일 업로드 DOM 속성으로 변환한다.
 */

import type { Send } from "@/machines/shared/types";
import { dataAttr } from "@/machines/shared/dom";
import type { FileUploadState, FileUploadContext, FileUploadEvent, FileRejection } from "./types";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export interface FileUploadConnectReturn {
  /** 현재 파일 목록 */
  files: File[];
  /** 거부된 파일 목록 */
  rejectedFiles: FileRejection[];
  /** 드래그 중 여부 */
  isDragging: boolean;
  /** 파일 선택 다이얼로그 열기 */
  openFilePicker(): void;
  /** 모든 파일 제거 */
  clearFiles(): void;
  /** root 속성 */
  rootProps: {
    "data-scope": string;
    "data-part": string;
    "data-disabled": "" | undefined;
    "data-dragging": "" | undefined;
    id: string;
  };
  /** label 속성 */
  labelProps: {
    "data-scope": string;
    "data-part": string;
    id: string;
    htmlFor: string;
  };
  /** dropzone 속성 */
  dropzoneProps: {
    "data-scope": string;
    "data-part": string;
    "data-dragging": "" | undefined;
    "data-disabled": "" | undefined;
    id: string;
    tabIndex: number;
    role: "button";
    "aria-disabled": "true" | "false";
    onDragEnter: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** trigger 속성 */
  triggerProps: {
    "data-scope": string;
    "data-part": string;
    "data-disabled": "" | undefined;
    id: string;
    type: "button";
    disabled: boolean;
    onClick: () => void;
  };
  /** hidden input 속성 */
  hiddenInputProps: {
    "data-scope": string;
    "data-part": string;
    id: string;
    type: "file";
    accept: string;
    multiple: boolean;
    disabled: boolean;
    tabIndex: number;
    style: React.CSSProperties;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  /** itemGroup 속성 */
  itemGroupProps: {
    "data-scope": string;
    "data-part": string;
    id: string;
  };
  /** 개별 item props 반환 */
  getItemProps(props: { file: File }): {
    "data-scope": string;
    "data-part": string;
    id: string;
  };
  /** 개별 item name props 반환 */
  getItemNameProps(props: { file: File }): {
    "data-scope": string;
    "data-part": string;
  };
  /** 개별 item size text props 반환 */
  getItemSizeTextProps(props: { file: File }): {
    "data-scope": string;
    "data-part": string;
    children: string;
  };
  /** 개별 item delete trigger props 반환 */
  getItemDeleteTriggerProps(props: { index: number }): {
    "data-scope": string;
    "data-part": string;
    type: "button";
    "aria-label": string;
    onClick: () => void;
  };
  /** 개별 item preview props 반환 */
  getItemPreviewProps(props: { file: File }): {
    "data-scope": string;
    "data-part": string;
  };
  /** 개별 item preview image props 반환 */
  getItemPreviewImageProps(props: { file: File; url: string }): {
    "data-scope": string;
    "data-part": string;
    src: string;
    alt: string;
  };
}

export function connectFileUpload(
  state: FileUploadState,
  context: FileUploadContext,
  send: Send<FileUploadEvent>,
): FileUploadConnectReturn {
  const isDragging = state === "dragging";
  const inputId = `${context.id}-input`;

  function openFilePicker() {
    if (context.disabled) return;
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    input?.click();
  }

  function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    send({ type: "FILE_SELECT", files });
  }

  return {
    files: context.files,
    rejectedFiles: context.rejectedFiles,
    isDragging,
    openFilePicker,
    clearFiles() {
      send({ type: "CLEAR" });
    },
    rootProps: {
      "data-scope": "file-upload",
      "data-part": "root",
      "data-disabled": dataAttr(context.disabled),
      "data-dragging": dataAttr(isDragging),
      id: context.id,
    },
    labelProps: {
      "data-scope": "file-upload",
      "data-part": "label",
      id: `${context.id}-label`,
      htmlFor: inputId,
    },
    dropzoneProps: {
      "data-scope": "file-upload",
      "data-part": "dropzone",
      "data-dragging": dataAttr(isDragging),
      "data-disabled": dataAttr(context.disabled),
      id: `${context.id}-dropzone`,
      tabIndex: context.disabled ? -1 : 0,
      role: "button",
      "aria-disabled": context.disabled ? "true" : "false",
      onDragEnter(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (!context.disabled) send({ type: "DRAG_ENTER" });
      },
      onDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
      },
      onDragLeave(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (!context.disabled) send({ type: "DRAG_LEAVE" });
      },
      onDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (context.disabled) return;
        const files = Array.from(e.dataTransfer.files);
        send({ type: "DROP", files });
      },
      onClick() {
        openFilePicker();
      },
      onKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openFilePicker();
        }
      },
    },
    triggerProps: {
      "data-scope": "file-upload",
      "data-part": "trigger",
      "data-disabled": dataAttr(context.disabled),
      id: `${context.id}-trigger`,
      type: "button",
      disabled: context.disabled,
      onClick() {
        openFilePicker();
      },
    },
    hiddenInputProps: {
      "data-scope": "file-upload",
      "data-part": "hidden-input",
      id: inputId,
      type: "file",
      accept: context.accept,
      multiple: context.multiple,
      disabled: context.disabled,
      tabIndex: -1,
      style: {
        position: "absolute",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      },
      onChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
          handleFiles(e.target.files);
          e.target.value = "";
        }
      },
    },
    itemGroupProps: {
      "data-scope": "file-upload",
      "data-part": "item-group",
      id: `${context.id}-item-group`,
    },
    getItemProps(props: { file: File }) {
      return {
        "data-scope": "file-upload" as const,
        "data-part": "item" as const,
        id: `${context.id}-item-${props.file.name}`,
      };
    },
    getItemNameProps() {
      return {
        "data-scope": "file-upload" as const,
        "data-part": "item-name" as const,
      };
    },
    getItemSizeTextProps(props: { file: File }) {
      return {
        "data-scope": "file-upload" as const,
        "data-part": "item-size-text" as const,
        children: formatFileSize(props.file.size),
      };
    },
    getItemDeleteTriggerProps(props: { index: number }) {
      return {
        "data-scope": "file-upload" as const,
        "data-part": "item-delete-trigger" as const,
        type: "button" as const,
        "aria-label": "Remove file",
        onClick() {
          send({ type: "FILE_REMOVE", index: props.index });
        },
      };
    },
    getItemPreviewProps() {
      return {
        "data-scope": "file-upload" as const,
        "data-part": "item-preview" as const,
      };
    },
    getItemPreviewImageProps(props: { file: File; url: string }) {
      return {
        "data-scope": "file-upload" as const,
        "data-part": "item-preview-image" as const,
        src: props.url,
        alt: props.file.name,
      };
    },
  };
}
