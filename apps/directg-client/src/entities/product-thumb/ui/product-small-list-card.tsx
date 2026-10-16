import type { ProductThumb } from "../model/types";

const formatWon = (value: number) => value.toLocaleString("ko-KR");
const isYes = (v: string) => v === "Y";

/** small 카드 label (legacy small_list_inc — holomodels 없음, multi는 클래스 다름). */
function smallTypeLabel(product: ProductThumb): { text: string; className: string } | null {
  const { game_type, display_type } = product;
  if (game_type === "game") {
    if (display_type === "basic")
      return { text: "GAME", className: "label bg-info rounded-0 font-12 fw-bold" };
    if (display_type === "edition")
      return { text: "에디션", className: "label bg-primary rounded-0 font-12 fw-bold" };
    if (display_type === "multi") return { text: "멀티팩", className: "label bg-warning" };
    return null;
  }
  if (game_type === "dlc")
    return { text: "DLC", className: "label bg-content rounded-0 font-12 fw-bold" };
  if (game_type === "music")
    return { text: "Music", className: "label bg-content rounded-0 font-12 fw-bold" };
  if (game_type === "bundle")
    return { text: "번들", className: "label bg-success rounded-0 font-12 fw-bold" };
  return null;
}

const SMALL_PLATFORM_ICONS: Record<string, string> = {
  "1": "/assets/images/platform/steam_logo.svg",
  "34": "/assets/images/platform/epic_logo.svg",
  "35": "/assets/images/platform/rockstar_logo.svg",
};

/** 가로형 작은 상품 카드 (legacy game/small_list_inc.php). 한국어지원 섹션 등에서 사용. */
export function ProductSmallListCard({ product }: { product: ProductThumb }) {
  const label = smallTypeLabel(product);
  const platformIcon = SMALL_PLATFORM_ICONS[product.product_platform];

  return (
    <div className="col">
      <div className="card rounded-0 bg-light border-0 flex-row g-0">
        <div className="thumb-area flex-shrink-0 rounded-0">
          <div className="position-relative">
            <a href={product.view_url} className="text-white">
              <img
                src={`${product.domain}/upload/product/${product.product_code}/header/header.jpg`}
                className="img-fluid rounded-0 w-100 h-100"
              />
            </a>
            <div className="label_area position-absolute bottom-0 start-0">
              {label && <span className={label.className}>{label.text}</span>}
            </div>
          </div>
        </div>
        <div className="content-area d-flex flex-column justify-content-between">
          <div className="title-area d-flex align-items-center">
            <div className="platform-area flex-shrink-0 d-lg-block d-flex text-center align-content-center">
              {platformIcon && <img src={platformIcon} className="platform_icon" />}
            </div>
            <div className="bar_area align-self-center"></div>
            <div className="product_name_area font-15 text-decoration-none text-white text-truncate">
              {product.product_name}
            </div>
          </div>
          <div className="badge_area align-content-center">
            {product.delivery_type === "1" && (
              <span className="badge text-secondary bg-none-40 rounded-2 font-11 fw-500">코드</span>
            )}
            {product.delivery_type === "2" && (
              <span className="badge text-secondary bg-none-40 rounded-2 font-11 fw-500">택배</span>
            )}
            {product.delivery_type === "3" && (
              <span className="badge text-secondary bg-none-40 rounded-2 font-11 fw-500">
                코드+택배
              </span>
            )}
            {isYes(product.spoken_korean) && (
              <span className="badge text-secondary rounded-2 bg-none-40 font-11 fw-500">
                음성 한국어
              </span>
            )}
            {isYes(product.interface_korean) && (
              <span className="badge text-secondary rounded-2 bg-none-40 font-11 fw-500">
                인터페이스/자막 한글
              </span>
            )}
            {isYes(product.exclusive_korean) && (
              <span className="badge exclusive_korean rounded-2 font-11 fw-500">독점 한국어</span>
            )}
            {isYes(product.is_preorder) && (
              <span className="badge bg-none-40 text-secondary rounded-2 font-11 fw-500">
                예약구매
              </span>
            )}
            {isYes(product.is_bonus) && (
              <span className="badge bg-none-40 text-secondary rounded-2 font-11 fw-500">특전</span>
            )}
            {isYes(product.is_naverpay_coupon) && (
              <span className="badge badge-naverpay rounded-2 font-11 fw-500">
                <img src="/assets/images/logo/logo_npaybk_small.svg" style={{ height: "1rem" }} />
                네이버페이
              </span>
            )}
          </div>
          <div className="price_area align-content-center d-flex align-items-center">
            {product.discount > 0 && (
              <span
                className={`discount-rate rounded-2 align-content-center text-center ${product.promotion_label} font-14 fw-bold me-2 num minus`}
              >
                {product.discount}%
              </span>
            )}
            <strong className="num font-16 fw-bold text-white me-2 won">
              {" "}
              {formatWon(product.price)}
            </strong>
            {product.discount > 0 && (
              <s className="num font-11 me-2 won opacity-50 text-end">
                {" "}
                {formatWon(product.consumer_price)}
              </s>
            )}
          </div>
        </div>
        <div className="button-area d-flex flex-column justify-content-between align-items-end">
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
          <div className="cart-area text-center align-content-end">
            {!isYes(product.soldout) ? (
              <button
                type="button"
                className="btn shadow-none btn_cart"
                data-sku={product.goods_sku}
              >
                <span className="icon_area">
                  <img
                    src="/assets/images/icon/basket-icon-white-new.svg"
                    className="d-block w-100"
                  />
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="btn shadow-none font-13 bg-secondary align-items-center justify-content-center pe-none fw-bold"
              >
                품절
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
