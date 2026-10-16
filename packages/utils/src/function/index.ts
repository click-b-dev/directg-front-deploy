// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

// ─── Debounce ───

export interface DebouncedFunction<T extends AnyFunction> {
  (...args: Parameters<T>): void;
  /** 대기 중인 호출을 취소 */
  cancel: () => void;
  /** 대기 중인 호출을 즉시 실행 */
  flush: () => void;
}

/**
 * 마지막 호출 후 delay(ms)가 지나야 실행.
 * 연속 호출 시 이전 타이머를 취소하고 새로 시작한다.
 */
export const debounce = <T extends AnyFunction>(fn: T, delay: number): DebouncedFunction<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;
  };

  const flush = () => {
    if (timer !== null && lastArgs !== null) {
      clearTimeout(timer);
      timer = null;
      fn(...lastArgs);
      lastArgs = null;
    }
  };

  const debounced = (...args: Parameters<T>): void => {
    lastArgs = args;
    cancel();
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
      lastArgs = null;
    }, delay);
  };

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced;
};

// ─── Throttle ───

export interface ThrottledFunction<T extends AnyFunction> {
  (...args: Parameters<T>): void;
  /** 대기 중인 trailing 호출을 취소 */
  cancel: () => void;
}

/**
 * interval(ms) 동안 최대 1번만 실행.
 * 첫 호출은 즉시 실행(leading), 이후 호출은 interval 후 마지막 인자로 실행(trailing).
 */
export const throttle = <T extends AnyFunction>(fn: T, interval: number): ThrottledFunction<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime = 0;

  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;
  };

  const throttled = (...args: Parameters<T>): void => {
    const now = Date.now();
    const remaining = interval - (now - lastCallTime);

    if (remaining <= 0) {
      // leading: 즉시 실행
      cancel();
      lastCallTime = now;
      fn(...args);
    } else {
      // trailing: 마지막 인자 저장, 타이머 갱신
      lastArgs = args;
      if (timer === null) {
        timer = setTimeout(() => {
          timer = null;
          lastCallTime = Date.now();
          if (lastArgs !== null) {
            fn(...lastArgs);
            lastArgs = null;
          }
        }, remaining);
      }
    }
  };

  throttled.cancel = cancel;

  return throttled;
};
