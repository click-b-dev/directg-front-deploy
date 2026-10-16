"use client";

import { useState, useTransition } from "react";

import { MobileListCard, type ProductThumb } from "@entities/product-thumb";
import type { ProductFilterParams } from "@entities/promotion-ing";

import { loadMoreGamePlatformList } from "../api/load-more-game-platform-list";

interface MobileGamePlatformListItemsProps {
  initialList: ProductThumb[];
  totalPages: number;
  filters: ProductFilterParams;
}

/**
 * 모바일 플랫폼별 게임 목록 list 뷰 + "더보기" 증분.
 * legacy `mobile/inc/footer_common.html`(L55~82) 핸들러 재현(game_list와 동일, 카드만 `MobileListCard`):
 * - data-page == data-total 이면 alert("마지막페이지입니다")
 * - 아니면 다음 page를 로드해 `#goods_list` 아래에 append, data-page/current_page +1
 * - 요청 중 버튼 disabled
 */
export function MobileGamePlatformListItems({
  initialList,
  totalPages,
  filters,
}: MobileGamePlatformListItemsProps) {
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
      const more = await loadMoreGamePlatformList(nextPage, filters);
      setItems((prev) => [...prev, ...more]);
      setDataPage(nextPage);
    });
  };

  return (
    <div className="section full">
      <div className="wide-block pt-2 pb-2 px-2">
        <div id="goods_list">
          {items.map((product) => (
            <MobileListCard key={product.goods_sku} product={product} />
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
