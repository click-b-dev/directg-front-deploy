import type { GameCategoryResponse } from "@entities/game-category";
import {
  ProductGridCard,
  ProductListCard,
  ProductThumbCard,
  type ProductThumb,
} from "@entities/product-thumb";
import { ServerPagination } from "@shared/ui/server-pagination";
import { Breadcrumb } from "@widgets/breadcrumb";
import { GameFilter } from "@widgets/game-filter";
import { GameFilterOrder } from "@widgets/game-filter-order";

type ViewType = "thumb" | "list" | "grid";

interface GoodsCategoryScreenProps {
  data: GameCategoryResponse;
  /** 현재 category_code (페이지네이션 param 유지). */
  categoryCode: string;
  /** legacy $page_type — thumb/list/grid 뷰. */
  viewType: ViewType;
}

/**
 * PS액세서리 카테고리별 목록 (legacy `pc/game/goods_category_{thumb,list,grid}.html`). 공개 SSR.
 * game_category 동형 + accessories(상품유형/플랫폼/장르/한국어 숨김). "PS액세서리" 링크는 goods_list 고정.
 */
export function GoodsCategoryScreen({ data, categoryCode, viewType }: GoodsCategoryScreenProps) {
  const { list, page, totalPages, total, tagName } = data;

  return (
    <>
      {/* legacy header.html breadcrumb: 다이렉트 게임즈 > PS액세서리(→goods_list) > 카테고리별 ({tagName}). */}
      <Breadcrumb
        items={[
          { label: "PS액세서리", href: "/game/goods_list" },
          { label: `카테고리별 (${tagName})` },
        ]}
      />
      <div className="container my-3 pb-5">
        <link rel="stylesheet" href="/assets/css/card-list.css" />
        <main>
          <GameFilter
            aside={{ productType: false, platform: false, genre: false, korean: false }}
          />
          <section id="content" className="content rounded-0">
            <GameFilterOrder total={total} basePath="/game/goods_category" pageType={viewType} />
            <GoodsCategoryList viewType={viewType} list={list} />

            <div id="pagination" className="mt-4">
              <ServerPagination
                page={page}
                totalPages={totalPages}
                baseUrl={`/game/goods_category_${viewType}.html`}
                params={{ category_code: categoryCode }}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

/** 뷰별 카드 컨테이너 (legacy #thumb_list / #card_list>.row.g-3 / #grid_list). */
function GoodsCategoryList({ viewType, list }: { viewType: ViewType; list: ProductThumb[] }) {
  if (viewType === "list") {
    return (
      <div id="card_list">
        <div className="row g-3">
          {list.map((product) => (
            <ProductListCard key={product.goods_sku} product={product} />
          ))}
        </div>
      </div>
    );
  }
  if (viewType === "grid") {
    return (
      <div id="grid_list">
        {list.map((product) => (
          <ProductGridCard key={product.goods_sku} product={product} />
        ))}
      </div>
    );
  }
  return (
    <div id="thumb_list">
      {list.map((product) => (
        <ProductThumbCard key={product.goods_sku} product={product} />
      ))}
    </div>
  );
}
