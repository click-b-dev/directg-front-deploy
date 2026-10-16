import { ProductThumbCard, type ProductThumb } from "@entities/product-thumb";

/** 신규게임 섹션 (legacy index.php #new_game). */
export function NewGameSection({ games }: { games: ProductThumb[] }) {
  return (
    <section id="new_game" className="mb-2">
      <div className="container">
        <div className="d-flex align-items-start">
          <h2 className="fw-bold d-inline">신규게임</h2>{" "}
          <a
            href="/game/game_thumb?category_code=&sort=release"
            className="btn btn-primary all-btn"
          >
            전체보기
          </a>
        </div>
        <div id="thumb_list">
          {games.map((product) => (
            <ProductThumbCard key={product.product_code} product={product} />
          ))}
        </div>
        <div className="b-example-divider"></div>
      </div>
    </section>
  );
}
