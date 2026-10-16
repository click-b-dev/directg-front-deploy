import {
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";
import { createTypedStorage } from "@click-b/utils";
import type { StorageSchema } from "@click-b/utils";

type ValueSchema<T> = StorageSchema & { v: T };
type StorageKind = "local" | "session";
type UseStorageReturn<T> = [T, Dispatch<SetStateAction<T>>, () => void];
type StorageSyncDetail = { key: string };

const STORAGE_SYNC_EVENT = "click-b:storage-sync";

const isStorageSyncEvent = (event: Event): event is CustomEvent<StorageSyncDetail> => {
  return event instanceof CustomEvent;
};

const dispatchStorageSyncEvent = (key: string) => {
  window.dispatchEvent(new CustomEvent<StorageSyncDetail>(STORAGE_SYNC_EVENT, { detail: { key } }));
};

const useWebStorage = <T>(
  key: string,
  initialValue: T,
  storageType: StorageKind,
): UseStorageReturn<T> => {
  const storage = useMemo(
    () =>
      createTypedStorage<ValueSchema<T>>({
        namespace: key,
        storage: storageType,
      }),
    [key, storageType],
  );

  const storageKey = `${key}:v`;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === storageKey) {
          onStoreChange();
        }
      };

      const handleCustomSync = (event: Event) => {
        if (isStorageSyncEvent(event) && event.detail.key === storageKey) {
          onStoreChange();
        }
      };

      window.addEventListener("storage", handleStorage);
      window.addEventListener(STORAGE_SYNC_EVENT, handleCustomSync);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(STORAGE_SYNC_EVENT, handleCustomSync);
      };
    },
    [storageKey],
  );

  const lastRawRef = useRef<string | null | undefined>(undefined);
  const cachedSnapshotRef = useRef<T>(initialValue);

  const getSnapshot = useCallback((): T => {
    const raw = storage.getRaw("v");

    if (raw === lastRawRef.current) {
      return cachedSnapshotRef.current;
    }

    lastRawRef.current = raw;
    const stored = storage.get("v");
    cachedSnapshotRef.current = stored !== null ? stored : initialValue;
    return cachedSnapshotRef.current;
  }, [initialValue, storage]);

  const getServerSnapshot = useCallback((): T => {
    return initialValue;
  }, [initialValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (newValue: SetStateAction<T>) => {
      const previousValue = storage.get("v");
      const resolvedValue =
        typeof newValue === "function"
          ? (newValue as (prevState: T) => T)(previousValue !== null ? previousValue : initialValue)
          : newValue;

      storage.set("v", resolvedValue);
      dispatchStorageSyncEvent(storageKey);
    },
    [initialValue, storage, storageKey],
  );

  const removeValue = useCallback(() => {
    storage.remove("v");
    dispatchStorageSyncEvent(storageKey);
  }, [storage, storageKey]);

  return [value, setValue, removeValue];
};

/**
 * localStorage와 React 상태를 동기화하는 훅.
 *
 * 인터페이스:
 * - 입력: 저장 key와 초기값
 * - 출력: `[value, setValue, removeValue]`
 * - setter: 일반 React state setter처럼 값 또는 updater 함수를 받을 수 있다
 *
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage("theme", "light");
 */
export const useLocalStorage = <T>(key: string, initialValue: T): UseStorageReturn<T> => {
  return useWebStorage(key, initialValue, "local");
};

/**
 * sessionStorage와 React 상태를 동기화하는 훅.
 *
 * 인터페이스:
 * - 입력: 저장 key와 초기값
 * - 출력: `[value, setValue, removeValue]`
 * - 생명주기: 탭을 닫으면 값이 사라지는 임시 상태에 적합하다
 *
 * @example
 * const [draft, setDraft, clearDraft] = useSessionStorage("draft", "");
 */
export const useSessionStorage = <T>(key: string, initialValue: T): UseStorageReturn<T> => {
  return useWebStorage(key, initialValue, "session");
};
