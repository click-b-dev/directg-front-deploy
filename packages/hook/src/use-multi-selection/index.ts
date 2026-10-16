import { useCallback, useMemo, useState } from "react";

interface UseMultiSelectionOptions<T> {
  data: T[];
  rowKey: keyof T | ((row: T) => string | number);
}

interface UseMultiSelectionReturn<T> {
  selectedKeys: Set<string | number>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  isSelected: (key: string | number) => boolean;
  toggleRow: (key: string | number) => void;
  toggleAll: () => void;
  clearSelection: () => void;
  getSelectedData: () => T[];
}

/**
 * 테이블 멀티 셀렉션 훅.
 * 고유 키 기반의 행 선택/해제, 전체 선택, 선택 데이터 추출을 제공한다.
 *
 * @example
 * const selection = useMultiSelection({ data: projects, rowKey: "id" });
 *
 * <Checkbox checked={selection.isAllSelected} indeterminate={selection.isIndeterminate} onChange={selection.toggleAll} />
 * {projects.map((p) => (
 *   <Checkbox checked={selection.isSelected(p.id)} onChange={() => selection.toggleRow(p.id)} />
 * ))}
 */
export function useMultiSelection<T>(
  options: UseMultiSelectionOptions<T>,
): UseMultiSelectionReturn<T> {
  const { data, rowKey } = options;
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

  const getKey = useCallback(
    (row: T): string | number => {
      if (typeof rowKey === "function") return rowKey(row);
      return row[rowKey] as string | number;
    },
    [rowKey],
  );

  const allKeys = useMemo(() => data.map(getKey), [data, getKey]);

  const validSelectedKeys = useMemo(() => {
    const allKeysSet = new Set(allKeys);
    const valid = new Set<string | number>();
    for (const key of selectedKeys) {
      if (allKeysSet.has(key)) valid.add(key);
    }
    return valid;
  }, [selectedKeys, allKeys]);

  const isAllSelected = data.length > 0 && validSelectedKeys.size === data.length;
  const isIndeterminate = validSelectedKeys.size > 0 && !isAllSelected;

  const isSelected = useCallback(
    (key: string | number) => validSelectedKeys.has(key),
    [validSelectedKeys],
  );

  const toggleRow = useCallback((key: string | number) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(allKeys));
    }
  }, [isAllSelected, allKeys]);

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const getSelectedData = useCallback(
    () => data.filter((row) => validSelectedKeys.has(getKey(row))),
    [data, validSelectedKeys, getKey],
  );

  return {
    selectedKeys: validSelectedKeys,
    isAllSelected,
    isIndeterminate,
    isSelected,
    toggleRow,
    toggleAll,
    clearSelection,
    getSelectedData,
  };
}
