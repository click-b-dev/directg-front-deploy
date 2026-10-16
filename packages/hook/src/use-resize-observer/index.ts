import { useEffect, useState, type RefObject } from "react";

export interface UseResizeObserverOptions<T extends HTMLElement> {
  /** 크기를 관찰할 element ref. */
  ref: RefObject<T | null>;
  /** 어떤 box 기준으로 측정할지 선택한다. 기본은 content box fallback이다. */
  box?: ResizeObserverBoxOptions;
}

export interface ResizeObserverSizeState {
  /** 아직 측정 전이거나 SSR 환경이면 undefined일 수 있다. */
  width?: number;
  /** 아직 측정 전이거나 SSR 환경이면 undefined일 수 있다. */
  height?: number;
}

const pickObservedSize = (
  size: ResizeObserverSize | readonly ResizeObserverSize[] | undefined,
): ResizeObserverSizeState | null => {
  if (!size) {
    return null;
  }

  const resolved = Array.isArray(size) ? size[0] : size;
  return {
    width: resolved.inlineSize,
    height: resolved.blockSize,
  };
};

const readEntrySize = (
  entry: ResizeObserverEntry,
  box: ResizeObserverBoxOptions | undefined,
): ResizeObserverSizeState => {
  if (box === "border-box") {
    const next = pickObservedSize(entry.borderBoxSize);
    if (next) {
      return next;
    }
  }

  if (box === "device-pixel-content-box") {
    const next = pickObservedSize(entry.devicePixelContentBoxSize);
    if (next) {
      return next;
    }
  }

  const contentBoxSize = pickObservedSize(entry.contentBoxSize);
  if (contentBoxSize) {
    return contentBoxSize;
  }

  return {
    width: entry.contentRect.width,
    height: entry.contentRect.height,
  };
};

/**
 * ResizeObserver 기반 element 크기 추적 훅.
 *
 * 인터페이스:
 * - 입력: 관찰 대상 ref와 선택적 box 옵션
 * - 출력: `{ width, height }`
 * - SSR: 안전한 초기값으로 빈 객체를 반환한다
 *
 * use case:
 * - 차트, 가상 리스트, 컨테이너 폭 기준 분기
 */
export const useResizeObserver = <T extends HTMLElement>(
  options: UseResizeObserverOptions<T>,
): ResizeObserverSizeState => {
  const { ref, box } = options;
  const [size, setSize] = useState<ResizeObserverSizeState>({});

  useEffect(() => {
    const target = ref.current;

    if (!target) {
      return;
    }

    if (typeof window === "undefined" || typeof ResizeObserver === "undefined") {
      return;
    }

    const updateSize = (nextSize: ResizeObserverSizeState) => {
      setSize((prev) => {
        if (prev.width === nextSize.width && prev.height === nextSize.height) {
          return prev;
        }

        return nextSize;
      });
    };

    updateSize({
      width: target.getBoundingClientRect().width,
      height: target.getBoundingClientRect().height,
    });

    const observer = new ResizeObserver((entries) => {
      const nextEntry = entries[0];
      if (!nextEntry) {
        return;
      }

      updateSize(readEntrySize(nextEntry, box));
    });

    observer.observe(target, box ? { box } : undefined);

    return () => {
      observer.disconnect();
    };
  }, [ref, box]);

  return size;
};
