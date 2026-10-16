"use client";

import type { ProductThumb } from "../model/types";

const formatWon = (value: number) => value.toLocaleString("ko-KR");
const isYes = (v: string) => v === "Y";

/** 플랫폼 아이콘 (legacy list_inc: 1/34/35/51). */
const PLATFORM_ICONS: Record<string, string> = {
  "1": "/assets/images/platform/steam_logo.svg",
  "34": "/assets/images/platform/epic_logo.svg",
  "35": "/assets/images/platform/rockstar_logo.svg",
  "51": "/assets/images/platform/holomodels_logo.svg",
};

/** label_area (legacy list_inc game_type/display_type switch, 클래스 verbatim). */
function renderLabel(product: ProductThumb) {
  const { game_type, display_type } = product;
  if (game_type === "game") {
    if (display_type === "basic")
      return <span className="label bg-info rounded-0 font-12 fw-bold">GAME</span>;
    if (display_type === "edition")
      return <span className="label bg-primary rounded-0 font-12 fw-bold">에디션</span>;
    if (display_type === "multi") return <span className="label bg-warning">멀티팩</span>;
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
 * 상품 리스트 카드 (legacy `game/list_inc.php`, drawList). 가로형 — 썸네일+플랫폼+콘텐츠+버튼.
 * ProductThumb 타입 재사용. #card_list 컨테이너에서 렌더.
 */
export function ProductListCard({ product }: { product: ProductThumb }) {
  const platformIcon = PLATFORM_ICONS[product.product_platform];
  const hasKorean =
    isYes(product.spoken_korean) ||
    isYes(product.interface_korean) ||
    isYes(product.exclusive_korean);

  return (
    <div className="col">
      <div className="card rounded-0 bg-light border-0 flex-row g-0 justify-content-between">
        <div className="d-flex">
          <div className="thumb-area flex-shrink-0 rounded-0">
            <div className="position-relative">
              <a href={product.view_url} className="text-white">
                <img
                  src={`${product.domain}/upload/product/${product.product_code}/header/header.jpg`}
                  className="img-fluid rounded-0 w-100 h-100"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
              </a>
              <div className="label_area position-absolute bottom-0 start-0">
                {renderLabel(product)}
              </div>
            </div>
          </div>

          {platformIcon && (
            <div className="platform-area flex-shrink-0 d-lg-block d-flex text-end align-content-center">
              <img src={platformIcon} className="platform_icon" />
            </div>
          )}

          <div className="content-area d-flex flex-column justify-content-between">
            <div className="product_name_area align-content-center">
              <a href={product.view_url} className="text-decoration-none text-white font-16">
                <h5 className="m-0 text-truncate">{product.product_name}</h5>
              </a>
            </div>
            <div className="badge_area align-content-center">
              {product.delivery_type === "1" && (
                <span className="badge text-secondary bg-none-40 rounded-2 font-11 fw-500">
                  코드
                </span>
              )}
              {product.delivery_type === "2" && (
                <span className="badge text-secondary bg-none-40 rounded-2 font-11 fw-500">
                  택배
                </span>
              )}
              {product.delivery_type === "3" && (
                <span className="badge text-secondary bg-none-40 rounded-2 font-11 fw-500">
                  코드+택배
                </span>
              )}

              {hasKorean ? (
                <>
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
                    <span className="badge exclusive_korean rounded-2 font-11 fw-500">
                      독점 한국어
                    </span>
                  )}
                </>
              ) : (
                (product.delivery_type === "1" || product.delivery_type === "3") && (
                  <span className="badge text-secondary rounded-2 bg-none-40 font-11 fw-500">
                    한국어 지원안함
                  </span>
                )
              )}

              {isYes(product.is_preorder) && (
                <span className="badge bg-none-40 text-secondary rounded-2 font-11 fw-500">
                  예약구매
                </span>
              )}
              {isYes(product.is_bonus) && (
                <span className="badge bg-none-40 text-secondary rounded-2 font-11 fw-500">
                  특전
                </span>
              )}
              {isYes(product.is_naverpay_coupon) && (
                <span className="badge badge-naverpay rounded-2 font-11 fw-500">
                  <img src="/assets/images/logo/logo_npaybk_small.svg" style={{ height: "1rem" }} />
                  네이버페이
                </span>
              )}
              {isYes(product.is_add_repay) && (
                <span className="badge bg-primary rounded-2 font-11 fw-500">
                  <img
                    src="/assets/images/icon/point_icon.svg"
                    style={{ height: "1rem" }}
                    className="position-absolute"
                  />{" "}
                  <span style={{ marginLeft: "1.2rem" }}>추가 적립</span>
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
              {isYes(product.is_promotion) && (
                <span className="text-danger font-14">
                  [프로모션: {product.promotion_end} 종료]
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="button-area flex-shrink-0">
          <div className="d-flex flex-column">
            <div className="wishlist-area text-center">
              <button
                type="button"
                className={`btn btn-sm shadow-none font-13 btn_wishlist ${isYes(product.wishlist_chk) ? "" : "btn_wishlist_off"}`}
                data-sku={product.goods_sku}
              >
                <span className="icon_area">
                  <img
                    src={`/assets/images/icon/wishlist-icon_${isYes(product.wishlist_chk) ? "y" : "n"}-new.svg`}
                    className="d-block w-100"
                  />
                </span>
                <span className="text_area d-flex align-items-center justify-content-center">
                  위시리스트
                </span>
              </button>
            </div>
            <div className="cart-area text-center align-content-end">
              {!isYes(product.soldout) ? (
                <button
                  type="button"
                  className="btn shadow-none font-16 btn_cart"
                  data-sku={product.goods_sku}
                >
                  <span className="icon_area">
                    <img
                      src="/assets/images/icon/basket-icon-white-new.svg"
                      className="d-block w-100"
                    />
                  </span>
                  <span className="text_area d-flex align-items-center justify-content-center">
                    장바구니
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn shadow-none font-16 bg-secondary align-items-center justify-content-center pe-none"
                >
                  품절
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
