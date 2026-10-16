import { getPromotionSeasonBest } from "@entities/promotion-season/api/get-promotion-season-best";
import { ProductGridCard, ProductThumbCard } from "@entities/product-thumb";

/**
 * 시즌 S-3 — 프로모션 인기게임 (legacy promotion_season.html 260–358). weekend W-3와 동일 마크업.
 * top4=#thumb_list(ProductThumbCard), 나머지=.grid_list(ProductGridCard, id="" 스타일 미적용).
 */
export async function SeasonBestSection() {
  const { thumbList, gridList } = await getPromotionSeasonBest();

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
