import { getPromotionWeekendBest } from "@entities/promotion-weekend/api/get-promotion-weekend-best";
import { ProductGridCard, ProductThumbCard } from "@entities/product-thumb";

/**
 * 주말특가 W-3 — 프로모션 인기게임 (legacy promotion_weekend.html 180–278).
 * top4=#thumb_list(drawThumb→ProductThumbCard), 나머지=.grid_list(drawGrid→ProductGridCard).
 * ⚠️ legacy .grid_list는 id="" → #grid_list(id) CSS 미적용 — id 없이 class만 verbatim.
 */
export async function PromotionBestSection() {
  const { thumbList, gridList } = await getPromotionWeekendBest();

  return (
    <section className="mb-3">
      <div className="container">
        <h2 className="fw-bold">프로모션 인기게임</h2>

        <div className="justify-content-center mb-3" id="thumb_list">
          {thumbList.map((product) => (
            <ProductThumbCard key={product.goods_sku} product={product} />
          ))}
        </div>

        <div className="grid_list">
          {gridList.map((product) => (
            <ProductGridCard key={product.goods_sku} product={product} />
          ))}
        </div>
      </div>
      <div className="b-example-divider"></div>
    </section>
  );
}
