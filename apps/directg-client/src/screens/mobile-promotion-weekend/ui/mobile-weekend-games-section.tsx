import { MobileThumbCard, type ProductThumb } from "@entities/product-thumb";

/**
 * 모바일 주말특가 W-5 — 프로모션 게임 목록 + 하단 배너 (legacy `mobile/promotion/promotion_weekend.html` 프로모션 게임 목록).
 * `getPromotionWeekendGames`(주말특가 기간 game/basic) 재사용. `#goods_thumb`에 `MobileThumbCard`(마크업 동일) + 전체보기.
 * server 컴포넌트.
 */
export function MobileWeekendGamesSection({ list }: { list: ProductThumb[] }) {
  return (
    <>
      <div className="section full mb-3">
        <div className="section-title py-2 px-2">
          <div className="d-flex justify-content-between align-items-end w-100">
            <h2 className="mb-0 font-16">프로모션 게임 목록</h2>
            <a
              href="/promotion/promotion_ing_thumb"
              className="btn btn-outline-primary btn-allview"
            >
              전체보기
            </a>
          </div>
        </div>
        <div className="wide-block px-2">
          <div id="goods_thumb">
            {list.map((product, index) => (
              <MobileThumbCard product={product} key={index} />
            ))}
          </div>
        </div>
      </div>

      <section className="mb-3">
        <div>
          <a href="/promotion/promotion_ing_thumb">
            <img src="https://image.directg.net/k843QVx2Jq" className="w-100" alt="" />
          </a>
        </div>
      </section>
    </>
  );
}
