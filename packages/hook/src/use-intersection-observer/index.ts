import { useCallback, useEffect, useRef, useState, type RefCallback } from "react";

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** true면 한 번 보인 뒤에는 observer를 동결한다. impression tracking에 적합하다. */
  freezeOnceVisible?: boolean;
  /** entry 변경 시 부수효과를 연결할 수 있는 콜백. */
  onChange?: (entry: IntersectionObserverEntry) => void;
}

export interface UseIntersectionObserverReturn<T extends Element> {
  /** 관찰 대상 element를 연결하는 callback ref. */
  ref: RefCallback<T | null>;
  /** 최신 observer entry. 아직 관찰 전이면 null. */
  entry: IntersectionObserverEntry | null;
  /** entry에서 자주 쓰는 `isIntersecting`만 분리한 편의 값. */
  isIntersecting: boolean;
}

/**
 * IntersectionObserver 기반 가시성 추적 훅.
 *
 * 인터페이스:
 * - 입력: `IntersectionObserverInit` 기반 옵션과 부가 옵션
 * - 출력: `{ ref, entry, isIntersecting }`
 * - SSR: observer가 없는 환경에서는 no-op으로 동작한다
 *
 * use case:
 * - infinite scroll sentinel
 * - lazy render / lazy load
 * - 1회성 노출 추적
 */
export const useIntersectionObserver = <T extends Element>(
  options: UseIntersectionObserverOptions = {},
): UseIntersectionObserverReturn<T> => {
  const { freezeOnceVisible = false, onChange, root, rootMargin, threshold } = options;
  const [node, setNode] = useState<T | null>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const ref = useCallback<RefCallback<T | null>>((nextNode) => {
    setNode(nextNode);
  }, []);

  const frozen = freezeOnceVisible && entry?.isIntersecting;

  useEffect(() => {
    if (!node) {
      setEntry(null);
      return;
    }

    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    if (frozen) {
      return;
    }

    const observer = new IntersectionObserver(
      ([nextEntry]) => {
        setEntry(nextEntry);
        onChangeRef.current?.(nextEntry);
      },
      { root, rootMargin, threshold },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node, root, rootMargin, threshold, frozen]);

  return {
    ref,
    entry,
    isIntersecting: Boolean(entry?.isIntersecting),
  };
};
