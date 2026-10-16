import type { ProductThumb } from "@entities/product-thumb";

const nf = (value: number) => value.toLocaleString("en-US");

/**
 * 모바일 시즌 S-8 — 프로모션 게임 목록 + 하단 배너 (legacy `mobile/promotion/promotion_season.html` 611~664).
 * `getPromotionSeasonGames`(getPromotionSeasonGame2, game/basic 30개) 재사용. 2열 grid(캐러셀 아님).
 * legacy 하드코딩: 기본게임 배지(bg-info, 항상), 할인 배지 bg-danger, card-badge(코드발송 등) 없음.
 * 마지막 섹션 뒤 하단 배너(k843QVx2Jq). server 컴포넌트.
 */
export function MobileSeasonGamesSection({ list }: { list: ProductThumb[] }) {
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
        <div className="wide-block full px-2">
          <div className="row row-col-5 row-cols-md-2 g-0 justify-content-center">
            {list.map((game, index) => (
              <div className="col-6" key={index}>
                <div className="card product-card m-0 mb-2">
                  <div className="card-header rounded-0 text-truncate">{game.product_name}</div>
                  <div className="card-img position-relative rounded-0">
                    <a href={game.view_url}>
                      <img
                        src={`${game.domain}/upload/product/${game.product_code}/header/header.jpg`}
                        className="imaged w-100 square"
                        alt={`${game.product_name} image`}
                      />
                    </a>
                    <div className="position-absolute bottom-0 start-0">
                      <span className="badge bg-info rounded-0 font-11 py-1 px-2">기본게임</span>
                    </div>
                  </div>
                  <div className="card-body px-2">
                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{ minHeight: "32px" }}
                    >
                      <div>
                        {game.discount > 0 && (
                          <span className="badge bg-danger rounded-1 percent">
                            -{game.discount}%
                          </span>
                        )}
                      </div>
                      <div className="card-price">
                        {game.discount > 0 && (
                          <div className="old-price">
                            <s className="won"> {nf(game.consumer_price)}</s>
                          </div>
                        )}
                        <div className="current-price text-white won"> {nf(game.price)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
