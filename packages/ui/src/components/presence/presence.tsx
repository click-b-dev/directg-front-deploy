/**
 * Presence 컴포넌트
 * enter/exit 애니메이션을 관리하며 콘텐츠의 마운트/언마운트를 제어한다.
 */

import { useEffect, useRef, useMemo } from "react";
import { useMachine } from "@/hooks";
import { createPresenceMachine, connectPresence } from "@/machines/presence";
import type { PresenceProps } from "./presence.types";

export const Presence = (props: PresenceProps) => {
  const { present, animationEnabled = true, onExitComplete, children } = props;

  const machine = useMemo(
    () => createPresenceMachine({ present, animationEnabled }),
    [present, animationEnabled],
  );

  const [state, context, send] = useMachine(machine);
  const api = connectPresence(state, context, send);

  const prevPresentRef = useRef(present);

  useEffect(() => {
    if (present !== prevPresentRef.current) {
      prevPresentRef.current = present;
      if (present) {
        send({ type: "MOUNT" });
      } else {
        send({ type: "UNMOUNT" });
      }
    }
  }, [present, send]);

  const prevStateRef = useRef(state);
  useEffect(() => {
    if (prevStateRef.current === "exiting" && state === "unmounted") {
      onExitComplete?.();
    }
    prevStateRef.current = state;
  }, [state, onExitComplete]);

  if (!api.isPresent) {
    return null;
  }

  if (typeof children === "function") {
    return <>{children({ state: api.state, isPresent: api.isPresent })}</>;
  }

  return (
    <div
      data-scope="presence"
      data-part="root"
      data-state={api.state}
      onAnimationEnd={api.onAnimationEnd}
    >
      {children}
    </div>
  );
};

Presence.displayName = "Presence";
