/** null과 undefined를 제외하는 타입 가드. `items.filter(isNonNullable)`로 타입을 좁힌다. */
export const isNonNullable = <T>(value: T): value is NonNullable<T> => {
  return value !== null && value !== undefined;
};

/** string 타입 가드 */
export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

/** number 타입 가드. NaN은 false를 반환한다. */
export const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && !Number.isNaN(value);
};
