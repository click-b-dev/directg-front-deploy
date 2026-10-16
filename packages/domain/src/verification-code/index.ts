import { useCallback, useEffect, useRef, useState } from "react";

export type VerificationCodeStatus = "idle" | "sent" | "verified" | "expired";

export type VerificationCodeSendResult = {
  verificationId: string;
  expiresAt?: string | null;
};

export type VerificationCodeVerifyInput = {
  verificationId: string;
  code: string;
};

export type VerificationCodeVerifyResult = boolean | { verified: boolean };

export type UseVerificationCodeOptions<TTarget> = {
  expireSeconds: number;
  send: (target: TTarget) => Promise<VerificationCodeSendResult>;
  verify: (input: VerificationCodeVerifyInput) => Promise<VerificationCodeVerifyResult>;
  onExpired?: () => void;
};

export type UseVerificationCodeReturn<TTarget> = {
  status: VerificationCodeStatus;
  verificationId: string | null;
  secondsLeft: number;
  isSending: boolean;
  isVerifying: boolean;
  send: (target: TTarget) => Promise<boolean>;
  resend: (target: TTarget) => Promise<boolean>;
  verify: (code: string) => Promise<boolean>;
  reset: () => void;
};

const OFFSETLESS_ISO_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

export const parseVerificationCodeExpiresAt = (expiresAt?: string | null) => {
  if (!expiresAt) {
    return null;
  }

  const normalized = OFFSETLESS_ISO_DATE_TIME_PATTERN.test(expiresAt) ? `${expiresAt}Z` : expiresAt;
  const time = new Date(normalized).getTime();

  return Number.isFinite(time) ? time : null;
};

export const resolveVerificationCodeExpiresAt = (
  expiresAt: string | null | undefined,
  expireSeconds: number,
  now = Date.now(),
) => {
  const fallback = now + expireSeconds * 1000;
  const parsed = parseVerificationCodeExpiresAt(expiresAt);

  return parsed !== null && parsed > now && parsed <= fallback ? parsed : fallback;
};

export const getVerificationCodeSecondsLeft = (expiresAt: number, now = Date.now()) =>
  Math.max(0, Math.ceil((expiresAt - now) / 1000));

export const isVerificationCodeVerified = (result: VerificationCodeVerifyResult) =>
  typeof result === "boolean" ? result : result.verified;

export const useVerificationCode = <TTarget>(
  options: UseVerificationCodeOptions<TTarget>,
): UseVerificationCodeReturn<TTarget> => {
  const { expireSeconds, send: sendRequest, verify: verifyRequest, onExpired } = options;
  const [status, setStatus] = useState<VerificationCodeStatus>("idle");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (expiresAt: number) => {
      clearTimer();

      const tick = () => {
        const remaining = getVerificationCodeSecondsLeft(expiresAt);
        setSecondsLeft(remaining);

        if (remaining <= 0) {
          clearTimer();
          setStatus("expired");
          onExpired?.();
        }
      };

      tick();
      timerRef.current = setInterval(tick, 1000);
    },
    [clearTimer, onExpired],
  );

  const reset = useCallback(() => {
    clearTimer();
    setStatus("idle");
    setVerificationId(null);
    setSecondsLeft(0);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const send = useCallback(
    async (target: TTarget) => {
      setIsSending(true);

      try {
        const result = await sendRequest(target);
        setVerificationId(result.verificationId);
        setStatus("sent");
        startTimer(resolveVerificationCodeExpiresAt(result.expiresAt, expireSeconds));

        return true;
      } catch {
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [expireSeconds, sendRequest, startTimer],
  );

  const verify = useCallback(
    async (code: string) => {
      if (!verificationId) {
        return false;
      }

      setIsVerifying(true);

      try {
        const result = await verifyRequest({ verificationId, code });
        const verified = isVerificationCodeVerified(result);

        if (verified) {
          clearTimer();
          setStatus("verified");
        }

        return verified;
      } catch {
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [clearTimer, verificationId, verifyRequest],
  );

  return {
    status,
    verificationId,
    secondsLeft,
    isSending,
    isVerifying,
    send,
    resend: send,
    verify,
    reset,
  };
};
