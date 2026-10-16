import { useId as reactUseId } from "react";

/**
 * 컴포넌트 ID 생성 훅
 * React 19의 useId를 기반으로, 선택적 custom id를 우선한다.
 */
export function useId(customId?: string): string {
  const generatedId = reactUseId();
  return customId ?? generatedId;
}
