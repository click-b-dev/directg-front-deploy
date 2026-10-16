/**
 * FileUpload 머신 타입 정의
 * 파일 업로드 + 드래그 앤 드롭 패턴
 */

export type FileUploadState = "idle" | "dragging";

export interface FileRejection {
  file: File;
  errors: FileError[];
}

export type FileError =
  | { type: "FILE_TOO_LARGE"; maxSize: number }
  | { type: "FILE_TOO_SMALL"; minSize: number }
  | { type: "FILE_INVALID_TYPE"; accept: string }
  | { type: "TOO_MANY_FILES"; maxFiles: number };

export interface FileUploadContext {
  /** 컴포넌트 고유 ID */
  id: string;
  /** 현재 선택된 파일 목록 */
  files: File[];
  /** 거부된 파일 목록 */
  rejectedFiles: FileRejection[];
  /** 허용 파일 타입 (예: "image/*,.pdf") */
  accept: string;
  /** 최대 파일 수 */
  maxFiles: number;
  /** 최대 파일 크기 (bytes) */
  maxFileSize: number;
  /** 비활성화 */
  disabled: boolean;
  /** 다중 파일 선택 */
  multiple: boolean;
}

export type FileUploadEvent =
  | { type: "DRAG_ENTER" }
  | { type: "DRAG_LEAVE" }
  | { type: "DROP"; files: File[] }
  | { type: "FILE_SELECT"; files: File[] }
  | { type: "FILE_REMOVE"; index: number }
  | { type: "CLEAR" }
  | { type: "SET_CONTEXT"; context: Partial<FileUploadContext> };
