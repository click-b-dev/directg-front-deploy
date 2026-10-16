"use client";

import type { ProductThumb } from "../model/types";

const formatWon = (value: number) => value.toLocaleString("ko-KR");
const isYes = (v: string) => v === "Y";

/** label_area (legacy grid_inc game_type/display_type switch, 클래스 verbatim — multi도 rounded-0 font-12 fw-bold). */
function renderLabel(product: ProductThumb) {
  const { game_type, display_type } = product;
  if (game_type === "game") {
    if (display_type === "basic")
      return <span className="label bg-info rounded-0 font-12 fw-bold">GAME</span>;
    if (display_type === "edition")
      return <span className="label bg-primary rounded-0 font-12 fw-bold">에디션</span>;
    if (display_type === "multi")
      return <span className="label bg-warning rounded-0 font-12 fw-bold">멀티팩</span>;
    return null;
  }
  if (game_type === "dlc")
    return <span className="label bg-content rounded-0 font-12 fw-bold">DLC</span>;
  if (game_type === "music")
    return <span className="label bg-content rounded-0 font-12 fw-bold">Music</span>;
  if (game_type === "bundle")
    return <span className="label bg-success rounded-0 font-12 fw-bold">번들</span>;
  if (game_type === "holomodels") {
    if (display_type === "holomodels")
      return <span className="label bg-success rounded-0 font-12 fw-bold">본체</span>;
    if (display_type === "holomodelsdlc")
      return <span className="label bg-content rounded-0 font-12 fw-bold">DLC</span>;
    if (display_type === "holomodelsedition")
      return <span className="label bg-primary rounded-0 font-12 fw-bold">에디션</span>;
  }
  return null;
}

/**
 * 상품 그리드 카드 (legacy `game/grid_inc.php`, drawGrid). 간단 — 썸네일+label+제목+할인율/가격/위시만.
 * ProductThumb 타입 재사용. #grid_list 컨테이너에서 렌더.
 */
export function ProductGridCard({ product }: { product: ProductThumb }) {
  return (
    <div className="card rounded-0 bg-card border-0 p-0 flex-shrink-0">
      <div className="thumb-area p-0 position-relative overflow-hidden">
        <a href={product.view_url}>
          <img
            src={`${product.domain}/upload/product/${product.product_code}/header/header.jpg`}
            className="card-img-top rounded-0 img-fluid"
            alt={product.product_name}
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
        </a>
        <div className="label_area position-absolute bottom-0 start-0">{renderLabel(product)}</div>
      </div>

      <div className="content-area">
        <div className="title_area font-13 text-decoration-none text-secondary text-truncate align-content-center">
          {product.product_name}
        </div>
        <div className="purchase-area d-flex align-items-end justify-content-between">
          {product.discount > 0 && (
            <div className="discount_rate_area d-flex">
              <span
                className={`discount-rate rounded-2 align-content-center text-center ${product.promotion_label} font-12 fw-bold num minus`}
              >
                {product.discount}%
              </span>
            </div>
          )}
          <div className="price-area">
            <div className="consumer_price align-content-end">
              {product.discount > 0 && (
                <s className="num font-11 text-secondary-80 won">
                  {" "}
                  {formatWon(product.consumer_price)}
                </s>
              )}
            </div>
            <div className="discount_price align-content-end">
              <span className="num font-13 won fw-bold text-white">
                {" "}
                {formatWon(product.price)}
              </span>
            </div>
          </div>
          <div className="button-area align-content-end">
            <div className="wishlist-area text-center">
              <button
                type="button"
                className={`btn btn-sm shadow-none btn_wishlist ${isYes(product.wishlist_chk) ? "" : "btn_wishlist_off"}`}
                data-sku={product.goods_sku}
              >
                <span className="icon_area">
                  <img
                    src={`/assets/images/icon/wishlist-icon_${isYes(product.wishlist_chk) ? "y" : "n"}-new.svg`}
                    className="d-block w-100"
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
