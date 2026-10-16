import { ProductSmallListCard, type ProductThumb } from "@entities/product-thumb";

interface KoreanSupportSectionProps {
  spokenGames: ProductThumb[];
  exclusiveGames: ProductThumb[];
}

/** 한국어지원 섹션 (legacy index.php #goods_korean). 음성/독점 2블록, small 카드. */
export function KoreanSupportSection({ spokenGames, exclusiveGames }: KoreanSupportSectionProps) {
  return (
    <section id="goods_korean" className="mb-2">
      <div className="container">
        <div className="d-grid">
          <div className="">
            <div className="d-flex align-items-start">
              <h2 className="fw-bold d-inline">음성 한국어지원</h2>{" "}
              <a
                href="/game/game_search_thumb?spoken_korean=Y"
                target="_blank"
                className="btn btn-primary all-btn"
              >
                전체보기
              </a>
            </div>
            <article id="spoken_korean" className="card_list_small">
              <div className="row row-cols-1 row-cols-md-1 g-3">
                {spokenGames.map((product) => (
                  <ProductSmallListCard key={product.product_code} product={product} />
                ))}
              </div>
            </article>
          </div>
          <div className="">
            <div className="d-flex align-items-start">
              <h2 className="fw-bold d-inline">독점 한국어지원</h2>{" "}
              <a
                href="/game/game_search_thumb?exclusive_korean=Y"
                target="_blank"
                className="btn btn-primary all-btn"
              >
                전체보기
              </a>
            </div>
            <article id="exclusive_korean" className="card_list_small">
              <div className="row row-cols-1 row-cols-md-1 g-3">
                {exclusiveGames.map((product) => (
                  <ProductSmallListCard key={product.product_code} product={product} />
                ))}
              </div>
            </article>
          </div>
        </div>
        <div className="b-example-divider"></div>
      </div>
    </section>
  );
}
