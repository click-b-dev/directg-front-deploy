"use client";

import type { ProductThumb } from "../model/types";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/** game_type/display_type별 라벨 (legacy thumb_inc label_area). */
function typeLabel(product: ProductThumb): { text: string; className: string } | null {
  const { game_type, display_type } = product;
  if (game_type === "game") {
    if (display_type === "basic") return { text: "GAME", className: "bg-info" };
    if (display_type === "edition") return { text: "에디션", className: "bg-primary" };
    if (display_type === "multi") return { text: "멀티팩", className: "bg-warning" };
    return null;
  }
  if (game_type === "dlc") return { text: "DLC", className: "bg-content" };
  if (game_type === "music") return { text: "Music", className: "bg-content" };
  if (game_type === "bundle") return { text: "번들", className: "bg-success" };
  if (game_type === "holomodels") {
    if (display_type === "holomodels") return { text: "본체", className: "bg-success" };
    if (display_type === "holomodelsdlc") return { text: "DLC", className: "bg-content" };
    if (display_type === "holomodelsedition") return { text: "에디션", className: "bg-primary" };
  }
  return null;
}

const PLATFORM_ICONS: Record<string, string> = {
  "1": "/assets/images/platform/steam_logo.svg",
  "34": "/assets/images/platform/epic_logo.svg",
  "35": "/assets/images/platform/rockstar_logo.svg",
  "51": "/assets/images/platform/holomodels_logo.svg",
};

const isYes = (v: string) => v === "Y";

export function ProductThumbCard({ product }: { product: ProductThumb }) {
  const label = typeLabel(product);
  const platformIcon = PLATFORM_ICONS[product.product_platform];
  const hasKorean =
    isYes(product.spoken_korean) ||
    isYes(product.interface_korean) ||
    isYes(product.exclusive_korean);

  return (
    <div className="card rounded-0 bg-card border-0 p-0 flex-shrink-0">
      <a href={product.view_url}>
        <div className="thumb-area p-0 position-relative">
          <img
            src={`${product.domain}/upload/product/${product.product_code}/header/header.jpg`}
            className="card-img-top rounded-0 img-fluid"
            alt={product.product_name}
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
          <div className="thumb-content-area">
            <div className="promotion_date_area">
              {isYes(product.is_promotion) && (
                <span className="text-danger font-13 fw-bold">{product.promotion_end} 종료</span>
              )}
            </div>
            <div className="badge-area text-center">
              <div className="title_badge_area align-content-center">
                {product.delivery_type === "1" && (
                  <span className="badge text-secondary bg-light-50 rounded-2 font-11 fw-500">
                    코드
                  </span>
                )}
                {product.delivery_type === "2" && (
                  <span className="badge text-secondary bg-light-50 rounded-2 font-11 fw-500">
                    택배
                  </span>
                )}
                {product.delivery_type === "3" && (
                  <span className="badge text-secondary bg-light-50 rounded-2 font-11 fw-500">
                    코드+택배
                  </span>
                )}

                {hasKorean ? (
                  <>
                    {isYes(product.spoken_korean) && (
                      <span className="badge text-secondary rounded-2 bg-light-50 font-11 fw-500">
                        음성 한국어
                      </span>
                    )}
                    {isYes(product.interface_korean) && (
                      <span className="badge text-secondary rounded-2 bg-light-50 font-11 fw-500">
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
                    <span className="badge text-secondary rounded-2 bg-light-50 font-11 fw-500">
                      한국어 지원안함
                    </span>
                  )
                )}
                {isYes(product.is_preorder) && (
                  <span className="badge bg-light-50 text-secondary rounded-2 font-11 fw-500">
                    예약구매
                  </span>
                )}
                {isYes(product.is_bonus) && (
                  <span className="badge bg-light-50 text-secondary rounded-2 font-11 fw-500">
                    특전
                  </span>
                )}
              </div>
              {isYes(product.is_naverpay_coupon) && (
                <div className="npay_badge_area align-content-center text-center">
                  <span className="badge badge-naverpay rounded-2 font-11 fw-500">
                    <img
                      src="/assets/images/logo/logo_npaybk_small.svg"
                      style={{ height: "1rem" }}
                    />
                    네이버페이
                  </span>
                </div>
              )}
              {isYes(product.is_add_repay) && (
                <span className="badge bg-primary rounded-2 font-11 fw-500">
                  <img src="/assets/images/icon/point_icon.svg" style={{ height: "1rem" }} /> 추가
                  적립
                </span>
              )}
            </div>
          </div>
          <div className="label_area position-absolute bottom-0 start-0">
            {label && (
              <span className={`label ${label.className} rounded-0 font-12 fw-bold`}>
                {label.text}
              </span>
            )}
          </div>
        </div>
      </a>
      <div className="content-area bg-light d-flex flex-column">
        <div className="title-area d-flex">
          {platformIcon && (
            <>
              <div className="platform_area">
                <img src={platformIcon} className="platform_icon" />
              </div>
              <div className="bar_area align-self-center"></div>
            </>
          )}
          <div className="product_name_area font-14 text-decoration-none text-secondary text-truncate">
            {product.product_name}
          </div>
        </div>
        <div className="purchase-area d-flex h-100 align-items-end">
          <div className="price-info-area d-flex">
            {product.discount > 0 && (
              <div className="discount_rate_area d-flex">
                <span
                  className={`discount-rate rounded-2 align-content-center text-center ${product.promotion_label} font-16 fw-bold num minus`}
                >
                  {product.discount}%
                </span>
              </div>
            )}
            <div className="price-area">
              <div className="consumer_price align-content-end">
                {product.discount > 0 && (
                  <s className="num font-12 text-secondary-80 won">
                    {" "}
                    {formatWon(product.consumer_price)}
                  </s>
                )}
              </div>
              <div className="discount_price align-content-end">
                <span className="num font-17 won fw-bold"> {formatWon(product.price)}</span>
              </div>
            </div>
          </div>
          <div className="button-area d-flex justify-content-between">
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
    </div>
  );
}
