import { getPromotionSeasonPrices } from "@entities/promotion-season/api/get-promotion-season-prices";
import { ProductSmallListCard } from "@entities/product-thumb";

/**
 * 시즌 S-7 — 5천/1만원 미만 게임 (legacy promotion_season.html 431–463).
 * 2열(col-6) drawSmallList(ProductSmallListCard). 전체보기 링크(가격 필터 프리셋).
 */
export async function SeasonPricesSection() {
  const { price5000, price10000 } = await getPromotionSeasonPrices();

  return (
    <section className="mb-3">
      <div className="container">
        <div className="row">
          <div className="col-6">
            <div className="d-flex flex-row align-items-start">
              <h2 className="fw-bold">5천원 미만 게임</h2>
              <a
                href="/promotion/promotion_ing_thumb?is_promotion=Y&sort=release&min_price=0&max_price=5000"
                className="btn ms-3 text-decoration-none font-14 bg-primary rounded-2 px-3 py-1"
              >
                전체보기
              </a>
            </div>
            <article id="price_5000" className="card_list_small">
              <div className="row row-cols-1 row-cols-md-1 g-3">
                {price5000.map((product) => (
                  <ProductSmallListCard key={product.goods_sku} product={product} />
                ))}
              </div>
            </article>
          </div>
          <div className="col-6">
            <div className="d-flex flex-row align-items-start">
              <h2 className="fw-bold">1만원 미만 게임</h2>
              <a
                href="/promotion/promotion_ing_thumb?is_promotion=Y&sort=release&min_price=5000&max_price=10000"
                className="btn ms-3 text-decoration-none font-14 bg-primary rounded-2 px-3 py-1"
              >
                전체보기
              </a>
            </div>
            <article id="price_10000" className="card_list_small">
              <div className="row row-cols-1 row-cols-md-1 g-3">
                {price10000.map((product) => (
                  <ProductSmallListCard key={product.goods_sku} product={product} />
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
      <div className="b-example-divider"></div>
    </section>
  );
}
