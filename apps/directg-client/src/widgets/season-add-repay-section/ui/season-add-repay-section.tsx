import { getPromotionSeasonAddRepay } from "@entities/promotion-season/api/get-promotion-season-add-repay";
import { ProductThumbCard } from "@entities/product-thumb";

/**
 * 시즌 S-6 — 추가 포인트 적립 (legacy promotion_season.html 410–429). S-5와 동일 구조.
 * 배너(col-3, 하드코딩 Y88eupClXn) + `.thumb_list`(가로) drawThumb. 전체보기 링크.
 */
export async function SeasonAddRepaySection() {
  const { bannerLink, list } = await getPromotionSeasonAddRepay();

  return (
    <section className="mb-3">
      <div className="container">
        <div className="d-flex flex-row align-items-start">
          <h2 className="fw-bold">추가 포인트 적립</h2>
          <a
            href={bannerLink}
            className="btn btn ms-3 text-decoration-none font-14 bg-primary rounded-2 px-3 py-1"
          >
            전체보기
          </a>
        </div>

        <div className="d-flex flex-row">
          <div className="d-flex flex-row col-3">
            <a href={bannerLink}>
              {/* legacy 하드코딩 배너 img */}
              <img src="https://image.directg.net/Y88eupClXn" className="h-100" alt="" />
            </a>
          </div>
          <div className="d-flex flex-row justify-content-end flex-nowrap border-0 thumb_list">
            {list.map((product) => (
              <ProductThumbCard key={product.goods_sku} product={product} />
            ))}
          </div>
        </div>
      </div>
      <div className="b-example-divider"></div>
    </section>
  );
}
