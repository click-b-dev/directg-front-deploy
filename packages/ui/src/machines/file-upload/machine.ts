/**
 * FileUpload 상태머신
 * 파일 업로드, 드래그 앤 드롭, 유효성 검사를 관리한다.
 *
 * States:
 *   idle ─DRAG_ENTER──→ dragging
 *   dragging ─DRAG_LEAVE──→ idle
 *   dragging ─DROP──→ idle (파일 추가)
 */

import type { TransitionResult } from "@/machines/shared/types";
import type {
  FileUploadState,
  FileUploadContext,
  FileUploadEvent,
  FileRejection,
  FileError,
} from "./types";

function isFileTypeAccepted(file: File, accept: string): boolean {
  if (!accept) return true;

  const acceptedTypes = accept.split(",").map((t) => t.trim());

  return acceptedTypes.some((type) => {
    if (type.startsWith(".")) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    if (type.endsWith("/*")) {
      const baseType = type.replace("/*", "");
      return file.type.startsWith(baseType);
    }
    return file.type === type;
  });
}

function validateFiles(
  incoming: File[],
  existing: File[],
  ctx: FileUploadContext,
): { accepted: File[]; rejected: FileRejection[] } {
  const accepted: File[] = [];
  const rejected: FileRejection[] = [];

  const availableSlots = ctx.maxFiles - existing.length;

  for (let i = 0; i < incoming.length; i++) {
    const file = incoming[i]!;
    const errors: FileError[] = [];

    if (!isFileTypeAccepted(file, ctx.accept)) {
      errors.push({ type: "FILE_INVALID_TYPE", accept: ctx.accept });
    }

    if (ctx.maxFileSize > 0 && file.size > ctx.maxFileSize) {
      errors.push({ type: "FILE_TOO_LARGE", maxSize: ctx.maxFileSize });
    }

    if (accepted.length >= availableSlots) {
      errors.push({ type: "TOO_MANY_FILES", maxFiles: ctx.maxFiles });
    }

    if (errors.length > 0) {
      rejected.push({ file, errors });
    } else {
      accepted.push(file);
    }
  }

  return { accepted, rejected };
}

export function transition(
  state: FileUploadState,
  ctx: FileUploadContext,
  event: FileUploadEvent,
): TransitionResult<FileUploadState, FileUploadContext> {
  if (ctx.disabled) {
    if (event.type === "SET_CONTEXT") {
      return { state, context: { ...ctx, ...event.context } };
    }
    return { state, context: ctx };
  }

  switch (event.type) {
    case "SET_CONTEXT": {
      return { state, context: { ...ctx, ...event.context } };
    }

    case "DRAG_ENTER": {
      return { state: "dragging", context: ctx };
    }

    case "DRAG_LEAVE": {
      return { state: "idle", context: ctx };
    }

    case "DROP": {
      const { accepted, rejected } = validateFiles(event.files, ctx.files, ctx);
      const nextFiles = ctx.multiple ? [...ctx.files, ...accepted] : accepted.slice(0, 1);
      return {
        state: "idle",
        context: { ...ctx, files: nextFiles, rejectedFiles: rejected },
        effects:
          accepted.length > 0
            ? [{ type: "announce", message: `${accepted.length} file(s) added` }]
            : rejected.length > 0
              ? [
                  {
                    type: "announce",
                    message: `${rejected.length} file(s) rejected`,
                    politeness: "assertive",
                  },
                ]
              : undefined,
      };
    }

    case "FILE_SELECT": {
      const { accepted, rejected } = validateFiles(event.files, ctx.files, ctx);
      const nextFiles = ctx.multiple ? [...ctx.files, ...accepted] : accepted.slice(0, 1);
      return {
        state: "idle",
        context: { ...ctx, files: nextFiles, rejectedFiles: rejected },
        effects:
          accepted.length > 0
            ? [{ type: "announce", message: `${accepted.length} file(s) selected` }]
            : undefined,
      };
    }

    case "FILE_REMOVE": {
      const nextFiles = ctx.files.filter((_, i) => i !== event.index);
      return {
        state,
        context: { ...ctx, files: nextFiles },
        effects: [{ type: "announce", message: "File removed" }],
      };
    }

    case "CLEAR": {
      return {
        state: "idle",
        context: { ...ctx, files: [], rejectedFiles: [] },
      };
    }

    default:
      return { state, context: ctx };
  }
}

export function createFileUploadMachine(ctx: Partial<FileUploadContext> & { id: string }) {
  const initialContext: FileUploadContext = {
    id: ctx.id,
    files: ctx.files ?? [],
    rejectedFiles: [],
    accept: ctx.accept ?? "",
    maxFiles: ctx.maxFiles ?? Infinity,
    maxFileSize: ctx.maxFileSize ?? Infinity,
    disabled: ctx.disabled ?? false,
    multiple: ctx.multiple ?? false,
  };

  return {
    initialState: "idle" as FileUploadState,
    initialContext,
    transition,
  };
}
