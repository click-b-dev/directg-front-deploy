import { useCallback, useEffect, useRef, useState } from "react";

interface UseCopyToClipboardReturn {
  isCopied: boolean;
  copy: (text: string) => Promise<void>;
}

/**
 * 클립보드 복사 + 자동 리셋 훅.
 *
 * @param resetDelay 복사 후 isCopied가 false로 리셋되기까지의 시간 (ms, 기본값: 2000)
 *
 * @example
 * const { isCopied, copy } = useCopyToClipboard(3000);
 *
 * <button onClick={() => copy(text)}>
 *   {isCopied ? "복사됨!" : "복사"}
 * </button>
 */
export const useCopyToClipboard = (resetDelay = 2000): UseCopyToClipboardReturn => {
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const copy = useCallback(
    async (text: string): Promise<void> => {
      // 이전 타이머 취소 (빠른 연속 클릭 대응)
      clearTimer();

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // Clipboard API 미지원 환경 폴백
          fallbackCopy(text);
        }

        setIsCopied(true);
        timerRef.current = setTimeout(() => setIsCopied(false), resetDelay);
      } catch {
        setIsCopied(false);
      }
    },
    [resetDelay],
  );

  return { isCopied, copy };
};

/** Clipboard API 미지원 시 textarea 기반 폴백 */
const fallbackCopy = (text: string): void => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};
