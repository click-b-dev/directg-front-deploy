"use client";

import { useState, useTransition } from "react";

import { MobileListCard, MobileThumbCard, type ProductThumb } from "@entities/product-thumb";
import type { ProductFilterParams } from "@entities/promotion-ing";

import { loadMorePublisher } from "../api/load-more-publisher";

interface MobileGamePublisherItemsProps {
  publisherCode: string;
  viewType: "thumb" | "list";
  initialList: ProductThumb[];
  totalPages: number;
  filters: ProductFilterParams;
}

/**
 * 모바일 퍼블리셔 목록(thumb/list 공용) + "더보기" 증분.
 * legacy `mobile/inc/footer_common.html`(L55~82) 핸들러 재현:
 * - data-page == data-total 이면 alert("마지막페이지입니다")
 * - 아니면 다음 page를 로드해 목록 아래에 append, data-page/current_page +1
 * - 요청 중 버튼 disabled
 * viewType에 따라 컨테이너 id(#goods_thumb/#goods_list)와 카드(Thumb/List)를 분기한다.
 */
export function MobileGamePublisherItems({
  publisherCode,
  viewType,
  initialList,
  totalPages,
  filters,
}: MobileGamePublisherItemsProps) {
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
      const more = await loadMorePublisher(publisherCode, nextPage, filters);
      setItems((prev) => [...prev, ...more]);
      setDataPage(nextPage);
    });
  };

  return (
    <div className="section full">
      <div className="wide-block pt-2 pb-2 px-2">
        <div id={viewType === "list" ? "goods_list" : "goods_thumb"}>
          {items.map((product) =>
            viewType === "list" ? (
              <MobileListCard key={product.goods_sku} product={product} />
            ) : (
              <MobileThumbCard key={product.goods_sku} product={product} />
            ),
          )}
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
