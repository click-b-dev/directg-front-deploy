"use client";

import { type ChangeEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface GameFilterOrderProps {
  /** 총 결과 수(legacy goods_list->total_results). */
  total: number;
  /** 뷰전환 링크 base (예: "/promotion/promotion_ing", "/game/game_category") — `${basePath}_${type}.html`. */
  basePath: string;
  /** legacy $page_type ("list"|"thumb"|"grid") — 현재 뷰. */
  pageType: "list" | "thumb" | "grid";
}

const SORT_OPTIONS = [
  { value: "release", label: "출시일순" },
  { value: "name", label: "가나다순" },
  { value: "name_en", label: "ABC순" },
  { value: "pricedown", label: "낮은가격순" },
  { value: "priceup", label: "높은가격순" },
  { value: "discount", label: "높은할인율순" },
];

/**
 * 상품 목록 뷰전환 + 총개수 + 정렬 (legacy `inc/game_filter_order.html`).
 * 정렬 변경 → 현재 필터(searchParams) 유지 + sort 갱신 → router.push. list/grid 뷰는 미이관(죽은 링크).
 */
export function GameFilterOrder({ total, basePath, pageType }: GameFilterOrderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qs = searchParams.toString();
  // legacy filter_include: sort 없으면 default "release"가 selected(q 검색은 목록 화면에 없음).
  const currentSort = searchParams.get("sort") ?? "release";

  const viewUrl = (type: string) => `${basePath}_${type}.html${qs ? `?${qs}` : ""}`;
  const svgClass = (type: string) => `svg-${pageType === type ? "on" : "off"} m-3`;

  const handleSort = (e: ChangeEvent<HTMLSelectElement>) => {
    // legacy goodsFilter: 현재 필터 유지 + sort 갱신 제출. page는 미포함(1페이지).
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="d-flex align-items-center align-self-center justify-content-between bg-table-dark border">
          <div>
            <a href={viewUrl("list")} className="text-decoration-none">
              <img src="/assets/images/icon/list.svg" className={svgClass("list")} />
            </a>
            <a href={viewUrl("thumb")} className="text-decoration-none">
              <img src="/assets/images/icon/thumb.svg" className={svgClass("thumb")} />
            </a>
            <a href={viewUrl("grid")} className="text-decoration-none">
              <img src="/assets/images/icon/grid.svg" className={svgClass("grid")} />
            </a>
          </div>
          <div className="d-flex me-2 text-nowrap" role="search">
            <span className="align-content-center px-3 font-14">
              {" "}
              총 <strong>{total.toLocaleString("en-US")}</strong>개
            </span>
            <select
              name="sort"
              id="sort"
              className="form-select form-select-lg rounded-0 shadow-none bg-table-dark me-3"
              aria-label="정렬순서"
              value={currentSort}
              onChange={handleSort}
            >
              <option value="">::: 정렬순서 :::</option>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
