import { useCallback, useRef, useSyncExternalStore } from "react";
import type { MachineDefinition, Effect } from "@/machines/shared/types";

/**
 * 범용 상태머신 실행 훅
 * 순수 함수 머신 정의를 React 상태와 연결한다.
 */
export function useMachine<TState extends string, TContext, TEvent extends { type: string }>(
  machine: MachineDefinition<TState, TContext, TEvent>,
) {
  const storeRef = useRef<{
    state: TState;
    context: TContext;
    listeners: Set<() => void>;
    snapshot: { state: TState; context: TContext };
  } | null>(null);

  if (storeRef.current === null) {
    const initialSnapshot = { state: machine.initialState, context: machine.initialContext };
    storeRef.current = {
      state: machine.initialState,
      context: machine.initialContext,
      listeners: new Set(),
      snapshot: initialSnapshot,
    };
  }

  const store = storeRef.current;
  const machineRef = useRef(machine);
  machineRef.current = machine;

  const subscribe = useCallback(
    (listener: () => void) => {
      store.listeners.add(listener);
      return () => store.listeners.delete(listener);
    },
    [store],
  );

  const getSnapshot = useCallback(() => {
    return store.snapshot;
  }, [store]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const send = useCallback(
    (event: TEvent) => {
      const result = machineRef.current.transition(store.state, store.context, event);
      const changed = result.state !== store.state || result.context !== store.context;

      if (changed) {
        store.state = result.state;
        store.context = result.context;
        store.snapshot = { state: result.state, context: result.context };
        for (const listener of store.listeners) listener();
      }

      if (result.effects) {
        for (const effect of result.effects) {
          executeEffect(effect);
        }
      }
    },
    [store],
  );

  return [snapshot.state, snapshot.context, send] as const;
}

function executeEffect(effect: Effect): void {
  switch (effect.type) {
    case "focus": {
      const el = document.getElementById(effect.target);
      el?.focus();
      break;
    }
    case "blur": {
      const el = document.getElementById(effect.target);
      el?.blur();
      break;
    }
    case "scrollIntoView": {
      const el = document.getElementById(effect.target);
      el?.scrollIntoView({ block: "nearest" });
      break;
    }
    case "announce": {
      import("@/machines/shared/dom").then((mod) =>
        mod.announce(effect.message, effect.politeness),
      );
      break;
    }
    case "custom": {
      effect.handler();
      break;
    }
  }
}
