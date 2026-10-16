export type ProgressState = "indeterminate" | "loading" | "complete";

export interface ProgressContext {
  /** 현재 값 (null = indeterminate) */
  value: number | null;
  /** 최솟값 */
  min: number;
  /** 최댓값 */
  max: number;
}

export type ProgressEvent =
  | { type: "SET_VALUE"; value: number | null }
  | { type: "SET_CONTEXT"; context: Partial<ProgressContext> };
