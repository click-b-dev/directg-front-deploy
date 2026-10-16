import type { GameListResponse } from "@entities/game-list";
import {
  ProductGridCard,
  ProductListCard,
  ProductThumbCard,
  type ProductThumb,
} from "@entities/product-thumb";
import { ServerPagination } from "@shared/ui/server-pagination";
import { GameFilter } from "@widgets/game-filter";
import { GameFilterOrder } from "@widgets/game-filter-order";

type ViewType = "thumb" | "list" | "grid";

interface GameHolomodelsScreenProps {
  data: GameListResponse;
  /** legacy $page_type — thumb/list/grid 뷰. */
  viewType: ViewType;
}

/**
 * 홀로 모델 목록 (legacy `pc/game/holomodels_{thumb,list,grid}.html`). 공개 SSR.
 * product_type=holomodels — 필터 상품유형/플랫폼/장르/한국어 숨김. **breadcrumb 없음**(header 조건 game/group/accessories만).
 */
export function GameHolomodelsScreen({ data, viewType }: GameHolomodelsScreenProps) {
  const { list, page, totalPages, total } = data;

  return (
    <div className="container my-3 pb-5">
      <link rel="stylesheet" href="/assets/css/card-list.css" />
      <main>
        <GameFilter aside={{ productType: false, platform: false, genre: false, korean: false }} />
        <section id="content" className="content rounded-0">
          <GameFilterOrder total={total} basePath="/game/holomodels" pageType={viewType} />
          <HolomodelsList viewType={viewType} list={list} />

          <div id="pagination" className="mt-4">
            <ServerPagination
              page={page}
              totalPages={totalPages}
              baseUrl={`/game/holomodels_${viewType}.html`}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

/** 뷰별 카드 컨테이너 (legacy #thumb_list / #card_list>.row.g-3 / #grid_list). */
function HolomodelsList({ viewType, list }: { viewType: ViewType; list: ProductThumb[] }) {
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
