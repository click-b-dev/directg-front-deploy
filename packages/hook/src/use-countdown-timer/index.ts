import { useCallback, useEffect, useRef, useState } from "react";

interface UseCountdownTimerReturn {
  seconds: number;
  isActive: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * 카운트다운 타이머 훅.
 * OTP 인증코드, MFA 등 시간 제한 UI에서 사용한다.
 *
 * Date.now() 기반으로 남은 시간을 계산하므로,
 * 탭이 백그라운드로 전환되었다가 돌아와도 정확한 잔여 시간을 표시한다.
 *
 * @param initialSeconds 카운트다운 시작 초 (기본값: 180)
 *
 * @example
 * const { seconds, isActive, start, reset } = useCountdownTimer(180);
 *
 * <button onClick={start} disabled={isActive}>인증코드 전송</button>
 * {isActive && <span>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>}
 */
export const useCountdownTimer = (initialSeconds = 180): UseCountdownTimerReturn => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);

    if (remaining <= 0) {
      clearTimer();
      setSeconds(0);
      setIsActive(false);
      return;
    }

    setSeconds(remaining);
  }, [clearTimer]);

  const stop = useCallback(() => {
    clearTimer();
    setIsActive(false);
  }, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    endTimeRef.current = Date.now() + initialSeconds * 1000;
    setSeconds(initialSeconds);
    setIsActive(true);
    intervalRef.current = setInterval(tick, 1000);
  }, [clearTimer, initialSeconds, tick]);

  const reset = useCallback(() => {
    clearTimer();
    setIsActive(false);
    setSeconds(initialSeconds);
  }, [clearTimer, initialSeconds]);

  useEffect(() => clearTimer, [clearTimer]);

  return { seconds, isActive, start, stop, reset };
};
