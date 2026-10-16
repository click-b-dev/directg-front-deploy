"use client";

import { useState, useTransition } from "react";

import { MobileListCard, type ProductThumb } from "@entities/product-thumb";
import type { ProductFilterParams } from "@entities/promotion-ing";

import { loadMorePromotionIng } from "../api/load-more-promotion-ing";

interface MobilePromotionIngListItemsProps {
  initialList: ProductThumb[];
  totalPages: number;
  filters: ProductFilterParams;
}

/**
 * 모바일 할인진행중 list 목록 + 더보기.
 * legacy `footer_common.html`의 append/page counter/마지막 alert 동작을 재현한다(thumb과 동일, 카드만 list).
 */
export function MobilePromotionIngListItems({
  initialList,
  totalPages,
  filters,
}: MobilePromotionIngListItemsProps) {
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
      const more = await loadMorePromotionIng(nextPage, filters);
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
