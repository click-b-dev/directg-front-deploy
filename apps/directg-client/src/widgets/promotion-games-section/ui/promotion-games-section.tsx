import { getPromotionWeekendGames } from "@entities/promotion-weekend/api/get-promotion-weekend-games";
import { ProductGridCard } from "@entities/product-thumb";

/**
 * 주말특가 W-5 — 프로모션 게임 목록 (legacy promotion_weekend.html 309–327).
 * #grid_list(id, 6열 drawGrid→ProductGridCard) + 하단 전체보기 배너. 마지막 섹션(divider 없음).
 */
export async function PromotionGamesSection() {
  const { list } = await getPromotionWeekendGames();

  return (
    <section className="mb-3">
      <div className="container">
        <div className="d-flex flex-row align-items-start">
          <h2 className="fw-bold">프로모션 게임 목록</h2>
          <a
            href="/promotion/promotion_ing_thumb?is_promotion=Y"
            className="ms-3 text-decoration-none font-14 bg-primary rounded-2 px-3 py-1"
          >
            전체보기
          </a>
        </div>

        <div className="grid_list" id="grid_list">
          {list.map((product) => (
            <ProductGridCard key={product.goods_sku} product={product} />
          ))}
        </div>

        <div className="mt-4 pt-2">
          <a href="/promotion/promotion_ing_thumb?is_promotion=Y">
            {/* legacy: 전체보기 배너 하드코딩 img */}
            <img src="https://image.directg.net/k843QVx2Jq" alt="" />
          </a>
        </div>
      </div>
    </section>
  );
}
