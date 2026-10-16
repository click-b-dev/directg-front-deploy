/**
 * FileUpload 컴포넌트 Props
 */

import type { ComponentPropsWithRef, ReactNode } from "react";

export interface FileUploadRootProps {
  /** 제어 모드: 파일 목록 */
  files?: File[];
  /** 제어 모드: 파일 변경 콜백 */
  onFilesChange?: (files: File[]) => void;
  /** 허용 파일 타입 */
  accept?: string;
  /** 최대 파일 수 */
  maxFiles?: number;
  /** 최대 파일 크기 (bytes) */
  maxFileSize?: number;
  /** 비활성화 */
  disabled?: boolean;
  /** 다중 선택 */
  multiple?: boolean;
  /** 컴포넌트 ID */
  id?: string;
  children: ReactNode;
}

export interface FileUploadDropzoneProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface FileUploadTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export type FileUploadHiddenInputProps = ComponentPropsWithRef<"input">;

export type FileUploadLabelProps = ComponentPropsWithRef<"label"> & {
  children: ReactNode;
};

export interface FileUploadItemGroupProps extends ComponentPropsWithRef<"ul"> {
  children: ReactNode;
}

export interface FileUploadItemProps extends ComponentPropsWithRef<"li"> {
  /** 파일 객체 */
  file: File;
  children: ReactNode;
}

export interface FileUploadItemNameProps extends ComponentPropsWithRef<"span"> {
  /** 파일 객체 */
  file: File;
  children?: ReactNode;
}

export interface FileUploadItemSizeTextProps extends ComponentPropsWithRef<"span"> {
  /** 파일 객체 */
  file: File;
  children?: ReactNode;
}

export interface FileUploadItemDeleteTriggerProps extends ComponentPropsWithRef<"button"> {
  /** 파일 인덱스 */
  index: number;
  children: ReactNode;
}

export interface FileUploadItemPreviewProps extends ComponentPropsWithRef<"div"> {
  /** 파일 객체 */
  file: File;
  children: ReactNode;
}

export interface FileUploadItemPreviewImageProps extends ComponentPropsWithRef<"img"> {
  /** 파일 객체 */
  file: File;
}
