import type { GamePublisherResponse } from "@entities/game-publisher";
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

interface GamePublisherScreenProps {
  data: GamePublisherResponse;
  /** 퍼블리셔 페이지 base (예: "/game/publisher_capcom") — 뷰전환/페이지네이션. */
  basePath: string;
  /** legacy $page_type — thumb/list/grid 뷰. */
  viewType: ViewType;
}

/**
 * 퍼블리셔별 상품 목록 (legacy `pc/game/publisher_{name}_{thumb,list,grid}.html`). 공개 SSR.
 * game_category 동형 + 필터 전체 블록. breadcrumb "퍼블리셔별 ({publisherName})"(게임 링크 없음).
 */
export function GamePublisherScreen({ data, basePath, viewType }: GamePublisherScreenProps) {
  const { list, page, totalPages, total, publisherName } = data;

  return (
    <>
      {/* legacy header.html breadcrumb: 다이렉트 게임즈 > 퍼블리셔별 ({publisherName}) (텍스트, sub_title="퍼블리셔별 ("). */}
      <Breadcrumb items={[{ label: `퍼블리셔별 (${publisherName})` }]} />
      <div className="container my-3 pb-5">
        <link rel="stylesheet" href="/assets/css/card-list.css" />
        <main>
          <GameFilter aside={{ productType: true }} />
          <section id="content" className="content rounded-0">
            <GameFilterOrder total={total} basePath={basePath} pageType={viewType} />
            <PublisherList viewType={viewType} list={list} />

            <div id="pagination" className="mt-4">
              <ServerPagination
                page={page}
                totalPages={totalPages}
                baseUrl={`${basePath}_${viewType}.html`}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

/** 뷰별 카드 컨테이너 (legacy #thumb_list / #card_list>.row.g-3 / #grid_list). */
function PublisherList({ viewType, list }: { viewType: ViewType; list: ProductThumb[] }) {
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
