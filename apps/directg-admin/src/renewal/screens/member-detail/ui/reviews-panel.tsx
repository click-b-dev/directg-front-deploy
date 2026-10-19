import { useState } from "react";
import iconOpenInNew from "@/renewal/assets/icon-open-in-new.svg";
import { useMemberReviews, type MemberReviewItem } from "@/renewal/entities/member-review";
import { DataTable, TableFooter, Tag, type DataTableColumn } from "@/renewal/shared/ui";
import { REVIEW_PAGE_SIZE, splitReviewTags } from "../model/review";

type ReviewsPanelProps = { m_no: string };

// 기획: 공감/신고 수가 1건 이상이면 색·굵기로 강조, 0이면 흐리게.
const COUNT_BASE = "rn:text-body3";
const likeClass = (row: MemberReviewItem) =>
  row.like_cnt > 0
    ? `${COUNT_BASE} rn:bg-info rn:font-semibold rn:text-brand`
    : `${COUNT_BASE} rn:font-regular rn:text-icon-3`;
const reportClass = (row: MemberReviewItem) =>
  row.report_cnt > 0
    ? `${COUNT_BASE} rn:bg-error-bg rn:font-semibold rn:text-error`
    : `${COUNT_BASE} rn:font-regular rn:text-icon-3`;

const columns: DataTableColumn<MemberReviewItem>[] = [
  { key: "review_id", header: "리뷰 ID", width: "rn:w-120", cell: (row) => row.review_id },
  { key: "reg_date", header: "등록일", width: "rn:w-180", cell: (row) => row.reg_date },
  {
    key: "category",
    header: "상품 카테고리",
    width: "rn:w-160",
    cell: (row) => <Tag tone="outline">{row.category}</Tag>,
  },
  {
    key: "product",
    header: "상품 이름",
    width: "rn:w-280",
    align: "left",
    cell: (row) => <p className="rn:truncate">{row.product_name}</p>,
  },
  {
    key: "review",
    header: "리뷰",
    align: "left",
    minWidth: 360,
    cell: (row) => {
      const { shown, more } = splitReviewTags(row.tags);
      return (
        <div className="rn:flex rn:flex-col rn:gap-8 rn:py-16">
          {/* 기획: 텍스트 리뷰는 2줄까지 노출(줄바꿈 무시), 넘치면 말줄임. 본문이 없으면 노출하지 않는다. */}
          {row.content && <p className="rn:line-clamp-2 rn:break-words">{row.content}</p>}
          {shown.length > 0 && (
            <div className="rn:flex rn:gap-4">
              {shown.map((tag) => (
                <Tag key={tag} tone="info">
                  {tag}
                </Tag>
              ))}
              {more > 0 && <Tag tone="neutral">+{more}</Tag>}
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: "like_cnt",
    header: "공감",
    width: "rn:w-80",
    cell: (row) => row.like_cnt,
    cellClassName: likeClass,
  },
  {
    key: "report_cnt",
    header: "신고",
    width: "rn:w-80",
    cell: (row) => row.report_cnt,
    cellClassName: reportClass,
  },
  { key: "status", header: "상태", width: "rn:w-100", cell: (row) => row.status_label },
  {
    key: "detail",
    header: "리뷰 상세",
    width: "rn:w-120",
    // 리뷰 상세(AD-Review-Detail-01) 화면은 아직 없어 이동하지 않는다.
    cell: () => (
      <button type="button" className="rn:inline-flex rn:items-center rn:gap-2 rn:font-medium">
        리뷰 보기
        <img src={iconOpenInNew} alt="" width={20} height={20} />
      </button>
    ),
  },
];

export const ReviewsPanel = ({ m_no }: ReviewsPanelProps) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useMemberReviews(m_no, page);

  const pagination = data?.pagination;

  return (
    <>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowKey={(row) => row.review_id}
        rowHeight="rn:h-64"
        emptyText={
          isLoading
            ? "불러오는 중..."
            : isError
              ? "리뷰 내역을 불러오지 못했습니다."
              : "리뷰 내역이 없습니다."
        }
      />
      <TableFooter
        page={pagination?.current_page ?? 1}
        totalPages={pagination?.total_pages ?? 1}
        pageSize={REVIEW_PAGE_SIZE}
        totalResults={pagination?.total_results ?? 0}
        onPageChange={setPage}
      />
    </>
  );
};
