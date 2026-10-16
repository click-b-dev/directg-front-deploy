export type AvatarState = "loading" | "loaded" | "error";

export interface AvatarContext {
  /** 이미지 소스 URL */
  src?: string;
  /** 현재 로드 상태 */
  loadState: AvatarState;
}

export type AvatarEvent =
  | { type: "IMAGE_LOAD" }
  | { type: "IMAGE_ERROR" }
  | { type: "SET_CONTEXT"; context: Partial<AvatarContext> };
