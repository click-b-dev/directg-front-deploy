import type { ReactNode } from "react";
import { cx } from "../lib/cx";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  /** 고정 너비 클래스(예: "rn:w-180"). 없으면 남는 폭을 차지한다. */
  width?: string;
  /** 남는 폭을 차지하는 열의 최소 너비(px). 기본 200 */
  minWidth?: number;
  align?: "left" | "center";
  cell: (row: T) => ReactNode;
  /** 행 데이터에 따라 셀 배경/글자를 바꿀 때(예: 신고 수 강조) */
  cellClassName?: (row: T) => string | undefined;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyText: string;
  /** 행 높이 클래스. 기본 56(Figma TD), 내용이 긴 표는 64 이상 */
  rowHeight?: string;
};

const FLEX_MIN_WIDTH = 200;

// 표의 최소 너비 = 고정 열 너비 합 + 가변 열 최소 너비 합. 컨테이너가 이보다 좁으면 가로 스크롤한다.
const getMinTableWidth = <T,>(columns: DataTableColumn<T>[]) =>
  columns.reduce((sum, column) => {
    const fixed = column.width ? Number(/rn:w-(\d+)/.exec(column.width)?.[1]) : NaN;
    return sum + (Number.isNaN(fixed) ? (column.minWidth ?? FLEX_MIN_WIDTH) : fixed);
  }, 0);

// Figma `table`: TH h40(page 배경, radius 8, 가운데 정렬) · TD h56(아래 테두리) · 셀 px12 · body3
const TH =
  "rn:h-40 rn:bg-page rn:px-12 rn:text-center rn:whitespace-nowrap rn:text-body3 rn:font-medium rn:text-ink-2 rn:first:rounded-l-8 rn:last:rounded-r-8";
const TD = "rn:border-b rn:border-solid rn:border-line rn:px-12 rn:text-body3";

export const DataTable = <T,>({
  columns,
  rows,
  getRowKey,
  emptyText,
  rowHeight = "rn:h-56",
}: DataTableProps<T>) => (
  <div className="rn:w-full rn:overflow-x-auto">
    <table
      className="rn:w-full rn:table-fixed rn:text-ink"
      style={{ minWidth: getMinTableWidth(columns) }}
    >
      <colgroup>
        {columns.map((column) => (
          <col key={column.key} className={column.width} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} className={TH}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowKey(row)}>
            {columns.map((column) => (
              <td
                key={column.key}
                className={cx(
                  TD,
                  rowHeight,
                  column.align === "left" ? "" : "rn:text-center",
                  column.cellClassName?.(row),
                )}
              >
                {column.cell(row)}
              </td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td
              colSpan={columns.length}
              className={cx(TD, rowHeight, "rn:text-center rn:text-ink-2")}
            >
              {emptyText}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
