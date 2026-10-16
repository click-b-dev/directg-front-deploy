import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
  type RefObject,
} from "react";
import { jsx } from "react/jsx-runtime";

type Layer = {
  ref: RefObject<HTMLElement | null>;
  handler: () => void;
};

interface ClickOutsideContextValue {
  register: (layer: Layer) => () => void;
  layers: Layer[];
}

const ClickOutsideContext = createContext<ClickOutsideContextValue | null>(null);

/**
 * useClickOutside의 중첩 레이어를 관리하는 Provider.
 * 앱 루트에 한 번 감싸면 모달 안의 드롭다운 등 중첩 케이스에서
 * 가장 안쪽 레이어만 닫히도록 동작한다.
 *
 * @example
 * <ClickOutsideProvider>
 *   <App />
 * </ClickOutsideProvider>
 */
export const ClickOutsideProvider = ({ children }: PropsWithChildren) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const layersRef = useRef<Layer[]>([]);

  const register = useCallback((layer: Layer) => {
    layersRef.current = [...layersRef.current, layer];
    setLayers(layersRef.current);

    return () => {
      layersRef.current = layersRef.current.filter((l) => l !== layer);
      setLayers(layersRef.current);
    };
  }, []);

  useEffect(() => {
    const handleEvent = (event: MouseEvent | TouchEvent) => {
      const currentLayers = layersRef.current;

      for (let i = currentLayers.length - 1; i >= 0; i--) {
        const layer = currentLayers[i];
        const el = layer.ref.current;

        if (!el) continue;

        if (el.contains(event.target as Node)) {
          return;
        }

        layer.handler();
        return;
      }
    };

    document.addEventListener("mousedown", handleEvent);
    document.addEventListener("touchstart", handleEvent);

    return () => {
      document.removeEventListener("mousedown", handleEvent);
      document.removeEventListener("touchstart", handleEvent);
    };
  }, []);

  const value = useMemo(() => ({ register, layers }), [register, layers]);

  return jsx(ClickOutsideContext, { value, children });
};

/**
 * ref 외부 클릭을 감지하여 handler를 호출하는 훅.
 * 드롭다운, 팝오버, 모달 등의 외부 클릭 닫기 패턴에 사용한다.
 *
 * ClickOutsideProvider 내부에서 사용하면 중첩 레이어를 스택으로 관리하여
 * 가장 안쪽 레이어의 handler만 호출한다.
 *
 * Provider 없이 단독으로 사용하면 독립적으로 동작한다.
 *
 * @example
 * const dropdownRef = useRef<HTMLDivElement>(null);
 * useClickOutside(dropdownRef, () => setIsOpen(false));
 */
export const useClickOutside = (ref: RefObject<HTMLElement | null>, handler: () => void): void => {
  const ctx = useContext(ClickOutsideContext);

  useEffect(() => {
    // Provider가 있으면 스택에 등록
    if (ctx) {
      return ctx.register({ ref, handler });
    }

    // Provider 없이 단독 사용 — 독립 listener
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;
      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, ctx]);
};
