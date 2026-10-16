/** 객체에서 특정 키만 추출한 새 객체를 반환 */
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
};

/** 객체에서 특정 키를 제거한 새 객체를 반환 */
export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
};

// ─── filterKeys ───

export interface FilterKeysEqualOptions<T> {
  /** 값이 일치하는 키만 추출 */
  equal: T[keyof T];
}

export interface FilterKeysTypeOptions {
  /** 해당 타입의 값을 가진 키만 추출 */
  type: "string" | "number" | "boolean" | "object" | "undefined" | "function";
}

export type FilterKeysOptions<T> = FilterKeysEqualOptions<T> | FilterKeysTypeOptions;

/** 값 기준(equal) 또는 타입 기준(type)으로 키를 필터링한 새 객체를 반환 */
export const filterKeys = <T extends Record<string, unknown>>(
  obj: T,
  options: FilterKeysOptions<T>,
): Partial<T> => {
  const result = {} as Partial<T>;

  for (const key of Object.keys(obj) as (keyof T & string)[]) {
    if ("equal" in options) {
      if (obj[key] === options.equal) {
        result[key] = obj[key];
      }
    } else {
      if (typeof obj[key] === options.type) {
        result[key] = obj[key];
      }
    }
  }

  return result;
};

// ─── objectTyped ───

export interface TypedObject {
  keys<T extends Record<string, unknown>>(obj: T): (keyof T & string)[];
  values<T extends Record<string, unknown>>(obj: T): T[keyof T][];
  entries<T extends Record<string, unknown>>(obj: T): [keyof T & string, T[keyof T]][];
  fromEntries<K extends string, V>(entries: [K, V][]): Record<K, V>;
}

/** 타입이 보강된 Object 메서드 래퍼 */
export const objectTyped: TypedObject = {
  keys<T extends Record<string, unknown>>(obj: T): (keyof T & string)[] {
    return Object.keys(obj) as (keyof T & string)[];
  },
  values<T extends Record<string, unknown>>(obj: T): T[keyof T][] {
    return Object.values(obj) as T[keyof T][];
  },
  entries<T extends Record<string, unknown>>(obj: T): [keyof T & string, T[keyof T]][] {
    return Object.entries(obj) as [keyof T & string, T[keyof T]][];
  },
  fromEntries<K extends string, V>(entries: [K, V][]): Record<K, V> {
    return Object.fromEntries(entries) as Record<K, V>;
  },
};
