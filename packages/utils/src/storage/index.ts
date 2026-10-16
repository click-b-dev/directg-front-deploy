// ─── Types ───

export interface StorageSchema {
  [key: string]: unknown;
}

export interface TypedStorageOptions {
  /** 키 접두사 (기본값: "") */
  namespace?: string;
  /** localStorage | sessionStorage (기본값: localStorage) */
  storage?: "local" | "session";
}

export interface TypedStorage<T extends StorageSchema> {
  get<K extends keyof T & string>(key: K): T[K] | null;
  /** 파싱 없이 raw JSON 문자열을 반환한다. 스냅샷 캐시 키로 사용할 수 있다. */
  getRaw<K extends keyof T & string>(key: K): string | null;
  set<K extends keyof T & string>(key: K, value: T[K], ttl?: number): void;
  remove<K extends keyof T & string>(key: K): void;
  clear(): void;
  has<K extends keyof T & string>(key: K): boolean;
}

// ─── Internal ───

interface StoredEntry<V = unknown> {
  value: V;
  expiresAt: number | null;
}

const isStoredEntry = (data: unknown): data is StoredEntry => {
  return typeof data === "object" && data !== null && "value" in data && "expiresAt" in data;
};

const getStorageInstance = (type: "local" | "session"): Storage | null => {
  if (typeof window === "undefined") return null;

  try {
    const storage = type === "local" ? window.localStorage : window.sessionStorage;
    // 접근 가능 여부 테스트
    const testKey = "__typed_storage_test__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
};

// ─── Factory ───

export const createTypedStorage = <T extends StorageSchema>(
  options?: TypedStorageOptions,
): TypedStorage<T> => {
  const namespace = options?.namespace ?? "";
  const storageType = options?.storage ?? "local";

  const prefix = namespace ? `${namespace}:` : "";

  const resolveKey = (key: string): string => {
    return `${prefix}${key}`;
  };

  const get = <K extends keyof T & string>(key: K): T[K] | null => {
    const storage = getStorageInstance(storageType);
    if (!storage) return null;

    try {
      const raw = storage.getItem(resolveKey(key));
      if (raw === null) return null;

      const parsed: unknown = JSON.parse(raw);

      if (!isStoredEntry(parsed)) return null;

      if (parsed.expiresAt !== null && Date.now() > parsed.expiresAt) {
        storage.removeItem(resolveKey(key));
        return null;
      }

      return parsed.value as T[K];
    } catch {
      return null;
    }
  };

  const set = <K extends keyof T & string>(key: K, value: T[K], ttl?: number): void => {
    const storage = getStorageInstance(storageType);
    if (!storage) return;

    try {
      const entry: StoredEntry = {
        value,
        expiresAt: ttl != null ? Date.now() + ttl : null,
      };
      storage.setItem(resolveKey(key), JSON.stringify(entry));
    } catch {
      // quota 초과 등 — 조용히 실패
    }
  };

  const remove = <K extends keyof T & string>(key: K): void => {
    const storage = getStorageInstance(storageType);
    if (!storage) return;

    try {
      storage.removeItem(resolveKey(key));
    } catch {
      // 조용히 실패
    }
  };

  const clear = (): void => {
    const storage = getStorageInstance(storageType);
    if (!storage) return;

    try {
      if (!prefix) {
        storage.clear();
        return;
      }

      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const storageKey = storage.key(i);
        if (storageKey?.startsWith(prefix)) {
          keysToRemove.push(storageKey);
        }
      }
      for (const k of keysToRemove) {
        storage.removeItem(k);
      }
    } catch {
      // 조용히 실패
    }
  };

  const getRaw = <K extends keyof T & string>(key: K): string | null => {
    const storage = getStorageInstance(storageType);
    if (!storage) return null;

    try {
      return storage.getItem(resolveKey(key));
    } catch {
      return null;
    }
  };

  const has = <K extends keyof T & string>(key: K): boolean => {
    return get(key) !== null;
  };

  return { get, getRaw, set, remove, clear, has };
};
