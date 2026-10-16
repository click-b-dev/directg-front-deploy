import type { PromotionIngResponse } from "@entities/promotion-ing";
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

interface PromotionIngScreenProps {
  data: PromotionIngResponse;
  /** legacy $page_type — thumb/list/grid 뷰. */
  viewType: ViewType;
}

/** 뷰별 카드 컨테이너 id (legacy #thumb_list/#card_list/#grid_list, card-list.css 그리드). */
const CONTAINER_ID: Record<ViewType, string> = {
  thumb: "thumb_list",
  list: "card_list",
  grid: "grid_list",
};

function renderCard(viewType: ViewType, product: ProductThumb) {
  if (viewType === "list") return <ProductListCard key={product.goods_sku} product={product} />;
  if (viewType === "grid") return <ProductGridCard key={product.goods_sku} product={product} />;
  return <ProductThumbCard key={product.goods_sku} product={product} />;
}

/**
 * 할인진행중 (legacy `pc/promotion/promotion_ing_{thumb,list,grid}.html`). 공개 SSR.
 * 동일 데이터/필터/정렬, 뷰(viewType)별 컨테이너·카드만 분기. aside: promotion=false, product_type=game.
 */
export function PromotionIngScreen({ data, viewType }: PromotionIngScreenProps) {
  const { list, page, totalPages, total } = data;

  return (
    <>
      {/* legacy header.html breadcrumb: 다이렉트 게임즈 > 게임 > 할인진행중. "게임" 링크는 page_type(viewType) 의존. */}
      <Breadcrumb
        items={[{ label: "게임", href: `/game/game_${viewType}.html` }, { label: "할인진행중" }]}
      />
      <div className="container my-3 pb-5">
        {/* legacy game 목록 카드 그리드 (home/board-dataroom 선례와 동일 로드) */}
        <link rel="stylesheet" href="/assets/css/card-list.css" />
        <main>
          <GameFilter aside={{ productType: true, promotion: false }} />
          <section id="content" className="content rounded-0">
            <GameFilterOrder
              total={total}
              basePath="/promotion/promotion_ing"
              pageType={viewType}
            />
            <div id={CONTAINER_ID[viewType]}>
              {list.map((product) => renderCard(viewType, product))}
            </div>

            <div id="pagination" className="mt-4">
              <ServerPagination
                page={page}
                totalPages={totalPages}
                baseUrl={`/promotion/promotion_ing_${viewType}.html`}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
