"use client";

import { useState, useTransition } from "react";

import type { ProductThumb } from "@entities/product-thumb";

import { MobileGameSearchCard } from "./mobile-game-search-card";
import { loadMoreGameSearch } from "../api/load-more-game-search";

interface MobileGameSearchItemsProps {
  initialList: ProductThumb[];
  totalPages: number;
  /** legacy 더보기 ajax는 q·sort만 전달(다른 필터 드롭 quirk). */
  q: string;
  sort: string;
}

/**
 * 모바일 통합검색 목록 + "더보기" 증분.
 * legacy `game_search.html`(L420~444) 핸들러 재현:
 * - data-page == data-total 이면 alert("마지막페이지입니다")
 * - 아니면 {page,q,sort}로 로드해 `#goods_list`에 append, data-page/current_page +1
 * - 요청 중 버튼 disabled
 */
export function MobileGameSearchItems({
  initialList,
  totalPages,
  q,
  sort,
}: MobileGameSearchItemsProps) {
  const [items, setItems] = useState<ProductThumb[]>(initialList);
  const [dataPage, setDataPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const handleMore = () => {
    if (dataPage === totalPages) {
      alert("마지막페이지입니다");
      return;
    }
    const nextPage = dataPage + 1;
    startTransition(async () => {
      const more = await loadMoreGameSearch(nextPage, q, sort);
      setItems((prev) => [...prev, ...more]);
      setDataPage(nextPage);
    });
  };

  return (
    <div className="section full">
      <div className="wide-block pt-2 pb-2 px-0 mx-2">
        <div id="goods_list">
          {items.map((product) => (
            <MobileGameSearchCard key={product.goods_sku} product={product} />
          ))}
        </div>
      </div>

      <div className="wide-block pt-2 pb-2 border-0 dg_bg">
        <button
          type="button"
          className="btn btn-secondary btn-block"
          data-page={dataPage}
          data-total={totalPages}
          id="btn_paging"
          onClick={handleMore}
          disabled={isPending}
        >
          ({" "}
          <span className="px-1" id="current_page">
            {dataPage}
          </span>{" "}
          /{" "}
          <span className="px-1" id="total_page">
            {totalPages}
          </span>{" "}
          ) 더보기
        </button>
      </div>
    </div>
  );
}
