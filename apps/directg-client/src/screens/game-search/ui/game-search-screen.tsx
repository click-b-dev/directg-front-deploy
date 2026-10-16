import type { GameListResponse } from "@entities/game-list";
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

interface GameSearchScreenProps {
  data: GameListResponse;
  /** 검색어 q (page_title·breadcrumb·페이지네이션 param 유지). */
  q: string;
  /** legacy $page_type — thumb/list/grid 뷰. */
  viewType: ViewType;
}

/**
 * 통합검색 목록 (legacy `pc/game/game_search_{thumb,list,grid}.html`). 공개 SSR.
 * game 전체 목록 + q 검색. page_title="통합검색 - {q}", 필터 전체 블록 표시.
 */
export function GameSearchScreen({ data, q, viewType }: GameSearchScreenProps) {
  const { list, page, totalPages, total } = data;

  return (
    <>
      {/* legacy header.html breadcrumb: 다이렉트 게임즈 > 통합검색 - {q} (page_title 텍스트). */}
      <Breadcrumb items={[{ label: `통합검색 - ${q}` }]} />
      <div className="container my-3 pb-5">
        <link rel="stylesheet" href="/assets/css/card-list.css" />
        <main>
          <GameFilter aside={{ productType: true }} />
          <section id="content" className="content rounded-0">
            <GameFilterOrder total={total} basePath="/game/game_search" pageType={viewType} />
            <SearchList viewType={viewType} list={list} />

            <div id="pagination" className="mt-4">
              <ServerPagination
                page={page}
                totalPages={totalPages}
                baseUrl={`/game/game_search_${viewType}.html`}
                params={{ q }}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

/** 뷰별 카드 컨테이너 (legacy #thumb_list / #card_list>.row.g-3 / #grid_list). */
function SearchList({ viewType, list }: { viewType: ViewType; list: ProductThumb[] }) {
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
