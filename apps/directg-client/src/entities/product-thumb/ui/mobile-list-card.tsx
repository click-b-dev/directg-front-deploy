import type { ProductThumb } from "../model/types";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/**
 * game_type/display_type별 badge (legacy 모바일 `list_inc.php`/`thumb_inc.php` 공통 — bg-c* 계열).
 */
function typeBadge(product: ProductThumb): { text: string; className: string } | null {
  const { game_type, display_type } = product;
  if (game_type === "game") {
    if (display_type === "basic") return { text: "기본게임", className: "bg-cinfo" };
    if (display_type === "edition") return { text: "에디션", className: "bg-cprimary" };
    if (display_type === "multi") return { text: "멀티팩", className: "bg-cwarning" };
    return null;
  }
  if (game_type === "dlc") return { text: "DLC", className: "bg-ccontent" };
  if (game_type === "music") return { text: "Music", className: "bg-ccontent" };
  if (game_type === "bundle") return { text: "번들", className: "bg-csuccess" };
  if (game_type === "holomodels") {
    if (display_type === "holomodels") return { text: "본체", className: "bg-csuccess" };
    if (display_type === "holomodelsdlc") return { text: "DLC", className: "bg-ccontent" };
    if (display_type === "holomodelsedition") return { text: "에디션", className: "bg-cprimary" };
  }
  return null;
}

/** product_platform → 플랫폼 로고 (legacy `list_inc.php` switch). */
const PLATFORM_LOGO: Record<string, string> = {
  "1": "steam_logo.svg",
  "34": "epic_logo.svg",
  "35": "rockstar_logo.svg",
  "51": "holomodels_logo.svg",
};

/**
 * 모바일 상품 list(가로형) 카드 — legacy `mobile/game/list_inc.php` 마크업 재현.
 * 여러 게임 목록 페이지(promotion_ing_list 등) 공유. PC `ProductListCard`와 다름(모바일 전용).
 * 위시/장바구니 버튼은 order 도메인 이월 — 마크업만 렌더(핸들러 없음, wishlist_chk 비로그인 "N").
 */
export function MobileListCard({ product }: { product: ProductThumb }) {
  const badge = typeBadge(product);
  const platformLogo = PLATFORM_LOGO[product.product_platform];
  const isWished = product.wishlist_chk === "Y";

  return (
    <div className="card row-card card-shadow border-0">
      <div className="card-body d-flex px-0 py-1 bg-clight h-auto">
        <div className="img rounded-0 position-relative col-5 h-auto">
          <a href={product.view_url} data-sku={product.goods_sku} className="product-link">
            <img
              src={`${product.domain}/upload/product/${product.product_code}/header/header.jpg`}
              className="img-fluid"
              alt={product.product_name}
            />
          </a>
          <div className="position-absolute bottom-0 start-0">
            {badge && <span className={`badge ${badge.className} rounded-0`}>{badge.text}</span>}
          </div>
        </div>
        <div className="product-info col-7 py-0 d-flex">
          <div
            className="card-title d-flex flex-column mb-0 justify-content-between w-100"
            style={{ flex: 1 }}
          >
            <div className="product_name text-truncate">{product.product_name}</div>
            <div className="d-flex flex-row justify-content-start flex-wrap align-content-center">
              {product.delivery_type === "1" && (
                <span className="badge badge-outline-secondary opacity-50 rounded-1 fs-7">
                  코드
                </span>
              )}
              {product.delivery_type === "2" && (
                <span className="badge badge-outline-secondary opacity-50 rounded-1 fs-7">
                  택배
                </span>
              )}
              {product.delivery_type === "3" && (
                <span className="badge badge-outline-secondary opacity-50 rounded-1 fs-7">
                  코드+택배
                </span>
              )}
              {product.is_promotion === "Y" && (
                <span className="badge badge-outline-secondary opacity-50 rounded-1 fs-7">
                  프로모션
                </span>
              )}
              {product.is_preorder === "Y" && (
                <span className="badge badge-outline-secondary opacity-50 rounded-1 fs-7">
                  예약
                </span>
              )}
              {product.is_bonus === "Y" && (
                <span className="badge badge-outline-secondary opacity-50 rounded-1 fs-7">
                  특전
                </span>
              )}
            </div>
            <div className="d-flex align-items-start flex-wrap align-content-start flex-shrink-0">
              {product.spoken_korean === "Y" && (
                <span className="badge opacity-50 rounded-1 fs-7 px-0 dot">음성 한국어</span>
              )}
              {product.interface_korean === "Y" && (
                <span className="badge opacity-50 rounded-1 fs-7 px-0 dot">
                  인터페이스/자막 한글
                </span>
              )}
              {product.exclusive_korean === "Y" && (
                <span className="badge opacity-50 rounded-1 fs-7 px-0 dot">독점 한국어</span>
              )}
            </div>
            <div className="d-flex align-items-start flex-wrap align-content-start flex-shrink-0 h-25">
              {platformLogo && (
                <div className="mw-100 me-1 ">
                  <img
                    src={`/mobile-assets/images/platform/${platformLogo}`}
                    className=""
                    style={{ width: "1.25rem" }}
                    alt=""
                  />
                </div>
              )}
              {product.is_naverpay_coupon === "Y" && (
                <div className="mw-100">
                  <span className="badge rounded-1 badge-naverpay fw-500">
                    <img
                      src="/mobile-assets/images/logo/logo_npaybk_small.svg"
                      style={{ height: "0.5rem" }}
                      alt=""
                    />
                    포인트 지급
                  </span>
                </div>
              )}
              {product.is_add_repay === "Y" && (
                <div className="mw-100">
                  <span className="badge rounded-1 bg-primary fw-500">
                    <img
                      src="/mobile-assets/images/icon/point_icon.svg"
                      style={{ height: "0.5rem" }}
                      alt=""
                    />
                    추가 적립
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between card-tail bg-clight bg-opacity-50 p-25">
        <div className="d-flex flex-row align-items-center card-price bg-opacity-50">
          {product.discount > 0 ? (
            <div className={`rounded-2 ${product.promotion_label} badge percent px-2 minus`}>
              {product.discount} %
            </div>
          ) : (
            <div></div>
          )}
          <div className="align-content-end d-flex flex-column ">
            {product.discount > 0 && (
              <s className="num won old-price"> {formatWon(product.consumer_price)}</s>
            )}
            <span className="current-price text-white num won"> {formatWon(product.price)}</span>
          </div>
        </div>
        <div className="align-self-center">
          <button
            type="button"
            className={`btn ${isWished ? "btn-outline-cdanger" : "btn-outline-csecondary"} border-1 p-1 h-auto d-inline-flex align-items-center justify-content-center rounded-2 btn_wishlist`}
            data-sku={product.goods_sku}
          >
            <img
              src={`/mobile-assets/images/icon/wishlist-icon_${isWished ? "y" : "n"}.svg`}
              style={{ width: "1rem" }}
              alt="위시리스트"
            />
          </button>
          {product.soldout !== "Y" ? (
            <button
              type="button"
              className="btn btn-outline-cinfo border-1 p-1 h-auto d-inline-flex align-items-center justify-content-center rounded-2 btn_cart"
              data-sku={product.goods_sku}
            >
              <img
                src="/mobile-assets/images/icon/basket_icon.svg"
                style={{ width: "1rem" }}
                alt="장바구니"
              />
            </button>
          ) : (
            <span className="badge bg-secondary rounded-2 fw-bold font-14 py-3 px-2 align-middle">
              품절
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
