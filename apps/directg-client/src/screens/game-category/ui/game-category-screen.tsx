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

interface GameCategoryScreenProps {
  data: GameCategoryResponse;
  /** 현재 category_code (페이지네이션 param 유지). */
  categoryCode: string;
  /** legacy $page_type — thumb/list/grid 뷰. */
  viewType: ViewType;
}

/**
 * 카테고리별 상품 목록 (legacy `pc/game/game_category_{thumb,list,grid}.html`). 공개 SSR.
 * 동일 데이터/필터/정렬, 뷰(viewType)별 컨테이너·카드만 분기.
 * list는 legacy `#card_list > .row.g-3 > .col`(ProductListCard=.col), grid는 `#grid_list`(CSS grid).
 */
export function GameCategoryScreen({ data, categoryCode, viewType }: GameCategoryScreenProps) {
  const { list, page, totalPages, total, tagName } = data;

  return (
    <>
      {/* legacy header.html breadcrumb: 다이렉트 게임즈 > 게임 > 카테고리별 ({tagName}). "게임" 링크는 page_type 의존. */}
      <Breadcrumb
        items={[
          { label: "게임", href: `/game/game_${viewType}.html` },
          { label: `카테고리별 (${tagName})` },
        ]}
      />
      <div className="container my-3 pb-5">
        {/* legacy game 목록 카드 그리드 (home/board-dataroom 선례와 동일 로드) */}
        <link rel="stylesheet" href="/assets/css/card-list.css" />
        <main>
          <GameFilter aside={{ productType: true }} />
          <section id="content" className="content rounded-0">
            <GameFilterOrder total={total} basePath="/game/game_category" pageType={viewType} />
            <CategoryList viewType={viewType} list={list} />

            <div id="pagination" className="mt-4">
              <ServerPagination
                page={page}
                totalPages={totalPages}
                baseUrl={`/game/game_category_${viewType}.html`}
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
function CategoryList({ viewType, list }: { viewType: ViewType; list: ProductThumb[] }) {
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
