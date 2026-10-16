"use client";

import { useState, useTransition } from "react";

import type { MypagePointRow } from "@entities/mypage-point";

import { loadMorePoints } from "../api/load-more-points";

interface MobileMypagePointListProps {
  initialList: MypagePointRow[];
  totalPages: number;
}

/** 적립/사용 라벨 — legacy: "+"→적립, "-"→사용, 그외 "". */
function emoneyLabel(type: string): string {
  if (type === "+") return "적립";
  if (type === "-") return "사용";
  return "";
}

/**
 * 모바일 포인트 내역 표 + "더보기" 증분 (legacy `mypage_point.html` #point_table_body + #btn_more).
 * 더보기 클릭 시 다음 page를 append. nextPage>=total_pages면 버튼 라벨 "마지막 페이지"·btn-secondary(alert 없음).
 */
export function MobileMypagePointList({ initialList, totalPages }: MobileMypagePointListProps) {
  const [items, setItems] = useState<MypagePointRow[]>(initialList);
  const [dataPage, setDataPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const isLast = dataPage >= totalPages;

  const handleMore = () => {
    const nextPage = dataPage + 1;
    startTransition(async () => {
      const more = await loadMorePoints(nextPage);
      setItems((prev) => [...prev, ...more]);
      setDataPage(nextPage);
    });
  };

  return (
    <>
      <div className="col-12">
        <table className="table table-light table-bordered table-centered mb-1 text-center align-middle">
          <thead className="align-middle table-dark">
            <tr>
              <th className="w-25">날짜</th>
              <th className="text-nowrap">적립/사용</th>
              <th>사유</th>
              <th className="w-25">포인트</th>
            </tr>
          </thead>
          <tbody id="point_table_body">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  적립금 내역이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((row, index) => (
                <tr key={index}>
                  <td>{row.regdt}</td>
                  <td className="no-wrap text-nowrap">{emoneyLabel(row.emoney_type)}</td>
                  <td className="text-start">{row.memo}</td>
                  <td className="">
                    <div className="d-flex justify-content-between">
                      <span className="won"></span>
                      <span className="amount text-nowrap fs-5">
                        {row.amt_delta.toLocaleString()}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="col-12">
        <input
          type="button"
          className={`btn ${isLast ? "btn-secondary" : "btn-primary"} btn-lg btn-block`}
          value={isLast ? "마지막 페이지" : "더보기"}
          name="btn_more"
          id="btn_more"
          data-page={dataPage}
          onClick={handleMore}
          disabled={isPending}
        />
      </div>
    </>
  );
}
