import type { Send } from "@/machines/shared/types";
import type { AvatarState, AvatarContext, AvatarEvent } from "./types";

export interface AvatarApi {
  /** 현재 로드 상태 */
  state: AvatarState;
  /** 이미지가 로드되었는지 */
  isLoaded: boolean;

  /** root 요소 props */
  getRootProps(): Record<string, unknown>;
  /** image 요소 props */
  getImageProps(): Record<string, unknown>;
  /** fallback 요소 props */
  getFallbackProps(): Record<string, unknown>;
}

export function connect(
  state: AvatarState,
  context: AvatarContext,
  send: Send<AvatarEvent>,
  ids: { root: string },
): AvatarApi {
  const isLoaded = state === "loaded";

  return {
    state,
    isLoaded,

    getRootProps() {
      return {
        "data-scope": "avatar",
        "data-part": "root",
        "data-state": state,
        id: ids.root,
      };
    },

    getImageProps() {
      return {
        "data-scope": "avatar",
        "data-part": "image",
        "data-state": state,
        src: context.src,
        hidden: !isLoaded,
        onLoad() {
          send({ type: "IMAGE_LOAD" });
        },
        onError() {
          send({ type: "IMAGE_ERROR" });
        },
      };
    },

    getFallbackProps() {
      return {
        "data-scope": "avatar",
        "data-part": "fallback",
        "data-state": state,
        hidden: isLoaded,
      };
    },
  };
}
