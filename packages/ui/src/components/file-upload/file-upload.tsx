/**
 * FileUpload 컴포넌트
 * 파일 업로드 + 드래그 앤 드롭 패턴 구현.
 * 파일 유효성 검사, 미리보기, 개별 삭제를 지원한다.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useState } from "react";
import { useMachine } from "@/hooks/use-machine";
import { useId } from "@/hooks/use-id";
import { createFileUploadMachine, connectFileUpload } from "@/machines/file-upload";
import type { FileUploadConnectReturn } from "@/machines/file-upload";
import { mergeProps } from "@/machines/shared/dom";
import type {
  FileUploadRootProps,
  FileUploadDropzoneProps,
  FileUploadTriggerProps,
  FileUploadHiddenInputProps,
  FileUploadLabelProps,
  FileUploadItemGroupProps,
  FileUploadItemProps,
  FileUploadItemNameProps,
  FileUploadItemSizeTextProps,
  FileUploadItemDeleteTriggerProps,
  FileUploadItemPreviewProps,
  FileUploadItemPreviewImageProps,
} from "./file-upload.types";

/** 내부 Context */
const FileUploadContext = createContext<FileUploadConnectReturn | null>(null);

const useFileUploadContext = () => {
  const ctx = useContext(FileUploadContext);
  if (!ctx) {
    throw new Error("FileUpload 하위 컴포넌트는 FileUpload.Root 안에서 사용해야 합니다.");
  }
  return ctx;
};

/** Root */
const Root = ({
  files: filesProp,
  onFilesChange,
  accept = "",
  maxFiles = Infinity,
  maxFileSize = Infinity,
  disabled = false,
  multiple = false,
  id: idProp,
  children,
}: FileUploadRootProps) => {
  const id = useId(idProp);

  const machine = useMemo(
    () =>
      createFileUploadMachine({
        id,
        files: filesProp,
        accept,
        maxFiles,
        maxFileSize,
        disabled,
        multiple,
      }),
    [id, filesProp, accept, maxFiles, maxFileSize, disabled, multiple],
  );

  const [state, context, send] = useMachine(machine);
  const api = connectFileUpload(state, context, send);

  // context 동기화
  useEffect(() => {
    send({
      type: "SET_CONTEXT",
      context: { accept, maxFiles, maxFileSize, disabled, multiple },
    });
  }, [accept, maxFiles, maxFileSize, disabled, multiple, send]);

  // 외부 files 동기화 (제어 모드)
  useEffect(() => {
    if (filesProp !== undefined && filesProp !== context.files) {
      send({ type: "SET_CONTEXT", context: { files: filesProp } });
    }
  }, [filesProp, context.files, send]);

  // 머신 files → 외부 콜백
  useEffect(() => {
    onFilesChange?.(context.files);
  }, [context.files, onFilesChange]);

  const ctxValue = useMemo(() => api, [state, context, api]);

  return (
    <FileUploadContext.Provider value={ctxValue}>
      <div {...api.rootProps}>{children}</div>
    </FileUploadContext.Provider>
  );
};

/** Label */
const Label = forwardRef<HTMLLabelElement, FileUploadLabelProps>(({ children, ...rest }, ref) => {
  const api = useFileUploadContext();
  const props = mergeProps(api.labelProps, rest as Record<string, unknown>);

  return (
    <label ref={ref} {...props}>
      {children}
    </label>
  );
});

/** Dropzone */
const Dropzone = forwardRef<HTMLDivElement, FileUploadDropzoneProps>(
  ({ children, ...rest }, ref) => {
    const api = useFileUploadContext();
    const props = mergeProps(api.dropzoneProps, rest as Record<string, unknown>);

    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

/** Trigger */
const Trigger = forwardRef<HTMLButtonElement, FileUploadTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useFileUploadContext();
    const props = mergeProps(api.triggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

/** HiddenInput */
const HiddenInput = forwardRef<HTMLInputElement, FileUploadHiddenInputProps>(({ ...rest }, ref) => {
  const api = useFileUploadContext();
  const props = mergeProps(api.hiddenInputProps, rest as Record<string, unknown>);

  return <input ref={ref} {...props} />;
});

/** ItemGroup */
const ItemGroup = forwardRef<HTMLUListElement, FileUploadItemGroupProps>(
  ({ children, ...rest }, ref) => {
    const api = useFileUploadContext();
    const props = mergeProps(api.itemGroupProps, rest as Record<string, unknown>);

    return (
      <ul ref={ref} {...props}>
        {children}
      </ul>
    );
  },
);

/** Item */
const FileUploadItem = forwardRef<HTMLLIElement, FileUploadItemProps>(
  ({ file, children, ...rest }, ref) => {
    const api = useFileUploadContext();
    const itemProps = api.getItemProps({ file });
    const props = mergeProps(itemProps, rest as Record<string, unknown>);

    return (
      <li ref={ref} {...props}>
        {children}
      </li>
    );
  },
);

/** ItemName */
const ItemName = forwardRef<HTMLSpanElement, FileUploadItemNameProps>(
  ({ file, children, ...rest }, ref) => {
    const api = useFileUploadContext();
    const nameProps = api.getItemNameProps({ file });
    const props = mergeProps(nameProps, rest as Record<string, unknown>);

    return (
      <span ref={ref} {...props}>
        {children ?? file.name}
      </span>
    );
  },
);

/** ItemSizeText */
const ItemSizeText = forwardRef<HTMLSpanElement, FileUploadItemSizeTextProps>(
  ({ file, children, ...rest }, ref) => {
    const api = useFileUploadContext();
    const sizeProps = api.getItemSizeTextProps({ file });
    const props = mergeProps(sizeProps, rest as Record<string, unknown>);

    return (
      <span ref={ref} {...props}>
        {children ?? sizeProps.children}
      </span>
    );
  },
);

/** ItemDeleteTrigger */
const ItemDeleteTrigger = forwardRef<HTMLButtonElement, FileUploadItemDeleteTriggerProps>(
  ({ index, children, ...rest }, ref) => {
    const api = useFileUploadContext();
    const deleteProps = api.getItemDeleteTriggerProps({ index });
    const props = mergeProps(deleteProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

/** ItemPreview */
const ItemPreview = forwardRef<HTMLDivElement, FileUploadItemPreviewProps>(
  ({ file, children, ...rest }, ref) => {
    const api = useFileUploadContext();
    const previewProps = api.getItemPreviewProps({ file });
    const props = mergeProps(previewProps, rest as Record<string, unknown>);

    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

/** ItemPreviewImage */
const ItemPreviewImage = forwardRef<HTMLImageElement, FileUploadItemPreviewImageProps>(
  ({ file, ...rest }, ref) => {
    const [url, setUrl] = useState<string>("");

    useEffect(() => {
      if (!file.type.startsWith("image/")) return;
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const api = useFileUploadContext();
    const imageProps = api.getItemPreviewImageProps({ file, url });
    const props = mergeProps(imageProps, rest as Record<string, unknown>);

    if (!url) return null;

    return <img ref={ref} {...props} />;
  },
);

export const FileUpload = {
  Root,
  Label,
  Dropzone,
  Trigger,
  HiddenInput,
  ItemGroup,
  Item: FileUploadItem,
  ItemName,
  ItemSizeText,
  ItemDeleteTrigger,
  ItemPreview,
  ItemPreviewImage,
};
