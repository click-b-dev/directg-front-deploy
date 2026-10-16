import { ProductThumbCard, type ProductThumb } from "@entities/product-thumb";

/** 예약구매 섹션 (legacy index.php #goods_preorder). 가로 스크롤(custom-scroll). */
export function PreorderSection({ games }: { games: ProductThumb[] }) {
  return (
    <section id="goods_preorder" className="mb-2">
      <div className="container">
        <div className="d-flex align-items-start">
          <h2 className="fw-bold d-inline">예약구매</h2>{" "}
          <a
            href="/game/game_thumb?is_preorder=Y"
            target="_blank"
            className="btn btn-primary all-btn"
          >
            전체보기
          </a>
        </div>
        <div
          id="preorder_area"
          className="d-flex flex-row justify-content-start flex-nowrap card-shadow border-0 custom-scroll thumb_list"
        >
          {games.map((product) => (
            <ProductThumbCard key={product.product_code} product={product} />
          ))}
        </div>
        <div className="b-example-divider"></div>
      </div>
    </section>
  );
}
