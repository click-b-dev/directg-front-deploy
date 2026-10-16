/**
 * 상태머신 공통 타입 정의
 * 모든 머신이 공유하는 기본 인터페이스
 */

/** 상태 전이 결과 */
export interface TransitionResult<TState extends string, TContext> {
  state: TState;
  context: TContext;
  effects?: Effect[];
}

/** Side effect (DOM 조작 등) - 머신 외부에서 실행 */
export type Effect =
  | { type: "focus"; target: string }
  | { type: "blur"; target: string }
  | { type: "scrollIntoView"; target: string }
  | { type: "announce"; message: string; politeness?: "polite" | "assertive" }
  | { type: "preventScroll" }
  | { type: "restoreScroll" }
  | { type: "custom"; handler: () => void };

/** 머신 정의 인터페이스 */
export interface MachineDefinition<
  TState extends string,
  TContext,
  TEvent extends { type: string },
> {
  initialState: TState;
  initialContext: TContext;
  transition: (
    state: TState,
    context: TContext,
    event: TEvent,
  ) => TransitionResult<TState, TContext>;
}

/** connect 함수가 반환하는 send 함수 타입 */
export type Send<TEvent extends { type: string }> = (event: TEvent) => void;

/** DOM 속성 공통 타입 */
export interface DataAttributes {
  "data-scope": string;
  "data-part": string;
  "data-state"?: string;
  "data-disabled"?: "" | undefined;
  "data-focus"?: "" | undefined;
  "data-hover"?: "" | undefined;
  "data-orientation"?: "horizontal" | "vertical";
}
