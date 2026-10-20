import { useState } from "react";
import type { MemberLevelHistoryItem } from "@entities/member";
import { MEMBER_LEVEL_LABELS } from "@/renewal/entities/member-level";
import { DataTable, Tag, TableFooter, type DataTableColumn } from "@/renewal/shared/ui";
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from "@/renewal/shared/lib/pagination";
import { formatPrice } from "../model/detail";
import { CHANGE_LABEL, CHANGE_TONE, toLevelRows, type LevelHistoryRow } from "../model/level";

type LevelPanelProps = { history: MemberLevelHistoryItem[]; email: string };

const levelLabel = (level: number | undefined) =>
  level === undefined ? "-" : (MEMBER_LEVEL_LABELS[level] ?? "-");

export const LevelPanel = ({ history, email }: LevelPanelProps) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);

  const all = toLevelRows(history);
  const totalPages = Math.max(1, Math.ceil(all.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const rows = all.slice((currentPage - 1) * perPage, currentPage * perPage);

  const columns: DataTableColumn<LevelHistoryRow>[] = [
    { key: "calculatedAt", header: "산정일", width: "rn:w-200", cell: (row) => row.calculatedAt },
    { key: "period", header: "산정 기간", width: "rn:w-300", cell: (row) => row.period },
    {
      key: "orderPrice",
      header: "최근 구매 총액",
      width: "rn:w-260",
      cell: (row) => formatPrice(row.orderPrice),
    },
    {
      key: "previous",
      header: "이전 등급",
      width: "rn:w-200",
      cell: (row) => levelLabel(row.previousLevel),
    },
    {
      key: "level",
      header: "변경 등급",
      width: "rn:w-320",
      cell: (row) => (
        <span className="rn:inline-flex rn:items-center rn:gap-8">
          {levelLabel(row.level)}
          {row.change && <Tag tone={CHANGE_TONE[row.change]}>{CHANGE_LABEL[row.change]}</Tag>}
        </span>
      ),
    },
    { key: "email", header: "계정", align: "left", cell: () => email },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.key}
        emptyText="회원 등급 변동 이력이 없습니다."
      />
      <TableFooter
        page={currentPage}
        totalPages={totalPages}
        pageSize={perPage}
        totalResults={all.length}
        onPageChange={setPage}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageSizeChange={(size) => {
          setPerPage(size);
          setPage(1);
        }}
      />
    </>
  );
};
