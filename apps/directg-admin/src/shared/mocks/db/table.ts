// 세션 내메모리 in-memory 테이블. MSW handler가 fixture를 직접 갖는 대신
// 이 테이블을 조회/변경한다. 새로고침 시 모듈이 재평가되어 seed로 자동 리셋된다.
//
// FSD: 이 파일은 shared 레이어이므로 entities/features를 import하지 않는다.
// Row 타입은 각 tables/<name>.ts에서 legacy 컬럼을 근거로 자체 정의한다.

type Predicate<T> = (row: T) => boolean;

export type Table<T> = {
  /** 전체 행(복제본) */
  all(): T[];
  /** 첫 일치 행. 없으면 undefined */
  find(pred: Predicate<T>): T | undefined;
  /** 일치 행 전부 */
  filter(pred: Predicate<T>): T[];
  /** 행 추가 후 추가된 행 반환 */
  insert(row: T): T;
  /** 첫 일치 행에 patch 병합. 갱신된 행 반환(없으면 undefined) */
  update(pred: Predicate<T>, patch: Partial<T>): T | undefined;
  /** 일치 행 제거. 제거된 개수 반환 */
  remove(pred: Predicate<T>): number;
  /** seed 상태로 되돌린다 */
  reset(): void;
};

const clone = <T>(value: T): T => structuredClone(value);

export function createTable<T>(seed: readonly T[]): Table<T> {
  let rows: T[] = clone(seed as T[]);

  return {
    all: () => clone(rows),
    find: (pred) => {
      const row = rows.find(pred);
      return row ? clone(row) : undefined;
    },
    filter: (pred) => clone(rows.filter(pred)),
    insert: (row) => {
      const next = clone(row);
      rows.push(next);
      return clone(next);
    },
    update: (pred, patch) => {
      const target = rows.find(pred);
      if (!target) return undefined;
      Object.assign(target, clone(patch));
      return clone(target);
    },
    remove: (pred) => {
      const before = rows.length;
      rows = rows.filter((row) => !pred(row));
      return before - rows.length;
    },
    reset: () => {
      rows = clone(seed as T[]);
    },
  };
}
